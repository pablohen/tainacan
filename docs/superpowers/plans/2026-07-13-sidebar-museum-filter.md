# Sidebar Museum Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accent- and case-insensitive filter input to the always-visible `SideNav` so users can quickly narrow the ~50-museum list by title.

**Architecture:** A small pure normalize helper strips diacritics and lowercases text. `MuseumSideNav` (in `AppChrome.tsx`) holds ephemeral filter state, renders a `SearchBar` in the `SideNav` `topContent` slot, filters `museums` by normalized title, and shows an empty state when nothing matches.

**Tech Stack:** Next.js (App Router, client component), React `useState`, Astryx `SideNav` / `SearchBar` (`TextInput`) / `Text`, TypeScript. Package manager: Bun.

> **Testing note:** This repo has no automated test runner (`AGENTS.md`). Verification is `bun run typecheck && bun run lint && bun run build` plus manual GUI checks. Do not add a test framework.

---

### Task 1: Add accent/case-insensitive normalize helper

**Files:**
- Create: `src/utils/normalizeText.ts`

- [ ] **Step 1: Create the helper**

```ts
export function normalizeText(value: string): string {
	return value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.trim();
}
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: PASS (no output errors)

- [ ] **Step 3: Commit**

```bash
git add src/utils/normalizeText.ts
git commit -m "feat(museums): add accent-insensitive text normalizer"
```

---

### Task 2: Wire the filter into the sidebar nav

**Files:**
- Modify: `src/components/AppChrome.tsx` (the `MuseumSideNav` function and its imports)

Current `MuseumSideNav` (for reference):

```tsx
function MuseumSideNav() {
	const pathname = usePathname();
	const museumId = pathname?.split("/")[1] ?? "";

	return (
		<SideNav collapsible>
			<SideNavSection title="Museus">
				{museums.map((museum) => (
					<SideNavItem
						key={museum.id}
						label={museum.title}
						href={`/${museum.id}`}
						isSelected={museumId === museum.id}
					/>
				))}
			</SideNavSection>
		</SideNav>
	);
}
```

- [ ] **Step 1: Add imports**

At the top of `src/components/AppChrome.tsx`, add these imports alongside the existing ones (keep imports at top of file per repo rule):

```tsx
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { normalizeText } from "@/utils/normalizeText";
```

Note: `Text` is already imported from `@astryxdesign/core/Text` in this file; reuse it. `VStack` is already imported too.

- [ ] **Step 2: Replace `MuseumSideNav` with the filtered version**

```tsx
function MuseumSideNav() {
	const pathname = usePathname();
	const museumId = pathname?.split("/")[1] ?? "";
	const [query, setQuery] = useState("");

	const normalizedQuery = normalizeText(query);
	const filteredMuseums = normalizedQuery
		? museums.filter((museum) =>
				normalizeText(museum.title).includes(normalizedQuery),
			)
		: museums;

	return (
		<SideNav
			collapsible
			topContent={
				<SearchBar
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Filtrar museus..."
				/>
			}
		>
			<SideNavSection title="Museus">
				{filteredMuseums.map((museum) => (
					<SideNavItem
						key={museum.id}
						label={museum.title}
						href={`/${museum.id}`}
						isSelected={museumId === museum.id}
					/>
				))}
				{filteredMuseums.length === 0 ? (
					<VStack paddingInline={3} paddingBlock={2}>
						<Text type="supporting">Nenhum museu encontrado</Text>
					</VStack>
				) : null}
			</SideNavSection>
		</SideNav>
	);
}
```

Rationale for details:
- `topContent` is Astryx's documented slot for auxiliary controls below the header; it is hidden automatically when the nav is collapsed, satisfying the "expanded only" requirement without extra code.
- Empty query returns the original `museums` array (no needless filtering).
- `SearchBar` already provides `startIcon="search"` and `hasClear`; clicking clear fires `onChange` with an empty value, resetting the list.

- [ ] **Step 3: Typecheck and lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS. Biome reports "No fixes applied." If Biome complains about import ordering, run `bun run biome:fix` and re-run.

- [ ] **Step 4: Commit**

```bash
git add src/components/AppChrome.tsx
git commit -m "feat(museums): filter sidebar museum list by title"
```

---

### Task 3: Verify build and behavior end-to-end

**Files:** none (verification only)

- [ ] **Step 1: Production build**

Run: `bun run build`
Expected: `✓ Compiled successfully`, TypeScript finishes, static pages generate, exit 0.

- [ ] **Step 2: Start dev server**

Run (in a background/tmux session): `bun run dev`
Expected: `Ready` on `http://localhost:3000`.

- [ ] **Step 3: Manual GUI checks (in browser)**

1. Load `http://localhost:3000/`; confirm the sidebar shows a "Filtrar museus..." input above the "Museus" list.
2. Type `sao joao` → list narrows to "Museu Regional São João Del Rey" (accent-insensitive).
3. Clear and type `historia` → matches "Museu Histórico Nacional".
4. Type gibberish (e.g. `zzzzz`) → shows "Nenhum museu encontrado".
5. Clear via the input's clear (x) button → full list returns.
6. Type a query, click a filtered result → navigates to that museum's page; confirm the app still works.

- [ ] **Step 4: Final verification gate**

Run: `bun run typecheck && bun run lint && bun run build`
Expected: all PASS.

---

## Self-Review

- **Spec coverage:** Placement in `topContent` (Task 2 Step 2) ✓; reuse `SearchBar` ✓; match `title` only ✓; accent+case-insensitive via `normalizeText` (Task 1) ✓; empty query shows all ✓; ephemeral `useState` ✓; empty state `Text` "Nenhum museu encontrado" ✓; collapsed hides filter (via `topContent`) ✓. Out-of-scope items (routes/theme/registry/nuqs/description) are untouched ✓.
- **Placeholder scan:** No TBD/TODO; all steps contain concrete code and commands.
- **Type consistency:** `normalizeText(value: string): string` defined in Task 1 and called identically in Task 2. `query`/`setQuery` names consistent.
