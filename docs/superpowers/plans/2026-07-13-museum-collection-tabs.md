# Museum Collection Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users narrow a museum’s item list to one Tainacan collection via in-page tabs, with **Todos** (museum-wide `/items`) as the default and selection persisted in `?collection=`.

**Architecture:** Extend `getItems` to hit `/collection/{id}/items` when a collection id is provided. Add a presentational `CollectionTabs` (`TabList` + `Tab`). Wire `MuseumContent` to fetch collections, sync `collection` via `nuqs`, and pass the selected id into item queries. Invalid collection ids are cleared after collections resolve.

**Tech Stack:** Next.js App Router (client), React Query, nuqs, Astryx `TabList`/`Tab`, existing Tainacan service + Zod schemas. Package manager: Bun.

> **Testing note:** This repo has no automated test runner (`AGENTS.md`). Verification is `bun run typecheck && bun run lint && bun run build` plus manual GUI checks. Do not add a test framework.

**Spec:** `docs/superpowers/specs/2026-07-13-museum-collection-tabs-design.md`

---

### File map

| File | Responsibility |
| --- | --- |
| `src/services/tainacanService.ts` | Optional `collectionId` on `getItems`; swap endpoint |
| `src/components/CollectionTabs.tsx` | Presentational tabs: Todos + collections |
| `src/app/[museumId]/page.tsx` | nuqs `collection`, fetch collections, wire tabs + items |

---

### Task 1: Extend `getItems` for collection scope

**Files:**
- Modify: `src/services/tainacanService.ts`

- [ ] **Step 1: Update `getItems` signature and URL**

Replace the existing `getItems` function with:

```ts
export const getItems = async (
	museumId: string,
	page: number = 1,
	searchTerm: string = "",
	collectionId?: number,
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

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/services/tainacanService.ts
git commit -m "feat(museums): scope getItems by optional collection id"
```

---

### Task 2: Add `CollectionTabs` component

**Files:**
- Create: `src/components/CollectionTabs.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { Tab, TabList } from "@astryxdesign/core/TabList";
import type { TainacanCollection } from "@/types/tainacan";

export type CollectionTabsProps = {
	collections: TainacanCollection[];
	value: string;
	onChange: (value: string) => void;
	isLoading?: boolean;
};

export function CollectionTabs({
	collections,
	value,
	onChange,
	isLoading = false,
}: CollectionTabsProps) {
	if (isLoading || collections.length === 0) {
		return null;
	}

	return (
		<TabList
			value={value}
			onChange={onChange}
			size="sm"
			layout="hug"
			hasDivider
			aria-label="Coleções"
		>
			<Tab value="all" label="Todos" />
			{collections.map((collection) => (
				<Tab
					key={collection.id}
					value={String(collection.id)}
					label={collection.name}
				/>
			))}
		</TabList>
	);
}
```

Note: If TypeScript rejects `aria-label` on `TabList`, wrap the `TabList` in a native element that carries `aria-label="Coleções"` only if Astryx forbids raw wrappers — prefer passing through if the prop is accepted; otherwise omit `aria-label` and rely on visible tab labels (do not introduce a `<div>`).

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`  
Expected: PASS (or fix `aria-label` per note above)

- [ ] **Step 3: Commit**

```bash
git add src/components/CollectionTabs.tsx
git commit -m "feat(museums): add CollectionTabs for museum browse"
```

---

### Task 3: Wire museum page to collections + URL state

**Files:**
- Modify: `src/app/[museumId]/page.tsx`

- [ ] **Step 1: Update imports**

Add:

```tsx
import { CollectionTabs } from "@/components/CollectionTabs";
import { getCollections, getItems } from "@/services/tainacanService";
```

Remove the old single `getItems` import line (replaced by the combined import above).

- [ ] **Step 2: Extend nuqs state with `collection`**

In `MuseumContent`, replace the `useQueryStates` block and keep search debounce as-is, but ensure search updates preserve `collection`:

```tsx
const [{ search, page, collection }, setQueryStates] = useQueryStates({
	search: parseAsString.withDefault(""),
	page: parseAsInteger.withDefault(1),
	collection: parseAsInteger,
});
```

`parseAsInteger` without default yields `number | null` when absent — that is the Todos state.

Keep the existing debounced-search effect; it already sets `{ search, page: 1 }` and should not clear `collection` (nuqs merges partial updates).

- [ ] **Step 3: Fetch collections and clear invalid ids**

After the search debounce effect, add:

```tsx
const {
	data: collections = [],
	isLoading: isCollectionsLoading,
	isError: isCollectionsError,
} = useQuery({
	queryKey: ["museum-collections", museumId],
	queryFn: () => getCollections(museumId),
	enabled: !!museumId,
	select: (data) => data ?? [],
});

useEffect(() => {
	if (isCollectionsLoading || isCollectionsError) return;
	if (collection === null) return;
	const exists = collections.some((c) => c.id === collection);
	if (!exists) {
		setQueryStates({ collection: null });
	}
}, [
	collection,
	collections,
	isCollectionsLoading,
	isCollectionsError,
	setQueryStates,
]);
```

- [ ] **Step 4: Pass `collection` into items query**

Replace the items `useQuery` with:

```tsx
const { data, isLoading, error, isError } = useQuery({
	queryKey: ["museum-items", museumId, page, search, collection],
	queryFn: () =>
		getItems(
			museumId,
			page,
			search,
			collection === null ? undefined : collection,
		),
	enabled: !!museumId,
});
```

- [ ] **Step 5: Render `CollectionTabs` and handle changes**

Between `HeroBanner` and the centered `VStack` that holds `SearchBar`, or at the top of that centered stack before `SearchBar`, render:

```tsx
{!isCollectionsError ? (
	<CollectionTabs
		collections={collections}
		isLoading={isCollectionsLoading}
		value={collection === null ? "all" : String(collection)}
		onChange={(next) => {
			setQueryStates({
				collection: next === "all" ? null : Number(next),
				page: 1,
			});
		}}
	/>
) : null}
```

Preferred placement: inside the outer `VStack gap={4}`, immediately after `HeroBanner`, full width (not constrained to `maxWidth={672}`), so long collection names can use TabList overflow.

- [ ] **Step 6: Verify**

Run: `bun run typecheck && bun run lint && bun run build`  
Expected: all PASS

Manual (when UI available): multi-collection museum → switch tabs → URL updates → list refreshes → reload keeps selection → Todos clears param → search works with collection selected → bad `?collection=` clears after load.

- [ ] **Step 7: Commit**

```bash
git add src/app/[museumId]/page.tsx
git commit -m "feat(museums): filter museum items by collection tabs"
```

---

### Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Optional collection on `getItems` → `/collection/{id}/items` | Task 1 |
| `CollectionTabs` with Todos + collections, hide when loading/empty | Task 2 |
| `nuqs` `collection`, query keys, invalid id clear | Task 3 |
| Placement between hero and search | Task 3 |
| Filters / new routes out of scope | — (not implemented) |
