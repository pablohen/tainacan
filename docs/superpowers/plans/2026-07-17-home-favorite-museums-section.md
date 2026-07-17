# Home Favorite Museums Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On home (`/`), show a **Meus museus** section of favorited museums above **Todos os museus**, reusing existing cards and `FavoritesContext`.

**Architecture:** Inline partition in `src/app/page.tsx`. Read `favoriteMuseums` from `useFavorites`, resolve via `getMuseumById`, filter by the same title search as the main grid, and render a conditional section. No new utils, routes, or persistence.

**Tech Stack:** Next.js App Router (client page), Astryx `Grid` / `VStack` / `HStack` / `Heading` / `Icon`, existing `MuseumCard` + `FavoritesContext`. Package manager: Bun.

> **Testing note:** This repo has no automated test runner (`AGENTS.md`). Verification is `bun run typecheck && bun run lint && bun run build` plus manual GUI checks. Do not add a test framework.

**Spec:** `docs/superpowers/specs/2026-07-17-home-favorite-museums-section-design.md`

## Global Constraints

- UI copy in Brazilian Portuguese
- Prefer Astryx primitives; no Tailwind / shadcn / lucide for app UI
- Biome: tabs, double quotes
- Do not change `/favorites`, sidebar, museum registry shape, or FavoritesContext API
- Favorites appear in both sections; hide **Meus museus** when empty
- One search filters both sections by museum title

---

### File map

| File | Responsibility |
| --- | --- |
| `src/app/page.tsx` | Search filter, favorite partition, two-section UI |

No other source files.

---

### Task 1: Two-section home layout

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `useFavorites().favoriteMuseums: string[]`
- Consumes: `getMuseumById(id: string): Museum | null`
- Consumes: `museums` registry; existing `MuseumCard`

- [ ] **Step 1: Replace `src/app/page.tsx` with the two-section home**

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
import { getMuseumById, museums } from "@/utils/museums";

export default function Home() {
	const { favoriteMuseums } = useFavorites();
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebounce(search, 300);

	const searchLower = debouncedSearch.toLowerCase();
	const matchesSearch = (title: string) =>
		title.toLowerCase().includes(searchLower);

	const filteredMuseums = museums.filter((museum) =>
		matchesSearch(museum.title),
	);

	const favoriteSection = favoriteMuseums
		.map((id) => getMuseumById(id))
		.filter((museum) => museum !== null)
		.filter((museum) => matchesSearch(museum.title));

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

- [ ] **Step 2: Typecheck, lint, and build**

Run:

```bash
bun run typecheck && bun run lint && bun run build
```

Expected: all three succeed with exit code 0.

If `bun run build` SIGSEGVs after a successful compile (known Bun quirk on some machines), fall back to:

```bash
node node_modules/next/dist/bin/next build
```

- [ ] **Step 3: Manual GUI checks**

1. Open `/` with **no** museum favorites → only **Todos os museus** heading + full grid (no **Meus museus**).
2. Favorite ≥1 museum from a card heart → **Meus museus** appears above **Todos**; that museum is in both grids.
3. Type a search that matches a favorite → both sections shrink; clear search restores both.
4. Type a search that matches nothing → single empty message; no section headings.
5. Unfavorite from a card under **Meus museus** → it disappears from that section and stays under **Todos**.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "$(cat <<'EOF'
feat(home): show favorite museums above the registry grid

EOF
)"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
| --- | --- |
| **Meus museus** then **Todos os museus** | Task 1 |
| Favorites in both sections | Task 1 (`favoriteSection` + `filteredMuseums`) |
| Hide **Meus** when empty | Task 1 (`favoriteSection.length > 0`) |
| Search filters both | Task 1 (`matchesSearch`) |
| Preserve `favoriteMuseums` order | Task 1 (`.map` over `favoriteMuseums`) |
| Skip missing ids | Task 1 (`museum !== null`) |
| Empty search → single message, no headings | Task 1 (`hasResults` gate) |
| Heart icon on **Meus museus** | Task 1 |
| Only touch `page.tsx` | Task 1 file map |
| Verification commands | Task 1 Step 2–3 |
