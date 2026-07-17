# Sidebar Favorite Museums Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add **Meus museus** / **Todos os museus** to the SideNav and extract a shared `partitionMuseumsByFavorite` helper used by home and sidebar.

**Architecture:** Pure helper takes the registry, favorite ids, and a caller-owned `matches` predicate; returns `{ favorites, all }`. Home keeps `toLowerCase` search; sidebar keeps `normalizeText` filter. SideNav uses two `SideNavSection`s with plain titles.

**Tech Stack:** Next.js App Router (client), Astryx `SideNav` / `SideNavSection` / `SideNavItem`, existing `FavoritesContext` + `museums` registry. Package manager: Bun.

> **Testing note:** This repo has no automated test runner (`AGENTS.md`). Verification is `bun run typecheck && bun run lint && bun run build` (or `node node_modules/next/dist/bin/next build` if Bun SIGSEGVs) plus manual GUI checks. Do not add a test framework.

**Spec:** `docs/superpowers/specs/2026-07-17-sidebar-favorite-museums-section-design.md`

## Global Constraints

- UI copy in Brazilian Portuguese
- Prefer Astryx primitives; no Tailwind / shadcn / lucide for app UI
- Biome: tabs, double quotes
- Favorites appear in both sections; hide **Meus museus** when empty
- Home matching stays `toLowerCase`; sidebar matching stays `normalizeText`
- No heart icon in SideNav section titles
- Do not change `/favorites` or FavoritesContext API

---

### File map

| File | Responsibility |
| --- | --- |
| `src/utils/partitionMuseumsByFavorite.ts` | Shared partition helper |
| `src/app/page.tsx` | Consume helper (home UI unchanged) |
| `src/components/AppChrome.tsx` | Two SideNav sections |

---

### Task 1: `partitionMuseumsByFavorite` helper

**Files:**
- Create: `src/utils/partitionMuseumsByFavorite.ts`

**Interfaces:**
- Consumes: `getMuseumById` from `@/utils/museums`; `Museum` from `@/types/Museum`
- Produces: `partitionMuseumsByFavorite({ museums, favoriteIds, matches }) => { favorites: Museum[]; all: Museum[] }`

- [ ] **Step 1: Create the helper module**

```ts
import type { Museum } from "@/types/Museum";
import { getMuseumById } from "@/utils/museums";

export type PartitionMuseumsByFavoriteArgs = {
	museums: Museum[];
	favoriteIds: string[];
	matches: (museum: Museum) => boolean;
};

export type PartitionMuseumsByFavoriteResult = {
	favorites: Museum[];
	all: Museum[];
};

export function partitionMuseumsByFavorite({
	museums,
	favoriteIds,
	matches,
}: PartitionMuseumsByFavoriteArgs): PartitionMuseumsByFavoriteResult {
	const all = museums.filter(matches);

	const favorites = favoriteIds
		.map((id) => getMuseumById(id))
		.filter((museum): museum is Museum => museum !== null)
		.filter(matches);

	return { favorites, all };
}
```

- [ ] **Step 2: Typecheck**

Run:

```bash
bun run typecheck
```

Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/utils/partitionMuseumsByFavorite.ts
git commit -m "$(cat <<'EOF'
feat(museums): add partitionMuseumsByFavorite helper

EOF
)"
```

---

### Task 2: Refactor home to use the helper

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `partitionMuseumsByFavorite` from Task 1
- Consumes: `useFavorites().favoriteMuseums`, `museums` registry

- [ ] **Step 1: Replace inline partition with the helper**

Replace the body of `Home` so filtering goes through the helper. Full file:

```tsx
"use client";

import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { HeroBanner } from "@/components/HeroBanner";
import { HeartFilledIcon } from "@/components/icons/HeartIcon";
import { MuseumCard } from "@/components/MuseumCard";
import { SearchBar } from "@/components/SearchBar";
import { useFavorites } from "@/contexts/FavoritesContext";
import { museums } from "@/utils/museums";
import { partitionMuseumsByFavorite } from "@/utils/partitionMuseumsByFavorite";

