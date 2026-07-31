# Live Federated Thematic Exploration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a live, progressively loaded theme catalog and `/themes/[theme]` pages that federate taxonomy-backed items across museums without a backend.

**Architecture:** Pure utilities normalize terms and build an explainable in-memory graph. React Query fetches each museum independently through existing Orval services, while a small scheduler caps concurrent museum discovery and exposes partial progress. Theme pages reuse cached graph data when possible and rediscover the requested theme on direct entry before issuing independent, retryable item queries per museum.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, TanStack Query 5, Orval-generated Tainacan services, Axios mutator, Zod 4, Astryx, Vitest 4, Testing Library, jsdom.

## Global Constraints

- Implement only stage 1: automatic relationships, a global theme catalog, federated results, and related themes.
- Fetch taxonomies and terms live; do not add a backend, build-time index, persistent index, embeddings, language-model calls, or semantic services.
- Validate all Tainacan API response shapes with the existing Zod-aware `tainacanMutator` path.
- Fetch only through Orval-generated services with `request: { museumId }`; do not call Axios from components.
- Limit museum discovery concurrency to `4`, term page size to `100`, theme item preview size to `8`, and related themes to `8`.
- A theme enters the global catalog only after it occurs in at least `2` distinct museums.
- Theme normalization may change case, diacritics, whitespace, and edge punctuation only; it must not stem, translate, or merge by similarity.
- Preserve original museum, taxonomy, term, and label provenance for every occurrence.
- All new user-facing labels and messages introduced by this feature must be in English.
- Keep existing museum and item routes unchanged; add only `/themes/[theme]`.
- Use Astryx components and tokens; do not add Tailwind, shadcn/ui, framer-motion, direct `lucide-react` imports, raw brand colors, or Card-wrapped dense lists.
- Use tabs and double quotes to satisfy Biome.
- Run `bun run check` before claiming completion.
- Do not commit unless the user explicitly asks. If commits are authorized, use the atomic Conventional Commit messages listed in each task.

## File Structure

### Create

- `src/types/themes.ts` — domain types shared by graph, discovery, and UI.
- `src/utils/themes.ts` — pure normalization, aggregation, ranking, route-key, and relationship logic.
- `src/utils/themes.test.ts` — unit coverage for all pure theme rules.
- `src/services/themeDiscovery.ts` — one-museum taxonomy discovery and pagination through generated services.
- `src/services/themeDiscovery.test.ts` — mocked-service tests for pagination, deduplication, and cancellation.
- `src/hooks/useThemeCatalog.ts` — capped-concurrency progressive discovery and graph aggregation.
- `src/hooks/useThemeCatalog.test.tsx` — hook tests for progress, failure isolation, cache reuse, and direct lookup.
- `src/services/themeItems.ts` — taxonomy-occurrence item requests and deterministic item deduplication.
- `src/services/themeItems.test.ts` — request-shape and merge tests.
- `src/hooks/useThemeMuseumItems.ts` — independent museum section queries and local retries.
- `src/hooks/useThemeMuseumItems.test.tsx` — hook tests for independent states and retry isolation.
- `src/components/HomeThemesSection.tsx` — progressive theme entry layer on the home page.
- `src/components/HomeThemesSection.test.tsx` — catalog-state and link tests.
- `src/components/ThemeMuseumSection.tsx` — one stable museum preview section.
- `src/components/ThemeMuseumSection.test.tsx` — loading, empty, success, and error tests.
- `src/components/RelatedThemes.tsx` — explainable related-theme links.
- `src/app/themes/[theme]/page.tsx` — client theme route presenter with metadata shell.
- `src/app/themes/[theme]/ThemePageClient.tsx` — discovery and federated-result orchestration.
- `src/app/themes/[theme]/loading.tsx` — direct-navigation loading state.
- `src/app/themes/[theme]/not-found.tsx` — unknown-theme state.
- `src/test/renderWithProviders.tsx` — reusable React Query test renderer.
- `src/test/setup.ts` — Testing Library matcher and cleanup setup.

### Modify

