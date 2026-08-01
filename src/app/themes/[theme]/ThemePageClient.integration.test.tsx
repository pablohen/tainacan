import { act, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { discoverMuseumThemes } from "@/services/themeDiscovery";
import { fetchThemeMuseumItems } from "@/services/themeItems";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { MuseumThemeDiscovery, ThemeOccurrence } from "@/types/themes";
import { ThemePageClient } from "./ThemePageClient";

vi.mock("@/utils/museums", () => {
	const museums = [
		{
			id: "museum-1",
			title: "Museum One",
			link: "https://museum-1.example",
			url: "museu/museum-1",
			description: "The first complete museum fixture.",
			api: "https://museum-1.example/wp-json/tainacan/v2",
		},
		{
			id: "museum-2",
			title: "Museum Two",
			link: "https://museum-2.example",
			url: "museu/museum-2",
			description: "The second complete museum fixture.",
			api: "https://museum-2.example/wp-json/tainacan/v2",
		},
		{
			id: "museum-3",
			title: "Museum Three",
			link: "https://museum-3.example",
			url: "museu/museum-3",
			description: "The third complete museum fixture.",
			api: "https://museum-3.example/wp-json/tainacan/v2",
		},
	];

	return {
		museums,
		getMuseumById: (museumId: string) =>
			museums.find((museum) => museum.id === museumId),
	};
});

vi.mock("@/services/themeDiscovery", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@/services/themeDiscovery")>();

	return {
		...actual,
		discoverMuseumThemes: vi.fn(),
	};
});

vi.mock("@/services/themeItems", () => ({
	fetchThemeMuseumItems: vi.fn(),
}));

interface Deferred<T> {
	promise: Promise<T>;
	resolve: (value: T) => void;
}

const discoveryAttempts = new Map<string, Deferred<MuseumThemeDiscovery>>();
const discoverMuseumThemesMock = vi.mocked(discoverMuseumThemes);
const fetchThemeMuseumItemsMock = vi.mocked(fetchThemeMuseumItems);

function deferred<T>(): Deferred<T> {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolvePromise) => {
		resolve = resolvePromise;
	});

	return { promise, resolve };
}

function occurrence(museumId: string): ThemeOccurrence {
	return {
		museumId,
		filterId: 11,
		taxonomyId: 21,
		taxonomyDbIdentifier: "themes",
		taxonomyLabel: "Themes",
		termId: 101,
		termLabel: "Sacred Art",
	};
}

function discovery(museumId: string): MuseumThemeDiscovery {
	return { museumId, occurrences: [occurrence(museumId)] };
}

function resolveDiscovery(museumId: string) {
	const attempt = discoveryAttempts.get(museumId);
	if (!attempt) throw new Error(`Missing discovery attempt for ${museumId}`);
	attempt.resolve(discovery(museumId));
}

function renderedMuseumIds() {
	return screen
		.getAllByRole("region")
		.map((region) =>
			region.getAttribute("aria-labelledby")?.replace("theme-museum-", ""),
		);
}

describe("ThemePageClient integration", () => {
	beforeEach(() => {
		discoveryAttempts.clear();
		discoverMuseumThemesMock.mockReset();
		discoverMuseumThemesMock.mockImplementation((museumId) => {
			const attempt = deferred<MuseumThemeDiscovery>();
			discoveryAttempts.set(museumId, attempt);
			return attempt.promise;
		});
		fetchThemeMuseumItemsMock.mockReset();
		fetchThemeMuseumItemsMock.mockResolvedValue({
			items: [],
			wpTotal: 0,
			wpTotalPages: 1,
		});
	});

	it("appends a late earlier-registry museum after already visible sections", async () => {
		renderWithProviders(<ThemePageClient themeKey="sacred%20art" />);

		await waitFor(() =>
			expect(discoverMuseumThemesMock).toHaveBeenCalledTimes(3),
		);
		act(() => {
			resolveDiscovery("museum-2");
			resolveDiscovery("museum-3");
		});
		await waitFor(() => expect(screen.getAllByRole("region")).toHaveLength(2));
		expect(renderedMuseumIds()).toEqual(["museum-2", "museum-3"]);

		act(() => resolveDiscovery("museum-1"));
		await waitFor(() => expect(screen.getAllByRole("region")).toHaveLength(3));

		expect(renderedMuseumIds()).toEqual(["museum-2", "museum-3", "museum-1"]);
	});
});
