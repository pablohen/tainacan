# Live Federated Thematic Exploration

**Date:** July 31, 2026  
**Status:** Approved

## Objective

Help curious visitors discover and explore collections when they do not arrive looking for a particular institution or object. The experience should support navigation through themes shared across museums without introducing a backend, a proprietary index, or cultural associations that are difficult to justify.

## Scope

The product evolves in three stages:

1. **Automatic relationships:** a global theme catalog, federated results, and related themes.
2. **Editorial journeys:** curated sequences of themes and items with a beginning, middle, and end.
3. **Dynamic journeys:** next steps adapted to visitor choices, with preferences stored only in the browser.

The first implementation must focus entirely on stage 1. Stages 2 and 3 are future directions and require separate specifications before implementation.

## Principles

- Data remains in each institution’s Tainacan REST API.
- Taxonomies and terms are fetched live rather than generated at build time.
- The interface delivers results progressively without waiting for every institution.
- A partial failure never blocks available results.
- Automatic associations must be conservative, traceable, and explainable.
- All new user-facing labels and messages for this feature must be written in English.

## Architecture

### Taxonomy Discovery

A query layer uses the existing Orval services, `tainacanMutator`, and React Query to discover taxonomy filters and their terms for each museum. Every operation receives `museumId` through `request`, and domain Zod schemas validate its responses.

Queries are independent per museum and paginated. The queue limits concurrency to protect the browser and external APIs. Navigating to another route cancels irrelevant work when the transport supports cancellation.

### Theme Normalization

Each term label produces a comparable technical key. Normalization:

- converts text to lowercase;
- removes diacritics;
- normalizes whitespace;
- ignores lexically insignificant punctuation at the edges.

Normalization does not perform stemming, translation, semantic classification, or similarity-based merging. Therefore, `Sacred Art` and `sacred art` may share a key, while `sacred art` and `religious imagery` remain separate themes.

The original label is never discarded. Presentation uses a stable original form, and the interface preserves the provenance of every occurrence.

### Theme Graph

The in-memory graph contains:

- the normalized theme key;
- the display label;
- term occurrences by museum;
- museum, taxonomy, and term IDs plus original labels for every occurrence;
- relationships with other themes based on co-occurrence in the same taxonomy or items when that information is available without disproportionate requests.

A theme enters the global catalog when it appears in at least two institutions that responded successfully. Catalog counts and status make it clear when discovery is still in progress. A displayed theme does not disappear during the same session because another institution failed.

### Federated Query

When a visitor opens a theme, the app queries only museums with a known occurrence. Each request uses that institution’s real filter and term IDs. Responses populate independent museum sections as they arrive.

React Query caches one bounded first-page preview by normalized theme key and museum. The preview service encapsulates that museum's deterministic taxonomy and term occurrences, uses a fixed page and page size, and merges their results. Freshness settings prevent excessive refetching during a session without promising an immediate update after a response has already been cached.

## Experience

### Home Page

The home page retains the existing hero, search, and museum grid. An **Explore by theme** section appears before **All museums**.

It presents themes discovered in more than one institution and communicates query progress. Themes are ordered by:

1. number of associated institutions;
2. number of available occurrences;
3. label in English alphabetical order.

Required states:

- initial catalog loading;
- a partial catalog while other institutions respond;
- no shared themes among available responses;
- partial failures with available results preserved;
- total unavailability with a retry action.

### Theme Page

The proposed route is `/themes/[theme]`, where the segment represents a URL-encoded normalized key. This is a new public route; its introduction requires explicit confirmation before implementation under the repository rules.

The page contains:

- a title and a brief explanation of the automatic grouping;
- federated query progress;
- the number of known, completed, and unavailable institutions;
- one stable section per museum;
- a bounded first-page item preview of up to eight items in each section;
- a **View all** action that opens the museum experience while retaining the theme filter;
- a retry action limited to the museum that failed;
- related themes when conservative relationships are available.