- `package.json` — add React component-test dependencies.
- `vitest.config.ts` — use jsdom and load the shared test setup.
- `src/app/page.tsx` — render `HomeThemesSection` before the museum list.
- `src/utils/tainacanFilters.ts` — expose a focused taxonomy query builder for a single occurrence.
- `src/utils/tainacanFilters.test.ts` — verify the new query builder.
- `src/components/MuseumPageStates.tsx` — allow English retry labels without changing existing callers.

---

### Task 1: Theme Domain Model and Conservative Graph

**Files:**
- Create: `src/types/themes.ts`
- Create: `src/utils/themes.ts`
- Create: `src/utils/themes.test.ts`

**Interfaces:**
- Consumes: `Museum["id"]` and numeric Tainacan taxonomy/term/filter IDs.
- Produces: `normalizeThemeLabel(label: string): string`, `buildThemeGraph(discoveries: MuseumThemeDiscovery[]): ThemeGraph`, `findTheme(graph: ThemeGraph, key: string): ThemeNode | null`, and `getRelatedThemes(graph: ThemeGraph, key: string, limit?: number): RelatedTheme[]`.

- [ ] **Step 1: Define domain types and write failing normalization tests**

Create `src/types/themes.ts` with these exact public types:

```ts
export interface ThemeOccurrence {
	museumId: string;
	filterId: number;
	taxonomyId: number;
	taxonomyDbIdentifier: string;
	taxonomyLabel: string;
	termId: number;
	termLabel: string;
}

export interface MuseumThemeDiscovery {
	museumId: string;
	occurrences: ThemeOccurrence[];
}

export interface ThemeNode {
	key: string;
	label: string;
	museumCount: number;
	occurrences: ThemeOccurrence[];
}

export interface RelatedTheme {
	key: string;
	label: string;
	sharedMuseumTaxonomyCount: number;
}

export interface ThemeGraph {
	themes: ThemeNode[];
	byKey: Record<string, ThemeNode>;
	relatedByKey: Record<string, RelatedTheme[]>;
}
```

Write tests proving that `"  Arte   Sacra! "` becomes `"arte sacra"`, `"São Paulo"` becomes `"sao paulo"`, internal punctuation is preserved, and blank/punctuation-only labels become an empty key.

- [ ] **Step 2: Run normalization tests and verify they fail**

Run: `bun run test src/utils/themes.test.ts`

Expected: FAIL because `@/utils/themes` does not exist.

- [ ] **Step 3: Implement the minimal normalizer**

Create `src/utils/themes.ts` with a `normalizeThemeLabel` function that applies NFD diacritic removal, lowercase conversion, trimmed/collapsed whitespace, and `/^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu` edge cleanup. Return the final trimmed value.

- [ ] **Step 4: Add failing graph aggregation and relationship tests**

Use fixtures where:

- two museums publish `Arte Sacra` with distinct IDs;
- one museum repeats the same occurrence;
- one museum publishes `Imaginária religiosa`;
- `Arte Sacra` and `Barroco` occur in the same taxonomy in two museums;
- `Arte Sacra` and `Escultura` share a taxonomy in only one museum.

Assert that duplicate occurrences are removed, only themes from at least two museums enter `themes`, catalog order is museum count descending then occurrence count descending then `localeCompare(..., "en")`, and only `Barroco` qualifies as a related theme for `Arte Sacra`.

- [ ] **Step 5: Run graph tests and verify they fail**

Run: `bun run test src/utils/themes.test.ts`

Expected: FAIL because graph exports are missing.

- [ ] **Step 6: Implement graph aggregation**

Implement these rules:

```ts
const occurrenceId = (value: ThemeOccurrence) =>
	`${value.museumId}:${value.filterId}:${value.taxonomyId}:${value.termId}`;

const taxonomyContextId = (value: ThemeOccurrence) =>
	`${value.museumId}:${value.taxonomyId}`;
```

Group non-empty normalized keys, deduplicate by `occurrenceId`, choose the display label by most frequent original label with `localeCompare(..., "en")` as the tie-breaker, and retain public nodes only when `new Set(occurrences.map(o => o.museumId)).size >= 2`.

