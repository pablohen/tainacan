# Dependency Upgrade Design

Date: 2026-08-06  
Status: Approved

## Goal

Bump all npm dependencies in `package.json` to their current published `latest` versions and verify the app still typechecks, lints, tests, and builds.

## Scope

**In scope**

- All dependencies and devDependencies in `package.json`
- Astryx `0.1.6` → `0.3.0` (core, theme-neutral, cli) with `astryx upgrade --from <old> --apply`
- Next.js `16.3.0-canary.89` → `16.3.0` stable
- Patch/minor bumps for React, TanStack Query, axios, nuqs, Biome, Orval, type packages

**Out of scope**

- Bun runtime upgrade (`packageManager: bun@1.4.0`)
- OpenAPI vendor fetch / Orval regeneration unless Orval upgrade breaks generated output
- Feature work or UI redesign

## Target versions

| Package | Target |
|---------|--------|
| `@astryxdesign/core` | `^0.3.0` |
| `@astryxdesign/theme-neutral` | `^0.3.0` |
| `@astryxdesign/cli` | `^0.3.0` |
| `next` | `16.3.0` |
| `react` / `react-dom` | `^19.2.8` |
| `@tanstack/react-query` (+ devtools) | `^5.101.4` |
| `axios` | `^1.19.0` |
| `nuqs` | `^2.9.5` |
| `@biomejs/biome` | `2.5.7` |
| `orval` | `^8.23.0` |
| `@types/node` | `^26.1.2` |
| `@types/react` | `^19.2.18` |

Already at latest: `@stylexjs/stylex`, `zod`, `typescript`, `vitest`, `lefthook`, `use-debounce`.

## Process

1. Update `package.json` version fields
2. `bun install` → refresh `bun.lock`
3. `bun run astryx upgrade --from <old-version> --apply`
4. Fix type/lint/build breaks (Astryx API changes first)
5. Adjust `next.config.mjs` if stable rejects `experimental.useTypeScriptCli`
6. `bun run biome:fix` if needed
7. `bun run check` as verification gate

## Verification

```bash
bun run check   # typecheck + lint + test + build
```

Optional: `bun run test:api` (network smoke).

## Rollback

Revert `package.json` and `bun.lock` to pre-upgrade state. If Astryx modified source files, revert those commits as well.

## Risks

| Area | Mitigation |
|------|------------|
| Astryx 0.3.0 API/CSS changes | `upgrade --from <old> --apply` + `astryx component` CLI |
| Next canary → stable | Remove incompatible experimental flags |
| Biome 2.5.7 | Autofix via `biome:fix` |
