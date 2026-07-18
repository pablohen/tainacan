# Tainacan API Types Codegen Design

Date: 2026-07-18  
Status: Implemented

## Goal

Replace hand-written Zod schemas with comprehensive types generated from Tainacan's official OpenAPI spec, supplemented by curated overrides for fields the spec omits or mis-models.

## Decisions

| Topic | Choice |
| --- | --- |
| Codegen tool | [Orval](https://orval.dev/docs/guides/zod) (`client: 'zod'`, `version: 4`) |
| Upstream source | Vendored `tainacan/tainacan` `docs/openapi.json` (develop) |
| Gaps in OpenAPI | `scripts/tainacan-schema-overrides.json` + `scripts/patch-tainacan-openapi.ts` |
| Paths in spec | Stripped before codegen (upstream path params are malformed; we only need component schemas) |
| Orval validation | `unsafeDisableValidation: true` (upstream spec fails strict validation) |
| Schema filter | Orval `filters.schemas` limited to entities the app uses |
| Post-process | Replace bare `zod.array()` with `zod.array(zod.unknown())` (Zod 4) |
| Facade | `src/schemas/tainacan.ts` re-exports stable names + `.required()` on identity fields |
| Types | `z.output<>` from facade schemas; `ItemEmbeddedMetadatum` alias added |
| Client URL state | Unchanged hand-written schemas in `src/utils/tainacanFilters.ts` |

## Pipeline

```
vendor/tainacan-openapi.json
  → patch (overrides + patchProperties + $ref array wrappers)
  → vendor/tainacan-openapi.patched.json
  → orval
  → src/schemas/generated/tainacan.zod.ts
  → src/schemas/tainacan.ts (facade)
  → src/types/tainacan.ts
```

## Commands

```bash
bun run codegen:tainacan:fetch   # refresh upstream OpenAPI
bun run codegen:tainacan         # patch + orval + post-process
bun run codegen:tainacan:sync    # fetch + codegen
bun scripts/smoke-test-schemas.ts  # validate against live museums
```

## Override categories

1. **replaceSchemas** — `item`, `items`, `item_embedded_metadata`, `filter_metadatum`, array wrappers (`filters`, `collections`, …)
2. **mergeSchemas** — computed fields on `filter`, `collection`, `term`
3. **patchProperties** — live-API relaxations (`order` null, `collections_ids` array, term `user` string, …)

## Two metadata concepts

| Type | Meaning |
| --- | --- |
| `Metadatum` | Field definition (`/metadata`) |
| `ItemEmbeddedMetadatum` | Runtime values on `item.metadata[slug]` |

`TainacanMetadatum` is kept as a deprecated alias for `ItemEmbeddedMetadatum`.

## Out of scope

- HTTP client / React Query codegen
- Write/mutation endpoints
- Upstreaming OpenAPI fixes to tainacan/tainacan
