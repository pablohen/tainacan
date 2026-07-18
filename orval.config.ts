import { defineConfig } from "orval";

export default defineConfig({
	tainacan: {
		input: {
			target: "./vendor/tainacan-openapi.patched.json",
			unsafeDisableValidation: true,
			filters: {
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
			},
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
});