export default function Home() {
	const { favoriteMuseums } = useFavorites();
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebounce(search, 300);

	const searchLower = debouncedSearch.toLowerCase();
	const { favorites: favoriteSection, all: filteredMuseums } =
		partitionMuseumsByFavorite({
			museums,
			favoriteIds: favoriteMuseums,
			matches: (museum) => museum.title.toLowerCase().includes(searchLower),
		});

	const hasResults = filteredMuseums.length > 0;

	return (
		<VStack gap={4}>
			<HeroBanner
				title="Explore Acervos Culturais"
				description="Navegue por dezenas de museus e instituições brasileiras"
			/>

			<VStack gap={4} maxWidth={672}>
				<SearchBar
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Buscar museus..."
				/>
			</VStack>

			{hasResults ? (
				<VStack gap={6}>
					{favoriteSection.length > 0 ? (
						<VStack gap={3}>
							<HStack gap={2} vAlign="center">
								<Icon icon={HeartFilledIcon} color="error" size="md" />
								<Heading level={2}>Meus museus</Heading>
							</HStack>
							<Grid columns={{ minWidth: 240, max: 4 }} gap={4}>
								{favoriteSection.map((museum) => (
									<MuseumCard key={museum.id} museum={museum} />
								))}
							</Grid>
						</VStack>
					) : null}

					<VStack gap={3}>
						<Heading level={2}>Todos os museus</Heading>
						<Grid columns={{ minWidth: 240, max: 4 }} gap={4}>
							{filteredMuseums.map((museum) => (
								<MuseumCard key={museum.id} museum={museum} />
							))}
						</Grid>
					</VStack>
				</VStack>
			) : (
				<Text type="supporting" justify="center" as="p">
					Nenhum museu encontrado para "{search}"
				</Text>
			)}
		</VStack>
	);
}
```

- [ ] **Step 2: Typecheck and lint**

Run:

```bash
bun run typecheck && bun run lint
```

Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "$(cat <<'EOF'
refactor(home): use partitionMuseumsByFavorite helper

EOF
)"
```

---

### Task 3: Two-section SideNav

**Files:**
- Modify: `src/components/AppChrome.tsx` (`MuseumSideNav` only)

**Interfaces:**
- Consumes: `partitionMuseumsByFavorite` from Task 1
- Consumes: `useFavorites().favoriteMuseums`, `museums`, `normalizeText`

- [ ] **Step 1: Update `MuseumSideNav`**

Replace the `MuseumSideNav` function (keep `FavoritesNavAction`, `AppFooter`, `AppChrome` unchanged) with:

```tsx
function MuseumSideNav() {
	const pathname = usePathname();
	const museumId = pathname?.split("/")[1] ?? "";
	const [query, setQuery] = useState("");
	const { favoriteMuseums } = useFavorites();

	const normalizedQuery = normalizeText(query);
	const { favorites: favoriteSection, all: filteredMuseums } =
		partitionMuseumsByFavorite({
			museums,
			favoriteIds: favoriteMuseums,
			matches: (museum) =>
				normalizedQuery
					? normalizeText(museum.title).includes(normalizedQuery)
					: true,
		});

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
			{favoriteSection.length > 0 ? (
				<SideNavSection title="Meus museus">
					{favoriteSection.map((museum) => (
						<SideNavItem
							key={`favorite-${museum.id}`}
							label={museum.title}
							href={`/${museum.id}`}
							isSelected={museumId === museum.id}
						/>
					))}
				</SideNavSection>
			) : null}

			<SideNavSection title="Todos os museus">
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

Add import at top of `AppChrome.tsx`:

```ts
import { partitionMuseumsByFavorite } from "@/utils/partitionMuseumsByFavorite";
```

Keep existing `museums` and `useFavorites` imports (already present).

Use `key={`favorite-${museum.id}`}` in the favorites section so React keys stay unique when the same museum appears in both sections.

- [ ] **Step 2: Typecheck, lint, and build**

Run:

```bash
bun run typecheck && bun run lint && bun run build
```

Expected: typecheck and lint exit 0. If build fails on the known pre-existing `/_not-found` jsxDEV error, note it in the report and confirm typecheck/lint passed; do not “fix” that error in this task.

- [ ] **Step 3: Manual GUI checks**

1. Sidebar with 0 museum favorites → only **Todos os museus**.
2. Favorite ≥1 museum (home or card) → **Meus museus** appears above **Todos**; museum in both.
3. SideNav filter narrows both sections; clear restores.
4. Unfavorite → **Meus museus** updates; item remains under **Todos**.
5. On a favorited museum route, both SideNav items for that museum show selected.
6. Home still shows **Meus museus** / **Todos os museus** as before.

- [ ] **Step 4: Commit**

```bash
git add src/components/AppChrome.tsx
git commit -m "$(cat <<'EOF'
feat(nav): show favorite museums in the sidebar

EOF
)"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
| --- | --- |
| Shared `partitionMuseumsByFavorite` | Task 1 |
| Home uses helper; `toLowerCase` unchanged | Task 2 |
| Two SideNav sections **Meus** / **Todos** | Task 3 |
| Favorites in both; hide **Meus** when empty | Task 3 |
| Sidebar `normalizeText` filter on both | Task 3 |
| Rename **Museus** → **Todos os museus** | Task 3 |
| No heart in SideNav titles | Task 3 |
| Unique keys when museum in both sections | Task 3 (`favorite-${id}`) |
| Verification | Task 1–3 steps |
