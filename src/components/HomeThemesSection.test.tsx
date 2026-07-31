import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomeThemesSection } from "@/components/HomeThemesSection";
import {
	type UseThemeCatalogResult,
	useThemeCatalog,
} from "@/hooks/useThemeCatalog";
import type { ThemeGraph, ThemeNode } from "@/types/themes";

vi.mock("@/hooks/useThemeCatalog", () => ({
	useThemeCatalog: vi.fn(),
}));

const useThemeCatalogMock = vi.mocked(useThemeCatalog);

const emptyGraph: ThemeGraph = {
	themes: [],
	byKey: {},
	relatedByKey: {},
};

function theme(key: string, label: string): ThemeNode {
	return {
		key,
		label,
		museumCount: 2,
		occurrences: [],
	};
}

function graphWith(themes: ThemeNode[]): ThemeGraph {
	return {
		themes,
		byKey: Object.fromEntries(themes.map((node) => [node.key, node])),
		relatedByKey: Object.fromEntries(themes.map((node) => [node.key, []])),
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
		],
		completedCount: 0,
		failedCount: 0,
		totalCount: 3,
		isInitialLoading: false,
		isComplete: false,
		refetchFailed: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

describe("HomeThemesSection", () => {
	beforeEach(() => {
		useThemeCatalogMock.mockReset();
	});

	it("shows discovery loading without an empty state before any museum completes", () => {
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				progress: [
					{ museumId: "museum-1", status: "loading" },
					{ museumId: "museum-2", status: "queued" },
					{ museumId: "museum-3", status: "queued" },
				],
				isInitialLoading: true,
			}),
		);

		render(<HomeThemesSection />);

		expect(screen.getByText("Discovering themes…")).toBeInTheDocument();
		expect(
			screen.queryByText("No shared themes were found."),
		).not.toBeInTheDocument();
	});

	it("keeps partial theme links visible with encoded destinations and progress", () => {
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				graph: graphWith([
					theme("sacred art/paintings", "Sacred Art"),
					theme("popular culture", "Popular Culture"),
				]),
				completedCount: 2,
			}),
		);

		render(<HomeThemesSection />);

		expect(
			screen.getByRole("heading", { name: "Explore by theme" }),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Sacred Art" })).toHaveAttribute(
			"href",
			"/themes/sacred%20art%2Fpaintings",
		);
		expect(
			screen.getByRole("link", { name: "Popular Culture" }),
		).toHaveAttribute("href", "/themes/popular%20culture");
		expect(screen.getByText("2 of 3 museums checked")).toBeInTheDocument();
	});

	it("shows the complete empty state only after discovery finishes", () => {
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				progress: [
					{ museumId: "museum-1", status: "success" },
					{ museumId: "museum-2", status: "success" },
					{ museumId: "museum-3", status: "success" },
				],
				completedCount: 3,
				isComplete: true,
			}),
		);

		render(<HomeThemesSection />);

		expect(
			screen.getByText("No shared themes were found."),
		).toBeInTheDocument();
	});

	it("preserves partial themes and retries unavailable museums", () => {
		const refetchFailed = vi.fn().mockResolvedValue(undefined);
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				graph: graphWith([theme("sacred art", "Sacred Art")]),
				progress: [
					{ museumId: "museum-1", status: "success" },
					{ museumId: "museum-2", status: "error" },
					{ museumId: "museum-3", status: "loading" },
				],
				completedCount: 2,
				failedCount: 1,
				refetchFailed,
			}),
		);

		render(<HomeThemesSection />);

		expect(
			screen.getByRole("link", { name: "Sacred Art" }),
		).toBeInTheDocument();
		expect(screen.getByText("1 museums unavailable")).toBeInTheDocument();

		fireEvent.click(
			screen.getByRole("button", { name: "Retry unavailable museums" }),
		);

		expect(refetchFailed).toHaveBeenCalledOnce();
	});

	it("shows a retryable temporary failure when every museum is unavailable", () => {
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				progress: [
					{ museumId: "museum-1", status: "error" },
					{ museumId: "museum-2", status: "error" },
					{ museumId: "museum-3", status: "error" },
				],
				completedCount: 3,
				failedCount: 3,
				isComplete: true,
			}),
		);

		render(<HomeThemesSection />);

		expect(
			screen.getByText("Themes are temporarily unavailable."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Retry unavailable museums" }),
		).toBeInTheDocument();
		expect(
			screen.queryByText("No shared themes were found."),
		).not.toBeInTheDocument();
	});

	it("limits the home entry layer to twelve theme links", () => {
		const themes = Array.from({ length: 13 }, (_, index) =>
			theme(`theme ${index + 1}`, `Theme ${index + 1}`),
		);
		useThemeCatalogMock.mockReturnValue(
			catalogResult({
				graph: graphWith(themes),
				completedCount: 3,
				isComplete: true,
			}),
		);

		render(<HomeThemesSection />);

		expect(screen.getAllByRole("link")).toHaveLength(12);
		expect(
			screen.queryByRole("link", { name: "Theme 13" }),
		).not.toBeInTheDocument();
	});
});
