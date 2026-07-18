import { useQuery } from "@tanstack/react-query";
import type { listItemsResponse } from "@/services/generated/items/items";
import type { ListItemsParams } from "@/services/generated/tainacanV2.schemas";
import { tainacanMutator, getPaginationMeta } from "@/services/tainacanMutator";
import type { FormattedItemsRes, TainacanItem } from "@/types/tainacan";
import { getMuseumRequestOptions } from "./museumRequest";

export interface UseMuseumItemsParams {
	page?: number;
	search?: string;
	collectionId?: number;
	filterParams?: Record<string, unknown>;
	sortParams?: { orderby: string; order: string };
	enabled?: boolean;
}

export function useMuseumItems(museumId: string, params: UseMuseumItemsParams) {
	const {
		page = 1,
		search = "",
		collectionId,
		filterParams,
		sortParams,
		enabled = true,
	} = params;

	return useQuery({
		queryKey: [
			"museum-items",
			museumId,
			page,
			search,
			collectionId ?? null,
			filterParams ?? null,
			sortParams ?? null,
		],
		queryFn: async (): Promise<FormattedItemsRes> => {
			const request = getMuseumRequestOptions(museumId);
			const queryParams = {
				perpage: 50,
				paged: page,
				...filterParams,
				...(search.trim() ? { search: search.trim() } : {}),
				...(sortParams
					? {
							orderby: sortParams.orderby,
							order: sortParams.order,
						}
					: {}),
			} as ListItemsParams;

			const path =
				typeof collectionId === "number"
					? `/collection/${collectionId}/items`
					: "/items";

			const response = await tainacanMutator<listItemsResponse>(path, {
				...request,
				params: queryParams,
			});

			const meta = getPaginationMeta(response);
			const body = response.data;
			if (!body || typeof body !== "object" || !("items" in body)) {
				throw new Error("Resposta inesperada ao carregar itens");
			}

			return {
				items: (body.items ?? []) as TainacanItem[],
				wpTotal: meta?.wpTotal ?? 0,
				wpTotalPages: meta?.wpTotalPages ?? 1,
			};
		},
		enabled: enabled && Boolean(museumId),
		staleTime: 30_000,
	});
}
