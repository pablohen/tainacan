export const ITEM_SORT_VALUES = [
	"title-asc",
	"title-desc",
	"date-asc",
	"date-desc",
] as const;

export type ItemSort = (typeof ITEM_SORT_VALUES)[number];

export const ITEM_SORT_OPTIONS: { value: ItemSort; label: string }[] = [
	{ value: "date-asc", label: "Data crescente" },
	{ value: "date-desc", label: "Data decrescente" },
	{ value: "title-asc", label: "Título A–Z" },
	{ value: "title-desc", label: "Título Z–A" },
];

export function isItemSort(value: string): value is ItemSort {
	return (ITEM_SORT_VALUES as readonly string[]).includes(value);
}

export function sortToQueryParams(
	sort: ItemSort | null,
): { orderby: string; order: string } | undefined {
	if (sort === null) return undefined;

	switch (sort) {
		case "title-asc":
			return { orderby: "title", order: "ASC" };
		case "title-desc":
			return { orderby: "title", order: "DESC" };
		case "date-asc":
			return { orderby: "date", order: "ASC" };
		case "date-desc":
			return { orderby: "date", order: "DESC" };
		default: {
			const _exhaustive: never = sort;
			return _exhaustive;
		}
	}
}