For relationships, count distinct `taxonomyContextId` values in which both public theme keys occur. Retain relationships with a score of at least `2`, order by score descending and label ascending, and cap each list to `8`. `findTheme` must decode the supplied route segment safely and return `null` for invalid encoding or missing keys.

- [ ] **Step 7: Run theme tests**

Run: `bun run test src/utils/themes.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit if authorized**

```bash
git add src/types/themes.ts src/utils/themes.ts src/utils/themes.test.ts
git commit -m "feat(themes): add conservative theme graph"
```

### Task 2: Live Museum Theme Discovery

**Files:**
- Create: `src/services/themeDiscovery.ts`
- Create: `src/services/themeDiscovery.test.ts`

**Interfaces:**
- Consumes: `listFilters`, `listTaxonomyTerms`, `tainacanRequestInit`, `getFilterFamily`, `getTaxonomyId`, and `getTaxonomyDbIdentifier`.
- Produces: `discoverMuseumThemes(museumId: string, signal?: AbortSignal): Promise<MuseumThemeDiscovery>` and constants `THEME_TERM_PAGE_SIZE = 100`, `THEME_DISCOVERY_STALE_TIME = 5 * 60_000`.

- [ ] **Step 1: Write failing service tests with mocked generated services**

Mock `@/services/generated/filters/filters` and `@/services/generated/taxonomies/taxonomies`. Assert that the service:

- calls `listFilters({ perpage: 100, paged: 1 }, { museumId, signal })` and continues while response metadata reports more pages;
- ignores non-taxonomy filters and taxonomy filters missing either taxonomy ID or database identifier;
- requests terms with `{ perpage: 100, paged }` and the same `{ museumId, signal }`;
- maps each term to a `ThemeOccurrence` containing filter, taxonomy, museum, and original labels;
- deduplicates the same taxonomy if multiple filters point to it while retaining the lowest filter ID as the query filter;
- resolves to `{ museumId, occurrences: [] }` when no compatible filter exists;
- propagates a validation/network error so React Query can mark only that museum failed.

Use response fixtures shaped as `{ data, status: 200, headers: new Headers({ "x-wp-totalpages": "2" }) }` because `tainacanMutator` exposes pagination headers on generated responses.

- [ ] **Step 2: Run the service tests and verify they fail**

Run: `bun run test src/services/themeDiscovery.test.ts`

Expected: FAIL because `themeDiscovery.ts` does not exist.

- [ ] **Step 3: Implement paginated discovery**

Implement a private generic pagination loop that reads `response.headers.get("x-wp-totalpages")`, defaults to one page, and always passes the same `AbortSignal`. Fetch filters first, reduce compatible filter descriptors to one per taxonomy ID, then fetch all pages of terms for each descriptor.

Use exact request initialization:

```ts
const options = tainacanRequestInit(museumId);
const request = signal ? { ...options, signal } : options;
```

Do not import Axios and do not validate in this service manually; the mutator already selects `GetFiltersResponseSchema` and `GetTaxonomyTermsResponseSchema`.

- [ ] **Step 4: Run service tests**

Run: `bun run test src/services/themeDiscovery.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit if authorized**

```bash
git add src/services/themeDiscovery.ts src/services/themeDiscovery.test.ts
git commit -m "feat(themes): discover live museum taxonomies"
```

### Task 3: Progressive Catalog Hook With Bounded Concurrency

**Files:**
- Modify: `package.json`
- Modify: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/renderWithProviders.tsx`
- Create: `src/hooks/useThemeCatalog.ts`
- Create: `src/hooks/useThemeCatalog.test.tsx`

**Interfaces:**
- Consumes: `museums`, `discoverMuseumThemes`, and `buildThemeGraph`.
- Produces: `useThemeCatalog(options?: { targetKey?: string }): UseThemeCatalogResult`.

Define the result exactly:

```ts
export interface ThemeMuseumProgress {
	museumId: string;
	status: "queued" | "loading" | "success" | "error";
}

