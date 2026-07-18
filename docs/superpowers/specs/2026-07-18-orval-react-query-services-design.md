# Orval React Query Services — Design

**Date:** 2026-07-18  
**Status:** Implemented

## Goal

Replace hand-written `tainacanService.ts` and `apiClient.ts` with Orval-generated TanStack Query hooks and a shared mutator. Museum-aware routing is handled via `museumId` on the mutator request option and inline generated hooks at call sites.

## Architecture

```
patch-tainacan-openapi.ts  →  curated paths + schema patches
         ↓
orval.config.ts (dual output)
  ├── zod → src/schemas/generated/tainacan.zod.ts
  └── react-query (tags-split) → src/services/generated/
         ↓
tainacanMutator.ts  (museumId → baseURL, Zod validation, WP headers, formatItemsResponse)
         ↓
pages & components  (generated hooks + request: { museumId })
```

## Curated API paths

Injected from `scripts/tainacan-api-paths.json`:

| Operation | Path | Tag |
|-----------|------|-----|
| `listItems` | `GET /items` | items |
| `listCollectionItems` | `GET /collection/{collection_id}/items` | items |
| `getItem` | `GET /items/{item_id}` | items |
| `listCollections` | `GET /collections` | collections |
| `listFilters` | `GET /filters` | filters |
| `listCollectionFilters` | `GET /collection/{collection_id}/filters` | filters |
| `listTaxonomyTerms` | `GET /taxonomy/{taxonomy_id}/terms` | taxonomies |

## Mutator (`tainacanMutator.ts`)

- Axios instance (10s timeout, JSON headers)
- `museumId` or `baseURL` on request options — `museumId` resolves via `getMuseumById`
- `params` option for axios serialization (nested `taxquery` / `metaquery`)
- Parses query strings from Orval-generated URLs for scalar params on other endpoints
- Validates responses with facade schemas in `src/schemas/tainacan.ts`
- `getPaginationMeta()` reads `x-wp-total` / `x-wp-totalpages`
- `formatItemsResponse()` maps list responses to `FormattedItemsRes` for `select`

## Consumer patterns

Components call generated hooks directly:

```ts
useListCollections(undefined, {
  request: { museumId },
  query: {
    queryKey: ["museum-collections", museumId],
    enabled: Boolean(museumId),
    select: (r) => r.data as TainacanCollection[],
  },
});
```

Conditional endpoints (museum-wide vs collection-scoped filters/items) use dual-hook patterns with `enabled` flags in [`src/app/[museumId]/page.tsx`](src/app/[museumId]/page.tsx).

Item list fetchers are post-processed in `codegen-tainacan.ts` to call the mutator with path + axios `params` (Orval's URL builder breaks nested filter query objects).

## Error handling

React Query surfaces `isError` / `error` on the client. RSC item pages use inline `getItem` with try/catch → `notFound()`.

## Codegen

`bun run codegen:tainacan` runs patch + Orval (both outputs). The patch step writes two specs: `tainacan-openapi.schemas.json` (components only, for Zod) and `tainacan-openapi.patched.json` (with curated paths, for React Query). Generated API files live under `src/services/generated/` (Biome-ignored).

## Out of scope

- Infinite scroll / mutations
- Full upstream OpenAPI path restoration
- Replacing `tainacanFilters.ts` URL-state helpers
