# Dependency Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade all outdated direct dependencies to the stable versions captured in the approved design and leave the Tainacan app passing its complete verification suite.

**Architecture:** Keep dependency ownership in the existing root `package.json` and resolve the graph through Bun into the committed `bun.lock`. Treat Astryx, Next.js, React, TypeScript, Vitest, and Orval as toolchain boundaries: migrate generated guidance/configuration only when the new versions require it, and keep museum API/domain code unchanged unless a concrete compiler or test failure identifies a compatibility fix.

**Tech Stack:** Bun `1.4.0`, Next.js `16.3.5`, React `19.3.0`, Astryx `0.6.2`, TypeScript `7.0.2`, Vitest `5.0.1`, Biome `2.5.14`, Orval `8.35.0`.

**Spec:** [2026-09-20-dep-upgrade-design.md](../specs/2026-09-20-dep-upgrade-design.md)

## Global Constraints

- Upgrade every outdated direct dependency to the target stable versions in the spec, including major-version updates.
- Keep `packageManager` at `bun@1.4.0`; do not upgrade the Bun runtime.
- Preserve public routes, museum registry entries, API endpoints, secrets, and unrelated user changes.
- Preserve the existing exact-versus-caret version convention: exact `next`, `@stylexjs/stylex`, and `@biomejs/biome`; caret ranges for the other semver dependencies.
- Do not regenerate the Tainacan OpenAPI client unless the Orval upgrade changes generated output or verification requires it.
- Do not commit changes unless the user explicitly requests a commit.
- Complete `bun run check` before claiming success.

## Review Focus

- **Manifest/lock resolution:** Every direct package reaches its approved target and `bun.lock` resolves the same graph; Task 1 checks this with `bun install` and `bun outdated`.
- **Astryx migration boundary:** The CLI remains invocable and generated guidance/configuration does not alter product routes or museum data; Task 2 checks `bun run astryx component AppShell` and the scoped diff.
- **Next.js plus React 19.3 build:** Server/client type boundaries and Next configuration remain valid; Task 3 checks `bun run typecheck` and `bun run build`.
- **Vitest 5 behavior:** Existing utility tests still execute under the upgraded runner; Task 3 checks all four current test files through `bun run test`.
- **Orval-generated client stability:** Generated service modules remain type-safe without an unrequested regeneration; Task 3 checks the generated service tree through typecheck and the final build.

---

### Task 1: Update direct dependency manifest and Bun lockfile

**Files:**
- Modify: `package.json`
- Modify: `bun.lock`
- Test: direct-package registry state reported by `bun outdated`

**Interfaces:**
- Consumes: Approved targets from `docs/superpowers/specs/2026-09-20-dep-upgrade-design.md`.
- Produces: A root manifest and lockfile that resolve the same direct dependency targets for Tasks 2–4.

- [x] **Step 1: Confirm the baseline is still isolated**

  Run:

  ```bash
  git status --short
  git diff --check
  ```

  Expected: only the approved Superpowers design document is uncommitted, and `git diff --check` reports no whitespace errors.

- [x] **Step 2: Update `package.json` direct version fields**

  Replace the direct dependency entries with these exact values while leaving scripts, `packageManager`, and package ordering intact:

  ```json
  "dependencies": {
    "@astryxdesign/core": "^0.6.2",
    "@astryxdesign/theme-neutral": "^0.6.2",
    "@stylexjs/stylex": "0.19.1",
    "@tanstack/react-query": "^5.103.1",
    "axios": "^1.20.0",
    "next": "16.3.5",
    "nuqs": "^2.10.1",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "use-debounce": "^10.1.1",
    "zod": "^4.6.5"
  },
  "devDependencies": {
    "@astryxdesign/cli": "^0.6.2",
    "@biomejs/biome": "2.5.14",
    "@tanstack/react-query-devtools": "^5.103.1",
    "@types/node": "^26.6.2",
    "@types/react": "^19.3.0",
    "lefthook": "^2.1.14",
    "orval": "^8.35.0",
    "typescript": "^7.0.2",
    "vitest": "^5.0.1"
  }
  ```

- [x] **Step 3: Resolve and lock the graph**

  Run:

  ```bash
  bun install
  ```

  Expected: installation completes successfully and updates `bun.lock` without changing `packageManager` or adding packages outside the direct manifest.

- [x] **Step 4: Verify direct versions against the registry snapshot**

  Run:

  ```bash
  bun outdated
  ```

  Expected: none of the 18 outdated direct packages listed in the design's registry snapshot remains behind its target. If a newer registry release appeared after the snapshot, record the new version in the design and update the manifest before continuing.

### Task 2: Migrate and smoke-test Astryx tooling

