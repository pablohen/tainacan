# Museum Active State Chips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a removable Token strip above museum results for active search, collection, facets, and sort, with per-chip remove and **Limpar tudo**.

**Architecture:** Pure `buildActiveStateChips` derives chip models from browse state. Presentational `MuseumActiveStateBar` renders Tokens + clear-all. `MuseumContent` owns nuqs patches and local `searchInput` sync. No new URL params.

**Tech Stack:** Next.js App Router (client), nuqs (existing), Astryx `Token` / `HStack` / `Button` / `VStack`, existing `tainacanFilters` + `itemSort` helpers. Package manager: Bun.

> **Testing note:** This repo has no automated test runner (`AGENTS.md`). Verification is `bun run typecheck && bun run lint && bun run build` (or `node node_modules/next/dist/bin/next build` if Bun SIGSEGVs after success) plus manual GUI checks. Do not add a test framework.

**Spec:** `docs/superpowers/specs/2026-07-17-museum-active-state-chips-design.md`

---

### File map

| File | Responsibility |
| --- | --- |
| `src/utils/activeStateChips.ts` | Chip types + `buildActiveStateChips` + facet value formatting |
| `src/components/MuseumActiveStateBar.tsx` | Tokens + Limpar tudo UI |
| `src/app/[museumId]/page.tsx` | Derive chips, handle remove/clear-all, render bar above results |

---

### Task 1: Chip model + builder helper

**Files:**
- Create: `src/utils/activeStateChips.ts`

- [ ] **Step 1: Create the helper module**

```ts
import type { TainacanCollection, TainacanFilter } from "@/types/tainacan";
import { ITEM_SORT_OPTIONS, type ItemSort } from "@/utils/itemSort";
import {
	type FilterValue,
	type FiltersState,
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

	if (family === "interval" && typeof value === "object" && !Array.isArray(value)) {
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
		const collection = input.collections.find((c) => c.id === input.collectionId);
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
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/utils/activeStateChips.ts
git commit -m "feat(museums): add active state chip builder"
```

---

### Task 2: `MuseumActiveStateBar` UI

**Files:**
- Create: `src/components/MuseumActiveStateBar.tsx`

- [ ] **Step 1: Create the component**

Use Astryx only (no raw `<div>`). Prefer `HStack` with `wrap="wrap"` for Tokens.

```tsx
"use client";

import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { Token } from "@astryxdesign/core/Token";
import { VStack } from "@astryxdesign/core/VStack";
import type { ActiveStateChip } from "@/utils/activeStateChips";

export type MuseumActiveStateBarProps = {
	chips: ActiveStateChip[];
	onRemove: (id: string) => void;
	onClearAll: () => void;
};

export function MuseumActiveStateBar({
	chips,
	onRemove,
	onClearAll,
}: MuseumActiveStateBarProps) {
	if (chips.length === 0) {
		return null;
	}

	return (
		<VStack gap={2} width="100%">
			<HStack gap={2} wrap="wrap" vAlign="center">
				{chips.map((chip) => (
					<Token
						key={chip.id}
						label={chip.label}
						size="sm"
						onRemove={() => onRemove(chip.id)}
					/>
				))}
				<Button
					variant="secondary"
					size="sm"
					label="Limpar tudo"
					onClick={onClearAll}
				/>
			</HStack>
		</VStack>
	);
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `bun run typecheck && bun run lint`  
Expected: PASS (fix Token/Button props via `bun run astryx component` if needed)

- [ ] **Step 3: Commit**

```bash
git add src/components/MuseumActiveStateBar.tsx
git commit -m "feat(museums): add MuseumActiveStateBar for browse chips"
```

---

### Task 3: Wire museum page

**Files:**
- Modify: `src/app/[museumId]/page.tsx`

- [ ] **Step 1: Imports**

Add:

```tsx
import { MuseumActiveStateBar } from "@/components/MuseumActiveStateBar";
import {
	buildActiveStateChips,
	removeFacetFromFilters,
} from "@/utils/activeStateChips";
```

- [ ] **Step 2: Derive chips (after filterDefs / collections / sort are available)**

Inside `MuseumContent`, before the `return` (after museum null check is fine, or before — chips don’t need museum title):

```tsx
const activeChips = buildActiveStateChips({
	search,
	collectionId: collection,
	collections,
	filters,
	filterDefs,
	sort,
	// termLabels optional in v1 — raw taxonomy ids are acceptable until terms resolve
});
```

Place this after `filterDefs` / `collections` / `sort` are in scope (anywhere before JSX is fine).

- [ ] **Step 3: Handlers**

```tsx
const handleRemoveChip = (id: string) => {
	if (id === "search") {
		setSearchInput("");
		setQueryStates({ search: null, page: 1 });
		return;
	}
	if (id === "collection") {
		setQueryStates({ collection: null, page: 1 });
		return;
	}
	if (id === "sort") {
		setQueryStates({ sort: null, page: 1 });
		return;
	}
	if (id.startsWith("facet:")) {
		const filterId = id.slice("facet:".length);
		setQueryStates({
			filters: removeFacetFromFilters(filters, filterId),
			page: 1,
		});
	}
};

const handleClearAll = () => {
	setSearchInput("");
	setQueryStates({
		search: null,
		collection: null,
		filters: null,
		sort: null,
		page: 1,
	});
};
```

Use exhaustive handling for known ids; ignore unknown ids.

- [ ] **Step 4: Render bar above results**

Immediately before the `{showItemsLoading ? (` block (after `MuseumFiltersPanel`), add:

```tsx
<MuseumActiveStateBar
	chips={activeChips}
	onRemove={handleRemoveChip}
	onClearAll={handleClearAll}
/>
```

- [ ] **Step 5: Verify**

Run: `bun run typecheck && bun run lint && bun run build`  
(If Bun SIGSEGVs after Next success, use `node node_modules/next/dist/bin/next build`.)

Manual:
- Apply search + collection + facet + sort → strip appears above results
- Remove one chip → only that state clears
- **Limpar tudo** → defaults, strip gone, SearchBar empty
- Reload with URL state → chips match

- [ ] **Step 6: Commit**

```bash
git add 'src/app/[museumId]/page.tsx'
git commit -m "feat(museums): show active browse state chips above results"
```

---

### Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Chips for search, collection, facets, sort | Task 1 + 3 |
| Strip only when ≥1 chip | Task 2 |
| Placement above results | Task 3 |
| Per-chip remove + Limpar tudo | Task 2 + 3 |
| Token UI, no new URL params | Task 2 + 3 |
| Facet one chip per taxonomy term (text/interval per key); order search→collection→facets→sort | Task 1 |
| CSS sticky / facet counts | — out of scope |
