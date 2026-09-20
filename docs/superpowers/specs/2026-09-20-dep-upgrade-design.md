# Dependency Upgrade Design

Date: 2026-09-20
Status: Approved

## Goal

Upgrade every outdated dependency in `package.json` to the latest stable
published version reported by the Bun registry, including major-version
updates, then verify that the Tainacan app still typechecks, lints, tests, and
builds successfully.

## Context and constraints

- The project uses Bun and commits its `bun.lock` lockfile.
- The current package manager declaration remains `bun@1.4.0`; upgrading the
  Bun runtime is out of scope.
- Museum APIs, public routes, application behavior, and the generated API
  contract are out of scope unless a dependency upgrade makes a compatibility
  fix necessary.
- The working tree was clean before this task.
- The previous dependency cycle upgraded Astryx to `0.3.0`; the current
  registry reports `0.6.2`, so Astryx CLI and package compatibility require
  explicit validation.

## Registry snapshot

Captured with `bun outdated` on 2026-09-20. These are the targets for the
upgrade unless the registry or package manager reports a resolution conflict:

| Package | Current | Target |
|---------|---------|--------|
| `@astryxdesign/core` | `0.3.0` | `0.6.2` |
| `@astryxdesign/theme-neutral` | `0.3.0` | `0.6.2` |
| `@stylexjs/stylex` | `0.19.0` | `0.19.1` |
| `@tanstack/react-query` | `5.101.4` | `5.103.1` |
| `axios` | `1.19.0` | `1.20.0` |
| `next` | `16.3.0` | `16.3.5` |
| `nuqs` | `2.9.5` | `2.10.1` |
| `react` / `react-dom` | `19.2.8` | `19.3.0` |
| `zod` | `4.4.3` | `4.6.5` |
| `@astryxdesign/cli` | `0.3.0` | `0.6.2` |
| `@biomejs/biome` | `2.5.7` | `2.5.14` |
| `@tanstack/react-query-devtools` | `5.101.4` | `5.103.1` |
| `@types/node` | `26.1.2` | `26.6.2` |
| `@types/react` | `19.2.18` | `19.3.0` |
| `lefthook` | `2.1.10` | `2.1.14` |
| `orval` | `8.23.0` | `8.35.0` |
| `vitest` | `4.1.10` | `5.0.1` |

Packages not listed by `bun outdated` (`use-debounce` and `typescript`) are
already current according to the same snapshot and will not be changed unless
dependency resolution requires it.

## Approach

1. Update the version ranges in `package.json` to the target stable releases,
   preserving the repository's existing exact-versus-caret convention.
2. Run `bun install` to resolve the dependency graph and refresh `bun.lock`.
3. Run the Astryx migration command from the currently installed version,
   `bun run astryx upgrade --from 0.3.0 --apply`, then review every generated
   change. Keep only compatibility/documentation changes relevant to this
   upgrade.
4. Inspect and fix compatibility failures in the smallest relevant scope.
   Prioritize Astryx component/API changes, Next.js configuration or type
   changes, React 19.3 compatibility, and Vitest 5 configuration changes.
5. Do not regenerate the Tainacan OpenAPI client unless the Orval upgrade
   changes generated output or the verification suite requires it.
6. Run the full repository check before claiming completion.

## Files and surfaces likely to change

- `package.json` — dependency versions.
- `bun.lock` — resolved dependency graph.
- Astryx-managed guidance or configuration files, only if the migration tool
  updates them and the changes are valid for this repository.
- Existing source/configuration files only when a verified dependency API or
  toolchain incompatibility requires a focused fix.
- A dated implementation plan under `docs/superpowers/plans/` before code
  changes begin.

## Verification and success criteria

The upgrade is successful when all of the following are true:

- `bun install` completes and `bun.lock` is consistent with `package.json`.
- `bun run typecheck` passes.
- `bun run lint` passes.
- `bun run test` passes.
- `bun run build` passes.
- Therefore `bun run check` passes end to end.
- No museum registry entries, public routes, secrets, or unrelated user
  changes are modified.

The optional `bun run test:api` smoke test may be run for additional evidence,
but failures caused by external museum availability are reported separately
from dependency verification.

## Rollback

Before applying the upgrade, record the current diff and dependency state. If
the new graph cannot be made compatible without unrelated feature work,
restore only the dependency, lockfile, migration, and compatibility changes
from this task; do not discard pre-existing user changes.