**Files:**
- Modify: `AGENTS.md` if the Astryx migration refreshes its generated instructions.
- Modify: `README.md` if the migration refreshes documented stack or CLI usage.
- Modify: `package.json` only if Astryx `0.6.2` moves the CLI entrypoint again.
- Inspect: `next-env.d.ts`, `next.config.mjs`, and any paths emitted by the Astryx migration command.
- Test: Astryx CLI component discovery output.

**Interfaces:**
- Consumes: The installed Astryx `0.6.2` packages from Task 1.
- Produces: A reviewed repository with current Astryx guidance and a working `astryx` script for Tasks 3–4.

- [x] **Step 1: Apply the versioned Astryx migration**

  Run:

  ```bash
  bun run astryx upgrade --from 0.3.0 --apply
  ```

  Expected: the CLI completes and reports the migration from `0.3.0` to the installed `0.6.2` package set.

- [x] **Step 2: Review migration output against the product boundary**

  Run:

  ```bash
  git diff --name-only
  git diff -- AGENTS.md README.md package.json next-env.d.ts next.config.mjs
  git diff -- src/app src/components src/contexts src/services src/utils/museums.ts
  ```

  Keep only changes that update Astryx guidance, CLI paths, Next type/config compatibility, or a directly identified compile failure. Revert generated edits that alter museum registry data, public route structure, or unrelated feature behavior using targeted `apply_patch` edits rather than broad checkout/reset commands.

- [x] **Step 3: Confirm the documented Astryx API is callable**

  Run:

  ```bash
  bun run astryx component AppShell
  ```

  Expected: the command exits successfully and prints the `AppShell` component reference without a missing-module or invalid-entrypoint error.

### Task 3: Resolve compiler, test-runner, and build compatibility

**Files:**
- Modify: `next.config.mjs` only for a concrete Next `16.3.5` configuration error.
- Modify: `next-env.d.ts` only for a concrete Next type-reference error.
- Modify: `vitest.config.ts` only for a concrete Vitest `5.0.1` configuration error.
- Modify: the exact source file named by a compiler/test failure when the dependency API changed; keep generated services under `src/services/generated/` unchanged unless the failure is in generated output.
- Test: `src/utils/checkImagePath.test.ts`
- Test: `src/utils/normalizeText.test.ts`
- Test: `src/utils/itemSort.test.ts`
- Test: `src/utils/tainacanFilters.test.ts`

**Interfaces:**
- Consumes: The locked dependency graph and migrated Astryx tooling from Tasks 1–2.
- Produces: Type-safe, tested application code and a production build compatible with Next `16.3.5` and React `19.3.0`.

- [x] **Step 1: Run the TypeScript boundary check**

  Run:

  ```bash
  bun run typecheck
  ```

  Expected: `tsc --noEmit` exits with code 0. If it fails, change only the file and symbol named in the diagnostic, preserving existing Tainacan API types and the `@/*` alias, then rerun this command until it passes.

- [x] **Step 2: Run the complete unit-test set under Vitest 5**

  Run:

  ```bash
  bun run test
  ```

  Expected: all tests in the four listed utility test files pass. If Vitest fails before collecting tests, update only `vitest.config.ts` for the reported Vitest 5 API/config change; if an assertion fails, preserve the existing behavior and fix the compatibility issue in the named implementation or test setup.

- [x] **Step 3: Run the production build**

  Run:

  ```bash
  bun run build
  ```

  Expected: Next completes a production build without React 19.3, Next 16.3.5, generated-service, or Astryx module errors. Keep `src/services/generated/` unchanged when the build passes; do not run OpenAPI codegen solely because Orval was upgraded.

### Task 4: Run the repository verification gate and audit the final diff

**Files:**
- Inspect: `package.json`
- Inspect: `bun.lock`
- Inspect: all files shown by `git diff --name-only`
- Test: repository-wide `bun run check`

**Interfaces:**
- Consumes: Passing typecheck, unit tests, build, and reviewed migration changes from Tasks 1–3.
- Produces: Evidence that the dependency upgrade is complete and limited to its approved scope.

- [x] **Step 1: Run the required end-to-end check**

  Run:

  ```bash
  bun run check
  ```

  Expected: typecheck, lint, all unit tests, and production build pass in sequence.

- [x] **Step 2: Optionally run the external API smoke test**

  Run:

  ```bash
  bun run test:api
  ```

  Expected: the smoke script reports schema/API results. Treat HTTP errors from an external museum as external-service evidence, record them, and do not alter museum configuration to make this test pass.

- [x] **Step 3: Audit scope and whitespace**

  Run:

  ```bash
  git diff --check
  git diff --stat
  git status --short
  ```

  Expected: the diff contains only the approved dependency manifest/lockfile, Superpowers docs, Astryx/toolchain compatibility changes, and focused fixes required by verification; no secrets, routes, museum registry entries, or unrelated files are present. Leave the changes uncommitted unless the user separately requests a commit.
