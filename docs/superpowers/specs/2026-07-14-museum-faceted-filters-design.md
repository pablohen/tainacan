# Museum Faceted Filters Design

Date: 2026-07-14  
Status: Approved (brainstorming)

## Goal

On the museum page, let users refine the item list with Tainacan facets (taxonomy, text, numeric, and date), with applied values persisted in the URL. Filters are always available: museum-wide definitions on **Todos**, collection-scoped definitions when a collection is selected.

## Decisions

| Topic | Choice |
| --- | --- |
| Availability | Always on the museum page — `getFilters()` on Todos; `getFilters(collectionId)` when a collection is selected |
| Placement | Collapsible panel under the search bar |
| URL state | Single `filters` JSON query param via `nuqs` (`parseAsJson` + Zod) |
| Panel open/closed | Derived: open by default when URL has active filters; otherwise closed (local/controlled as needed) |
| Encoding approach | One JSON map `{ [filterId]: FilterValue }` + per-`filter_type` adapters → API query params |
| Supported families (v1) | Taxonomy (checkbox / tag-style), text, numeric interval, date / date-like interval |
| Unsupported types | Omit from UI; strip from URL once filter defs resolve |
| Apply UX | Immediate URL update on change (no separate “Aplicar”), matching search/collection |
| Text / numeric debounce | ~300–500ms before writing URL / refetching |
| Collection change | Clear `filters` and reset `page` to 1 |
| Empty defs | Hide panel when loading settles to `[]` or all types unsupported |
| Fetch error | Hide panel; item list keeps working |
| Copy | Brazilian Portuguese (`Filtros`, `Limpar filtros`, field labels from API `name`) |

## Out of scope

- Sort control, taxonomy-only browse chrome, infinite scroll, view density
- Perfect parity with every Tainacan filter widget / admin UI
- Facet result counts
- Changes to item cards, masonry, or item detail
- New public routes

## Architecture

```
MuseumContent
  nuqs: { search, page, collection, filters }
       // filters: Record<filterId, FilterValue> | null
  useQuery filterDefs → getFilters(museumId, collectionId?)
  adapters → API query params
  useQuery items → getItems(museumId, page, search, collectionId?, filterParams?)

  UI: HeroBanner → CollectionTabs → SearchBar
      → Collapsible "Filtros" (MuseumFiltersPanel) → masonry + Pagination
```

### URL shape

- Param name: `filters`
- Value: JSON object keyed by Tainacan filter `id` (string keys in JSON)
- `FilterValue` variants (conceptual):
  - Taxonomy multi: `string[]` (prefer term ids when the terms API provides them; adapter documents the chosen identifier)
  - Text: `string`
  - Interval (numeric/date): `{ min?: string; max?: string }`
- Absent / `null` / `{}` → no facet params on the items request

### Service

- Keep existing collection endpoint swap on `getItems`
- Extend `getItems` to accept optional structured filter params (or a flat `Record` of extra query params produced by adapters)
- Continue validating item responses with `GetItemsResponseSchema`

### Adapters

Module such as `src/utils/tainacanFilters.ts`:

| Family | Example `filter_type` | API direction |
| --- | --- | --- |
| Taxonomy | `TaxonomyCheckbox`, `TaxonomyTaginput`, similar | `taxquery[…]` |
| Text | text-like filter types | meta text compare / metakey+metavalue patterns Tainacan expects |
| Numeric interval | `Numeric_Interval` | meta between / min–max |
| Date interval | date / date-interval types | same interval pattern with date-formatted bounds |

- Input: filter definition + user `FilterValue`
- Output: Axios-compatible query params merged into the items request
- Unknown `filter_type` → no UI control; if present in URL, drop when defs resolve

### Schema

Expand `TainacanFilterSchema` enough for UI and adapters (nested `metadatum` / taxonomy identifiers as needed). Fetch taxonomy term options on demand from the appropriate Tainacan terms endpoint when a taxonomy control mounts or opens.

### Query keys

- Filter defs: `["museum-filters", museumId, collectionId ?? null]`
- Items: include serialized active filters (or the `filters` object) alongside `page`, `search`, `collection`

## UI

### `MuseumFiltersPanel`

- Astryx `Collapsible` under `SearchBar`
- Trigger: **Filtros** (optional count of active filter keys)
- Default open when URL has any active filters; otherwise closed
- Body: one field per supported filter (`Field` + control)
- **Limpar filtros** clears the `filters` param

### Controls (Astryx-first)

| Family | Control |
| --- | --- |
| Taxonomy multi (short) | `CheckboxList` |
| Taxonomy multi (long) / tag-style | `MultiSelector` or `Typeahead` patterns |
| Text | `TextInput` (or equivalent) |
| Numeric interval | two inputs (min / max) |
| Date interval | `DateRangeInput` when date-like; else min/max text/date inputs |

### Empty / loading / error

| State | Behavior |
| --- | --- |
| Loading | Hide panel until defs resolve |
| `[]` or no supported types | Hide panel |
| Fetch error | Hide panel; items unaffected |
| Empty item results under facets | Existing empty Banner; copy may mention filters when any are active |

## Error handling & edge cases

| Case | Behavior |
| --- | --- |
| Stale filter ids after collection change | Cleared because `filters` resets on collection change |
| Stale ids / unsupported types in URL | Strip once defs successfully resolve |
| Interval with only min or only max | Still send; both empty → remove that filter key |
| Museum-wide filters empty (common) | No panel on Todos until a collection with filters is selected |
| Filter defs fail but items succeed | Hide panel only |

## Testing

- `bun run typecheck && bun run lint && bun run build`
- Manual GUI (e.g. Museu Casa de Benjamin Constant + a collection with filters):
  - Open **Filtros** → select taxonomy values → URL `filters` updates → list narrows
  - Reload preserves facets
  - Switch collection clears facets
  - **Limpar filtros** restores the unfiltered list (still within current collection/search)
  - Text and interval filters debounce and refetch
  - Todos with empty museum-wide filters shows no panel

## Follow-ups (not this feature)

- Sort control (`order` / `orderby`)
- Facet counts
- Broader Tainacan widget parity
