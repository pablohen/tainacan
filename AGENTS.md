# AGENTS.md

Personal aggregator for external [Tainacan](https://tainacan.org/) (WordPress) museum APIs. No custom backend — collection data comes from museum REST endpoints in `src/utils/museums.ts`. Live site: https://tainacan.vercel.app. UI copy is **Brazilian Portuguese** (`pt-BR`).

## Superpowers

Always use Superpowers in this repo.

- Before any response or action, check whether a Superpowers skill applies. If there is even a small chance it does, invoke it and follow it.
- **Plan gate:** Before Plan mode or writing an implementation plan, always run the brainstorming skill first. Do not plan, scaffold, or implement until the design is approved.
- **Docs gate:** Always generate Superpowers docs on disk (not chat-only):
  - Design: `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
  - Plan: `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`
- Prefer the relevant skill over ad-hoc process, for example:
  - brainstorming before creative / feature work **and before any plan**
  - writing-plans before multi-step implementation
  - systematic-debugging before fixing bugs
  - test-driven-development when adding behavior
  - verification-before-completion before claiming work is done
- User instructions and this file outrank Superpowers when they conflict. Do not skip a clearly applicable skill.

## Commands

Package manager: **Bun**. Next.js CLI (`dev` / `build` / `start`) runs under Bun via `bun --bun`.

```bash
bun run dev          # development server
bun run build        # production build
bun run start        # production server
bun run typecheck    # tsc --noEmit
bun run lint         # biome check .
bun run astryx       # Astryx CLI (component docs, templates, theme)
```

Before claiming done: `bun run typecheck && bun run lint && bun run build`.

No automated test suite is configured.

## Layout

```
src/app/           App Router pages
src/components/    App UI (AppChrome + domain components)
src/contexts/      Client state (e.g. FavoritesContext + localStorage)
src/services/      Axios + Tainacan API (tainacanService, apiClient)
src/schemas/       Zod schemas (API response source of truth)
src/types/         Domain / inferred types
src/utils/         Museum registry, image helpers
```

Path alias: `@/*` → `src/*`.

## Architecture

- Fetch through `src/services/tainacanService.ts` and validate with Zod in `src/schemas/tainacan.ts`. Do not call Axios inline from components.
- Add museums only in `src/utils/museums.ts` (no env-based API config).
- Client lists: React Query. Item detail: server `await` then client presenter.
- Client persistence: localStorage contexts (mirror `FavoritesContext` for similar features).
- URL query state: `nuqs`.
- Page shell: Astryx `AppShell` via `AppChrome` (TopNav + SideNav + content). Theme locked to light.
- Prefer Astryx primitives from `@astryxdesign/core/*`. Discover APIs with `bun run astryx component <Name>`.
- Biome: tabs, double quotes.

## Commits

When the user asks to commit, use **atomic Conventional Commits**.

- One logical change per commit. Do not bundle unrelated refactors, formatting, and features.
- Format: `type(scope): summary`
- Types: `feat`, `fix`, `refactor`, `docs`, `style`, `chore`, `perf`, `test`, `ci`
- Scope optional but preferred when clear (`favorites`, `museums`, `item`, `ui`, …)
- Summary: imperative and concise; focus on why / what changed

Examples:

```
feat(favorites): persist museum favorites in localStorage
fix(item): handle missing document image gracefully
chore: add AGENTS.md for coding agents
```

Only commit when explicitly asked. Never amend or push unless asked.

## Boundaries

**Always**

- Write UI strings in Brazilian Portuguese
- Validate Tainacan API shapes with Zod
- Match existing layout and patterns
- Use Superpowers when a skill applies
- Run brainstorming before any plan
- Persist Superpowers specs and plans under `docs/superpowers/`
- Use atomic conventional commits when committing

**Ask first**

- Removing museums from the registry
- Changing public routes
- Introducing a real backend or auth

**Never**

- Invent museum API URLs
- Commit secrets or `.env` files
- Assume the README stack is current without checking package.json
- Skip Superpowers when a skill clearly applies
- Reintroduce Tailwind, shadcn/ui, framer-motion, or direct lucide-react imports for app UI

<!-- ASTRYX:START -->
Astryx v0.1.4 · 90+ components
CLI: run every command as `bunx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing. Full page → AppShell; sidebar nav → SideNav.
- Frame first: pick the shell (AppShell / Layout+LayoutPanel) and budget regions in px BEFORE writing content (`astryx docs layout`).
- Dense data = rows (Table, List/Item) edge-to-edge — never Card-wrapped list items. Card = dashboard widgets, galleries, settings groups only.
- Status → StatusDot/Token; Badge only for counts and enumerated states, never decoration.
- Custom styling: component props first; StyleX `xstyle` or tokens. No raw hex/px for brand colors.
- Tokens for every value (`astryx docs tokens`). Brand/accent via `astryx theme` — never override --color-* in :root.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   90+ components by category
  template --list    page + block recipes
  docs <topic>       color, elevation, icons, illustrations, layout, migration, motion, principles, shape, spacing, styling, theme, tokens, typography
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->

## Cursor Cloud specific instructions

Frontend-only Next.js app; there is no backend, database, or Docker to run. Commands are in `## Commands` above and `package.json`.

- `bun` is on `PATH` via `~/.bashrc`. `package.json` pins `packageManager: bun@1.4.0`, but that release does not exist upstream (404); the environment uses the latest available `1.x` instead, which runs `dev`/`build`/`typecheck`/`lint` fine. Bun does not enforce the `packageManager` field here, so ignore the mismatch.
- Run the dev server with `bun run dev` (http://localhost:3000). Start it in a background/tmux session — it is long-running.
- All collection/item data comes from live external Tainacan (WordPress) REST APIs listed in `src/utils/museums.ts`; the VM needs outbound internet. Requests can be slow (~8s) and some museums legitimately return no items or broken image thumbnails — that is upstream data, not a bug. Pick a well-populated collection (e.g. "Museu do Ouro") when smoke-testing.
- Favorites persist in browser localStorage only (no server state).