export interface UseThemeCatalogResult {
	graph: ThemeGraph;
	progress: ThemeMuseumProgress[];
	completedCount: number;
	failedCount: number;
	totalCount: number;
	isInitialLoading: boolean;
	isComplete: boolean;
	refetchFailed: () => Promise<void>;
}
```

- [ ] **Step 1: Add the component-test harness**

Run:

```bash
bun add --dev @testing-library/react @testing-library/jest-dom jsdom
```

Update `vitest.config.ts` to use `environment: "jsdom"`, `include: ["src/**/*.test.{ts,tsx}"]`, and `setupFiles: ["./src/test/setup.ts"]`. In setup, import `afterEach` from Vitest, import `cleanup` from Testing Library, import `@testing-library/jest-dom/vitest`, and register `afterEach(cleanup)`.

Create `renderWithProviders.tsx` exporting a fresh `QueryClient` with retries disabled and a wrapper using `QueryClientProvider`.

- [ ] **Step 2: Write failing progressive-hook tests**

Mock six museums and `discoverMuseumThemes` with deferred promises. Assert:

- exactly four discovery calls start initially;
- resolving one call starts exactly one queued museum;
- a rejection increments `failedCount` and starts the next queued museum;
- successful data appears in `graph` before all requests finish;
- one failed museum does not set a global error;
- `refetchFailed()` calls only failed queries;
- passing `targetKey` does not change matching rules and still supports direct-route discovery.

- [ ] **Step 3: Run hook tests and verify they fail**

Run: `bun run test src/hooks/useThemeCatalog.test.tsx`

Expected: FAIL because `useThemeCatalog` does not exist.

- [ ] **Step 4: Implement concurrency gating and incremental aggregation**

Use `useQueries` with one query per museum and an `enabled` window. Start with `activeLimit = 4`; whenever a loading query settles, increment the limit by one until it reaches `museums.length`. Use the literal query-key tuple `["museum-themes", museum.id]` and `staleTime: THEME_DISCOVERY_STALE_TIME`.

Derive graph and progress with `useMemo`; never copy successful query data into component state. Implement failed-only refetch by awaiting `Promise.all` over results whose `isError` is true.

- [ ] **Step 5: Run hook tests**

Run: `bun run test src/hooks/useThemeCatalog.test.tsx`

Expected: PASS.

- [ ] **Step 6: Run the full unit suite to detect environment regressions**

Run: `bun run test`

Expected: all existing node-oriented tests and new jsdom tests PASS.

- [ ] **Step 7: Commit if authorized**

```bash
git add package.json bun.lock vitest.config.ts src/test src/hooks/useThemeCatalog.ts src/hooks/useThemeCatalog.test.tsx
git commit -m "feat(themes): load theme catalog progressively"
```

### Task 4: Theme Item Requests and Museum-Level Query State

**Files:**
- Modify: `src/utils/tainacanFilters.ts`
- Modify: `src/utils/tainacanFilters.test.ts`
- Create: `src/services/themeItems.ts`
- Create: `src/services/themeItems.test.ts`
- Create: `src/hooks/useThemeMuseumItems.ts`
- Create: `src/hooks/useThemeMuseumItems.test.tsx`

**Interfaces:**
- Consumes: `ThemeOccurrence[]`, `listItems`, `formatItemsResponse`, and `tainacanRequestInit`.
- Produces: `buildTaxonomyOccurrenceParams(occurrence: ThemeOccurrence): Record<string, unknown>`, `fetchThemeMuseumItems(museumId: string, occurrences: ThemeOccurrence[], signal?: AbortSignal): Promise<FormattedItemsRes>`, and `useThemeMuseumItems(node: ThemeNode | null): ThemeMuseumItemsResult[]`.

Define each section result exactly:

```ts
export interface ThemeMuseumItemsResult {
	museumId: string;
	data: FormattedItemsRes | undefined;
	isPending: boolean;
	isError: boolean;
	error: Error | null;
	refetch: () => Promise<unknown>;
}
```

- [ ] **Step 1: Write the failing taxonomy-query builder test**

Assert that an occurrence with `taxonomyDbIdentifier: "tnc_tax_123"` and `termId: 45` produces:

```ts
{
	taxquery: [{ taxonomy: "tnc_tax_123", terms: [45], compare: "IN" }],
}
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `bun run test src/utils/tainacanFilters.test.ts`

