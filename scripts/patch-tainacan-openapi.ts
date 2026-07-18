import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

interface OpenApiSpec {
	components: { schemas: Record<string, Record<string, unknown>> };
	[key: string]: unknown;
}

interface Overrides {
	replaceSchemas?: Record<string, Record<string, unknown>>;
	mergeSchemas?: Record<string, { properties: Record<string, unknown> }>;
	patchProperties?: Record<string, Record<string, Record<string, unknown>>>;
}

interface OpenApiPathItem {
	get?: Record<string, unknown>;
}

interface ApiPathsConfig {
	paths: Record<string, OpenApiPathItem>;
}

function loadJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

function mergeSchemaProperties(
	target: Record<string, unknown>,
	properties: Record<string, unknown>,
): void {
	const existing = (target.properties as Record<string, unknown>) ?? {};
	target.properties = { ...existing, ...properties };
}

export function patchTainacanOpenApi(
	inputPath: string,
	overridesPath: string,
	apiPathsPath: string,
	outputPath: string,
	options?: { includePaths?: boolean },
): void {
	const spec = loadJson<OpenApiSpec>(inputPath);
	const overrides = loadJson<Overrides>(overridesPath);
	const apiPaths = loadJson<ApiPathsConfig>(apiPathsPath);

	for (const [name, schema] of Object.entries(overrides.replaceSchemas ?? {})) {
		spec.components.schemas[name] = schema;
	}

	for (const [name, patch] of Object.entries(overrides.mergeSchemas ?? {})) {
		const existing = spec.components.schemas[name];
		if (!existing) {
			throw new Error(`Cannot merge into missing schema: ${name}`);
		}
		mergeSchemaProperties(existing, patch.properties);
	}

	for (const [schemaName, properties] of Object.entries(
		overrides.patchProperties ?? {},
	)) {
		const schema = spec.components.schemas[schemaName];
		if (!schema) {
			throw new Error(
				`Cannot patch properties on missing schema: ${schemaName}`,
			);
		}
		const existingProps = (schema.properties as Record<string, unknown>) ?? {};
		for (const [propName, propSchema] of Object.entries(properties)) {
			existingProps[propName] = propSchema;
		}
		schema.properties = existingProps;
	}

	// Curated paths only — upstream full spec has malformed parameters on unused routes.
	spec.paths = options?.includePaths === false ? {} : apiPaths.paths;

	writeFileSync(outputPath, `${JSON.stringify(spec, null, 2)}\n`, "utf8");
}

if (import.meta.main) {
	const inputPath = join(root, "vendor/tainacan-openapi.json");
	const overridesPath = join(root, "scripts/tainacan-schema-overrides.json");
	const apiPathsPath = join(root, "scripts/tainacan-api-paths.json");
	const outputPath = join(root, "vendor/tainacan-openapi.patched.json");

	patchTainacanOpenApi(inputPath, overridesPath, apiPathsPath, outputPath);
	console.log(`Patched OpenAPI written to ${outputPath}`);
}
