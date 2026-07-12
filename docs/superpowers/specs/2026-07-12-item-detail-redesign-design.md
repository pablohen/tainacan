# Item Detail Redesign Design

Date: 2026-07-12  
Status: Approved (brainstorming)

## Goal

Redesign `/{museumId}/items/{itemId}` so it feels continuous with the image-first gallery list cards, while improving reading hierarchy: show description when present and present all non-empty metadata more clearly. Preserve server fetch, routes, Zod validation, and pt-BR copy.

## Decisions

| Topic | Choice |
| --- | --- |
| Direction | Gallery-like presentation + richer content layout |
| Layout | Immersive hero + content sheet (approach C) |
| Chrome | Heart on hero + stacked label-above-value metadata (C3) |
| Metadata filter | Any field with non-empty `value_as_string` (same as today; no allowlist) |
| Description | Show in sheet only when trimmed non-empty |
| Page title | Item title on hero scrim is the heading; drop generic “Detalhes do Item” |
| Favorite | `FavoriteButton` `variant="card"` on hero (list-card pattern) |
| Data fetching | Unchanged: server `getItem` → `ItemPageClient` |
| Loading | Route `loading.tsx` using rewritten `ItemDetailSkeleton` matching immersive shape |

## Out of scope

- Museum registry / API URLs / Zod schema changes
- Rendering `document_as_html` or PDF documents (image extraction via `checkImagePath` stays as today)
- Per-museum metadata allowlists or “Mais metadados” collapse
- Changing public routes
- Home `FavoriteItemsSection` or list `Card` redesign (already done)

## Architecture

```
ItemPage (server)
  → getMuseumById + getItem
  → ItemPageClient
       VStack
         Link (Voltar para a coleção)
         Hero (relative Section / container)
           Image
           Absolute Section (favorite) + MediaTheme dark + FavoriteButton card
           Absolute Section (scrim) + MediaTheme dark + title + museum name
         Sheet (VStack)
           description? (Text)
           ItemMetadata[]  OR empty supporting text
```

`loading.tsx` under the item route renders `ItemDetailSkeleton` (immersive shape) while the server fetch runs.

## Component contracts

### `ItemPageClient`

Props unchanged: `{ item, museumId, museumName }`.

Composition rules:

- No wrapping page `Card` + `Layout` header/content for the main chrome
- Hero uses absolute overlay chrome via Astryx `Section` + CSS classes (same escape hatch as list `Card`; StyleX not wired)
- Scrim title: item `title` as primary heading text (`maxLines={2}`); museum name as supporting
- Sheet shows `item.description` only if `item.description.trim()` is non-empty
- Metadata: `Object.entries(item.metadata)` filtered by truthy `value_as_string`, mapped to `ItemMetadata`

### `ItemMetadata`

- Remove muted `Card` wrapper
- Stacked field: label (`Heading` or supporting/label text with `metadata.name`) above value (`Text` with `value_as_string`)
- Still return `null` when `value_as_string` is empty

### Hero CSS (`globals.css`)

Add detail-specific classes (do not reuse `.item-card` clickable styles):

- `.item-detail` — relative positioning host
- `.item-detail__favorite` — absolute top-right
- `.item-detail__meta` — absolute bottom scrim (gradient + readable text)

Mirror spacing/token patterns from `.item-card__*` where sensible.

### `ItemDetailSkeleton` + `loading.tsx`

- Rewrite skeleton to: back-link placeholder, hero block, sheet field placeholders
- Add `src/app/[museumId]/items/[itemId]/loading.tsx` that exports the skeleton

### `FavoriteButton`

- Detail page uses `variant="card"` on the hero
- Remove unused `variant="detail"` from `FavoriteButton` (only call site today is the item page)

## Content & empty states

| Content | Behavior |
| --- | --- |
| Title | Always on scrim |
| Museum name | Always on scrim (supporting) |
| Description | Sheet; omit if empty/whitespace |
| Metadata | All non-empty `value_as_string`; empty → “Nenhum metadado disponível” |
| Image missing / PDF | `checkImagePath` placeholder; hero chrome still renders |
| Back link | “Voltar para a coleção” → `/{museumId}` |

## Constraints

- Astryx components and tokens only (no Tailwind / shadcn / lucide for app UI)
- No raw `<div>` for layout (use `Section` / stacks; CSS classes for absolute hero chrome)
- UI strings remain Brazilian Portuguese
- Discover props with `bun run astryx component <Name>` before coding new primitives
- `generateMetadata` stays as today (title + description for SEO)

## Verification

`bun run typecheck && bun run lint && bun run build`

Manual:

- Item page matches gallery language (hero image, heart, scrim title)
- Description appears only when API provides it
- Metadata reads as stacked fields, not muted cards
- Favorite toggles and persists via existing context
- Loading skeleton matches immersive layout shape
- Mobile: hero stacks above sheet; no fixed 600px metadata scroll trap
