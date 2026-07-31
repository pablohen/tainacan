import { listItems } from "@/services/generated/items/items";
import type { ListItemsParams } from "@/services/generated/tainacanV2.schemas";
import { formatItemsResponse } from "@/services/tainacanMutator";
import { tainacanRequestInit } from "@/services/tainacanRequest";
import type { FormattedItemsRes } from "@/types/tainacan";
import type { ThemeOccurrence } from "@/types/themes";
import { buildTaxonomyOccurrenceParams } from "@/utils/tainacanFilters";

export const THEME_ITEM_PREVIEW_SIZE = 8;

function distinctOccurrences(
	occurrences: ThemeOccurrence[],
): ThemeOccurrence[] {
	const seen = new Set<string>();
	return occurrences.filter((occurrence) => {
		const id = JSON.stringify([
			occurrence.taxonomyDbIdentifier,
			occurrence.termId,
		]);
		if (seen.has(id)) return false;
		seen.add(id);
		return true;
	});
}

export async function fetchThemeMuseumItems(
	museumId: string,
	occurrences: ThemeOccurrence[],
	signal?: AbortSignal,
): Promise<FormattedItemsRes> {
	const uniqueOccurrences = distinctOccurrences(occurrences);
	if (uniqueOccurrences.length === 0) {
		return { items: [], wpTotal: 0, wpTotalPages: 1 };
	}

	const options = tainacanRequestInit(museumId);
	const request = signal ? { ...options, signal } : options;
	const results = await Promise.allSettled(
		uniqueOccurrences.map(async (occurrence) => {
			const params = {
				perpage: THEME_ITEM_PREVIEW_SIZE,
				paged: 1,
				...buildTaxonomyOccurrenceParams(occurrence),
			} as ListItemsParams;
			return formatItemsResponse(await listItems(params, request));
		}),
	);
	if (signal?.aborted) {
		throw (
			signal.reason ??
			new DOMException("The operation was aborted.", "AbortError")
		);
	}
	const successes = results.flatMap((result) =>
		result.status === "fulfilled" ? [result.value] : [],
	);

	if (successes.length === 0) {
		const failure = results.find(
			(result): result is PromiseRejectedResult => result.status === "rejected",
		);
		throw failure?.reason instanceof Error
			? failure.reason
			: new Error("Unable to load theme items.");
	}

	const itemIds = new Set<number>();
	const items = successes.flatMap((response) =>
		response.items.filter((item) => {
			if (itemIds.has(item.id)) return false;
			itemIds.add(item.id);
			return true;
		}),
	);

	return {
		items: items.slice(0, THEME_ITEM_PREVIEW_SIZE),
		wpTotal: successes.reduce((total, response) => total + response.wpTotal, 0),
		wpTotalPages: 1,
	};
}
