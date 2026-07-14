# Museum Faceted Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add URL-backed faceted filters on museum pages (taxonomy, text, numeric/date intervals) via a collapsible panel under search, using Tainacan filter defs and query adapters.

**Architecture:** Expand filter/term Zod schemas; extend `getItems` + `apiClient` to pass nested `taxquery`/`metaquery` params; add `tainacanFilters` helpers (value schema, family detection, API adapters, URL sanitization); build `MuseumFiltersPanel`; wire `nuqs` `filters` JSON into `MuseumContent`. Changing collection clears filters.

**Tech Stack:** Next.js App Router (client), React Query, nuqs `parseAsJson`, Axios nested params, Astryx `Collapsible` / `MultiSelector` / `TextInput` / `Button` / `VStack`, Zod. Package manager: Bun.

> **Testing note:** This repo has no automated test runner (`AGENTS.md`). Verification is `bun run typecheck && bun run lint && bun run build` (or `node node_modules/next/dist/bin/next build` if `bun run build` SIGSEGVs after success) plus manual GUI checks. Do not add a test framework.

**Spec:** `docs/superpowers/specs/2026-07-14-museum-faceted-filters-design.md`

---

### File map

| File | Responsibility |
| --- | --- |
| `src/schemas/tainacan.ts` | Richer filter schema + taxonomy terms schema |
| `src/types/tainacan.ts` | Export new inferred types |
| `src/services/apiClient.ts` | Allow nested Axios query params |
| `src/services/tainacanService.ts` | `filterParams` on `getItems`; `getTaxonomyTerms` |
| `src/utils/tainacanFilters.ts` | FilterValue schema, families, adapters, sanitize |
| `src/components/MuseumFiltersPanel.tsx` | Collapsible filter UI |
| `src/app/[museumId]/page.tsx` | Wire defs, URL state, panel, items query |

---

### Task 1: Expand schemas and types for filters + terms

**Files:**
- Modify: `src/schemas/tainacan.ts`
- Modify: `src/types/tainacan.ts`

- [ ] **Step 1: Replace `TainacanFilterSchema` and add terms schema**

In `src/schemas/tainacan.ts`, replace the existing `TainacanFilterSchema` with:

```ts
export const TainacanFilterMetadatumSchema = z
	.object({
		metadatum_id: z.union([z.string(), z.number()]).optional(),
		metadatum_name: z.string().optional(),
		metadata_type_object: z
			.object({
				options: z
					.object({
						taxonomy_id: z.number().optional(),
						taxonomy: z.string().optional(),
					})
					.passthrough()
					.optional(),
			})
			.passthrough()
			.optional(),
	})
	.passthrough();

export const TainacanFilterSchema = z.object({
	id: z.number(),
	name: z.string(),
	filter_type: z.string(),
	collection_id: z.union([z.number(), z.string()]),
	metadatum_id: z.union([z.number(), z.string()]).optional(),
	enabled: z.string().optional(),
	metadatum: TainacanFilterMetadatumSchema.optional(),
});

export const TainacanTermSchema = z
	.object({
		id: z.number(),
		name: z.string(),
	})
	.passthrough();

export const GetTaxonomyTermsResponseSchema = z.array(TainacanTermSchema);
```

Keep `GetFiltersResponseSchema = z.array(TainacanFilterSchema)`.

- [ ] **Step 2: Export new types**

In `src/types/tainacan.ts`, add imports for `GetTaxonomyTermsResponseSchema` and `TainacanTermSchema`, and:

```ts
export type TainacanTerm = z.infer<typeof TainacanTermSchema>;
export type GetTaxonomyTermsResponse = z.infer<
	typeof GetTaxonomyTermsResponseSchema
>;
```

- [ ] **Step 3: Typecheck**

