import { useListCollections } from "@/services/generated/collections/collections";
import type { TainacanCollection } from "@/types/tainacan";
import { getMuseumApiBase } from "./museumRequest";

export function useMuseumCollections(museumId: string) {
	const baseURL = getMuseumApiBase(museumId);

	return useListCollections<TainacanCollection[]>(undefined, {
		request: baseURL ? { baseURL } : undefined,
		query: {
			queryKey: ["museum-collections", museumId],
			enabled: Boolean(baseURL),
			select: (response) => response.data as TainacanCollection[],
		},
	});
}
