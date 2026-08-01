import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	type UseThemeCatalogResult,
	useThemeCatalog,
} from "@/hooks/useThemeCatalog";
import {
	type ThemeMuseumItemsResult,
	useThemeMuseumItems,
} from "@/hooks/useThemeMuseumItems";
import type {
	RelatedTheme,
	ThemeGraph,
	ThemeNode,
	ThemeOccurrence,
} from "@/types/themes";
import { ThemePageClient } from "./ThemePageClient";

vi.mock("@/hooks/useThemeCatalog", () => ({
	useThemeCatalog: vi.fn(),
}));

vi.mock("@/hooks/useThemeMuseumItems", () => ({
	useThemeMuseumItems: vi.fn(),
}));

const useThemeCatalogMock = vi.mocked(useThemeCatalog);
const useThemeMuseumItemsMock = vi.mocked(useThemeMuseumItems);

const emptyGraph: ThemeGraph = {
	themes: [],
	byKey: {},
	relatedByKey: {},
};

function occurrence(
	museumId: string,
	overrides: Partial<ThemeOccurrence> = {},
): ThemeOccurrence {
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

function themeNode(key = "sacred art", label = "Sacred Art"): ThemeNode {
	return {
		key,
		label,
		museumCount: 2,
		occurrences: [
			occurrence("major-jose-levy-sobrinho"),
			occurrence("museu-casa-da-princesa", {
				filterId: 14,
				taxonomyId: 22,
				termId: 44,
			}),
		],
	};
}

function graphWith(node: ThemeNode, related: RelatedTheme[] = []): ThemeGraph {
	return {
		themes: [node],
		byKey: { [node.key]: node },
		relatedByKey: { [node.key]: related },
	};
}

function catalogResult(
	overrides: Partial<UseThemeCatalogResult> = {},
): UseThemeCatalogResult {
	return {
		graph: emptyGraph,
		progress: [
			{ museumId: "museum-1", status: "queued" },
			{ museumId: "museum-2", status: "queued" },
			{ museumId: "museum-3", status: "queued" },
			{ museumId: "museum-4", status: "queued" },
		],
		completedCount: 0,
		failedCount: 0,
		totalCount: 4,
		isInitialLoading: false,
		isComplete: false,
		refetchFailed: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

function itemResult(
	museumId: string,
	overrides: Partial<ThemeMuseumItemsResult> = {},
): ThemeMuseumItemsResult {
	return {
		museumId,
		data: { items: [], wpTotal: 0, wpTotalPages: 0 },
		isPending: false,
		isError: false,
		error: null,
		refetch: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

describe("ThemePageClient", () => {
	beforeEach(() => {
		useThemeCatalogMock.mockReset();
		useThemeMuseumItemsMock.mockReset();
		useThemeMuseumItemsMock.mockReturnValue([]);
	});

	it("shows direct-entry discovery and progress until the requested theme is known", () => {
		useThemeCatalogMock.mockReturnValue(
			catalogResult({ completedCount: 2, totalCount: 5 }),
		);

		render(<ThemePageClient themeKey="sacred%20art" />);

		expect(
			screen.getByText("Finding this theme across museums…"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Museums checked globally: 2 of 5"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Museums unavailable globally: 0"),
		).toBeInTheDocument();
		expect(screen.queryByText("Theme not found")).not.toBeInTheDocument();
	});

	it("reveals a discovered theme immediately in first-seen museum order", () => {
		const node = themeNode();
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				graph: graphWith(node),
				completedCount: 2,
				totalCount: 4,
			}),
		);
		useThemeMuseumItemsMock.mockReturnValue([
			itemResult("museu-casa-da-princesa"),
			itemResult("major-jose-levy-sobrinho"),
		]);

		render(<ThemePageClient themeKey="sacred art" />);

		expect(
			screen.getByRole("heading", { level: 1, name: "Sacred Art" }),
		).toBeInTheDocument();
		const regions = screen.getAllByRole("region");
		expect(
			regions.map((region) => region.getAttribute("aria-labelledby")),
		).toEqual([
			"theme-museum-major-jose-levy-sobrinho",
			"theme-museum-museu-casa-da-princesa",
		]);
		expect(screen.getByText("Known institutions: 2")).toBeInTheDocument();
		expect(
			screen.getByText("Completed institutions: 2 of 2"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Museums checked globally: 2 of 4"),
		).toBeInTheDocument();
	});

	it("separates federated item progress from global discovery progress", () => {
		const node = {
			...themeNode(),
			museumCount: 3,
			occurrences: [
				...themeNode().occurrences,
				occurrence("museu-casa-benjamin-constant", {
					filterId: 18,
					taxonomyId: 26,
					termId: 48,
				}),
			],
		};
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				graph: graphWith(node),
				completedCount: 2,
				failedCount: 1,
				totalCount: 4,
			}),
		);
		useThemeMuseumItemsMock.mockReturnValue([
			itemResult("major-jose-levy-sobrinho", {
				data: undefined,
				isPending: true,
			}),
			itemResult("museu-casa-da-princesa"),
			itemResult("museu-casa-benjamin-constant", {
				data: undefined,
				isError: true,
				error: new Error("Museum unavailable"),
			}),
		]);

		render(<ThemePageClient themeKey="sacred art" />);

		expect(screen.getByText("Federated theme results")).toBeInTheDocument();
		expect(screen.getByText("Known institutions: 3")).toBeInTheDocument();
		expect(
			screen.getByText("Completed institutions: 2 of 3"),
		).toBeInTheDocument();
		expect(screen.getByText("Unavailable institutions: 1")).toBeInTheDocument();
		expect(screen.getByText("Global theme discovery")).toBeInTheDocument();
		expect(
			screen.getByText("Museums checked globally: 2 of 4"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Museums unavailable globally: 1"),
		).toBeInTheDocument();
	});

	it("renders the client not-found state only after discovery completes", () => {
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				completedCount: 4,
				isComplete: true,
			}),
		);

		render(<ThemePageClient themeKey="missing" />);

		expect(screen.getByText("Theme not found")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
			"href",
			"/",
		);
		expect(
			screen.queryByText("Finding this theme across museums…"),
		).not.toBeInTheDocument();
	});

	it("keeps a missing theme retryable when completed discovery has failures", () => {
		const refetchFailed = vi.fn().mockResolvedValue(undefined);
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				completedCount: 4,
				failedCount: 1,
				isComplete: true,
				refetchFailed,
			}),
		);

		render(<ThemePageClient themeKey="missing" />);

		expect(screen.queryByText("Theme not found")).not.toBeInTheDocument();
		expect(
			screen.getByText("Finding this theme across museums…"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Theme discovery is incomplete."),
		).toBeInTheDocument();
		expect(
			screen.getByText("Museums unavailable globally: 1"),
		).toBeInTheDocument();

		fireEvent.click(
			screen.getByRole("button", { name: "Retry unavailable museums" }),
		);
		expect(refetchFailed).toHaveBeenCalledOnce();
	});

	it("summarizes failed discovery without hiding successful museum sections", () => {
		const node = themeNode();
		const refetchFailed = vi.fn().mockResolvedValue(undefined);
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				graph: graphWith(node),
				completedCount: 3,
				failedCount: 1,
				refetchFailed,
			}),
		);
		useThemeMuseumItemsMock.mockReturnValue([
			itemResult("major-jose-levy-sobrinho"),
			itemResult("museu-casa-da-princesa"),
		]);

		render(<ThemePageClient themeKey="sacred art" />);

		expect(
			screen.getByText("Theme discovery is incomplete."),
		).toBeInTheDocument();
		expect(screen.getByText("Unavailable institutions: 0")).toBeInTheDocument();
		expect(
			screen.getByText("Museums unavailable globally: 1"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("region", { name: "Major José Levy Sobrinho" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("region", { name: "Museu Casa da Princesa" }),
		).toBeInTheDocument();

		fireEvent.click(
			screen.getByRole("button", { name: "Retry unavailable museums" }),
		);
		expect(refetchFailed).toHaveBeenCalledOnce();
	});

	it("places related themes after every museum section", () => {
		const node = themeNode();
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				graph: graphWith(node, [
					{
						key: "religious objects",
						label: "Religious Objects",
						sharedMuseumTaxonomyCount: 2,
					},
				]),
				completedCount: 4,
				isComplete: true,
			}),
		);
		useThemeMuseumItemsMock.mockReturnValue([
			itemResult("major-jose-levy-sobrinho"),
			itemResult("museu-casa-da-princesa"),
		]);

		render(<ThemePageClient themeKey="sacred art" />);

		const lastMuseum = screen.getByRole("region", {
			name: "Museu Casa da Princesa",
		});
		const relatedHeading = screen.getByRole("heading", {
			name: "Related themes",
		});
		expect(
			lastMuseum.compareDocumentPosition(relatedHeading) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("decodes an encoded theme key through the graph lookup", () => {
		const node = themeNode();
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				graph: graphWith(node),
				completedCount: 4,
				isComplete: true,
			}),
		);
		useThemeMuseumItemsMock.mockReturnValue([
			itemResult("major-jose-levy-sobrinho"),
			itemResult("museu-casa-da-princesa"),
		]);

		render(<ThemePageClient themeKey="sacred%20art" />);

		expect(
			screen.getByRole("heading", { level: 1, name: "Sacred Art" }),
		).toBeInTheDocument();
	});

	it("handles malformed percent encoding as not found without throwing", () => {
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				completedCount: 4,
				isComplete: true,
			}),
		);

		render(<ThemePageClient themeKey="%E0%A4%A" />);

		expect(screen.getByText("Theme not found")).toBeInTheDocument();
	});
});
