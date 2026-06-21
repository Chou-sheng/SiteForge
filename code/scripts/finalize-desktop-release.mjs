import { rm, rename } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(scriptsDirectory);
const releaseRoot = join(projectRoot, "release");
const builderOutputDirectory = join(releaseRoot, "win-unpacked");
const finalReleaseDirectory = join(releaseRoot, "SiteForge");
const builderDebugFile = join(releaseRoot, "builder-debug.yml");

await rm(finalReleaseDirectory, { recursive: true, force: true });
await rename(builderOutputDirectory, finalReleaseDirectory);
await rm(builderDebugFile, { force: true });

console.log(`Desktop folder distribution prepared at ${finalReleaseDirectory}`);
