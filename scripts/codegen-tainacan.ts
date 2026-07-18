import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { patchTainacanOpenApi } from "./patch-tainacan-openapi";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const inputPath = join(root, "vendor/tainacan-openapi.json");
const overridesPath = join(root, "scripts/tainacan-schema-overrides.json");
const apiPathsPath = join(root, "scripts/tainacan-api-paths.json");
const patchedApiPath = join(root, "vendor/tainacan-openapi.patched.json");
const patchedSchemasPath = join(root, "vendor/tainacan-openapi.schemas.json");
const generatedSchemaPath = join(root, "src/schemas/generated/tainacan.zod.ts");

patchTainacanOpenApi(inputPath, overridesPath, apiPathsPath, patchedApiPath, {
	includePaths: true,
});
patchTainacanOpenApi(
	inputPath,
	overridesPath,
	apiPathsPath,
	patchedSchemasPath,
	{ includePaths: false },
);

const orval = spawnSync(
	"bunx",
	["orval", "--config", join(root, "orval.config.ts")],
	{ cwd: root, stdio: "inherit" },
);

if (orval.status !== 0) {
	process.exit(orval.status ?? 1);
}

// Orval emits bare zod.array() for OpenAPI arrays without items — invalid in Zod 4.
const generated = readFileSync(generatedSchemaPath, "utf8");
writeFileSync(
	generatedSchemaPath,
	generated.replaceAll("zod.array()", "zod.array(zod.unknown())"),
	"utf8",
);

console.log("Tainacan schema and API codegen complete.");
