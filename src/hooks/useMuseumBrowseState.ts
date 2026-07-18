import {
	parseAsInteger,
	parseAsJson,
	parseAsString,
	parseAsStringLiteral,
	useQueryStates,
} from "nuqs";
import { useEffect } from "react";
import type { TainacanFilter } from "@/types/tainacan";
import { ITEM_SORT_VALUES } from "@/utils/itemSort";
import { ITEM_VIEW_VALUES } from "@/utils/itemView";
import {
	type FiltersState,
	FiltersStateSchema,
	sanitizeFiltersState,
} from "@/utils/tainacanFilters";

export function useMuseumBrowseState() {
	return useQueryStates({
		search: parseAsString.withDefault(""),
		page: parseAsInteger.withDefault(1),
		collection: parseAsInteger,
		filters: parseAsJson((value) => {
			const parsed = FiltersStateSchema.safeParse(value);
			return parsed.success ? parsed.data : null;
		}),
		sort: parseAsStringLiteral(ITEM_SORT_VALUES),
		view: parseAsStringLiteral(ITEM_VIEW_VALUES),
	});
}

export function useSanitizeMuseumFilters(
	filters: FiltersState | null,
	filterDefs: TainacanFilter[],
	isFiltersSuccess: boolean,
	setQueryStates: ReturnType<typeof useMuseumBrowseState>[1],
) {
	useEffect(() => {
		if (!isFiltersSuccess) return;
		const sanitized = sanitizeFiltersState(filters, filterDefs);
		const currentJson = JSON.stringify(filters ?? null);
		const nextJson = JSON.stringify(sanitized);
		if (currentJson !== nextJson) {
			setQueryStates({ filters: sanitized });
		}
	}, [filters, filterDefs, isFiltersSuccess, setQueryStates]);
}