Sections do not change position as responses arrive. Each section displays its own loading, successful-empty, successful-with-items, or error state. This avoids reorganizing the entire grid during progressive loading.

### Related Themes

In the first stage, relationships are derived only from structured evidence in the metadata. The interface does not claim equivalence; it presents results as themes that also occur in the same taxonomic context or on the same items.

Relationships without sufficient evidence are not displayed. This stage does not use embeddings, a language model, or an external semantic service.

### Future Evolution

Editorial journeys may connect manually selected themes and items in narrative sequences. Dynamic journeys may adapt suggestions to choices made during exploration and persist interests in `localStorage`, following the isolation and hydration patterns used by `FavoritesContext`.

These future experiences do not change the initial graph model and are outside this specification’s implementation plan.

## Data Flow

1. The home page starts discovery requests with limited concurrency.
2. Each response is validated and converted into theme occurrences.
3. The aggregator incrementally updates the in-memory graph.
4. Themes that occur in two institutions enter the catalog.
5. Selecting a theme opens its route and reads known occurrences from the cache.
6. The page starts one item request per associated institution.
7. Each section renders when its own request completes.
8. Conservative relationships provide suggestions for the next theme.

If a visitor opens a theme page directly without home-page cache, the page performs the necessary discovery before querying items. The page explains this loading state instead of depending on previous navigation state.

## Failures and Operational Limits

- Museums without compatible taxonomy filters are ignored and do not count as failures.
- Invalid responses fail Zod validation and appear as institution-level unavailability.
- Timeouts, network failures, and HTTP errors are isolated by museum.
- Manual retry does not invalidate successful requests from other institutions.
- Term pagination and fixed-size item previews prevent unbounded data loading.
- Discovery concurrency, term page size, item preview size, and related-theme limits are tested constants set to 4, 100, 8, and 8 respectively.
- The app does not promise an exhaustive catalog while institutions are loading or unavailable.
- Visible provenance reduces but does not eliminate the risk of homonyms with different meanings.

## Components and Responsibilities

- **Theme discovery query:** coordinates progressive discovery and exposes state by museum.
- **Normalizer:** a pure function that creates conservative theme keys.
- **Graph builder:** a pure function that aggregates occurrences and relationships.
- **Home theme section:** presents the partial catalog and global states.
- **Theme page:** coordinates item requests and federated progress.
- **Museum results section:** presents one independent state and supports local retry.
- **Related themes:** presents explainable relationships and links between themes.

Each unit depends on explicit types and interfaces so data transformation can be tested without rendering components or accessing the network.

## Tests

### Unit Tests

- case, diacritic, whitespace, and punctuation normalization;
- preservation of original labels and IDs;
- aggregation of equivalent occurrences;
- separation of labels that are only semantically similar;
- duplicate removal;
- the minimum two-institution rule;
- stable catalog ordering;
- relationship construction from co-occurrence.

### Components and Hooks

- initial, partial, empty, and completely unavailable catalog states;
- progressive museum arrival in different orders;
- independently loading, empty, populated, and failed museum sections;
- retrying one institution without refetching the others;
- opening the route directly without prior cache;
- **View all** navigation preserving the correct filter.

### Integration

Simulated APIs must cover fast, slow, paginated, empty, invalid, and unavailable responses. The real-API smoke test remains optional and network-dependent.

Before the implementation is considered complete, the repository must pass `bun run check`.

## Success Criteria

- Visitors find themes across institutions without knowing institution names in advance.
- Useful results appear before every API finishes.
- One unavailable API does not block exploration of the others.
- Every thematic association reveals its institution and taxonomy provenance.
- Directly reloading a theme page works without prior navigation.
- No backend, persistent index, or external semantic service is introduced.
- All new UI copy introduced by this feature is in English.

## Out of Scope for the First Implementation

- semantic equivalence or automatic translation of terms;
- manual alias curation;
- personalized ranking;
- user accounts or cross-device synchronization;
- editorial journeys;
- dynamic journeys;
- a server-side or build-time index;
- changes to existing museum and item routes.
