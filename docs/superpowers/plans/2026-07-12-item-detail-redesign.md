# Item Detail Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the item detail page as an immersive hero + content sheet aligned with gallery list cards, with optional description and stacked metadata fields.

**Architecture:** Keep server `getItem` → `ItemPageClient`. Replace the page `Card`/`Layout` chrome with a relative hero (`Section` + absolute favorite/scrim, same escape hatch as list `Card`) and a sheet `VStack` for description + `ItemMetadata`. CSS classes in `globals.css` (`.item-detail*`). Wire `loading.tsx` to a rewritten immersive `ItemDetailSkeleton`.

**Tech Stack:** Next.js App Router, Astryx `@astryxdesign/core`, Bun, Biome

## Global Constraints

- Brazilian Portuguese UI copy only
- No raw `<div>` for layout; Astryx primitives + CSS classes for absolute hero chrome
- No Tailwind / shadcn / lucide for app UI
- Discover component APIs with `bun run astryx component <Name>`
- Spec: `docs/superpowers/specs/2026-07-12-item-detail-redesign-design.md`
- No automated test suite — verify with `bun run typecheck && bun run lint && bun run build` plus manual UI checks

## File map

| File | Responsibility |
| --- | --- |
| `src/styles/globals.css` | `.item-detail`, `__favorite`, `__meta` absolute chrome |
| `src/components/ItemMetadata.tsx` | Stacked label-above-value field (no muted Card) |
| `src/app/[museumId]/items/[itemId]/ItemPageClient.tsx` | Immersive hero + sheet composition |
| `src/components/FavoriteButton.tsx` | Remove unused `detail` variant |
| `src/components/ItemDetailSkeleton.tsx` | Immersive loading shape |
| `src/app/[museumId]/items/[itemId]/loading.tsx` | Route loading UI |
| `.gitignore` | Ignore `.superpowers/` brainstorm artifacts |

---

### Task 1: Hero CSS + gitignore

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `.gitignore`

**Interfaces:**
- Produces: CSS classes `.item-detail`, `.item-detail__favorite`, `.item-detail__meta` for Task 3

- [ ] **Step 1: Append item-detail chrome after `.item-card__meta` block**

Add (mirror list-card patterns; hero is not clickable so favorite does not need `pointer-events` split unless children need clicks — keep the same pattern as cards for consistency):

```css
/* Immersive item detail hero chrome */
.item-detail {
	position: relative;
	overflow: clip;
}

.item-detail__favorite {
	position: absolute;
	inset-block-start: 0;
	inset-inline-end: 0;
	z-index: 1;
	pointer-events: none;
}

.item-detail__favorite > * {
	pointer-events: auto;
}

.item-detail__meta {
	position: absolute;
	inset-inline: 0;
	inset-block-end: 0;
	z-index: 1;
	background-color: var(--color-overlay);
	pointer-events: none;
}
```

- [ ] **Step 2: Ignore brainstorm artifacts**

Append to `.gitignore`:

```gitignore
# Superpowers brainstorm companion
.superpowers/
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/globals.css .gitignore
git commit -m "$(cat <<'EOF'
style(item): add immersive detail hero chrome classes

EOF
)"
```

---

### Task 2: Stacked `ItemMetadata`

**Files:**
- Modify: `src/components/ItemMetadata.tsx`

**Interfaces:**
- Consumes: `TainacanMetadatum` via existing props (`metadata: { name, value_as_string, ... }`)
- Produces: stacked label-above-value UI for Task 3 sheet

- [ ] **Step 1: Replace muted Card with stacked field**

Target implementation:

```tsx
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import type { TainacanMetadatum } from "@/types/tainacan";

interface ItemMetadataProps {
	metadata: TainacanMetadatum;
}

export function ItemMetadata({ metadata }: ItemMetadataProps) {
	if (!metadata.value_as_string) {
		return null;
	}
	return (
		<VStack gap={1}>
			<Heading level={4}>{metadata.name}</Heading>
			<Text type="body" as="p">
				{metadata.value_as_string}
			</Text>
		</VStack>
	);
}
```

Keep existing import paths/types if the file already differs slightly — preserve the early return on empty `value_as_string`. Drop the `Card` import.

- [ ] **Step 2: Commit**

