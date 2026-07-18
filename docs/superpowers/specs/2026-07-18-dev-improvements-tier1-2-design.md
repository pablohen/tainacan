# Dev Improvements Tier 1 & 2 — Design

Approved scope: DX automation (Tier 1) and code health/reliability (Tier 2).

## Tier 1 — DX

- Composite `check` script (`typecheck` + `lint` + `test` + `build`)
- GitHub Actions CI on push/PR to `main`
- Wire `test:api` smoke script (local / scheduled; not PR CI)
- Gate React Query Devtools to development
- Lefthook pre-commit (`biome check --staged`)
- README + AGENTS documentation sync

## Tier 2 — Reliability

- `TainacanApiError` + `safeParse` + real HTTP status in mutator
- `tainacanRequestInit` / `withMuseumRequest` helpers
- Favorites Zod validation + `isHydrated` exposure
- Museum page hooks: `useMuseumBrowseState`, `useMuseumItemsQuery`, `useDebouncedUrlSearch`
- Unified museum 404 via layout `notFound()`
- Error banners with retry for collections/filters/items
- `keepPreviousData` on museum item lists
- Vitest unit tests for utils
- Codegen drift workflow (weekly + manual)
- Pinned upstream OpenAPI git ref

## Out of scope

Tier 3 (SSR museum browse, images) and Tier 4 (cleanup/polish) deferred.
