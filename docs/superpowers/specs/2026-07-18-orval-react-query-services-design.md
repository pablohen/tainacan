# Orval React Query Services — Design

**Date:** 2026-07-18  
**Status:** Implemented

## Goal

Replace hand-written `tainacanService.ts` and `apiClient.ts` with Orval-generated TanStack Query hooks, a shared axios mutator, and thin museum-aware wrapper hooks.

## Architecture

```
patch-tainacan-openapi.ts  →  curated paths + schema patches
         ↓
orval.config.ts (dual output)
  ├── zod → src/schemas/generated/tainacan.zod.ts
  └── react-query (tags-split) → src/services/generated/
         ↓
tainacanMutator.ts  (per-museum baseURL, Zod validation, WP headers)
         ↓
src/hooks/tainacan/*  (museum wrappers + fetchMuseumItem for RSC)
         ↓
pages & components
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
- `baseURL` from museum registry via wrapper `request` option
- `params` option for axios serialization (nested `taxquery` / `metaquery`)
- Parses query strings from Orval-generated URLs for scalar params
- Validates responses with facade schemas in `src/schemas/tainacan.ts`
- `getPaginationMeta()` reads `x-wp-total` / `x-wp-totalpages`

## Museum wrappers (`src/hooks/tainacan/`)

| Export | Purpose |
|--------|---------|
| `useMuseumCollections` | Collection tabs |
| `useMuseumFilters` | Museum-wide or collection-scoped filters |
| `useMuseumItems` | Item list with pagination meta (`FormattedItemsRes`) |
| `useMuseumTaxonomyTerms` | Filter panel + active chip labels |
| `fetchMuseumItem` | RSC item detail + `generateMetadata` |
| `getMuseumRequestOptions` | Shared `{ baseURL }` for generated fetchers |

`useMuseumItems` calls the mutator directly with axios `params` (not Orval URL builder) so nested filter query objects serialize correctly.

## Error handling

Service functions no longer return `null` on failure. React Query surfaces `isError` / `error`; RSC `fetchMuseumItem` catches and returns `null` for `notFound()`.

## Codegen

`bun run codegen:tainacan` runs patch + Orval (both outputs). The patch step writes two specs: `tainacan-openapi.schemas.json` (components only, for Zod) and `tainacan-openapi.patched.json` (with curated paths, for React Query). Generated API files live under `src/services/generated/` (Biome-ignored).

## Out of scope

- Infinite scroll / mutations
- Full upstream OpenAPI path restoration
- Replacing `tainacanFilters.ts` URL-state helpers
