# Astryx Full Migration Design

Date: 2026-07-12  
Status: Approved (brainstorming)

## Goal

Migrate the Tainacan Next.js app from Tailwind CSS + shadcn/ui to [Astryx](https://astryx.atmeta.com/) with a full UI cutover. Business logic, routing, and data fetching stay unchanged.

## Decisions

| Topic | Choice |
| --- | --- |
| Scope | Full cutover — replace all shadcn/ui and restyle major surfaces |
| Theme | Light-only — `Theme` locked to `light`; no dark/system toggle |
| Chrome | AppShell + TopNav + SideNav (museums in SideNav) |
| Tailwind | Temporary coexistence, then remove entirely |
| Icons / motion | Remove `lucide-react` and `framer-motion`; use Astryx icons/CSS |
| Process | Official incremental migration |

## Out of scope

- CommandPalette
- Settings popover / theme toggle
- Dark mode
- Public route renames
- Museum registry or API changes
- Auth / backend

## Architecture

```
RootLayout
  → Theme (mode=light)
    → Providers (React Query, nuqs, Favorites)
      → AppShell
          TopNav: brand → /, Favoritos → /favorites
          SideNav: museums → /{id} (active from pathname)
          Main: page content + minimal Footer
```

Keep: `tainacanService`, Zod schemas, museums registry, FavoritesContext, React Query, nuqs, public routes, pt-BR copy.

## Primitive map

| Current | Astryx |
| --- | --- |
| `ui/button` | `Button` / `IconButton` |
| `ui/input` / SearchBar | `TextInput` |
| `ui/card` | `Card` + layout stacks |
| `ui/alert` | `Banner` |
| skeleton / spinner | Astryx loading equivalents |
| `ui/pagination` | Astryx pagination or Button group; keep nuqs page state |
| Favorite heart | `IconButton` + FavoritesContext |
| lucide icons | Astryx icons (or SVG) |
| framer-motion | remove |

Rewrite in place: `MuseumCard`, `Card`, `CardSkeleton`, `SearchBar`, `HeroBanner`, `FavoriteButton`, `Loading`, `ItemDetailSkeleton`, `FavoriteItemsSection`.

Delete after replacement: `Header`, `MuseumList`, `src/components/ui/*`.

Grids: responsive Astryx layout; simple grid is fine (no masonry requirement).

## Shell mapping

- **TopNav:** “Tainacan” brand link; Favoritos `IconButton` + badge count
- **SideNav:** one item per museum from `museums`; mobile via AppShell behavior
- **Footer:** “Tainacan © year” in main content area
- Pages stop mounting Header/Footer locally

## Migration phases

1. Init + Theme + CSS layer coexistence
2. Foundation smoke page (cascade check)
3. AppChrome (AppShell / TopNav / SideNav)
4. Shared components + routes (home → museum → item/not-found → favorites → error)
5. Purge Tailwind, shadcn, framer-motion, lucide-react; update AGENTS.md / README
6. Verify: typecheck, lint, build, manual shell/routes

## Verification criteria

- `bun run typecheck && bun run lint && bun run build` succeed
- Desktop and mobile shell navigation work
- Favorites badge, search, pagination, item detail, error/not-found behave as today
- No remaining imports of `@/components/ui/*`, Tailwind, `framer-motion`, or `lucide-react`

## Non-goals for visual fidelity

Exact pixel parity with the previous Tailwind look is not required. Prefer Astryx defaults and tokens while preserving information architecture and pt-BR copy.
