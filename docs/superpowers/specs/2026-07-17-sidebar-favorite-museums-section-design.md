# Sidebar Favorite Museums Section Design

Date: 2026-07-17  
Status: Approved (brainstorming)

## Goal

Mirror the home **Meus museus** / **Todos os museus** pattern in the app sidebar, using a shared partition helper so home and SideNav stay consistent.

## Decisions

| Topic | Choice |
| --- | --- |
| Layout | Two `SideNavSection`s: **Meus museus** then **Todos os museus** |
| Duplicates | Favorites appear in both sections |
| Empty favorites | Hide **Meus museus** entirely |
| Filter | Existing SideNav “Filtrar museus…” with `normalizeText`; filters both sections |
| Approach | Shared `partitionMuseumsByFavorite` helper; callers pass a `matches` predicate |
| Home | Refactor to the same helper; keep home’s `toLowerCase` matching (no `normalizeText` change) |
| Section titles | Plain text (no heart icon in SideNav — `SideNavSection` title API) |
| Rename | Current sidebar **Museus** → **Todos os museus** |
| Copy | Brazilian Portuguese |

## Out of scope

- Aligning home title search with sidebar `normalizeText`
- Changes to `/favorites`
- Drag-reorder of favorite museums
- Heart icon in SideNav section headers
- Region / featured museum work

## Behavior (sidebar)

1. Keep collapsible SideNav + “Filtrar museus…” search.
2. Build lists via `partitionMuseumsByFavorite` with `normalizeText`-based `matches`.
3. Render **Meus museus** only when `favorites.length > 0`.
4. Always render **Todos os museus** from `all` when there are results; when `all` is empty, show existing “Nenhum museu encontrado” (no empty **Meus** section).
5. `SideNavItem` selection (`isSelected`) works in both sections for the current museum route.
6. Unfavoriting updates **Meus museus** immediately (same localStorage context as home).

## Architecture

```
partitionMuseumsByFavorite({ museums, favoriteIds, matches })
  → { favorites, all }

Home (page.tsx)
  matches = title toLowerCase includes debounced search
  → Meus museus Grid + Todos os museus Grid

MuseumSideNav (AppChrome.tsx)
  matches = normalizeText(title) includes normalized query
  → SideNavSection "Meus museus" + SideNavSection "Todos os museus"
```

### Helper contract

`src/utils/partitionMuseumsByFavorite.ts`:

| Input | Role |
| --- | --- |
| `museums` | Full registry (`museums` from `museums.ts`) |
| `favoriteIds` | `favoriteMuseums` from `FavoritesContext` (order preserved) |
| `matches` | `(museum: Museum) => boolean` — caller-owned filter |

| Output | Role |
| --- | --- |
| `favorites` | Resolved favorites matching `matches`, favorite order, skip missing ids |
| `all` | Registry museums matching `matches`, registry order |

### Files

| File | Role |
| --- | --- |
| `src/utils/partitionMuseumsByFavorite.ts` | Shared partition |
| `src/app/page.tsx` | Consume helper (UI unchanged) |
| `src/components/AppChrome.tsx` | Two SideNav sections |

## Edge cases

| Case | Behavior |
| --- | --- |
| No favorite museums | Omit **Meus museus**; **Todos os museus** only |
| Favorite id not in registry | Skip |
| Filter matches nothing | Empty supporting text; no **Meus** section |
| Same museum in both sections | Both selected when on that museum’s route |

## Testing / verification

- Manual sidebar: 0 favorites → only **Todos os museus**
- Manual: ≥1 favorite → **Meus** above **Todos**; item in both
- Manual: filter narrows both; clear restores
- Manual: unfavorite removes from **Meus**
- Home still behaves as before after helper refactor
- `bun run typecheck && bun run lint && bun run build`
