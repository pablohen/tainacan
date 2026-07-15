import { z } from "zod";
import type { TainacanFilter } from "@/types/tainacan";

export const FilterIntervalValueSchema = z.object({
	min: z.string().optional(),
	max: z.string().optional(),
});

export const FilterValueSchema = z.union([
	z.array(z.string()),
	z.string(),
	FilterIntervalValueSchema,
]);

export const FiltersStateSchema = z.record(z.string(), FilterValueSchema);

export type FilterIntervalValue = z.infer<typeof FilterIntervalValueSchema>;
export type FilterValue = z.infer<typeof FilterValueSchema>;
export type FiltersState = z.infer<typeof FiltersStateSchema>;

export type FilterFamily = "taxonomy" | "text" | "interval" | "unsupported";

export function getFilterFamily(filterType: string): FilterFamily {
	const type = filterType.toLowerCase();
	if (type.includes("taxonomy")) return "taxonomy";
	if (
		type.includes("numeric_interval") ||
		type.includes("date_interval") ||
		type.includes("custom_interval") ||
		(type.includes("interval") && !type.includes("taxonomy"))
	) {
		return "interval";
	}
	if (
		type.includes("text") ||
		type.includes("custominput") ||
		type.includes("autocomplete")
	) {
		return "text";
	}
	return "unsupported";
}

export function isSupportedFilter(filter: TainacanFilter): boolean {
	return getFilterFamily(filter.filter_type) !== "unsupported";
}

export function getTaxonomyId(filter: TainacanFilter): number | null {
	const options = filter.metadatum?.metadata_type_object?.options;
	if (!options || Array.isArray(options)) return null;
	const id = options.taxonomy_id;
	return typeof id === "number" ? id : null;
}

export function getTaxonomyDbIdentifier(filter: TainacanFilter): string | null {
	const options = filter.metadatum?.metadata_type_object?.options;
	if (!options || Array.isArray(options)) return null;
	const taxonomy = options.taxonomy;
	return typeof taxonomy === "string" && taxonomy.length > 0 ? taxonomy : null;
}

export function getMetadatumId(filter: TainacanFilter): number | null {
	const raw = filter.metadatum_id ?? filter.metadatum?.metadatum_id;
	if (raw === undefined || raw === null) return null;
	const n = typeof raw === "number" ? raw : Number(raw);
	return Number.isFinite(n) ? n : null;
}

export function isEmptyFilterValue(value: FilterValue | undefined): boolean {
	if (value === undefined) return true;
	if (typeof value === "string") return value.trim() === "";
	if (Array.isArray(value)) return value.length === 0;
	return !value.min?.trim() && !value.max?.trim();
}

export function countActiveFilters(filters: FiltersState | null): number {
	if (!filters) return 0;
	return Object.values(filters).filter((v) => !isEmptyFilterValue(v)).length;
}

function valueMatchesFamily(family: FilterFamily, value: FilterValue): boolean {
	switch (family) {
		case "taxonomy":
			return (
				Array.isArray(value) &&
				value.length > 0 &&
				value.every((term) => typeof term === "string")
			);
		case "text":
			return typeof value === "string" && value.trim() !== "";
		case "interval":
			return (
				typeof value === "object" &&
				!Array.isArray(value) &&
				Boolean(value.min?.trim() || value.max?.trim())
			);
		case "unsupported":
			return false;
		default: {
			const exhaustiveCheck: never = family;
			return exhaustiveCheck;
		}
	}
}

/** Drop empty values, unknown ids, and unsupported filter types. */
export function sanitizeFiltersState(
	filters: FiltersState | null,
	defs: TainacanFilter[],
): FiltersState | null {
	if (!filters) return null;
	const byId = new Map(defs.map((f) => [String(f.id), f]));
	const next: FiltersState = {};
	for (const [key, value] of Object.entries(filters)) {
		const def = byId.get(key);
		if (!def || !isSupportedFilter(def)) continue;
		if (isEmptyFilterValue(value)) continue;
		if (!valueMatchesFamily(getFilterFamily(def.filter_type), value)) continue;
		next[key] = value;
	}
	return Object.keys(next).length > 0 ? next : null;
}

export function buildFilterQueryParams(
	filters: FiltersState | null,
	defs: TainacanFilter[],
): Record<string, unknown> {
	if (!filters) return {};
	const byId = new Map(defs.map((f) => [String(f.id), f]));
	const taxquery: Array<Record<string, unknown>> = [];
	const metaquery: Array<Record<string, unknown>> = [];

	for (const [key, value] of Object.entries(filters)) {
		const def = byId.get(key);
		if (!def || isEmptyFilterValue(value)) continue;
		const family = getFilterFamily(def.filter_type);

		if (family === "taxonomy" && Array.isArray(value)) {
			const taxonomy = getTaxonomyDbIdentifier(def);
			if (!taxonomy) continue;
			const terms = value
				.map((id) => Number(id))
				.filter((n) => Number.isFinite(n));
			if (terms.length === 0) continue;
			taxquery.push({
				taxonomy,
				terms,
				compare: "IN",
			});
			continue;
		}

		const metadatumId = getMetadatumId(def);
		if (metadatumId === null) continue;

		if (family === "text" && typeof value === "string") {
			metaquery.push({
				key: metadatumId,
				value: value.trim(),
				compare: "LIKE",
			});
			continue;
		}

		if (
			family === "interval" &&
			typeof value === "object" &&
			!Array.isArray(value)
		) {
			const min = value.min?.trim();
			const max = value.max?.trim();
			if (min && max) {
				metaquery.push({
					key: metadatumId,
					value: [min, max],
					compare: "BETWEEN",
				});
			} else if (min) {
				metaquery.push({
					key: metadatumId,
					value: min,
					compare: ">=",
				});
			} else if (max) {
				metaquery.push({
					key: metadatumId,
					value: max,
					compare: "<=",
				});
			}
		}
	}

	const params: Record<string, unknown> = {};
	if (taxquery.length > 0) params.taxquery = taxquery;
	if (metaquery.length > 0) params.metaquery = metaquery;
	return params;
}
