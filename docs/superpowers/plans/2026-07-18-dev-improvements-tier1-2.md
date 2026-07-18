# Dev Improvements Tier 1 & 2 — Implementation Plan

## Phase 1 — DX foundation

1. Add `check`, `test`, `test:api`, `prepare` scripts to `package.json`
2. Add `.github/workflows/ci.yml`
3. Gate devtools via `src/components/ReactQueryDevtools.tsx`
4. Add `lefthook.yml` + devDependency
5. Expand `README.md` and `AGENTS.md`

## Phase 2 — Data layer

1. Add `src/services/tainacanApiError.ts`
2. Harden `src/services/tainacanMutator.ts`
3. Add `src/services/tainacanRequest.ts`
4. Add `src/schemas/favorites.ts` + update `FavoritesContext`
5. Gate favorites badge on `isHydrated` in `AppChrome`

## Phase 3 — Museum page refactor

1. Add `useMuseumBrowseState`, `useSanitizeMuseumFilters`, `useMuseumItemsQuery`
2. Add `useDebouncedUrlSearch` / `useDebouncedLocalSearch`
3. Refactor `src/app/[museumId]/page.tsx`
4. Add `src/app/[museumId]/not-found.tsx` + layout guard
5. Add `MuseumQueryErrorBanner` component
6. Distinguish 404 vs 5xx in item `loadItem`

## Phase 4 — Test & codegen hygiene

1. Add `vitest.config.ts` + unit tests under `src/utils/*.test.ts`
2. Add `test` to CI and `check`
3. Add `.github/workflows/codegen-drift.yml`
4. Pin OpenAPI via `scripts/tainacan-openapi-ref.ts` + fetch script

## Verification

```bash
bun run check
bun run test:api  # optional; requires network
```
