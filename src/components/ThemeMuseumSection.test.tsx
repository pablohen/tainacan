import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MuseumQueryErrorBanner } from "@/components/MuseumPageStates";
import { RelatedThemes } from "@/components/RelatedThemes";
import { ThemeMuseumSection } from "@/components/ThemeMuseumSection";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import type { ThemeMuseumItemsResult } from "@/hooks/useThemeMuseumItems";
import type { TainacanItem } from "@/types/tainacan";
import type { ThemeOccurrence } from "@/types/themes";
import { FiltersStateSchema } from "@/utils/tainacanFilters";

const museumId = "major-jose-levy-sobrinho";
const museumTitle = "Major José Levy Sobrinho";

function item(id: number): TainacanItem {
	return {
		id,
		title: `Item ${id}`,
		description: "",
		document_as_html: `<img src="https://example.com/item-${id}.jpg" />`,
		metadata: {},
	};
}

function occurrence(overrides: Partial<ThemeOccurrence> = {}): ThemeOccurrence {
	return {
		museumId,
		filterId: 7,
		taxonomyId: 10,
		taxonomyDbIdentifier: "tnc_tax_10",
		taxonomyLabel: "Themes",
		termId: 31,
		termLabel: "Sacred Art",
		...overrides,
	};
}

function result(
	overrides: Partial<ThemeMuseumItemsResult> = {},
): ThemeMuseumItemsResult {
	return {
		museumId,
		data: undefined,
		isPending: false,
		isError: false,
		error: null,
		refetch: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

function section(
	queryResult: ThemeMuseumItemsResult,
	occurrences: ThemeOccurrence[] = [occurrence()],
) {
	return (
		<FavoritesProvider>
			<ThemeMuseumSection result={queryResult} occurrences={occurrences} />
		</FavoritesProvider>
	);
}

beforeEach(() => {
	const values = new Map<string, string>();
	Object.defineProperty(globalThis, "localStorage", {
		configurable: true,
		value: {
			get length() {
				return values.size;
			},
			clear: () => values.clear(),
			getItem: (key: string) => values.get(key) ?? null,
			key: (index: number) => [...values.keys()][index] ?? null,
			removeItem: (key: string) => values.delete(key),
			setItem: (key: string, value: string) => values.set(key, value),
		} satisfies Storage,
	});
});

describe("MuseumQueryErrorBanner", () => {
	it("renders a caller-provided retry label", () => {
		render(
			<MuseumQueryErrorBanner
				title="Museum unavailable"
				description="Try again later."
				onRetry={vi.fn()}
				retryLabel="Retry museum"
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Retry museum" }),
		).toBeInTheDocument();
	});
});

describe("ThemeMuseumSection", () => {
	it("keeps a named museum region mounted while its state changes", () => {
		const { rerender } = render(section(result({ isPending: true })));
		const initialRegion = screen.getByRole("region", { name: museumTitle });

		rerender(
			section(
				result({
					data: { items: [], wpTotal: 0, wpTotalPages: 0 },
				}),
			),
		);

		expect(screen.getByRole("region", { name: museumTitle })).toBe(
			initialRegion,
		);
	});

	it("renders the museum title and eight skeletons while pending", () => {
		const { container } = render(section(result({ isPending: true })));

		expect(
			screen.getByRole("heading", { name: museumTitle }),
		).toBeInTheDocument();
		expect(container.querySelectorAll(".astryx-skeleton")).toHaveLength(8);
	});

	it("renders the theme-specific empty state for an empty success", () => {
		render(
			section(result({ data: { items: [], wpTotal: 0, wpTotalPages: 0 } })),
		);

		expect(
			screen.getByText("No items found for this theme."),
		).toBeInTheDocument();
	});

	it("renders item cards and links to the first deterministic occurrence", () => {
		const occurrences = [
			occurrence({ filterId: 8, taxonomyId: 22, termId: 90 }),
			occurrence({ filterId: 9, taxonomyId: 10, termId: 42 }),
			occurrence({ filterId: 7, taxonomyId: 10, termId: 31 }),
		];
		render(
			section(
				result({
					data: {
						items: [item(101), item(202)],
						wpTotal: 12,
						wpTotalPages: 2,
					},
				}),
				occurrences,
			),
		);

		expect(screen.getByRole("link", { name: "Item 101" })).toHaveAttribute(
			"href",
			`/${museumId}/items/101`,
		);
		expect(screen.getByRole("link", { name: "Item 202" })).toHaveAttribute(
			"href",
			`/${museumId}/items/202`,
		);

		const viewAll = screen.getByRole("link", { name: "View all" });
		expect(viewAll).toHaveAttribute(
			"href",
			`/${museumId}?filters=%7B%227%22%3A%5B%2231%22%5D%7D`,
		);
		const href = viewAll.getAttribute("href");
		const filters = new URL(href ?? "", "https://example.com").searchParams.get(
			"filters",
		);
		expect(FiltersStateSchema.parse(JSON.parse(filters ?? "null"))).toEqual({
			"7": ["31"],
		});
	});

	it("renders deduplicated source metadata in occurrence order", () => {
		const occurrences = [
			occurrence({
				filterId: 7001,
				taxonomyId: 10001,
				taxonomyDbIdentifier: "internal_themes_taxonomy",
				termId: 31001,
				taxonomyLabel: "Themes",
				termLabel: "Sacred Art",
			}),
			occurrence({
				filterId: 7002,
				taxonomyId: 20002,
				taxonomyDbIdentifier: "internal_materials_taxonomy",
				termId: 40002,
				taxonomyLabel: "Materials",
				termLabel: "Gold",
			}),
			occurrence({
				filterId: 7003,
				taxonomyId: 30003,
				taxonomyDbIdentifier: "internal_duplicate_taxonomy",
				termId: 50003,
				taxonomyLabel: "Themes",
				termLabel: "Sacred Art",
			}),
			occurrence({
				filterId: 7004,
				taxonomyId: 40004,
				taxonomyDbIdentifier: "internal_period_taxonomy",
				termId: 60004,
				taxonomyLabel: "Period",
				termLabel: "19th century",
			}),
		];
		const { container } = render(
			section(
				result({ data: { items: [], wpTotal: 0, wpTotalPages: 0 } }),
				occurrences,
			),
		);

		const sourceLabel = screen.getByText("Source metadata");
		const themes = screen.getByText("Themes: Sacred Art");
		const materials = screen.getByText("Materials: Gold");
		const period = screen.getByText("Period: 19th century");

		expect(screen.getAllByText("Themes: Sacred Art")).toHaveLength(1);
		expect(
			sourceLabel.compareDocumentPosition(themes) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(
			themes.compareDocumentPosition(materials) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(
			materials.compareDocumentPosition(period) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(container).not.toHaveTextContent("internal_themes_taxonomy");
		expect(container).not.toHaveTextContent("7001");
		expect(container).not.toHaveTextContent("10001");
		expect(container).not.toHaveTextContent("31001");
	});

	it("renders a local error and retries only its supplied result", () => {
		const refetch = vi.fn().mockResolvedValue(undefined);
		render(
			section(result({ isError: true, error: new Error("offline"), refetch })),
		);

		expect(
			screen.getByText("This museum is temporarily unavailable."),
		).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Retry museum" }));

		expect(refetch).toHaveBeenCalledOnce();
	});
});

describe("RelatedThemes", () => {
	it("renders nothing when there are no related themes", () => {
		const { container } = render(<RelatedThemes themes={[]} />);

		expect(container).toBeEmptyDOMElement();
	});

	it("renders up to eight encoded theme links with relationship evidence", () => {
		const themes = Array.from({ length: 9 }, (_, index) => ({
			key: index === 0 ? "sacred art/paintings" : `theme ${index + 1}`,
			label: index === 0 ? "Sacred Art" : `Theme ${index + 1}`,
			sharedMuseumTaxonomyCount: index + 2,
		}));
		render(<RelatedThemes themes={themes} />);

		expect(
			screen.getByRole("heading", { name: "Related themes" }),
		).toBeInTheDocument();
		expect(screen.getAllByRole("link")).toHaveLength(8);
		expect(screen.getByRole("link", { name: "Sacred Art" })).toHaveAttribute(
			"href",
			"/themes/sacred%20art%2Fpaintings",
		);
		expect(
			screen.getByText("Shared across 2 museum taxonomies"),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("link", { name: "Theme 9" }),
		).not.toBeInTheDocument();
	});
});
