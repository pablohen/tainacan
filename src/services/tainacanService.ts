import {
	GetCollectionsResponseSchema,
	GetFiltersResponseSchema,
	GetItemsResponseSchema,
	GetTaxonomiesResponseSchema,
	TainacanItemSchema,
} from "@/schemas/tainacan";
import { fetchAndValidate } from "@/services/apiClient";
import type {
	FormattedItemsRes,
	TainacanCollection,
	TainacanFilter,
	TainacanItem,
	TainacanTaxonomy,
} from "@/types/tainacan";
import { getMuseumById } from "@/utils/museums";

export const getItems = async (
	museumId: string,
	page: number = 1,
	searchTerm: string = "",
	collectionId?: number,
	sortParams?: { orderby: string; order: string },
): Promise<FormattedItemsRes | null> => {
	const perpage = 50;
	const paged = page;

	if (!museumId || typeof museumId !== "string") {
		return null;
	}

	const museum = getMuseumById(museumId);
	if (!museum) {
		return null;
	}

	const apiUrl =
		typeof collectionId === "number"
			? `${museum.api}/collection/${collectionId}/items`
			: `${museum.api}/items`;

	const params: Record<string, number | string> = {
		perpage,
		paged,
	};

	if (searchTerm && searchTerm.trim() !== "") {
		params.search = searchTerm.trim();
	}

	if (sortParams) {
		params.orderby = sortParams.orderby;
		params.order = sortParams.order;
	}

	try {
		const res = await fetchAndValidate(apiUrl, GetItemsResponseSchema, params);

		const wpTotal = res.headers["x-wp-total"] as number;
		const wpTotalPages = res.headers["x-wp-totalpages"] as number;

		return {
			items: res.data.items,
			wpTotal: Number(wpTotal) || 0,
			wpTotalPages: Number(wpTotalPages) || 1,
		};
	} catch (error) {
		console.error("Error fetching items:", error);
		return null;
	}
};

export const getItem = async (
	museumId: string,
	itemId: number,
): Promise<TainacanItem | null> => {
	const museum = getMuseumById(museumId);
	if (!museum) {
		return null;
	}

	const apiUrl = `${museum.api}/items/${itemId}`;

	try {
		const res = await fetchAndValidate(apiUrl, TainacanItemSchema);
		return res.data;
	} catch (error) {
		console.error("Error fetching item:", error);
		return null;
	}
};

export const getCollections = async (
	museumId: string,
): Promise<TainacanCollection[] | null> => {
	const museum = getMuseumById(museumId);
	if (!museum) return null;

	const apiUrl = `${museum.api}/collections`;

	try {
		const res = await fetchAndValidate(apiUrl, GetCollectionsResponseSchema);
		return res.data;
	} catch (error) {
		console.error("Error fetching collections:", error);
		return null;
	}
};

export const getTaxonomies = async (
	museumId: string,
): Promise<TainacanTaxonomy[] | null> => {
	const museum = getMuseumById(museumId);
	if (!museum) return null;

	const apiUrl = `${museum.api}/taxonomies`;

	try {
		const res = await fetchAndValidate(apiUrl, GetTaxonomiesResponseSchema);
		return res.data;
	} catch (error) {
		console.error("Error fetching taxonomies:", error);
		return null;
	}
};

export const getFilters = async (
	museumId: string,
	collectionId?: number,
): Promise<TainacanFilter[] | null> => {
	const museum = getMuseumById(museumId);
	if (!museum) return null;

	const apiUrl = collectionId
		? `${museum.api}/collection/${collectionId}/filters`
		: `${museum.api}/filters`;

	try {
		const res = await fetchAndValidate(apiUrl, GetFiltersResponseSchema);
		return res.data;
	} catch (error) {
		console.error("Error fetching filters:", error);
		return null;
	}
};
