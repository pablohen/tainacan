# Museum UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the external-link button, ship image-first overlay item cards, and replace item Grids with CSS-column masonry on museum and favorites pages.

**Architecture:** Shared `Card` (`ClickableCard` + absolute overlay chrome + `MediaTheme`) and `ItemMasonry` (CSS multi-column via token classes on Astryx `Section`). Hero uses a single navigational `Button` with `endContent` icon. Do not nest Astryx `Overlay` inside `ClickableCard` — Overlay sets `data-pressable-container` and blocks card navigation.

**Tech Stack:** Next.js App Router, Astryx `@astryxdesign/core`, StyleX `@stylexjs/stylex`, Bun

## Global Constraints

- Brazilian Portuguese UI copy only
- No raw `<div>` for layout; Astryx primitives + `xstyle`
- No Tailwind / shadcn / lucide for app UI
- Discover component APIs with `bun run astryx component <Name>`
- Spec: `docs/superpowers/specs/2026-07-12-museum-ui-polish-design.md`

---

### Task 1: HeroBanner external CTA

**Files:**
- Modify: `src/components/HeroBanner.tsx`

- [ ] Replace `Link isExternalLink` + nested `Button` with:
  - `Button` `label="Ir para o site"` `variant="primary"`
  - `href={link}` `target="_blank"` `rel="noopener noreferrer"`
  - `endContent={<Icon icon="externalLink" />}`
- [ ] Keep `link !== "#"` guard; remove unused `Link` import if unused
- [ ] Commit: `fix(ui): keep external link icon inside museum site button`

### Task 2: Image-first Card + skeleton

**Files:**
- Modify: `src/components/Card.tsx`
- Modify: `src/components/CardSkeleton.tsx`

- [ ] Change `Card` props to `{ museumId, itemId, title, imageUrl, subtitle? }`
- [ ] Implement `ClickableCard` + nested `Overlay` (top heart, bottom title/ID/subtitle) + `MediaTheme mode="dark"`
- [ ] Image: natural height, `objectFit: "contain"`, full width
- [ ] Update `CardSkeleton` to full-bleed block (no footer)
- [ ] Commit: `feat(ui): rebuild item cards as image-first overlays`

### Task 3: ItemMasonry + museum page

**Files:**
- Create: `src/components/ItemMasonry.tsx`
- Modify: `src/app/[museumId]/page.tsx`

- [ ] Add `ItemMasonry` with CSS multi-column (`globals.css` + `Section` className), spacing tokens, `break-inside: avoid` on children
- [ ] Swap museum page loading + item `Grid` for `ItemMasonry`
- [ ] Map each Tainacan item into flat `Card` props via `checkImagePath`
- [ ] Commit: `feat(ui): add CSS-column masonry for museum item grids`

### Task 4: Favorites wiring

**Files:**
- Modify: `src/app/favorites/page.tsx`

- [ ] Replace inline item card markup with shared `Card` + `ItemMasonry`
- [ ] Pass `subtitle={museum?.title}`
- [ ] Leave museum favorites on `Grid` / `MuseumCard`
- [ ] Remove unused imports
- [ ] Commit: `refactor(favorites): reuse shared item Card in masonry layout`

### Task 5: Verify

- [ ] Run `bun run typecheck && bun run lint && bun run build`
- [ ] Fix any failures; do not claim done without green output
