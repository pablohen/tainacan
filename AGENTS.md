# AGENTS.md

Personal aggregator for external [Tainacan](https://tainacan.org/) (WordPress) museum APIs. No custom backend — collection data comes from museum REST endpoints in `src/utils/museums.ts`. Live site: https://tainacan.vercel.app. UI copy is **Brazilian Portuguese** (`pt-BR`).

## Superpowers

Always use Superpowers in this repo.

- Before any response or action, check whether a Superpowers skill applies. If there is even a small chance it does, invoke it and follow it.
- Prefer the relevant skill over ad-hoc process, for example:
  - brainstorming before creative / feature work
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
```

Before claiming done: `bun run typecheck && bun run lint && bun run build`.

No automated test suite is configured.

## Layout

```
src/app/           App Router pages
src/components/    App UI + shadcn primitives in ui/
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
- Page shell: Header + content + Footer. Light theme only.
- Prefer shadcn primitives in `src/components/ui/`.
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
- Use atomic conventional commits when committing

**Ask first**

- Removing museums from the registry
- Changing public routes
- Introducing a real backend or auth

**Never**

- Invent museum API URLs
- Commit secrets or `.env` files
- Assume the README stack is current (e.g. Next-SEO / Next-Themes are listed but not installed)
- Skip Superpowers when a skill clearly applies
