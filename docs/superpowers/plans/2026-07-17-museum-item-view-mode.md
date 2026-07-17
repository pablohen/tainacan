# Museum Item View Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Galeria / Tabela view switcher on museum browse pages; masonry remains default; table shows thumb, title, id, and favorite with URL `?view=table`.

**Architecture:** Pure `itemView` helpers + presentational `ItemViewModeSelector` and `ItemResultsTable`. Museum page owns `nuqs` `view` and swaps the results body only.

**Tech Stack:** Next.js App Router (client), nuqs `parseAsStringLiteral`, Astryx `SegmentedControl` + `Table`, Next `Image` / `Link`, existing `FavoriteButton` + `checkImagePath`. Package manager: Bun.

> **Testing note:** This repo has no automated test runner (`AGENTS.md`). Verification is `bun run typecheck && bun run lint && bun run build` (or `node node_modules/next/dist/bin/next build` if Bun SIGSEGVs after success) plus manual GUI checks. Do not add a test framework.

**Spec:** `docs/superpowers/specs/2026-07-17-museum-item-view-mode-design.md`

---

### File map

| File | Responsibility |
| --- | --- |
| `src/utils/itemView.ts` | View literals for nuqs |
| `src/components/ItemViewModeSelector.tsx` | SegmentedControl Galeria / Tabela |
| `src/components/ItemResultsTable.tsx` | Table + skeleton |
| `src/app/[museumId]/page.tsx` | Wire `view` + selector + conditional results |

---

### Task 1: `itemView` helpers

**Files:**
- Create: `src/utils/itemView.ts`

- [ ] **Step 1: Create the module**

```ts
/** Non-default views stored in the URL. Absent `view` = masonry. */
export const ITEM_VIEW_VALUES = ["table"] as const;

export type ItemView = (typeof ITEM_VIEW_VALUES)[number];

export type ItemViewMode = "masonry" | ItemView;

export function toItemViewMode(view: ItemView | null): ItemViewMode {
	return view ?? "masonry";
}

export function fromItemViewMode(mode: ItemViewMode): ItemView | null {
	return mode === "masonry" ? null : mode;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/itemView.ts
git commit -m "feat(museums): add item view mode helpers"
```

---

### Task 2: `ItemViewModeSelector`

**Files:**
- Create: `src/components/ItemViewModeSelector.tsx`

- [ ] **Step 1: Build SegmentedControl**

```tsx
"use client";

import {
	SegmentedControl,
	SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import {
	fromItemViewMode,
	type ItemViewMode,
	toItemViewMode,
} from "@/utils/itemView";
import type { ItemView } from "@/utils/itemView";

export type ItemViewModeSelectorProps = {
	value: ItemView | null;
	onChange: (next: ItemView | null) => void;
};

export function ItemViewModeSelector({
	value,
	onChange,
}: ItemViewModeSelectorProps) {
	const mode = toItemViewMode(value);
	return (
		<SegmentedControl
			label="Visualização"
			size="sm"
			value={mode}
			onChange={(next) => {
				onChange(fromItemViewMode(next as ItemViewMode));
			}}
		>
			<SegmentedControlItem value="masonry" label="Galeria" />
			<SegmentedControlItem value="table" label="Tabela" />
		</SegmentedControl>
	);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ItemViewModeSelector.tsx
git commit -m "feat(museums): add Galeria/Tabela view mode selector"
```

---

### Task 3: `ItemResultsTable`

**Files:**
- Create: `src/components/ItemResultsTable.tsx`

- [ ] **Step 1: Implement table + loading skeleton**

Use Astryx `Table` with `proportional` / `pixel`, `density="compact"`, `hasHover`, `dividers="rows"`.

Row type extends `Record<string, unknown>` with `id`, `title`, `imageUrl`, `museumId`.

Columns:
- Thumb: small `next/image` linking to item
- Título: `Link` to item
- ID: plain text
- Favorito: `FavoriteButton` (`type="item"`, stop navigation via existing handler)

Export `ItemResultsTable` and `ItemResultsTableSkeleton` (N placeholder rows or a compact Banner/Loading strip — prefer simple repeated skeleton rows without inventing new CSS if possible; a short `VStack` of muted bars is fine only if Astryx primitives cover it — otherwise reuse `Loading` / empty Table with placeholder data).

Prefer: skeleton as Table with 8 placeholder rows (`title: "…"`, empty image) or `Center` + `Loading` if Table looks odd empty.

- [ ] **Step 2: Commit**

```bash
git add src/components/ItemResultsTable.tsx
git commit -m "feat(museums): add item results table view"
```

---

### Task 4: Wire museum page

**Files:**
- Modify: `src/app/[museumId]/page.tsx`

- [ ] **Step 1: Add nuqs `view`**

```ts
view: parseAsStringLiteral(ITEM_VIEW_VALUES),
```

Place `ItemViewModeSelector` in an `HStack` with `ItemSortSelector` under SearchBar.

```tsx
onChange={(next) => {
  setQueryStates({ view: next });
}}
```

Do **not** reset `page` when changing view.

- [ ] **Step 2: Conditional results**

When `toItemViewMode(view) === "table"`, render `ItemResultsTable` / skeleton; else existing masonry.

- [ ] **Step 3: Verify**

```bash
bun run typecheck && bun run lint && bun run build
```

- [ ] **Step 4: Commit**

```bash
git add 'src/app/[museumId]/page.tsx'
git commit -m "feat(museums): wire Galeria/Tabela view on museum page"
```

---

### Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Galeria default, Tabela via `?view=table` | Task 1 + 4 |
| SegmentedControl Visualização | Task 2 |
| Columns thumb / título / id / favorito | Task 3 |
| Links to item detail | Task 3 |
| Swap results body only | Task 4 |
| Favorites / list density / table sort | — out of scope |