Expected: FAIL because `buildTaxonomyOccurrenceParams` is missing.

- [ ] **Step 3: Implement the focused query builder**

Add the pure export without changing `buildFilterQueryParams` behavior. Accept the minimal `{ taxonomyDbIdentifier: string; termId: number }` shape so the helper remains independent of the full graph type.

- [ ] **Step 4: Write failing theme-item service tests**

Assert that `fetchThemeMuseumItems`:

- issues one `listItems` request per distinct taxonomy/term occurrence with `perpage: 8`, `paged: 1`, and the exact `taxquery`;
- passes `{ museumId, signal }` through generated service options;
- formats every response with `formatItemsResponse`;
- merges responses by item ID in occurrence order;
- caps the merged preview at eight items;
- reports `wpTotal` as the sum of occurrence totals and `wpTotalPages: 1` for the merged preview;
- rejects when every occurrence request fails, but preserves successful results when only some occurrences fail.

- [ ] **Step 5: Implement the item service and run its tests**

Run before implementation: `bun run test src/services/themeItems.test.ts`

Expected: FAIL because the service is missing.

Implement with generated `listItems` calls only, then rerun the same command and expect PASS.

- [ ] **Step 6: Write failing museum-query hook tests**

Use a node with two museums. Assert that query keys are `["theme-museum-items", node.key, museumId]`, sections retain node occurrence order, one rejection does not affect the other result, and calling one result’s `refetch` does not call the other query function.

- [ ] **Step 7: Implement and verify `useThemeMuseumItems`**

Group occurrences by museum, call `useQueries`, and map each result to `ThemeMuseumItemsResult`. Run:

```bash
bun run test src/hooks/useThemeMuseumItems.test.tsx src/services/themeItems.test.ts src/utils/tainacanFilters.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit if authorized**

```bash
git add src/utils/tainacanFilters.ts src/utils/tainacanFilters.test.ts src/services/themeItems.ts src/services/themeItems.test.ts src/hooks/useThemeMuseumItems.ts src/hooks/useThemeMuseumItems.test.tsx
git commit -m "feat(themes): query federated theme items"
```

### Task 5: Home Theme Entry Layer

**Files:**
- Create: `src/components/HomeThemesSection.tsx`
- Create: `src/components/HomeThemesSection.test.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `useThemeCatalog()` and `ThemeNode` links.
- Produces: a self-contained home section rendered before the existing museum sections.

- [ ] **Step 1: Discover Astryx APIs before writing UI**

Run:

```bash
bunx astryx build "progressive explore-by-theme section for a museum aggregator home page"
bunx astryx component Section
bunx astryx component Button
bunx astryx component Banner
bunx astryx component Skeleton
```

Record the selected primitives in the task report. Use the CLI’s actual props; if the suggested skeleton component has another name, use the discovered name consistently in tests and implementation.

- [ ] **Step 2: Write failing component tests**

Mock `useThemeCatalog` and assert these exact outcomes:

- initial loading renders `Discovering themes…` and no empty-state message;
- partial data renders `Explore by theme`, links to `/themes/${encodeURIComponent(node.key)}`, and progress text `${completedCount} of ${totalCount} museums checked`;
- a complete empty graph renders `No shared themes were found.`;
- partial failures preserve theme links and render `${failedCount} museums unavailable` plus `Retry unavailable museums`;
- total failure renders `Themes are temporarily unavailable.` and the same retry action.

- [ ] **Step 3: Run the component test and verify it fails**

Run: `bun run test src/components/HomeThemesSection.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 4: Implement the Astryx section**

Render a transparent `Section`/`VStack` composition rather than cards around dense term lists. Show at most twelve theme links on the home page. Keep partial content stable; do not hide themes while new museums arrive.

- [ ] **Step 5: Insert the section on the home page**

In `src/app/page.tsx`, render `<HomeThemesSection />` after the search block and before the conditional that renders favorite/all museums. Do not alter existing museum search semantics.

- [ ] **Step 6: Verify tests and production types**

Run:

```bash
bun run test src/components/HomeThemesSection.test.tsx
bun run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit if authorized**

