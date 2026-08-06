# Tainacan

Projeto pessoal para agregar conteúdo de diversos sites que estão usando a ferramenta Tainacan, disponível para WordPress.
[https://tainacan.vercel.app](https://tainacan.vercel.app).

## Desenvolvimento

Package manager: **Bun**. O CLI do Next.js (`dev` / `build` / `start`) roda sob o Bun via `bun --bun`.

```bash
bun install
bun run dev
bun run build
bun run start
bun run check        # typecheck + lint + test + build
bun run typecheck
bun run lint
bun run test         # testes unitários (Vitest)
bun run test:api     # smoke contra APIs reais de museus (rede)
bun run astryx --help
```

Após `bun install`, o Lefthook instala um hook de pre-commit que roda `biome check --staged`.

## Arquitetura

Agregador sem backend próprio: dados vêm das APIs REST Tainacan de cada museu. Detalhes para agentes e convenções do repositório em [AGENTS.md](AGENTS.md).

```
src/app/           Rotas (App Router)
src/components/    UI (AppChrome + componentes de domínio)
src/contexts/      Estado cliente (ex.: favoritos em localStorage)
src/services/      Hooks Orval + tainacanMutator (museumId na request)
src/schemas/       Schemas Zod (fonte de verdade das respostas da API)
src/types/         Tipos de domínio inferidos dos schemas
src/utils/         Registro de museus, helpers de imagem
```

- **Museus:** cadastrar apenas em `src/utils/museums.ts` (sem config por env).
- **Fetch:** hooks gerados em `src/services/generated/` com `request: { museumId }`.
- **Validação:** Zod em `src/schemas/tainacan.ts` via mutator.

## Codegen da API Tainacan

OpenAPI upstream é baixado, corrigido com overrides e gerado via Orval (Zod + React Query):

```bash
bun run codegen:tainacan        # regenera a partir do vendor/ local
bun run codegen:tainacan:sync   # fetch upstream + codegen
```

Arquivos gerados: `src/schemas/generated/`, `src/services/generated/`. Não editar à mão.

## Front-end

- TypeScript 7
- React 19
- Next.js 16
- Astryx 0.3 (`@astryxdesign/core` + `theme-neutral`)
- TanStack Query (React Query)
- Axios
- Zod 4
- nuqs
- Vitest (unit tests)
- Biome (lint/format)

Após atualizar `@astryxdesign/core`, rode `bun run astryx upgrade --from <versão-anterior> --apply` (o CLI 0.3+ exige `--from`). Descubra componentes com `bun run astryx component <Name>`.
