# Museum Item Sort Design

Date: 2026-07-15  
Status: Approved (brainstorming)

## Goal

Let users sort a museum’s item list by title or date (ascending or descending) via one Selector. URL state is stored only when the user leaves the API default (**Padrão**).

## Decisions

| Topic | Choice |
| --- | --- |
| Options (v1) | Título A–Z, Título Z–A, Data crescente, Data decrescente |
| Control | Single Astryx `Selector` with four options + clear |
| Default | **Padrão** — no `sort` URL param; do not send `order` / `orderby` until the user picks |
| URL | Single `sort` query param via `nuqs`; omit when default (cleaner URLs) |
| Param values | `title-asc` \| `title-desc` \| `date-asc` \| `date-desc` |
| API mapping | `title-*` → `orderby=title`; `date-*` → `orderby=date`; `*-asc` → `order=ASC`; `*-desc` → `order=DESC` |
| Placement | Under `SearchBar`, above filters panel when present (same content column) |
| Clear | `hasClear` on Selector → `sort: null` (Padrão) |
| Page reset | Changing sort → `page` = 1; keep `search` / `collection` / `filters` |
| Collection change | Keep current sort (browse preference, not collection-scoped) |
| Invalid `?sort=` | Treat as Padrão and strip |
| Copy | Brazilian Portuguese |

## Out of scope

- Relevance / other `orderby` values
- Nesting sort inside the Filtros collapsible
- Two separate field + direction controls
- Changes to masonry, pagination model, or item detail
- Facet counts / infinite scroll / view density

## Architecture

```
MuseumContent
  nuqs: { search, page, collection, filters?, sort }
       // sort: ItemSort | null
  sortToQueryParams(sort) → { orderby, order } | undefined
  getItems(..., filterParams?, sortParams?)

  UI: Hero → CollectionTabs → SearchBar → ItemSortSelector → Filtros? → masonry
```

### URL shape

- Param: `sort`
- Allowed: `title-asc`, `title-desc`, `date-asc`, `date-desc`
- Absent / cleared → Padrão (API default ordering)

### Service

Extend `getItems` so optional sort params are merged into the Axios query only when present (same pattern as optional filter params if already on the branch). When `sort` is null, omit `order` and `orderby` entirely.

### Helper

`src/utils/itemSort.ts` (or equivalent):

| Export | Role |
| --- | --- |
| `ITEM_SORT_VALUES` | The four literal values |
| `ItemSort` | Union type |
| `ITEM_SORT_OPTIONS` | `{ value, label }[]` for the Selector |
| `parseItemSort` / nuqs literal parser | Validate URL value |
| `sortToQueryParams(sort)` | Map to `{ orderby, order }` or `undefined` |

### Query keys

Include `sort` in the museum items React Query key alongside `page`, `search`, `collection`, and filters when present.

## UI

### `ItemSortSelector` (optional small component)

- Astryx `Selector`
- Label: **Ordenar**
- Placeholder: **Padrão**
- `hasClear`
- `size="sm"`
- Options as in Decisions table

### Placement

Under the search field, above the faceted-filters collapsible when that feature is present. Full width of the search column (`maxWidth={672}` stack) is fine; hug content if using an `HStack` later.

## Error handling & edge cases

| Case | Behavior |
| --- | --- |
| Invalid `?sort=` | Strip; show Padrão |
| Clear / Padrão | No `order`/`orderby` on the request |
| Sort + collection + filters + search | All compose; sort is independent |
| Empty result set | Existing empty Banner unchanged |

## Testing

- `bun run typecheck && bun run lint && bun run build`
- Manual:
  - Select Título A–Z → URL has `sort=title-asc` → list order changes
  - Reload keeps selection
  - Clear → no `sort` param → API default
  - Change page then change sort → page resets to 1
  - Works together with collection (and filters if available)

## Follow-ups (not this feature)

- Relevance when `search` is non-empty
- Active-filter / sort summary chips
- Infinite scroll / view density
