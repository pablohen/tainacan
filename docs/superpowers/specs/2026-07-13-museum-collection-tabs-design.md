# Museum Collection Tabs Design

Date: 2026-07-13  
Status: Approved (brainstorming)

## Goal

On a museum page, let users narrow the item list to one Tainacan collection via an in-page control, without leaving `/[museumId]`. Default remains the current museum-wide item list (**Todos**). Faceted filters are intentionally deferred to a follow-up that can reuse the selected collection context.

## Decisions

| Topic | Choice |
| --- | --- |
| Scope focus | Deeper single-museum browsing; collections first, filters later |
| Entry UX | In-page tabs on `/[museumId]` (not a dedicated collection route) |
| Default | **Todos** — no `collection` URL param → museum-wide `/items` |
| URL state | `nuqs` param `collection` (numeric id), alongside existing `search` / `page` |
| API when selected | `GET {museum.api}/collection/{id}/items` |
| API when Todos | `GET {museum.api}/items` (unchanged) |
| Control component | Astryx `TabList` + `Tab` (overflow-friendly; SegmentedControl is for ~2–5 options) |
| Placement | Between `HeroBanner` and `SearchBar` |
| Single-collection museums | Still show `Todos` + that collection |
| Hide when empty/error | Hide the tab row if collections fail or return `[]`; item list keeps working |
| Page reset | Changing collection → `page` = 1; keep `search`. Changing search → `page` = 1; keep `collection` |
| Invalid `?collection=` | After collections resolve, clear unknown ids and fall back to Todos |
| Copy | Brazilian Portuguese (`Todos`, `Coleções`, existing empty/error patterns) |

## Out of scope

- Faceted filters / taxonomies UI (`getFilters` / `getTaxonomies`)
- New public routes (e.g. `/[museumId]/collections/...`)
- Hiding the tab row when there is only one collection
- Changes to item cards, masonry layout, or item detail page
- Extracting a shared `useMuseumBrowseState` hook (optional later if the page grows)

## Architecture

```
/[museumId] (MuseumContent)
  nuqs: { search, page, collection }   // collection: number | null
  useQuery collections → getCollections(museumId)
  useQuery items → getItems(museumId, page, search, collectionId?)
       ├─ collectionId absent → GET {api}/items
       └─ collectionId set    → GET {api}/collection/{id}/items
  UI: HeroBanner → CollectionTabs → SearchBar → masonry + Pagination
```

### Service

Extend `getItems` in `src/services/tainacanService.ts` with optional `collectionId?: number`:

- When set: `${museum.api}/collection/${collectionId}/items`
- When absent: `${museum.api}/items` (current behavior)
- Query params unchanged: `perpage`, `paged`, optional `search`
- Response validation stays on `GetItemsResponseSchema`

### Query keys

- Items: `["museum-items", museumId, page, search, collectionId ?? null]`
- Collections: `["museum-collections", museumId]`

### UI component

`CollectionTabs` in `src/components/`:

| Prop | Role |
| --- | --- |
| `collections` | `TainacanCollection[]` from `getCollections` |
| `value` | `"all"` or `String(collection.id)` |
| `onChange` | `(value: string) => void` |
| `isLoading?` | While true, hide the row to avoid an empty-tab flash |

Tabs:

1. `Todos` → value `"all"` → clears `collection` from the URL
2. One `Tab` per collection → `name` as label, `String(id)` as value

Accessible group label: `Coleções`.

## Error handling

| Case | Behavior |
| --- | --- |
| Collections request fails | Hide tab row; items continue as today |
| Collections empty `[]` | Hide tab row |
| Items request fails | Existing museum-page error Banner |
| Stale/unknown `?collection=` | Once collections resolve, strip param and show Todos |
| Empty items for a collection | Same empty-list behavior as the current search empty state |

## Testing

- `bun run typecheck && bun run lint && bun run build`
- Manual GUI on a multi-collection museum:
  - Switch collection tabs → URL `collection` updates → list refreshes
  - Full reload preserves selected collection
  - **Todos** / clear restores museum-wide list
  - Search still works while a collection is selected
  - Changing collection resets pagination to page 1
  - Invalid `?collection=` falls back to Todos after collections load

## Follow-up (not this feature)

With a selected collection id in URL/state, a later feature can call `getFilters(collectionId)` and add faceted filters on the same museum page without new routes.
