import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const projectRoot = process.cwd();
const buildRoot = join(projectRoot, "desktop-build");
const appTarget = join(buildRoot, "app");
const serverTarget = join(buildRoot, "server");
const desktopSource = join(projectRoot, "desktop", "dist");
const standaloneSource = join(projectRoot, ".next", "standalone");
const staticSource = join(projectRoot, ".next", "static");
const publicSource = join(projectRoot, "public");

async function assertNoPrivateEnvFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      await assertNoPrivateEnvFiles(entryPath);
      continue;
    }

    if (entry.name === ".env.local") {
      throw new Error(`Private environment file copied into desktop build: ${relative(projectRoot, entryPath)}`);
    }
  }
}

async function pruneUnusedSharpPlatforms(nodeModulesDirectory) {
  const imagePackagesDirectory = join(nodeModulesDirectory, "@img");
  const entries = await readdir(imagePackagesDirectory, { withFileTypes: true });
  const requiredPackages = new Set(["colour", "sharp-win32-x64"]);

  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && !requiredPackages.has(entry.name))
      .map((entry) =>
        rm(join(imagePackagesDirectory, entry.name), {
          recursive: true,
          force: true,
        }),
      ),
  );
}

await rm(buildRoot, { recursive: true, force: true });
await mkdir(appTarget, { recursive: true });
await mkdir(serverTarget, { recursive: true });
await cp(desktopSource, join(appTarget, "desktop", "dist"), { recursive: true });

const rootPackage = JSON.parse(await readFile(join(projectRoot, "package.json"), "utf8"));
const desktopPackage = {
  name: rootPackage.name,
  version: rootPackage.version,
  productName: rootPackage.build.productName,
  description: rootPackage.description,
  author: rootPackage.author,
  private: true,
  packageManager: "npm@11.8.0",
  main: "desktop/dist/main.js",
  build: {
    appId: rootPackage.build.appId,
    productName: rootPackage.build.productName,
    executableName: rootPackage.build.executableName,
    electronVersion: rootPackage.devDependencies.electron.replace(/^[^\d]*/, ""),
    asar: true,
    npmRebuild: false,
    directories: {
      output: "../../release",
    },
    files: ["desktop/dist/**/*", "package.json"],
    extraResources: [
      {
        from: "../server",
        to: "server",
        filter: ["**/*", "!node_modules{,/**/*}"],
      },
      {
        from: "../server/node_modules",
        to: "server/node_modules",
        filter: ["**/*"],
      },
    ],
    extraFiles: [
      { from: "../../README.md", to: "README.md" },
      { from: "../../config.example.env", to: "config.example.env" },
      { from: "../../VERSION.txt", to: "VERSION.txt" },
      { from: "../../THIRD_PARTY_NOTICES.txt", to: "THIRD_PARTY_NOTICES.txt" },
    ],
  },
};
await writeFile(
  join(appTarget, "package.json"),
  `${JSON.stringify(desktopPackage, null, 2)}\n`,
  "utf8",
);

await cp(standaloneSource, serverTarget, { recursive: true });
await cp(staticSource, join(serverTarget, ".next", "static"), { recursive: true });
await cp(publicSource, join(serverTarget, "public"), { recursive: true });
await pruneUnusedSharpPlatforms(join(serverTarget, "node_modules"));
await assertNoPrivateEnvFiles(buildRoot);

console.log(
  `Desktop app and server prepared at ${relative(projectRoot, appTarget)} and ${relative(projectRoot, serverTarget)}`,
);
