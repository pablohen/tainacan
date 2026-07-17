# Museum Item View Mode Design

Date: 2026-07-17  
Status: Approved (brainstorming)

## Goal

Let users switch the museum item results between today’s **Galeria** (CSS masonry) and a dense **Tabela** of the same page of items, with the choice mirrored in the URL.

## Decisions

| Topic | Choice |
| --- | --- |
| Modes | `masonry` (default, today’s layout) · `table` |
| URL | `?view=table`; omit param when masonry (same pattern as sort) |
| Control | Astryx `SegmentedControl` labeled **Visualização** — Galeria / Tabela |
| Placement | Same toolbar row as **Ordenar** (under SearchBar) |
| Table columns | Museum: Thumb · Título · ID · favorito. Favorites: + **Museu** |
| Navigation | Title (and thumb) link to `/{museumId}/items/{id}` |
| Table chrome | `density="compact"`, `hasHover`, `dividers="rows"` |
| Page / filters / sort / chips | Unchanged when switching view; only the results body swaps |
| Loading | Masonry: existing card skeletons; table: compact skeleton / spinner |
| Scope | Museum browse page **and** favorites **Itens** section |
| Favorites sort | Same **Ordenar** / `?sort=`; client-side via `sortFavoriteItems` (title by label; date = favorited list order) |
| Invalid `?view=` | Treat as masonry and strip |
| Copy | Brazilian Portuguese |

## Out of scope

- Compact / dense masonry column variants
- List / row gallery between masonry and table
- Table-header sorting (keep **Ordenar** on museum pages)
- Bulk selection / row actions beyond favorito
- View chips in the active-state strip
- Changing `perpage` with view mode
- Table layout for favorite **museums** grid

## Architecture

```
MuseumContent
  nuqs: { …, view }  // ItemView | null — null = masonry
  ItemViewModeSelector → set view (omit when masonry)
  results:
    view === "table" ? ItemResultsTable : ItemMasonry + Card
```

### URL shape

- Param: `view`
- Allowed: `table`
- Absent / cleared → masonry

### Helper

`src/utils/itemView.ts`:

| Export | Role |
| --- | --- |
| `ITEM_VIEW_VALUES` | `["table"]` as const (or `["masonry","table"]` with default omit) |
| `ItemView` | `"table"` (non-default) or include both with default masonry |
| `ITEM_VIEW_OPTIONS` | labels for UI if needed |
| nuqs `parseAsStringLiteral` | Validate URL |

Use `parseAsStringLiteral(["table"] as const)` so only non-default is stored, matching sort. Control always shows a selected segment: masonry when `view === null`, table when `view === "table"`.

### Components

| File | Role |
| --- | --- |
| `ItemViewModeSelector.tsx` | SegmentedControl Galeria / Tabela |
| `ItemResultsTable.tsx` | Astryx `Table` + thumb / title link / id / FavoriteButton |
| `ItemMasonry` / `Card` | Unchanged for masonry path |

### Table row model

Map each `TainacanItem` to a client row (`Record<string, unknown>`):

- `id`, `title`, `imageUrl` (via `checkImagePath`), `museumId`

Columns use `pixel` for thumb + id + favorito; `proportional` for título. `renderCell` for media, link, and favorite (client component).

## UI

### `ItemViewModeSelector`

- `SegmentedControl` `label="Visualização"` `size="sm"`
- Items: `masonry` → **Galeria**, `table` → **Tabela**
- Controlled value: `view ?? "masonry"`
- `onChange`: `table` → set `view: "table"`; `masonry` → set `view: null`

### Results body

```
if loading:
  table ? ItemResultsTableSkeleton : Card skeletons in ItemMasonry
else if error: Banner (shared)
else if empty: Banner (shared)
else:
  table ? ItemResultsTable : ItemMasonry + Cards
Pagination (shared, when applicable)
```

## Error handling & edge cases

| Case | Behavior |
| --- | --- |
| Invalid `?view=` | Masonry; strip param |
| Missing image | Existing `checkImagePath` fallback |
| Narrow viewport | Table scrolls horizontally if needed; columns keep min widths |

## Testing

- `bun run typecheck && bun run lint && bun run build`
- Manual: toggle Galeria ↔ Tabela; reload with `?view=table`; filters/sort/chips still work; title opens item detail; favorite toggles without navigating

## Follow-ups (not this feature)

- Icon-only segmented control
- Sticky first column (thumb/title)
- Persist view preference across museum ↔ favorites (shared URL param already; no cross-route persistence)
