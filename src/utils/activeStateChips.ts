import type { TainacanCollection, TainacanFilter } from "@/types/tainacan";
import { ITEM_SORT_OPTIONS, type ItemSort } from "@/utils/itemSort";
import {
	type FiltersState,
	type FilterValue,
	getFilterFamily,
	isEmptyFilterValue,
} from "@/utils/tainacanFilters";

export type ActiveStateChipKind = "search" | "collection" | "facet" | "sort";

export type ActiveStateChip = {
	id: string;
	kind: ActiveStateChipKind;
	label: string;
};

/** Optional map: taxonomyId → (termId string → term name) for nicer facet labels. */
export type TermLabelMap = Record<number, Record<string, string>>;

function formatFacetValue(
	filter: TainacanFilter,
	value: FilterValue,
	termLabels: TermLabelMap | undefined,
): string {
	const family = getFilterFamily(filter.filter_type);

	if (family === "taxonomy" && Array.isArray(value)) {
		const taxonomyId =
			filter.metadatum?.metadata_type_object?.options &&
			!Array.isArray(filter.metadatum.metadata_type_object.options)
				? filter.metadatum.metadata_type_object.options.taxonomy_id
				: undefined;
		const names = value.map((id) => {
			const fromMap =
				typeof taxonomyId === "number"
					? termLabels?.[taxonomyId]?.[id]
					: undefined;
			return fromMap ?? id;
		});
		return names.join(", ");
	}

	if (family === "text" && typeof value === "string") {
		return value.trim();
	}

	if (
		family === "interval" &&
		typeof value === "object" &&
		!Array.isArray(value)
	) {
		const min = value.min?.trim() ?? "";
		const max = value.max?.trim() ?? "";
		if (min && max) return `${min}–${max}`;
		return min || max;
	}

	return String(value);
}

export function buildActiveStateChips(input: {
	search: string;
	collectionId: number | null;
	collections: TainacanCollection[];
	filters: FiltersState | null;
	filterDefs: TainacanFilter[];
	sort: ItemSort | null;
	termLabels?: TermLabelMap;
}): ActiveStateChip[] {
	const chips: ActiveStateChip[] = [];

	const searchTerm = input.search.trim();
	if (searchTerm) {
		chips.push({
			id: "search",
			kind: "search",
			label: `Busca: ${searchTerm}`,
		});
	}

	if (input.collectionId !== null) {
		const collection = input.collections.find(
			(c) => c.id === input.collectionId,
		);
		chips.push({
			id: "collection",
			kind: "collection",
			label: collection?.name ?? `Coleção ${input.collectionId}`,
		});
	}

	if (input.filters) {
		const byId = new Map(input.filterDefs.map((f) => [String(f.id), f]));
		const facetKeys = Object.keys(input.filters).sort((a, b) =>
			a.localeCompare(b, "pt-BR", { numeric: true }),
		);
		for (const key of facetKeys) {
			const value = input.filters[key];
			if (isEmptyFilterValue(value)) continue;
			const def = byId.get(key);
			const filterName = def?.name ?? `Filtro ${key}`;
			const formatted = def
				? formatFacetValue(def, value, input.termLabels)
				: String(value);
			chips.push({
				id: `facet:${key}`,
				kind: "facet",
				label: `${filterName}: ${formatted}`,
			});
		}
	}

	if (input.sort !== null) {
		const option = ITEM_SORT_OPTIONS.find((o) => o.value === input.sort);
		chips.push({
			id: "sort",
			kind: "sort",
			label: option?.label ?? input.sort,
		});
	}

	return chips;
}

export function removeFacetFromFilters(
	filters: FiltersState | null,
	filterId: string,
): FiltersState | null {
	if (!filters) return null;
	const next = { ...filters };
	delete next[filterId];
	return Object.keys(next).length > 0 ? next : null;
}