```bash
git add src/components/HomeThemesSection.tsx src/components/HomeThemesSection.test.tsx src/app/page.tsx
git commit -m "feat(themes): add home theme discovery"
```

### Task 6: Stable Museum Result Sections and Related Themes

**Files:**
- Modify: `src/components/MuseumPageStates.tsx`
- Create: `src/components/ThemeMuseumSection.tsx`
- Create: `src/components/ThemeMuseumSection.test.tsx`
- Create: `src/components/RelatedThemes.tsx`

**Interfaces:**
- Consumes: `ThemeMuseumItemsResult`, `ThemeOccurrence[]`, `RelatedTheme[]`, `museums`, `Card`, `CardSkeleton`, and `ItemMasonry`.
- Produces: stable, independent museum sections and related-theme navigation.

- [ ] **Step 1: Discover exact Astryx section and progress APIs**

Run:

```bash
bunx astryx component ProgressBar
bunx astryx component Banner
bunx astryx component Section
bunx astryx component Link
```

Use only components confirmed by the CLI. If navigation uses Next.js `Link` around an Astryx primitive, follow an existing repository pattern rather than guessing props.

- [ ] **Step 2: Make the shared error banner label configurable with a failing test**

Add an optional `retryLabel?: string` prop defaulting to the current `"Tentar novamente"`, then verify `retryLabel="Retry museum"` renders English copy without changing current museum-page callers.

- [ ] **Step 3: Write failing museum-section tests**

Assert:

- pending state renders the museum title and eight skeletons;
- empty success renders `No items found for this theme.`;
- populated success renders item cards and a `View all` link to `/${museumId}?filters=${encodedFilters}`;
- error renders `This museum is temporarily unavailable.` and `Retry museum`;
- clicking retry invokes only the supplied result’s `refetch`;
- the section root remains present in every state to prevent layout reordering.

Generate the `View all` query with `URLSearchParams` and a `filters` value compatible with `FiltersStateSchema`: `{ [filterId]: [String(termId)] }`. If a museum has multiple occurrences, choose the first occurrence in deterministic taxonomy ID/term ID order for this deep link; the theme page preview remains the union of all occurrences.

- [ ] **Step 4: Implement museum sections and verify tests**

Use the existing `checkImagePath` and `Card` mapping pattern from the museum page. Run:

```bash
bun run test src/components/ThemeMuseumSection.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Implement related-theme links**

Create `RelatedThemes` with heading `Related themes`, return `null` for an empty list, render at most eight links, and include evidence text such as `Shared across ${sharedMuseumTaxonomyCount} museum taxonomies`. Link with `/themes/${encodeURIComponent(theme.key)}`.

- [ ] **Step 6: Run focused tests and typecheck**

Run:

```bash
bun run test src/components/ThemeMuseumSection.test.tsx
bun run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit if authorized**

```bash
git add src/components/MuseumPageStates.tsx src/components/ThemeMuseumSection.tsx src/components/ThemeMuseumSection.test.tsx src/components/RelatedThemes.tsx
git commit -m "feat(themes): add progressive museum sections"
```

### Task 7: Public Theme Route and Direct-Entry Recovery

**Files:**
- Create: `src/app/themes/[theme]/page.tsx`
- Create: `src/app/themes/[theme]/ThemePageClient.tsx`
- Create: `src/app/themes/[theme]/loading.tsx`
- Create: `src/app/themes/[theme]/not-found.tsx`
- Create: `src/app/themes/[theme]/ThemePageClient.test.tsx`

**Interfaces:**
- Consumes: `useThemeCatalog({ targetKey })`, `findTheme`, `getRelatedThemes`, `useThemeMuseumItems`, `ThemeMuseumSection`, and `RelatedThemes`.
- Produces: the approved `/themes/[theme]` public route with no dependency on prior home navigation.

