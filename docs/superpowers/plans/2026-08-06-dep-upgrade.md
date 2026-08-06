# Dependency Upgrade Implementation

Date: 2026-08-06  
Spec: [2026-08-06-dep-upgrade-design.md](../specs/2026-08-06-dep-upgrade-design.md)

## Summary

Upgraded all npm dependencies to latest published versions. Astryx jumped `0.1.6` → `0.3.0`; Next moved from `16.3.0-canary.89` to stable `16.3.0`. No source-file codemod changes were required — existing code was already compatible with Astryx 0.3.0 APIs.

## Final versions

| Package | Version |
|---------|---------|
| `@astryxdesign/core` | 0.3.0 |
| `@astryxdesign/theme-neutral` | 0.3.0 |
| `@astryxdesign/cli` | 0.3.0 |
| `next` | 16.3.0 |
| `react` / `react-dom` | 19.2.8 |
| `@tanstack/react-query` (+ devtools) | 5.101.4 |
| `axios` | 1.19.0 |
| `nuqs` | 2.9.5 |
| `@biomejs/biome` | 2.5.7 |
| `orval` | 8.23.0 |
| `@types/node` | 26.1.2 |
| `@types/react` | 19.2.18 |

Unchanged (already latest): `@stylexjs/stylex` 0.19.0, `zod` 4.4.3, `typescript` 7.0.2, `vitest` 4.1.10, `lefthook` 2.1.10, `use-debounce` 10.1.1.

## Files changed

- [`package.json`](../../package.json) — version bumps; `astryx` script path updated for CLI 0.3.0 (`clients/cli/bin/astryx.mjs`)
- [`bun.lock`](../../bun.lock) — lockfile refresh
- [`AGENTS.md`](../../AGENTS.md) — refreshed by `astryx upgrade --from 0.1.6 --apply` (v0.3.0, 155 components, updated styling rules)
- [`next-env.d.ts`](../../next-env.d.ts) — Next 16.3.0 type reference path

## Manual fixes

1. **Astryx CLI bin path** — `@astryxdesign/cli` 0.3.0 moved the entry from `bin/astryx.mjs` to `clients/cli/bin/astryx.mjs`; updated the `astryx` npm script accordingly.
2. **Astryx upgrade command** — new CLI requires `--from <old-version>`: `bun run astryx upgrade --from 0.1.6 --apply`.
3. **Next experimental flag** — `experimental.useTypeScriptCli` in `next.config.mjs` still accepted by stable 16.3.0; no change needed.
4. **Orval** — no regeneration required; generated code unchanged.

## Verification

```bash
bun run check   # PASS — typecheck, lint, 12 tests, build
```

`bun run test:api` returned 403 from Museu Casa de Benjamin Constant (external API); unrelated to dependency changes.

## Docs updated

- [`README.md`](../../README.md) — stack versions, `check` includes tests, Astryx upgrade note
- [`AGENTS.md`](../../AGENTS.md) — `check` comment; `upgrade --from` in Astryx CLI block
- [`docs/superpowers/specs/2026-08-06-dep-upgrade-design.md`](../specs/2026-08-06-dep-upgrade-design.md) — corrected upgrade command

## Rollback

Revert `package.json`, `bun.lock`, `AGENTS.md`, `README.md`, and `next-env.d.ts`.
