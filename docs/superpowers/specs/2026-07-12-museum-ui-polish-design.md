# Museum UI Polish Design

Date: 2026-07-12  
Status: Approved (brainstorming)

## Goal

Fix three museum acervo UI issues: external-link icon sitting outside the “Ir para o site” button, a chaotic CSS Grid of variable-height cards, and flat uninspiring item cards. Preserve data fetching, routes, and pt-BR copy.

## Decisions

| Topic | Choice |
| --- | --- |
| Approach | Astryx primitives + CSS multi-column masonry (Approach 1; token CSS instead of StyleX — babel plugin not wired) |
| External CTA | Single `Button` with `href` / `target` / `rel` and `endContent` external icon |
| Item layout | True masonry via CSS `column-count` (`ItemMasonry` + token CSS in `globals.css`) |
| Card treatment | Image-first gallery: full-bleed media, bottom title scrim, heart top-right (absolute `Section` chrome — not nested `Overlay`) |
| Card scope | Shared `Card` everywhere item cards appear (museum page + favorites items) |
| Card primitive | `ClickableCard` + absolute overlay chrome + `MediaTheme mode="dark"` |

## Out of scope

- `MuseumCard` redesign
- Item detail page chrome
- Home `FavoriteItemsSection` text-only list (no images)
- Museum registry / API / routes
- README changes (unless setup story breaks)

## Architecture

```
HeroBanner
  → Button (href=museum.link, endContent=externalLink)

Museum page / Favorites items
  → ItemMasonry (CSS columns)
      → Card (ClickableCard)
           Image (natural height)
           Absolute Section (top) → FavoriteButton
           Absolute Section (bottom scrim) → title + optional subtitle + ID
```

## Component contracts

### `Card`

```ts
{
  museumId: string
  itemId: number
  title: string
  imageUrl: string
  subtitle?: string // museum name on favorites
}
```

- No footer strip; no `"${id} - ${title}"` single line
- Title primary; ID supporting; optional subtitle for museum name
- Nested favorite control must not navigate (`FavoriteButton` already stops propagation)

### `ItemMasonry`

- CSS multi-column via `globals.css` classes on Astryx `Section` (`column-count` ~1 → 2 → 3 → 4+)
- `column-gap` / item bottom margin from Astryx spacing tokens (`var(--spacing-4)`)
- Children `break-inside: avoid`
- Host via Astryx `Section` + `className` (no raw `<div>`; StyleX `xstyle` not used because `@stylexjs/babel-plugin` is not wired in this Next app)

### Call sites

| Surface | Change |
| --- | --- |
| `HeroBanner` | Button composition only |
| `[museumId]/page` | `Grid` → `ItemMasonry`; map items into `Card` props |
| `favorites/page` | Item list uses shared `Card` + `ItemMasonry`; museum grid unchanged |
| `CardSkeleton` | Full-bleed shape matching masonry cards |

## Constraints

- Astryx components and tokens only (no Tailwind / shadcn / lucide for app UI)
- No raw `<div>` for layout
- UI strings remain Brazilian Portuguese
- Discover props with `bun run astryx component <Name>` before coding

## Verification

`bun run typecheck && bun run lint && bun run build`

Manual: museum page external CTA icon inside pill; masonry stagger; overlay card on museum + favorites.
