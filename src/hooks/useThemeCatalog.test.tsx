import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useThemeCatalog } from "@/hooks/useThemeCatalog";
import { discoverMuseumThemes } from "@/services/themeDiscovery";
import { createQueryClientWrapper } from "@/test/renderWithProviders";
import type { MuseumThemeDiscovery, ThemeOccurrence } from "@/types/themes";

vi.mock("@/utils/museums", () => ({
	museums: [
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
		{
			id: "museum-4",
			title: "Museum Four",
			link: "https://museum-4.example",
			url: "museu/museum-4",
			description: "The fourth complete museum fixture.",
			api: "https://museum-4.example/wp-json/tainacan/v2",
		},
		{
			id: "museum-5",
			title: "Museum Five",
			link: "https://museum-5.example",
			url: "museu/museum-5",
			description: "The fifth complete museum fixture.",
			api: "https://museum-5.example/wp-json/tainacan/v2",
		},
		{
			id: "museum-6",
			title: "Museum Six",
			link: "https://museum-6.example",
			url: "museu/museum-6",
			description: "The sixth complete museum fixture.",
			api: "https://museum-6.example/wp-json/tainacan/v2",
		},
	],
}));

vi.mock("@/services/themeDiscovery", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@/services/themeDiscovery")>();

	return {
		...actual,
		discoverMuseumThemes: vi.fn(),
	};
});

interface Deferred<T> {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (reason: unknown) => void;
}

const museumIds = [
	"museum-1",
	"museum-2",
	"museum-3",
	"museum-4",
	"museum-5",
	"museum-6",
] as const;
const attempts = new Map<string, Deferred<MuseumThemeDiscovery>[]>();
const discoverMuseumThemesMock = vi.mocked(discoverMuseumThemes);

function deferred<T>(): Deferred<T> {
	let resolve!: (value: T) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<T>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});

	return { promise, resolve, reject };
}

function occurrence(
	museumId: string,
	termLabel: string,
	termId = 101,
): ThemeOccurrence {
	return {
		museumId,
		filterId: 11,
		taxonomyId: 21,
		taxonomyDbIdentifier: "themes",
		taxonomyLabel: "Themes",
		termId,
		termLabel,
	};
}

function discovery(museumId: string, termLabel?: string): MuseumThemeDiscovery {
	return {
		museumId,
		occurrences: termLabel ? [occurrence(museumId, termLabel)] : [],
	};
}

function attemptFor(museumId: string, attemptIndex = 0) {
	const attempt = attempts.get(museumId)?.[attemptIndex];
	if (!attempt) {
		throw new Error(
			`Missing discovery attempt ${attemptIndex} for ${museumId}`,
		);
	}
	return attempt;
}

function callCountFor(museumId: string) {
	return discoverMuseumThemesMock.mock.calls.filter(
		([calledMuseumId]) => calledMuseumId === museumId,
	).length;
}

beforeEach(() => {
	attempts.clear();
	discoverMuseumThemesMock.mockReset();
	discoverMuseumThemesMock.mockImplementation((museumId) => {
		const attempt = deferred<MuseumThemeDiscovery>();
		const museumAttempts = attempts.get(museumId) ?? [];
		museumAttempts.push(attempt);
		attempts.set(museumId, museumAttempts);
		return attempt.promise;
	});
});

describe("useThemeCatalog", () => {
	it("keeps four discoveries active while settled requests release queue slots", async () => {
		const { wrapper } = createQueryClientWrapper();
		const { result } = renderHook(() => useThemeCatalog(), { wrapper });

		await waitFor(() =>
			expect(discoverMuseumThemesMock).toHaveBeenCalledTimes(4),
		);
		expect(result.current.progress.map(({ status }) => status)).toEqual([
			"loading",
			"loading",
			"loading",
			"loading",
			"queued",
			"queued",
		]);

		act(() => attemptFor("museum-1").resolve(discovery("museum-1")));
		await waitFor(() =>
			expect(discoverMuseumThemesMock).toHaveBeenCalledTimes(5),
		);
		expect(callCountFor("museum-5")).toBe(1);

		act(() => attemptFor("museum-2").reject(new Error("Museum unavailable")));
		await waitFor(() => expect(result.current.failedCount).toBe(1));
		await waitFor(() =>
			expect(discoverMuseumThemesMock).toHaveBeenCalledTimes(6),
		);
		expect(callCountFor("museum-6")).toBe(1);
	});

	it("builds a partial graph without turning one museum failure into a global error", async () => {
		const { wrapper } = createQueryClientWrapper();
		const { result } = renderHook(() => useThemeCatalog(), { wrapper });

		await waitFor(() =>
			expect(discoverMuseumThemesMock).toHaveBeenCalledTimes(4),
		);
		act(() => {
			attemptFor("museum-1").resolve(discovery("museum-1", "Sacred Art"));
			attemptFor("museum-2").resolve(discovery("museum-2", "Sacred Art"));
			attemptFor("museum-3").reject(new Error("Invalid response"));
		});

		await waitFor(() =>
			expect(result.current.graph.themes.map(({ key }) => key)).toEqual([
				"sacred art",
			]),
		);
		expect(result.current.failedCount).toBe(1);
		expect(result.current.completedCount).toBe(3);
		expect(result.current.isComplete).toBe(false);
		expect(result.current.progress[2]).toEqual({
			museumId: "museum-3",
			status: "error",
		});
	});

	it("refetches only failed museum discoveries", async () => {
		const { wrapper } = createQueryClientWrapper();
		const { result } = renderHook(() => useThemeCatalog(), { wrapper });

		await waitFor(() =>
			expect(discoverMuseumThemesMock).toHaveBeenCalledTimes(4),
		);
		act(() => {
			attemptFor("museum-1").reject(new Error("Temporary failure"));
			attemptFor("museum-2").resolve(discovery("museum-2"));
			attemptFor("museum-3").resolve(discovery("museum-3"));
			attemptFor("museum-4").resolve(discovery("museum-4"));
		});
		await waitFor(() =>
			expect(discoverMuseumThemesMock).toHaveBeenCalledTimes(6),
		);
		act(() => {
			attemptFor("museum-5").resolve(discovery("museum-5"));
			attemptFor("museum-6").resolve(discovery("museum-6"));
		});
		await waitFor(() => expect(result.current.isComplete).toBe(true));

		let retryPromise: Promise<void> | undefined;
		act(() => {
			retryPromise = result.current.refetchFailed();
		});
		await waitFor(() => expect(callCountFor("museum-1")).toBe(2));
		act(() =>
			attemptFor("museum-1", 1).resolve(discovery("museum-1", "Sacred Art")),
		);
		await act(async () => {
			await retryPromise;
		});

		expect(museumIds.map(callCountFor)).toEqual([2, 1, 1, 1, 1, 1]);
		expect(result.current.failedCount).toBe(0);
	});

	it("discovers a direct-route target with the catalog matching rules", async () => {
		const { wrapper } = createQueryClientWrapper();
		const { result } = renderHook(
			() => useThemeCatalog({ targetKey: "sacred art" }),
			{ wrapper },
		);

		await waitFor(() =>
			expect(discoverMuseumThemesMock).toHaveBeenCalledTimes(4),
		);
		act(() => {
			attemptFor("museum-1").resolve(discovery("museum-1", "Sacred Art"));
			attemptFor("museum-2").resolve(discovery("museum-2", "  sacred art! "));
		});

		await waitFor(() =>
			expect(result.current.graph.byKey["sacred art"]?.museumCount).toBe(2),
		);
		expect(result.current.graph.themes).toHaveLength(1);
	});
});
