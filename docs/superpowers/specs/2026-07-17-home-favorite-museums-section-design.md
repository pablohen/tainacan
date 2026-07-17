# Home Favorite Museums Section Design

Date: 2026-07-17  
Status: Approved (brainstorming)

## Goal

On the home page, surface favorited museums in a dedicated **Meus museus** section above the full registry grid, without changing routes, persistence, or the Favorites page.

This is the first small slice of a broader home / registry direction (region filters, featured museums, etc. later).

## Decisions

| Topic | Choice |
| --- | --- |
| Layout | Two sections: **Meus museus** then **Todos os museus** |
| Duplicates | Favorites appear in both sections |
| Empty favorites | Hide **Meus museus** entirely (home looks like today) |
| Search | One query filters both sections by museum title |
| Cards | Reuse existing `MuseumCard` / `Grid` |
| Headings | Level 2; optional heart icon on **Meus museus** (favorites-page pattern) |
| Favorite order | Preserve `favoriteMuseums` array order from `FavoritesContext` |
| Todos order | Registry order in `museums.ts` |
| Approach | Inline logic in `src/app/page.tsx` + `useFavorites` (no new abstractions) |
| Copy | Brazilian Portuguese |

## Out of scope

- Region / UF filters on the museum grid
- Featured / curated museums
- Sidebar reorder or pin
- Changes to `/favorites`
- Manual drag-reorder of favorite museums
- New persistence keys or URL params for sections
- Empty-state hint inside **Meus museus** (section is hidden instead)

## Behavior

1. Keep the existing hero + search bar (`Buscar museus...`).
2. Filter the registry by title → `filteredMuseums`.
3. Build **Meus museus** from `favoriteMuseums`, resolving each id via `getMuseumById`, skipping missing ids, then applying the same title filter. Preserve favorite list order.
4. Render **Meus museus** only when that list has ≥1 museum.
5. Always render **Todos os museus** from `filteredMuseums` (includes favorites).
6. Unfavoriting removes the card from **Meus museus** immediately; it remains under **Todos**.
7. If both sections would be empty after search, show the existing single empty message: `Nenhum museu encontrado para "…"`.

### Hydration

Before localStorage hydrates, `favoriteMuseums` is `[]`, so **Meus museus** stays hidden. After hydrate it appears if there are favorites. No extra loading UI (same client-only pattern as elsewhere).

## Architecture

```
Home (src/app/page.tsx)
  useFavorites → favoriteMuseums
  filteredMuseums = museums.filter(title match)
  favoriteSection = favoriteMuseums → museums matching search (order preserved)
  [favoriteSection.length > 0] → Heading "Meus museus" + Grid(MuseumCard)
  Heading "Todos os museus" + Grid(MuseumCard) from filteredMuseums
  [both empty] → existing empty Text
```

### Files

| File | Role |
| --- | --- |
| `src/app/page.tsx` | Partition + two section UI |
| `FavoritesContext` | Unchanged consumer of `favoriteMuseums` |
| `MuseumCard` | Unchanged |

No changes to services, schemas, museums registry shape, or AppChrome sidebar.

## Error handling / edge cases

| Case | Behavior |
| --- | --- |
| No favorite museums | Omit **Meus museus**; show **Todos os museus** heading + full grid |
| Favorite id not in registry | Skip that id |
| `filteredMuseums.length === 0` | No section headings or grids — only the existing empty message |
| Search with matches | Favorites that match also appear in **Todos** (same filter); both sections can show |
| Toggle favorite on a card | Heart updates; **Meus** list updates without navigation |

Because both sections use the same title filter over the registry, **Meus museus** cannot have matches when **Todos** is empty.

## Testing / verification

- Manual: 0 favorites → home unchanged aside from **Todos os museus** heading above the grid.
- Manual: ≥1 favorite → **Meus museus** appears above **Todos**; favorite cards in both.
- Manual: search narrows both; clear search restores both.
- Manual: unfavorite from a **Meus** card removes it from that section.
- `bun run typecheck && bun run lint && bun run build`

## Follow-ups (not this slice)

- Region / UF filters
- Featured museums
- Pin / reorder favorites beyond list order
- Align home title search with sidebar `normalizeText` (optional polish)