```bash
git add src/components/ItemMetadata.tsx
git commit -m "$(cat <<'EOF'
refactor(item): render metadata as stacked label-value fields

EOF
)"
```

---

### Task 3: Immersive `ItemPageClient`

**Files:**
- Modify: `src/app/[museumId]/items/[itemId]/ItemPageClient.tsx`

**Interfaces:**
- Consumes: `.item-detail*` CSS (Task 1), stacked `ItemMetadata` (Task 2), `FavoriteButton` `variant="card"`, `checkImagePath`, Astryx `Section` / `VStack` / `Link` / `Text` / `MediaTheme`
- Produces: final detail page UI

- [ ] **Step 1: Discover Astryx APIs if unsure**

```bash
bun run astryx component Section
bun run astryx component Text
```

- [ ] **Step 2: Rewrite `ItemPageClient` composition**

Replace the `Card` + `Layout` structure with:

```tsx
"use client";

import { Link } from "@astryxdesign/core/Link";
import { Section } from "@astryxdesign/core/Section";
import { Heading, Text } from "@astryxdesign/core/Text";
import { MediaTheme } from "@astryxdesign/core/theme";
import { VStack } from "@astryxdesign/core/VStack";
import Image from "next/image";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ItemMetadata } from "@/components/ItemMetadata";
import type { TainacanItem as Item } from "@/types/tainacan";
import { checkImagePath } from "@/utils/checkImagePath";

interface ItemPageProps {
	item: Item;
	museumId: string;
	museumName: string;
}

export default function ItemPageClient({
	item,
	museumId,
	museumName,
}: ItemPageProps) {
	const metadata = Object.entries(item.metadata || {}).filter(
		([, meta]) => Boolean(meta.value_as_string),
	);
	const { title, description } = item;
	const imgPath = checkImagePath(item);
	const trimmedDescription = description?.trim() ?? "";

	return (
		<VStack gap={4} maxWidth={1280}>
			<Link href={`/${museumId}`} isStandalone>
				Voltar para a coleção
			</Link>

			<Section variant="transparent" padding={0} className="item-detail">
				<Image
					src={imgPath}
					alt={title}
					width={960}
					height={960}
					style={{
						width: "100%",
						height: "auto",
						display: "block",
						objectFit: "contain",
						objectPosition: "top",
					}}
					unoptimized
				/>
				<Section
					variant="transparent"
					padding={2}
					className="item-detail__favorite"
				>
					<MediaTheme mode="dark">
						<FavoriteButton
							type="item"
							item={{
								museumId,
								itemId: item.id,
								title: item.title,
								imageUrl: imgPath,
							}}
							variant="card"
						/>
					</MediaTheme>
				</Section>
				<Section
					variant="transparent"
					padding={3}
					className="item-detail__meta"
				>
					<MediaTheme mode="dark">
						<VStack gap={0.5}>
							<Heading level={1}>
								<Text type="label" maxLines={2} color="inherit" as="span">
									{title}
								</Text>
							</Heading>
							<Text type="supporting" maxLines={1} color="inherit" as="p">
								{museumName}
							</Text>
						</VStack>
					</MediaTheme>
				</Section>
			</Section>

			<VStack gap={4}>
				{trimmedDescription ? (
					<Text type="body" as="p">
						{trimmedDescription}
					</Text>
				) : null}

				{metadata.length > 0 ? (
					<VStack gap={3}>
						{metadata.map(([key, meta]) => (
							<ItemMetadata key={`ItemMetadata__${key}`} metadata={meta} />
						))}
					</VStack>
				) : (
					<Text type="supporting" justify="center" as="p">
						Nenhum metadado disponível
					</Text>
				)}
			</VStack>
		</VStack>
	);
}
```

Notes for the implementer:

- Prefer a valid heading: if nesting `Heading` + `Text` conflicts with Astryx APIs, use `Heading level={1}` with the title string directly and apply `maxLines` only if supported; otherwise keep title readable without forcing invalid markup.
- Do **not** reintroduce `height={600}` / `isScrollable` metadata trap.
- Drop unused `Card` / `Layout` / `HStack` imports.

- [ ] **Step 3: Commit**

