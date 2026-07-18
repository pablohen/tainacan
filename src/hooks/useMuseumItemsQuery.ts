import { keepPreviousData } from "@tanstack/react-query";
import {
	useListCollectionItems,
	useListItems,
} from "@/services/generated/items/items";
import type { ListItemsParams } from "@/services/generated/tainacanV2.schemas";
import { formatItemsResponse } from "@/services/tainacanMutator";
import { withMuseumRequest } from "@/services/tainacanRequest";
import type { FormattedItemsRes } from "@/types/tainacan";

interface UseMuseumItemsQueryOptions {
	museumId: string;
	collection: number | null;
	page: number;
	search: string;
	filterParams: Record<string, unknown> | undefined;
	sortParams: { orderby: string; order: string } | undefined;
	filtersReadyForItems: boolean;
	hasActiveFilters: boolean;
	isFiltersSuccess: boolean;
	isFiltersError: boolean;
}

export function useMuseumItemsQuery({
	museumId,
	collection,
	page,
	search,
	filterParams,
	sortParams,
	filtersReadyForItems,
}: UseMuseumItemsQueryOptions) {
	const itemParams = {
		perpage: 50,
		paged: page,
		...filterParams,
		...(search.trim() ? { search: search.trim() } : {}),
		...(sortParams
			? { orderby: sortParams.orderby, order: sortParams.order }
			: {}),
	} as ListItemsParams;

	const museumItemsQuery = useListItems<FormattedItemsRes>(itemParams, {
		...withMuseumRequest(museumId),
		query: {
			queryKey: [
				"museum-items",
				museumId,
				page,
				search,
				null,
				filterParams ?? null,
				sortParams ?? null,
			],
			enabled: Boolean(museumId) && filtersReadyForItems && collection === null,
			select: formatItemsResponse,
			placeholderData: keepPreviousData,
		},
	});

	const collectionItemsQuery = useListCollectionItems<FormattedItemsRes>(
		String(collection ?? 0),
		itemParams,
		{
			...withMuseumRequest(museumId),
			query: {
				queryKey: [
					"museum-items",
					museumId,
					page,
					search,
					collection,
					filterParams ?? null,
					sortParams ?? null,
				],
				enabled:
					Boolean(museumId) && filtersReadyForItems && collection !== null,
				select: formatItemsResponse,
				placeholderData: keepPreviousData,
			},
		},
	);

	return collection === null ? museumItemsQuery : collectionItemsQuery;
}

export function useMuseumItemsReady(
	hasActiveFilters: boolean,
	isFiltersSuccess: boolean,
	isFiltersError: boolean,
): boolean {
	return !hasActiveFilters || isFiltersSuccess || isFiltersError;
}
