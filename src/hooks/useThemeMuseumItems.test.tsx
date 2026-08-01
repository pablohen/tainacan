import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useThemeMuseumItems } from "@/hooks/useThemeMuseumItems";
import { fetchThemeMuseumItems } from "@/services/themeItems";
import { createQueryClientWrapper } from "@/test/renderWithProviders";
import type { ThemeNode, ThemeOccurrence } from "@/types/themes";

vi.mock("@/services/themeItems", () => ({
	fetchThemeMuseumItems: vi.fn(),
}));

const fetchThemeMuseumItemsMock = vi.mocked(fetchThemeMuseumItems);

function occurrence(
	museumId: string,
	taxonomyDbIdentifier: string,
	termId: number,
): ThemeOccurrence {
	return {
		museumId,
		filterId: termId,
		taxonomyId: termId + 100,
		taxonomyDbIdentifier,
		taxonomyLabel: `Taxonomy ${termId}`,
		termId,
		termLabel: `Theme ${termId}`,
	};
}

const museumTwoFirst = occurrence("museum-2", "taxonomy-two-a", 201);
const museumOne = occurrence("museum-1", "taxonomy-one", 101);
const museumTwoSecond = occurrence("museum-2", "taxonomy-two-b", 202);
const node: ThemeNode = {
	key: "shared-theme",
	label: "Shared Theme",
	museumCount: 2,
	occurrences: [museumTwoFirst, museumOne, museumTwoSecond],
};

describe("useThemeMuseumItems", () => {
	beforeEach(() => {
		fetchThemeMuseumItemsMock.mockReset();
		fetchThemeMuseumItemsMock.mockImplementation(async (museumId) => {
			if (museumId === "museum-2") {
				throw new Error("Museum 2 unavailable");
			}
			return { items: [], wpTotal: 0, wpTotalPages: 1 };
		});
	});

	it("keeps first-seen museum order and isolates query state and refetches", async () => {
		const { queryClient, wrapper } = createQueryClientWrapper();
		const { result } = renderHook(() => useThemeMuseumItems(node), { wrapper });

		expect(result.current.map(({ museumId }) => museumId)).toEqual([
			"museum-2",
			"museum-1",
		]);
		expect(
			queryClient
				.getQueryCache()
				.getAll()
				.map(({ queryKey }) => queryKey),
		).toEqual([
			["theme-museum-items", "shared-theme", "museum-2"],
			["theme-museum-items", "shared-theme", "museum-1"],
		]);

		await waitFor(() => expect(result.current[0]?.isError).toBe(true));
		await waitFor(() =>
			expect(result.current[1]?.data).toEqual({
				items: [],
				wpTotal: 0,
				wpTotalPages: 1,
			}),
		);
		expect(result.current[0]?.error).toEqual(new Error("Museum 2 unavailable"));
		expect(result.current[1]?.isError).toBe(false);

		expect(fetchThemeMuseumItemsMock).toHaveBeenCalledWith(
			"museum-2",
			[museumTwoFirst, museumTwoSecond],
			expect.any(AbortSignal),
		);
		expect(fetchThemeMuseumItemsMock).toHaveBeenCalledWith(
			"museum-1",
			[museumOne],
			expect.any(AbortSignal),
		);
		expect(fetchThemeMuseumItemsMock).toHaveBeenCalledTimes(2);

		await act(async () => {
			await result.current[1]?.refetch();
		});

		expect(
			fetchThemeMuseumItemsMock.mock.calls.filter(
				([museumId]) => museumId === "museum-1",
			),
		).toHaveLength(2);
		expect(
			fetchThemeMuseumItemsMock.mock.calls.filter(
				([museumId]) => museumId === "museum-2",
			),
		).toHaveLength(1);
	});
});
