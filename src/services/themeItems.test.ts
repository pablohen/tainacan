import { beforeEach, describe, expect, it, vi } from "vitest";
import { listItems } from "@/services/generated/items/items";
import { fetchThemeMuseumItems } from "@/services/themeItems";
import type { TainacanItem } from "@/types/tainacan";
import type { ThemeOccurrence } from "@/types/themes";

vi.mock("@/services/generated/items/items", () => ({
	listItems: vi.fn(),
}));

const listItemsMock = vi.mocked(listItems);

function occurrence(
	taxonomyDbIdentifier: string,
	termId: number,
): ThemeOccurrence {
	return {
		museumId: "museum-1",
		filterId: 11,
		taxonomyId: 21,
		taxonomyDbIdentifier,
		taxonomyLabel: "Themes",
		termId,
		termLabel: `Theme ${termId}`,
	};
}

function item(id: number): TainacanItem {
	return {
		id,
		title: `Item ${id}`,
		description: "",
		document_as_html: "",
		metadata: {},
	};
}

function response(items: TainacanItem[], wpTotal: number) {
	return {
		data: { items },
		status: 200 as const,
		headers: new Headers({
			"x-wp-total": String(wpTotal),
			"x-wp-totalpages": "3",
		}),
	};
}

function requestedTaxonomy(params: unknown): string | undefined {
	const taxquery = (params as { taxquery?: Array<{ taxonomy?: string }> })
		.taxquery;
	return taxquery?.[0]?.taxonomy;
}

describe("fetchThemeMuseumItems", () => {
	beforeEach(() => {
		listItemsMock.mockReset();
	});

	it("queries each distinct occurrence and merges a formatted eight-item preview in occurrence order", async () => {
		const signal = new AbortController().signal;
		const first = occurrence("taxonomy-one", 101);
		const second = occurrence("taxonomy-two", 202);
		listItemsMock.mockImplementation(async (params) => {
			if (requestedTaxonomy(params) === "taxonomy-one") {
				return response([1, 2, 3, 4, 5, 6].map(item), 10);
			}
			return response([3, 7, 8, 9].map(item), 4);
		});

		await expect(
			fetchThemeMuseumItems("museum-1", [first, first, second], signal),
		).resolves.toEqual({
			items: [1, 2, 3, 4, 5, 6, 7, 8].map(item),
			wpTotal: 14,
			wpTotalPages: 1,
		});

		expect(listItemsMock).toHaveBeenCalledTimes(2);
		expect(listItemsMock).toHaveBeenNthCalledWith(
			1,
			{
				perpage: 8,
				paged: 1,
				taxquery: [
					{
						taxonomy: "taxonomy-one",
						terms: [101],
						compare: "IN",
					},
				],
			},
			{ museumId: "museum-1", signal },
		);
		expect(listItemsMock).toHaveBeenNthCalledWith(
			2,
			{
				perpage: 8,
				paged: 1,
				taxquery: [
					{
						taxonomy: "taxonomy-two",
						terms: [202],
						compare: "IN",
					},
				],
			},
			{ museumId: "museum-1", signal },
		);
	});

	it("preserves successful occurrence results when another occurrence fails", async () => {
		listItemsMock.mockImplementation(async (params) => {
			if (requestedTaxonomy(params) === "unavailable") {
				throw new Error("Occurrence unavailable");
			}
			return response([item(42)], 6);
		});

		await expect(
			fetchThemeMuseumItems("museum-1", [
				occurrence("unavailable", 101),
				occurrence("available", 202),
			]),
		).resolves.toEqual({
			items: [item(42)],
			wpTotal: 6,
			wpTotalPages: 1,
		});
	});

	it("rejects an aborted aggregate instead of caching a partial preview", async () => {
		const controller = new AbortController();
		listItemsMock.mockImplementation(async (params, options) => {
			if (requestedTaxonomy(params) === "available") {
				return response([item(42)], 6);
			}
			return new Promise((_, reject) => {
				options?.signal?.addEventListener("abort", () => {
					reject(options.signal?.reason);
				});
			});
		});

		const aggregate = fetchThemeMuseumItems(
			"museum-1",
			[occurrence("available", 101), occurrence("pending", 202)],
			controller.signal,
		);
		controller.abort(new DOMException("Navigation cancelled", "AbortError"));

		await expect(aggregate).rejects.toMatchObject({ name: "AbortError" });
	});

	it("rejects when every occurrence request fails", async () => {
		listItemsMock.mockRejectedValue(new Error("Museum unavailable"));

		await expect(
			fetchThemeMuseumItems("museum-1", [
				occurrence("taxonomy-one", 101),
				occurrence("taxonomy-two", 202),
			]),
		).rejects.toBeInstanceOf(Error);
	});
});
