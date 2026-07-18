import { getItem } from "@/services/generated/items/items";
import type { TainacanItem } from "@/types/tainacan";
import { getMuseumRequestOptions } from "./museumRequest";

export async function fetchMuseumItem(
	museumId: string,
	itemId: number,
): Promise<TainacanItem | null> {
	try {
		const response = await getItem(
			String(itemId),
			undefined,
			getMuseumRequestOptions(museumId),
		);
		return response.data as TainacanItem;
	} catch (error) {
		console.error("Error fetching item:", error);
		return null;
	}
}
