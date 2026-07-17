import type { TainacanCollection, TainacanFilter } from "@/types/tainacan";
import { ITEM_SORT_OPTIONS, type ItemSort } from "@/utils/itemSort";
import {
	type FiltersState,
	type FilterValue,
	getFilterFamily,
	getTaxonomyId,
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

function formatScalarFacetValue(
	filter: TainacanFilter,
	value: FilterValue,
): string {
	const family = getFilterFamily(filter.filter_type);

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

function termLabel(
	filter: TainacanFilter | undefined,
	termId: string,
	termLabels: TermLabelMap | undefined,
): string {
	if (!filter) return termId;
	const taxonomyId = getTaxonomyId(filter);
	if (taxonomyId === null) return termId;
	return termLabels?.[taxonomyId]?.[termId] ?? termId;
}

function pushFacetChips(
	chips: ActiveStateChip[],
	filterKey: string,
	value: FilterValue,
	def: TainacanFilter | undefined,
	termLabels: TermLabelMap | undefined,
): void {
	const filterName = def?.name ?? `Filtro ${filterKey}`;
	const family = def ? getFilterFamily(def.filter_type) : null;

	if (family === "taxonomy" || (family === null && Array.isArray(value))) {
		if (!Array.isArray(value) || value.length === 0) return;
		for (const termId of value) {
			chips.push({
				id: `facet:${filterKey}:${termId}`,
				kind: "facet",
				label: `${filterName}: ${termLabel(def, termId, termLabels)}`,
			});
		}
		return;
	}

	if (!def) {
		chips.push({
			id: `facet:${filterKey}`,
			kind: "facet",
			label: `${filterName}: ${String(value)}`,
		});
		return;
	}

	chips.push({
		id: `facet:${filterKey}`,
		kind: "facet",
		label: `${filterName}: ${formatScalarFacetValue(def, value)}`,
	});
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
			pushFacetChips(chips, key, value, byId.get(key), input.termLabels);
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

/** Parse `facet:{filterId}` or `facet:{filterId}:{termId}`. */
export function parseFacetChipId(
	id: string,
): { filterId: string; termId?: string } | null {
	if (!id.startsWith("facet:")) return null;
	const rest = id.slice("facet:".length);
	const colon = rest.indexOf(":");
	if (colon === -1) {
		return rest.length > 0 ? { filterId: rest } : null;
	}
	const filterId = rest.slice(0, colon);
	const termId = rest.slice(colon + 1);
	if (!filterId || !termId) return null;
	return { filterId, termId };
}

export function removeFacetFromFilters(
	filters: FiltersState | null,
	filterId: string,
	termId?: string,
): FiltersState | null {
	if (!filters) return null;
	const current = filters[filterId];

	if (termId !== undefined && Array.isArray(current)) {
		const nextTerms = current.filter((id) => id !== termId);
		const next = { ...filters };
		if (nextTerms.length === 0) {
			delete next[filterId];
		} else {
			next[filterId] = nextTerms;
		}
		return Object.keys(next).length > 0 ? next : null;
	}

	const next = { ...filters };
	delete next[filterId];
	return Object.keys(next).length > 0 ? next : null;
}
