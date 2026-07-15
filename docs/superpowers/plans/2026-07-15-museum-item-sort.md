# Museum Item Sort Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a four-option sort Selector on museum pages (title/date × asc/desc) with URL state only when not using the API default (**Padrão**).

**Architecture:** Pure helpers map `ItemSort` literals to Tainacan `orderby`/`order`. `getItems` merges those params only when set. Museum page stores `sort` via `nuqs` `parseAsStringLiteral` and renders `ItemSortSelector` under search.

**Tech Stack:** Next.js App Router (client), React Query, nuqs `parseAsStringLiteral`, Astryx `Selector`, TypeScript. Package manager: Bun.

> **Testing note:** This repo has no automated test runner (`AGENTS.md`). Verification is `bun run typecheck && bun run lint && bun run build` (or `node node_modules/next/dist/bin/next build` if `bun run build` SIGSEGVs after success) plus manual GUI checks. Do not add a test framework.

**Spec:** `docs/superpowers/specs/2026-07-15-museum-item-sort-design.md`

---

### File map

| File | Responsibility |
| --- | --- |
| `src/utils/itemSort.ts` | Sort literals, labels, `sortToQueryParams` |
| `src/services/tainacanService.ts` | Optional sort params on `getItems` |
| `src/components/ItemSortSelector.tsx` | Astryx Selector UI |
| `src/app/[museumId]/page.tsx` | nuqs `sort` + wire selector + query key |

---

### Task 1: Add `itemSort` helpers

**Files:**
- Create: `src/utils/itemSort.ts`

- [ ] **Step 1: Create the module**

```ts
export const ITEM_SORT_VALUES = [
	"title-asc",
	"title-desc",
	"date-asc",
	"date-desc",
] as const;

export type ItemSort = (typeof ITEM_SORT_VALUES)[number];

export const ITEM_SORT_OPTIONS: { value: ItemSort; label: string }[] = [
	{ value: "title-asc", label: "Título A–Z" },
	{ value: "title-desc", label: "Título Z–A" },
	{ value: "date-asc", label: "Data crescente" },
	{ value: "date-desc", label: "Data decrescente" },
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
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/utils/itemSort.ts
git commit -m "feat(museums): add item sort helpers"
```

---

### Task 2: Pass sort params through `getItems`

**Files:**
- Modify: `src/services/tainacanService.ts`

- [ ] **Step 1: Extend `getItems`**

Replace the existing `getItems` signature and params construction with:

```ts
export const getItems = async (
	museumId: string,
	page: number = 1,
	searchTerm: string = "",
	collectionId?: number,
	sortParams?: { orderby: string; order: string },
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

	const params: Record<string, number | string> = {
		perpage,
		paged,
	};

	if (searchTerm && searchTerm.trim() !== "") {
		params.search = searchTerm.trim();
	}

	if (sortParams) {
		params.orderby = sortParams.orderby;
		params.order = sortParams.order;
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

Do not send `order`/`orderby` when `sortParams` is undefined (Padrão).

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/services/tainacanService.ts
git commit -m "feat(museums): support orderby and order on getItems"
```

---

### Task 3: `ItemSortSelector` + wire museum page

**Files:**
- Create: `src/components/ItemSortSelector.tsx`
- Modify: `src/app/[museumId]/page.tsx`

- [ ] **Step 1: Create the selector component**

```tsx
"use client";

import { Selector } from "@astryxdesign/core/Selector";
import {
	ITEM_SORT_OPTIONS,
	type ItemSort,
} from "@/utils/itemSort";

export type ItemSortSelectorProps = {
	value: ItemSort | null;
	onChange: (next: ItemSort | null) => void;
};

export function ItemSortSelector({ value, onChange }: ItemSortSelectorProps) {
	return (
		<Selector
			label="Ordenar"
			placeholder="Padrão"
			options={ITEM_SORT_OPTIONS}
			value={value ?? undefined}
			onChange={(next) => {
				onChange(next as ItemSort);
			}}
			hasClear
			size="sm"
		/>
	);
}
```

If Astryx `Selector` with `hasClear` types `onChange` as `(value: string | null) => void`, handle `null` explicitly:

```tsx
onChange={(next) => {
	onChange(next === null ? null : (next as ItemSort));
}}
```

Verify with `bun run astryx component Selector` if typecheck complains.

- [ ] **Step 2: Wire `sort` into the museum page**

In `src/app/[museumId]/page.tsx`:

1. Update imports:

```tsx
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { ItemSortSelector } from "@/components/ItemSortSelector";
import { ITEM_SORT_VALUES, sortToQueryParams } from "@/utils/itemSort";
```

2. Extend query state:

```tsx
const [{ search, page, collection, sort }, setQueryStates] = useQueryStates({
	search: parseAsString.withDefault(""),
	page: parseAsInteger.withDefault(1),
	collection: parseAsInteger,
	sort: parseAsStringLiteral(ITEM_SORT_VALUES),
});
```

`parseAsStringLiteral` without default yields `ItemSort | null` when absent — that is Padrão.

3. Pass sort into items query:

```tsx
const sortParams = sortToQueryParams(sort);

const { data, isLoading, error, isError } = useQuery({
	queryKey: ["museum-items", museumId, page, search, collection, sort],
	queryFn: () =>
		getItems(
			museumId,
			page,
			search,
			collection === null ? undefined : collection,
			sortParams,
		),
	enabled: !!museumId,
});
```

4. Render under SearchBar (inside the `maxWidth={672}` stack, after SearchBar):

```tsx
<VStack maxWidth={672} width="100%" gap={3}>
	<SearchBar
		value={searchInput}
		onChange={(e: ChangeEvent<HTMLInputElement>) => {
			setSearchInput(e.target.value);
		}}
	/>
	<ItemSortSelector
		value={sort}
		onChange={(next) => {
			setQueryStates({
				sort: next,
				page: 1,
			});
		}}
	/>
</VStack>
```

If the parent `VStack` around SearchBar currently has no `gap`, add `gap={3}` as above. Keep CollectionTabs `onChange` as-is (do **not** clear sort on collection change per spec).

- [ ] **Step 3: Verify**

Run: `bun run typecheck && bun run lint && bun run build`  
(If Bun SIGSEGVs after a successful Next build, confirm with `node node_modules/next/dist/bin/next build`.)  
Expected: all PASS.

Manual:
- Select Título A–Z → URL has `sort=title-asc` → list order changes
- Reload keeps selection
- Clear → no `sort` param
- Change sort resets page to 1
- Works with a selected collection

- [ ] **Step 4: Commit**

```bash
git add src/components/ItemSortSelector.tsx 'src/app/[museumId]/page.tsx'
git commit -m "feat(museums): add item sort selector to museum browse"
```

---

### Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Four sort options + Padrão default | Task 1 + 3 |
| Single `sort` URL param, omit when default | Task 3 |
| Map to `orderby`/`order` only when set | Task 1 + 2 |
| Selector under search | Task 3 |
| Clear → Padrão | Task 3 |
| Page reset on change; keep collection | Task 3 |
| Invalid sort stripped by parser | Task 3 (`parseAsStringLiteral`) |
| Relevance / filters panel nesting | — out of scope |
