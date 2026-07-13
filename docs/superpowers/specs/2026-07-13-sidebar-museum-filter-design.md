# Sidebar Museum Filter Design

Date: 2026-07-13  
Status: Approved (brainstorming)

## Goal

Let users quickly find a museum in the always-visible sidebar navigation, which today lists all ~50 museums with no filter. Add a filter input to the `SideNav` that narrows the list by museum title as the user types. Matching is accent- and case-insensitive for Brazilian Portuguese.

## Decisions

| Topic | Choice |
| --- | --- |
| Placement | Filter input in `SideNav`'s `topContent` slot (in `MuseumSideNav`, `AppChrome.tsx`) |
| Filter UI | Reuse existing `SearchBar` component (`TextInput`, `startIcon="search"`, `hasClear`) |
| Match field | `museum.title` only (that is all the sidebar shows) |
| Matching | Accent-insensitive + case-insensitive |
| Normalization | `s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()`, applied to query and title |
| Empty query | Show all museums (current behavior) |
| State | Ephemeral local `useState` in `MuseumSideNav` — no `nuqs`/URL state |
| Persistence | Survives client-side navigation (AppChrome stays mounted); resets on full reload |
| Empty state | `Text type="supporting"` inside nav: `Nenhum museu encontrado` |
| Collapsed state | Filter input + empty state render only when `SideNav` is expanded |

## Out of scope

- Homepage grid search (already exists in `src/app/page.tsx`)
- `nuqs`/URL-persisted filter state
- Matching against museum `description`
- Route changes, theme changes, museum-registry edits
- Sidebar grouping/categories

## Architecture

```
AppChrome (client, stays mounted)
  → MuseumSideNav
      state: query (useState)
      derived: filteredMuseums = museums.filter(title matches normalized query)
      SideNav (collapsible)
        topContent (expanded only) → SearchBar(value=query, onChange)
        SideNavSection "Museus"
          filteredMuseums.map → SideNavItem
          filteredMuseums.length === 0 → Text "Nenhum museu encontrado"
```

Normalization helper (accent/case-insensitive) lives alongside `MuseumSideNav` (or `src/utils` if reused elsewhere later).

## Error handling

No network or async paths; `museums` is a static in-memory array. The only edge case is an empty result set, handled by the empty state.

## Testing

- `bun run typecheck && bun run lint && bun run build`
- Manual GUI: type `sao joao` → matches "Museu Regional São João Del Rey"; type `historia` → matches "Museu Histórico Nacional"; clear via the input's clear button restores the full list; clicking a filtered result still navigates to the museum page.
