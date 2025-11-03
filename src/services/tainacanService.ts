import axios from "axios";
import type { ItemDTO, Metadata } from "../interfaces/ItemDTO";
import type { ItemsDTO } from "../interfaces/ItemsDTO";
import { getMuseumById } from "../utils/museums";

export interface Items {
	id: number;
	title: string;
	description: string;
	document_as_html: string;
}

export interface Item {
	id: number;
	title: string;
	description: string;
	document_as_html: string;
	metadata: Metadata;
}
export interface FormattedItemsRes {
	items: Items[];
	wpTotal: number;
	wpTotalPages: number;
}

const getItems = async (
	museumId: string,
	page: number = 1,
	searchTerm: string = "",
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

	const apiUrl = `${museum.api}/items`;

	const params: Record<string, number | string> = {
		perpage,
		paged,
	};

	if (searchTerm && searchTerm.trim() !== "") {
		params.search = searchTerm.trim();
	}

	const res = await axios.get(apiUrl, { params }).catch(() => null);

	if (!res) return null;

	const wpTotal = res.headers["x-wp-total"] as unknown as number;
	const wpTotalPages = res.headers["x-wp-totalpages"] as unknown as number;
	const results = res.data as ItemsDTO;

	if (!results.items || !Array.isArray(results.items)) {
		return null;
	}

	const items: Items[] = results.items.map(
		({ id, title, description, document_as_html }) => ({
			id,
			title,
			description,
			document_as_html,
		}),
	);

	return {
		items,
		wpTotal: Number(wpTotal) || 0,
		wpTotalPages: Number(wpTotalPages) || 1,
	};
};

const getItem = async (
	museumId: string,
	itemId: number,
): Promise<Item | null> => {
	const museum = getMuseumById(museumId);
	if (!museum) {
		return null;
	}

	const res = await axios
		.get<ItemDTO>(`${museum.api}/items/${itemId}`)
		.catch(() => null);

	if (!res) return null;

	return {
		id: res.data.id,
		title: res.data.title,
		description: res.data.description,
		document_as_html: res.data.document_as_html,
		metadata: res.data.metadata,
	};
};

export const tainacanService = {
	getItems,
	getItem,
};
