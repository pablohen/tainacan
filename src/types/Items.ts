import type { Item } from "./Item";

export interface GetItemsResponse {
	items: Item[];
	template: string;
	filters: unknown[];
	filters_arguments: unknown[];
}