Run: `bun run typecheck`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/schemas/tainacan.ts src/types/tainacan.ts
git commit -m "feat(museums): expand filter and taxonomy term schemas"
```

---

### Task 2: Nested query params + terms fetch + `getItems` filter params

**Files:**
- Modify: `src/services/apiClient.ts`
- Modify: `src/services/tainacanService.ts`

- [ ] **Step 1: Widen `fetchAndValidate` params**

In `src/services/apiClient.ts`, change the params type so Axios can serialize nested `taxquery` / `metaquery`:

```ts
export const fetchAndValidate = async <T extends z.ZodTypeAny>(
	url: string,
	schema: T,
	params?: Record<string, unknown>,
): Promise<ValidatedResponse<z.infer<T>>> => {
	const response: AxiosResponse = await apiClient.get(url, { params });
	// ... unchanged
};
```

- [ ] **Step 2: Extend `getItems` and add `getTaxonomyTerms`**

In `src/services/tainacanService.ts`:

1. Import `GetTaxonomyTermsResponseSchema` and type `TainacanTerm`.
2. Replace `getItems` with:

```ts
export const getItems = async (
	museumId: string,
	page: number = 1,
	searchTerm: string = "",
	collectionId?: number,
	filterParams?: Record<string, unknown>,
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

	const params: Record<string, unknown> = {
		perpage,
		paged,
		...(filterParams ?? {}),
	};

	if (searchTerm && searchTerm.trim() !== "") {
		params.search = searchTerm.trim();
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
```

3. Add:

```ts
export const getTaxonomyTerms = async (
	museumId: string,
	taxonomyId: number,
): Promise<TainacanTerm[] | null> => {
	const museum = getMuseumById(museumId);
	if (!museum) return null;

	const apiUrl = `${museum.api}/taxonomy/${taxonomyId}/terms`;

	try {
		const res = await fetchAndValidate(
			apiUrl,
			GetTaxonomyTermsResponseSchema,
		);
		return res.data;
	} catch (error) {
		console.error("Error fetching taxonomy terms:", error);
		return null;
	}
};
```

Verified live: `GET {api}/taxonomy/{taxonomyId}/terms` returns `{ id, name, ... }[]`. Axios nested `taxquery` / `metaquery` against collection items returns filtered results.

- [ ] **Step 3: Typecheck**

Run: `bun run typecheck`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/services/apiClient.ts src/services/tainacanService.ts
git commit -m "feat(museums): support filter query params and taxonomy terms"
```

---

### Task 3: Filter value schema, families, and API adapters

**Files:**
- Create: `src/utils/tainacanFilters.ts`

- [ ] **Step 1: Create the helpers module**

```ts
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
	const id = filter.metadatum?.metadata_type_object?.options?.taxonomy_id;
	return typeof id === "number" ? id : null;
}

export function getTaxonomyDbIdentifier(filter: TainacanFilter): string | null {
	const taxonomy = filter.metadatum?.metadata_type_object?.options?.taxonomy;
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
			taxquery.push({
				taxonomy,
				terms: value.map((id) => Number(id)).filter((n) => Number.isFinite(n)),
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

		if (family === "interval" && typeof value === "object" && !Array.isArray(value)) {
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
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/utils/tainacanFilters.ts
git commit -m "feat(museums): add Tainacan filter value adapters"
```

---

### Task 4: `MuseumFiltersPanel` UI

**Files:**
- Create: `src/components/MuseumFiltersPanel.tsx`

- [ ] **Step 1: Create the panel component**

Use Astryx only (no `<div>`). Taxonomy controls use `MultiSelector` (works for short and long lists). Interval/text use `TextInput`. Terms load per taxonomy via React Query when the panel is open / filter is taxonomy.

```tsx
"use client";

import { Button } from "@astryxdesign/core/Button";
import { Collapsible } from "@astryxdesign/core/Collapsible";
import { MultiSelector } from "@astryxdesign/core/MultiSelector";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { getTaxonomyTerms } from "@/services/tainacanService";
import type { TainacanFilter } from "@/types/tainacan";
import {
	type FilterIntervalValue,
	type FilterValue,
	type FiltersState,
	countActiveFilters,
	getFilterFamily,
	getTaxonomyId,
	isSupportedFilter,
} from "@/utils/tainacanFilters";

export type MuseumFiltersPanelProps = {
	museumId: string;
	filters: FiltersState | null;
	filterDefs: TainacanFilter[];
	isLoading?: boolean;
	onChange: (next: FiltersState | null) => void;
};

function TaxonomyFilterControl({
	museumId,
	filter,
	value,
	onChange,
}: {
	museumId: string;
	filter: TainacanFilter;
	value: string[];
	onChange: (next: string[]) => void;
}) {
	const taxonomyId = getTaxonomyId(filter);
	const { data: terms = [], isLoading } = useQuery({
		queryKey: ["taxonomy-terms", museumId, taxonomyId],
		queryFn: async () => {
			if (taxonomyId === null) return [];
			const data = await getTaxonomyTerms(museumId, taxonomyId);
			if (data === null) throw new Error("Falha ao carregar termos");
			return data;
		},
		enabled: taxonomyId !== null,
	});

	return (
		<MultiSelector
			label={filter.name}
			options={terms.map((term) => ({
				value: String(term.id),
				label: term.name,
			}))}
			value={value}
			onChange={onChange}
			placeholder="Selecionar..."
			hasSearch={terms.length > 8}
			searchPlaceholder="Buscar..."
			triggerDisplay="labels"
			isLoading={isLoading}
			size="sm"
		/>
	);
}

function TextFilterControl({
	filter,
	value,
	onCommit,
}: {
	filter: TainacanFilter;
	value: string;
	onCommit: (next: string) => void;
}) {
	const [local, setLocal] = useState(value);
	const [debounced] = useDebounce(local, 400);

	useEffect(() => {
		setLocal(value);
	}, [value]);

	useEffect(() => {
		if (debounced !== value) onCommit(debounced);
	}, [debounced, value, onCommit]);

	return (
		<TextInput
			label={filter.name}
			value={local}
			onChange={(next) => setLocal(next)}
			size="sm"
			hasClear
		/>
	);
}

function IntervalFilterControl({
	filter,
	value,
	onCommit,
}: {
	filter: TainacanFilter;
	value: FilterIntervalValue;
	onCommit: (next: FilterIntervalValue) => void;
}) {
	const [local, setLocal] = useState<FilterIntervalValue>(value);
	const [debounced] = useDebounce(local, 400);

	useEffect(() => {
		setLocal(value);
	}, [value]);

	useEffect(() => {
		const same =
			(debounced.min ?? "") === (value.min ?? "") &&
			(debounced.max ?? "") === (value.max ?? "");
		if (!same) onCommit(debounced);
	}, [debounced, value, onCommit]);

	return (
		<VStack gap={2}>
			<Text type="label" as="p">
				{filter.name}
			</Text>
			<TextInput
				label="Mínimo"
				value={local.min ?? ""}
				onChange={(min) => setLocal((prev) => ({ ...prev, min }))}
				size="sm"
				hasClear
			/>
			<TextInput
				label="Máximo"
				value={local.max ?? ""}
				onChange={(max) => setLocal((prev) => ({ ...prev, max }))}
				size="sm"
				hasClear
			/>
		</VStack>
	);
}

export function MuseumFiltersPanel({
	museumId,
	filters,
	filterDefs,
	isLoading = false,
	onChange,
}: MuseumFiltersPanelProps) {
	const supported = filterDefs.filter(isSupportedFilter);
	const activeCount = countActiveFilters(filters);
	const hasActive = activeCount > 0;

	if (isLoading || supported.length === 0) {
		return null;
	}

	const setFilterValue = (filterId: number, value: FilterValue | null) => {
		const key = String(filterId);
		const current = { ...(filters ?? {}) };
		if (value === null) {
			delete current[key];
		} else {
			current[key] = value;
		}
		onChange(Object.keys(current).length > 0 ? current : null);
	};

	return (
		<Collapsible
			defaultIsOpen={hasActive}
			trigger={
				<Text type="label" as="span">
					{hasActive ? `Filtros (${activeCount})` : "Filtros"}
				</Text>
			}
		>
			<VStack gap={4}>
				{supported.map((filter) => {
					const family = getFilterFamily(filter.filter_type);
					const raw = filters?.[String(filter.id)];

					if (family === "taxonomy") {
						const value = Array.isArray(raw) ? raw : [];
						return (
							<TaxonomyFilterControl
								key={filter.id}
								museumId={museumId}
								filter={filter}
								value={value}
								onChange={(next) =>
									setFilterValue(filter.id, next.length > 0 ? next : null)
								}
							/>
						);
					}

					if (family === "text") {
						const value = typeof raw === "string" ? raw : "";
						return (
							<TextFilterControl
								key={filter.id}
								filter={filter}
								value={value}
								onCommit={(next) =>
									setFilterValue(filter.id, next.trim() ? next : null)
								}
							/>
						);
					}

					if (family === "interval") {
						const value: FilterIntervalValue =
							raw && typeof raw === "object" && !Array.isArray(raw)
								? raw
								: {};
						return (
							<IntervalFilterControl
								key={filter.id}
								filter={filter}
								value={value}
								onCommit={(next) => {
									const empty = !next.min?.trim() && !next.max?.trim();
									setFilterValue(filter.id, empty ? null : next);
								}}
							/>
						);
					}

					return null;
				})}

				{hasActive ? (
					<Button
						variant="secondary"
						size="sm"
						label="Limpar filtros"
						onClick={() => onChange(null)}
					/>
				) : null}
			</VStack>
		</Collapsible>
	);
}
```

If `Text type="label"` is invalid, use `type="supporting"` or omit `type` per Astryx `Text` docs (`bun run astryx component Text`). If `Button` uses `children` instead of `label`, switch to the documented API (`bun run astryx component Button` and match existing app usage).

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`  
Expected: PASS (fix any Astryx prop mismatches)

- [ ] **Step 3: Commit**

```bash
git add src/components/MuseumFiltersPanel.tsx
git commit -m "feat(museums): add MuseumFiltersPanel for faceted browse"
```

---

### Task 5: Wire museum page (nuqs + defs + items + clear on collection)

**Files:**
- Modify: `src/app/[museumId]/page.tsx`

- [ ] **Step 1: Update imports**

Add:

```tsx
import { parseAsInteger, parseAsJson, parseAsString, useQueryStates } from "nuqs";
import { MuseumFiltersPanel } from "@/components/MuseumFiltersPanel";
import { getCollections, getFilters, getItems } from "@/services/tainacanService";
import {
	FiltersStateSchema,
	buildFilterQueryParams,
	sanitizeFiltersState,
} from "@/utils/tainacanFilters";
```

Remove the old single-line imports that these replace (`parseAsInteger, parseAsString` line and `getCollections, getItems` line).

- [ ] **Step 2: Add `filters` to nuqs and clear on collection tab change**

Extend query state:

```tsx
const [{ search, page, collection, filters }, setQueryStates] = useQueryStates({
	search: parseAsString.withDefault(""),
	page: parseAsInteger.withDefault(1),
	collection: parseAsInteger,
	filters: parseAsJson((value) => {
		const parsed = FiltersStateSchema.safeParse(value);
		return parsed.success ? parsed.data : null;
	}),
});
```

Update `CollectionTabs` `onChange` to clear filters:

```tsx
onChange={(next) => {
	setQueryStates({
		collection: next === "all" ? null : Number(next),
		page: 1,
		filters: null,
	});
}}
```

- [ ] **Step 3: Fetch filter defs and sanitize URL**

After collections logic, add:

```tsx
const {
	data: filterDefs = [],
	isLoading: isFiltersLoading,
	isError: isFiltersError,
	isSuccess: isFiltersSuccess,
} = useQuery({
	queryKey: ["museum-filters", museumId, collection],
	queryFn: async () => {
		const data = await getFilters(
			museumId,
			collection === null ? undefined : collection,
		);
		if (data === null) {
			throw new Error("Falha ao carregar filtros");
		}
		return data;
	},
	enabled: !!museumId,
});

useEffect(() => {
	if (!isFiltersSuccess) return;
	const sanitized = sanitizeFiltersState(filters, filterDefs);
	const currentJson = JSON.stringify(filters ?? null);
	const nextJson = JSON.stringify(sanitized);
	if (currentJson !== nextJson) {
		setQueryStates({ filters: sanitized });
	}
}, [filters, filterDefs, isFiltersSuccess, setQueryStates]);
```

- [ ] **Step 4: Pass filter params into items query**

```tsx
const filterParams = buildFilterQueryParams(filters, filterDefs);

const { data, isLoading, error, isError } = useQuery({
	queryKey: [
		"museum-items",
		museumId,
		page,
		search,
		collection,
		filters,
	],
	queryFn: () =>
		getItems(
			museumId,
			page,
			search,
			collection === null ? undefined : collection,
			filterParams,
		),
	enabled: !!museumId,
});
```

- [ ] **Step 5: Render panel under search; update empty copy**

Inside the centered column, immediately after the `SearchBar` `VStack`, add:

```tsx
{!isFiltersError ? (
	<MuseumFiltersPanel
		museumId={museumId}
		filters={filters}
		filterDefs={filterDefs}
		isLoading={isFiltersLoading}
		onChange={(next) => {
			setQueryStates({
				filters: next,
				page: 1,
			});
		}}
	/>
) : null}
```

Update the empty items Banner description to mention filters when active:

```tsx
description={
	search || countActiveFilters(filters) > 0
		? "Tente ajustar sua busca ou os filtros."
		: "Não há itens disponíveis no momento."
}
```

Import `countActiveFilters` from `@/utils/tainacanFilters` for that check.

- [ ] **Step 6: Verify**

Run: `bun run typecheck && bun run lint && bun run build`  
(If `bun run build` SIGSEGVs after a successful Next build, confirm with `node node_modules/next/dist/bin/next build`.)  
Expected: typecheck/lint PASS; production build compiles routes including `/[museumId]`.

Manual (Casa Benjamin Constant → pick collection with filters, e.g. Publicações):
- Open **Filtros** → select taxonomy → URL `filters` updates → list narrows
- Reload keeps facets
- Switch collection clears `filters`
- **Limpar filtros** restores unfiltered list within collection
- Interval min/max works
- Todos with empty museum-wide filters shows no panel

- [ ] **Step 7: Commit**

```bash
git add 'src/app/[museumId]/page.tsx'
git commit -m "feat(museums): wire faceted filters into museum browse"
```

---

### Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Always-on defs: museum vs collection `getFilters` | Task 5 |
| Collapsible under search | Task 4–5 |
| `filters` JSON via nuqs | Task 3–5 |
| Taxonomy / text / interval adapters | Task 3 |
| Nested API params on items | Task 2–3 |
| Terms on demand | Task 2 + 4 |
| Clear filters on collection change | Task 5 |
| Sanitize stale/unsupported URL values | Task 3 + 5 |
| Hide panel when empty/error/loading | Task 4–5 |
| Sort / facet counts / new routes | — out of scope |