```bash
git add src/app/[museumId]/items/[itemId]/ItemPageClient.tsx
git commit -m "$(cat <<'EOF'
feat(item): redesign detail page as immersive hero and sheet

EOF
)"
```

---

### Task 4: Remove `FavoriteButton` `detail` variant

**Files:**
- Modify: `src/components/FavoriteButton.tsx`

**Interfaces:**
- Consumes: Task 3 no longer passes `variant="detail"`
- Produces: `variant?: "default" | "card"` only

- [ ] **Step 1: Delete `detail` branch and type**

- Change type to `variant?: "default" | "card"`
- Remove the `if (variant === "detail") { return <Button .../> }` block
- Remove unused `Button` import if nothing else needs it

- [ ] **Step 2: Confirm no remaining call sites**

```bash
rg 'variant="detail"|variant=\{"detail"\}' src
```

Expected: no matches

- [ ] **Step 3: Commit**

```bash
git add src/components/FavoriteButton.tsx
git commit -m "$(cat <<'EOF'
refactor(favorites): drop unused detail FavoriteButton variant

EOF
)"
```

---

### Task 5: Immersive skeleton + route `loading.tsx`

**Files:**
- Modify: `src/components/ItemDetailSkeleton.tsx`
- Create: `src/app/[museumId]/items/[itemId]/loading.tsx`

**Interfaces:**
- Produces: loading UI matching hero + sheet shape while `page.tsx` awaits `getItem`

- [ ] **Step 1: Rewrite `ItemDetailSkeleton`**

```tsx
import { Section } from "@astryxdesign/core/Section";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { VStack } from "@astryxdesign/core/VStack";

export function ItemDetailSkeleton() {
	return (
		<VStack gap={4} maxWidth={1280}>
			<Skeleton height={20} width={180} radius={2} />

			<Section variant="transparent" padding={0} className="item-detail">
				<Skeleton height={360} width="100%" radius={0} />
			</Section>

			<VStack gap={3}>
				<Skeleton height={64} width="100%" radius={2} />
				{[0, 1, 2, 3].map((i) => (
					<VStack key={i} gap={1}>
						<Skeleton height={16} width={120} radius={2} index={i} />
						<Skeleton height={20} width="80%" radius={2} index={i} />
					</VStack>
				))}
			</VStack>
		</VStack>
	);
}
```

If `Skeleton` `width="100%"` is invalid for the Astryx prop type, use a numeric width that fills the content column (e.g. omit width or use a large number) after checking `bun run astryx component Skeleton`.

- [ ] **Step 2: Add route loading file**

Create `src/app/[museumId]/items/[itemId]/loading.tsx`:

```tsx
import { ItemDetailSkeleton } from "@/components/ItemDetailSkeleton";

export default function Loading() {
	return <ItemDetailSkeleton />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ItemDetailSkeleton.tsx src/app/[museumId]/items/[itemId]/loading.tsx
git commit -m "$(cat <<'EOF'
feat(item): add immersive detail loading skeleton

EOF
)"
```

---

### Task 6: Verify

- [ ] **Step 1: Run verification**

```bash
bun run typecheck && bun run lint && bun run build
```

Expected: all three exit 0

- [ ] **Step 2: Manual smoke (dev server)**

```bash
bun run dev
```

Check:

- Hero image + scrim title + museum name + heart (card variant)
- Description only when API has non-empty description
- Metadata as stacked fields (not muted cards)
- Empty metadata copy still shows
- Favorite toggles persist
- Loading skeleton appears on slow navigation / refresh if observable
- Mobile: no fixed-height scroll trap; sheet flows below hero
- Back link returns to `/{museumId}`

- [ ] **Step 3: Fix any failures from Step 1–2; do not claim done without green verification**

---

## Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Immersive hero + sheet | 3 |
| Heart on hero (`variant="card"`) | 3, 4 |
| Stacked metadata | 2, 3 |
| Description if present | 3 |
| Drop “Detalhes do Item” | 3 |
| `.item-detail*` CSS | 1 |
| Remove `detail` FavoriteButton variant | 4 |
| `ItemDetailSkeleton` + `loading.tsx` | 5 |
| No API/schema/route changes | (none — `page.tsx` untouched) |
| Verification commands | 6 |
| `.superpowers/` gitignore | 1 |
