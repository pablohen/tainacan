import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TAINACAN_OPENAPI_GIT_REF } from "./tainacan-openapi-ref";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outputPath = join(root, "vendor/tainacan-openapi.json");
const url = `https://raw.githubusercontent.com/tainacan/tainacan/${TAINACAN_OPENAPI_GIT_REF}/docs/openapi.json`;

mkdirSync(dirname(outputPath), { recursive: true });

const result = spawnSync("curl", ["-fsSL", url, "-o", outputPath], {
	stdio: "inherit",
});

if (result.status !== 0) {
	console.error(`Failed to fetch OpenAPI from ${url}`);
	process.exit(result.status ?? 1);
}

writeFileSync(
	join(root, "vendor/tainacan-openapi.ref"),
	`${TAINACAN_OPENAPI_GIT_REF}\n`,
	"utf8",
);

console.log(
	`Fetched OpenAPI (${TAINACAN_OPENAPI_GIT_REF}) → vendor/tainacan-openapi.json`,
);
