import {
	useListCollectionFilters,
	useListFilters,
} from "@/services/generated/filters/filters";
import type { TainacanFilter } from "@/types/tainacan";
import { getMuseumApiBase } from "./museumRequest";

export function useMuseumFilters(museumId: string, collectionId?: number) {
	const baseURL = getMuseumApiBase(museumId);
	const request = baseURL ? { baseURL } : undefined;

	const museumFilters = useListFilters<TainacanFilter[]>(undefined, {
		request,
		query: {
			queryKey: ["museum-filters", museumId, null],
			enabled: Boolean(baseURL) && collectionId === undefined,
			select: (response) => response.data as TainacanFilter[],
		},
	});

	const collectionFilters = useListCollectionFilters<TainacanFilter[]>(
		collectionId ?? 0,
		undefined,
		{
			request,
			query: {
				queryKey: ["museum-filters", museumId, collectionId ?? null],
				enabled: Boolean(baseURL) && collectionId !== undefined,
				select: (response) => response.data as TainacanFilter[],
			},
		},
	);

	return collectionId === undefined ? museumFilters : collectionFilters;
}
