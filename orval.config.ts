import { defineConfig } from "orval";

const patchedApiSpec = "./vendor/tainacan-openapi.patched.json";
const patchedSchemaSpec = "./vendor/tainacan-openapi.schemas.json";

const schemaFilter = {
	schemas: [
		"item",
		"items",
		"item_embedded_metadata",
		"collection",
		"collections",
		"filter",
		"filters",
		"filter_metadatum",
		"taxonomy",
		"taxonomies",
		"term",
		"terms",
		"metadatum",
	],
};

export default defineConfig({
	tainacanSchemas: {
		input: {
			target: patchedSchemaSpec,
			unsafeDisableValidation: true,
			filters: schemaFilter,
		},
		output: {
			client: "zod",
			mode: "single",
			target: "./src/schemas/generated/tainacan.zod.ts",
			override: {
				zod: {
					version: 4,
				},
			},
		},
	},
	tainacanApi: {
		input: {
			target: patchedApiSpec,
			unsafeDisableValidation: true,
			filters: {
				tags: ["items", "collections", "filters", "taxonomies"],
			},
		},
		output: {
			client: "react-query",
			mode: "tags-split",
			target: "./src/services/generated",
			schemas: false,
			override: {
				mutator: {
					path: "./src/services/tainacanMutator.ts",
					name: "tainacanMutator",
				},
				query: {
					useQuery: true,
					options: {
						staleTime: 30_000,
					},
				},
			},
		},
	},
});
