# Museum Active State Chips Design

Date: 2026-07-17  
Status: Approved (brainstorming)

## Goal

Above the masonry results on a museum page, show a removable chip strip for active browse state (search, collection, facets, and sort) so users can recover or clear deep browse without hunting individual controls.

## Decisions

| Topic | Choice |
| --- | --- |
| Dimensions | Search + collection + facets + sort (full recoverable state) |
| Placement | Immediately above the results block (loading / error / masonry / empty), after Filtros |
| Visibility | Strip only when ≥1 chip would show |
| Clear-all | **Limpar tudo** resets search, collection→Todos, facets, sort→Padrão, page→1; also sync local `searchInput` |
| Per-chip remove | Clears only that dimension / facet key |
| Architecture | Presentational `MuseumActiveStateBar` + parent-derived chips and callbacks |
| Chip UI | Astryx `Token` with `onRemove`, `size="sm"` |
| Sticky meaning | Stays with the results column above masonry (not CSS `position: sticky` unless later needed) |
| URL | No new params — chips mirror existing `search` / `collection` / `filters` / `sort` |
| Facet chip granularity | One chip per active filter key |
| Chip order | search → collection → facets (by filter id) → sort |
| Copy | Brazilian Portuguese |

## Out of scope

- CSS `position: sticky` / fixed header behavior (unless layout proves necessary later)
- Changing SearchBar, CollectionTabs, Filtros, or Ordenar controls themselves
- Cross-museum chips, favorites, or new routes
- Facet counts on chips
- Infinite scroll / view density

## Architecture

```
MuseumContent (owns nuqs + local searchInput)
  derive ActiveStateChip[] from:
    search, collection (+ collections[]), filters (+ filterDefs / term labels), sort
  onRemove(chipId) → patch that dimension in setQueryStates (+ page 1 when needed)
  onClearAll → search null, collection null, filters null, sort null, page 1
               + setSearchInput("")

  UI: Hero → CollectionTabs → SearchBar → ItemSortSelector → MuseumFiltersPanel
      → MuseumActiveStateBar → masonry / empty / error
```

### Chip model

```ts
type ActiveStateChipKind = "search" | "collection" | "facet" | "sort";

type ActiveStateChip = {
	id: string; // stable: "search" | "collection" | `facet:${filterId}` | "sort"
	kind: ActiveStateChipKind;
	label: string;
};
```

### Labels

| Kind | Label pattern |
| --- | --- |
| Search | `Busca: {term}` |
| Collection | Collection `name` from `collections` |
| Facet (taxonomy multi) | `{filterName}: {termNames joined by ", "}` — fall back to raw ids until term names resolve |
| Facet (text) | `{filterName}: {value}` |
| Facet (interval) | `{filterName}: {min}–{max}` (omit empty bound) |
| Sort | Matching `ITEM_SORT_OPTIONS` label |

### Remove behavior

| Chip | Action |
| --- | --- |
| Search | `search: null`, clear `searchInput`, `page: 1` |
| Collection | `collection: null`, `page: 1` (keep filters/sort; existing sanitize may drop invalid facets) |
| Facet | Delete that key from `filters` JSON (or `filters: null` if last), `page: 1` |
| Sort | `sort: null`, `page: 1` |

### Clear-all

`search: null`, `collection: null`, `filters: null`, `sort: null`, `page: 1`, `setSearchInput("")`.

## UI

### `MuseumActiveStateBar`

| Prop | Role |
| --- | --- |
| `chips` | `ActiveStateChip[]` |
| `onRemove` | `(id: string) => void` |
| `onClearAll` | `() => void` |

- Return `null` when `chips.length === 0`
- Layout: Astryx stack wrapping Tokens + secondary `Button` **Limpar tudo** (no `<div>`)
- Optional short **Ativo** supporting text only if it stays uncluttered; prefer Tokens + button alone if tight

### Placement

Directly above the items loading / error / masonry / empty Banner block.

## Error handling & edge cases

| Case | Behavior |
| --- | --- |
| Taxonomy chip before terms load | Show filter name with raw term ids; update label when terms arrive |
| Removing last chip | Strip unmounts (`null`) |
| Empty museum-wide filters | No facet chips (panel already hidden) |
| Invalid / sanitized filters | Chips follow post-sanitize state |

## Testing

- `bun run typecheck && bun run lint && bun run build`
- Manual on a multi-filter collection:
  - Apply search + collection + facet + sort → strip appears above results
  - Remove one chip → only that state clears
  - **Limpar tudo** → all defaults, strip gone, SearchBar empty
  - Reload with URL state → chips match URL

## Follow-ups (not this feature)

- True CSS sticky bar while scrolling long masonry
- Chip overflow (“+N”) for many facets
- Facet counts on Tokens
