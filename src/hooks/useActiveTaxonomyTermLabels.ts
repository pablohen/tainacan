"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { getMuseumRequestOptions } from "@/hooks/tainacan/museumRequest";
import { listTaxonomyTerms } from "@/services/generated/taxonomies/taxonomies";
import type { TainacanFilter, TainacanTerm } from "@/types/tainacan";
import type { TermLabelMap } from "@/utils/activeStateChips";
import {
	type FiltersState,
	getFilterFamily,
	getTaxonomyId,
	isEmptyFilterValue,
} from "@/utils/tainacanFilters";

/** Taxonomy ids needed to label active facet chips (shares cache with Filtros panel). */
function activeTaxonomyIds(
	filters: FiltersState | null,
	filterDefs: TainacanFilter[],
): number[] {
	if (!filters) return [];
	const byId = new Map(filterDefs.map((f) => [String(f.id), f]));
	const ids = new Set<number>();
	for (const [key, value] of Object.entries(filters)) {
		if (isEmptyFilterValue(value)) continue;
		const def = byId.get(key);
		if (!def || getFilterFamily(def.filter_type) !== "taxonomy") continue;
		const taxonomyId = getTaxonomyId(def);
		if (taxonomyId !== null) ids.add(taxonomyId);
	}
	return [...ids].sort((a, b) => a - b);
}

export function useActiveTaxonomyTermLabels(
	museumId: string,
	filterDefs: TainacanFilter[],
	filters: FiltersState | null,
): TermLabelMap {
	const taxonomyIds = useMemo(
		() => activeTaxonomyIds(filters, filterDefs),
		[filters, filterDefs],
	);

	const results = useQueries({
		queries: taxonomyIds.map((taxonomyId) => ({
			queryKey: ["taxonomy-terms", museumId, taxonomyId],
			queryFn: async (): Promise<TainacanTerm[]> => {
				const response = await listTaxonomyTerms(
					taxonomyId,
					undefined,
					getMuseumRequestOptions(museumId),
				);
				return (response.data as TainacanTerm[]) ?? [];
			},
			enabled: !!museumId,
		})),
	});

	return useMemo(() => {
		const map: TermLabelMap = {};
		for (let i = 0; i < taxonomyIds.length; i++) {
			const taxonomyId = taxonomyIds[i];
			const terms = results[i]?.data;
			if (taxonomyId === undefined || !terms) continue;
			map[taxonomyId] = Object.fromEntries(
				terms.map((term) => [String(term.id), term.name]),
			);
		}
		return map;
	}, [taxonomyIds, results]);
}