- [ ] **Step 1: Write failing page-client tests**

Mock catalog and item hooks. Assert:

- while discovery is incomplete and the key is not yet found, the page renders `Finding this theme across museums…` and progress;
- as soon as the node exists, it renders the theme label and stable museum sections without waiting for discovery completion;
- completion without a node renders `Theme not found` and a link back to `/`;
- failed museums in discovery are summarized without hiding successful result sections;
- progress displays known, completed, and unavailable institution counts;
- related themes render after museum sections;
- an encoded key is decoded through `findTheme` and invalid percent encoding produces the not-found state without throwing.

- [ ] **Step 2: Run route tests and verify they fail**

Run: `bun run test 'src/app/themes/[theme]/ThemePageClient.test.tsx'`

Expected: FAIL because the route files do not exist.

- [ ] **Step 3: Implement the client presenter**

Keep hook order unconditional: always call `useThemeCatalog`, derive `node`, and call `useThemeMuseumItems(node)`. Do not call `notFound()` from the client. Render an English empty state only after `isComplete` is true and `node` remains null.

Render museum sections in `node.occurrences` first-seen museum order and never sort them by query completion time.

- [ ] **Step 4: Implement the route shell and metadata**

In `page.tsx`, unwrap `params: Promise<{ theme: string }>` with `await`, pass the raw segment to `ThemePageClient`, and export `generateMetadata` with title `Explore theme` when the label is not yet available server-side. Do not fetch external APIs from the server shell.

Create `loading.tsx` with `Finding themes…` and `not-found.tsx` with `Theme not found` plus a home link. The client’s completed missing-node state should match this wording even though it does not invoke the server boundary.

- [ ] **Step 5: Verify route tests, types, and build**

Run:

```bash
bun run test 'src/app/themes/[theme]/ThemePageClient.test.tsx'
bun run typecheck
bun run build
```

Expected: PASS and Next.js lists `/themes/[theme]` as a dynamic route.

- [ ] **Step 6: Commit if authorized**

```bash
git add 'src/app/themes/[theme]'
git commit -m "feat(themes): add federated theme pages"
```

### Task 8: End-to-End Verification and Documentation Sync

**Files:**
- Modify only if behavior differs from documentation: `docs/superpowers/specs/2026-07-31-live-thematic-exploration-design.md`
- Modify only if the feature needs user-facing documentation: `README.md`

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified stage-1 feature with no known spec gaps.

- [ ] **Step 1: Run the complete unit suite**

Run: `bun run test`

Expected: all existing and new tests PASS.

- [ ] **Step 2: Run the repository completion gate**

Run: `bun run check`

Expected: typecheck, Biome, Vitest, and production build all PASS.

- [ ] **Step 3: Run the optional live API smoke test when network is available**

Run: `bun run test:api`

Expected: configured live museum response schemas validate. If an external institution is unavailable, record the exact museum and error; do not weaken validation to make the smoke test pass.

- [ ] **Step 4: Manually exercise progressive behavior**

Run: `bun run dev`

Verify:

1. `/` retains museum search and shows `Explore by theme` before `All museums`.
2. Themes appear before all museum discovery requests settle.
3. Opening one theme shows fixed museum sections that fill independently.
4. Blocking one museum API in browser devtools leaves other sections usable and exposes local retry.
5. Reloading `/themes/<known-key>` in a fresh tab discovers the theme without prior home navigation.
6. `View all` opens the existing museum route with the correct taxonomy filter.
7. Related theme links remain within `/themes/*`.
8. All new copy introduced by the feature is English.

- [ ] **Step 5: Review spec coverage and update documentation only if needed**

Compare every design requirement against the implemented behavior. If implementation intentionally differs, update the spec with the approved behavior and explain the reason in the task report. Do not silently change scope.

- [ ] **Step 6: Commit verification-only documentation if authorized**

```bash
git add docs/superpowers/specs/2026-07-31-live-thematic-exploration-design.md README.md
git commit -m "docs(themes): document thematic exploration"
```

Skip this commit when neither file changed.
