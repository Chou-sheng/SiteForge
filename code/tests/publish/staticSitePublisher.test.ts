import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { enterpriseTemplates } from "../../src/lib/templates/enterpriseTemplates";
import {
  createSafeSiteDirectoryName,
  publishStaticSite,
} from "../../src/lib/publish/staticSitePublisher";
import { createDefaultBlock } from "../../src/modules/registry";

async function writeRuntime(publicDirectory: string) {
  const runtimeDirectory = join(publicDirectory, "static-runtime");
  await mkdir(runtimeDirectory, { recursive: true });
  await writeFile(join(runtimeDirectory, "renderer.js"), "window.RUNTIME=true", "utf8");
  await writeFile(join(runtimeDirectory, "style.css"), "body{margin:0}", "utf8");
}

function createImageDocument(source: string) {
  const document = structuredClone(enterpriseTemplates[0].document);
  const hero = createDefaultBlock("hero", "split-layout");
  hero.props = {
    ...hero.props,
    image: { src: source, alt: "测试图片" },
  };
  document.title = "AI 产品官网";
  document.slug = undefined;
  document.blocks = [hero];
  return document;
}

describe("static site publisher", () => {
  it("creates readable Windows-safe directory names", () => {
    expect(createSafeSiteDirectoryName("AI 产品官网", "page-1")).toBe(
      "ai-chan-pin-guan-wang",
    );
    expect(createSafeSiteDirectoryName("CON", "page-1")).toBe("page-1");
    expect(createSafeSiteDirectoryName("  Demo /// Site  ", "page-1")).toBe(
      "demo-site",
    );
  });

  it("publishes the shared renderer, Tailwind CSS, and localized public images", async () => {
    const root = await mkdtemp(join(tmpdir(), "publish-local-"));
    const publicDirectory = join(root, "public");
    const parentDirectory = join(root, "published");
    await mkdir(join(publicDirectory, "template-assets"), { recursive: true });
    await writeRuntime(publicDirectory);
    await writeFile(
      join(publicDirectory, "template-assets", "hero.jpg"),
      Buffer.from("local-image"),
    );

    const result = await publishStaticSite({
      document: createImageDocument("/template-assets/hero.jpg"),
      parentDirectory,
      publicDirectory,
    });
    const html = await readFile(result.indexFile, "utf8");
    const assets = await readdir(join(result.outputDirectory, "assets"));

    expect(html).toContain('href="./assets/style.css"');
    expect(html).toContain('src="./assets/renderer.js"');
    expect(html).not.toContain("/template-assets/hero.jpg");
    expect(html).toContain("./assets/");
    expect(assets).toContain("style.css");
    expect(assets).toContain("renderer.js");
    expect(assets).toHaveLength(3);
    expect(result.assetCount).toBe(1);
    expect(
      (await readdir(parentDirectory)).some((name) => name.includes(".tmp-")),
    ).toBe(false);
  });

  it("downloads each remote image once and rewrites repeated document references", async () => {
    const root = await mkdtemp(join(tmpdir(), "publish-remote-"));
    const publicDirectory = join(root, "public");
    await writeRuntime(publicDirectory);
    let requests = 0;
    const remoteUrl = "https://images.example.com/hero.jpg";
    const fetchImpl = (async () => {
      requests += 1;
      return new Response(Buffer.from("remote-image"), {
        status: 200,
        headers: { "content-type": "image/jpeg" },
      });
    }) as typeof fetch;
    const document = createImageDocument(remoteUrl);
    const hero = document.blocks[0];
    hero.props = {
      ...hero.props,
      secondaryImage: { src: remoteUrl, alt: "重复图片" },
    };

    const result = await publishStaticSite({
      document,
      parentDirectory: join(root, "published"),
      publicDirectory,
      fetchImpl,
    });

    expect(requests).toBe(1);
    expect(result.assetCount).toBe(1);
    expect(await readdir(join(result.outputDirectory, "assets"))).toHaveLength(3);
    expect(await readFile(result.indexFile, "utf8")).not.toContain(remoteUrl);
  });

  it("keeps the last successful site when a new publish fails", async () => {
    const root = await mkdtemp(join(tmpdir(), "publish-rollback-"));
    const publicDirectory = join(root, "public");
    const parentDirectory = join(root, "published");
    const outputDirectory = join(parentDirectory, "rollback-demo");
    await writeRuntime(publicDirectory);
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(join(outputDirectory, "index.html"), "old-site", "utf8");

    await expect(
      publishStaticSite({
        document: {
          ...createImageDocument("https://images.example.com/fail.jpg"),
          title: "Rollback Demo",
        },
        parentDirectory,
        publicDirectory,
        fetchImpl: (async () => {
          throw new Error("network down");
        }) as typeof fetch,
      }),
    ).rejects.toThrow();

    expect(await readFile(join(outputDirectory, "index.html"), "utf8")).toBe(
      "old-site",
    );
    expect(
      (await readdir(parentDirectory)).some(
        (name) => name.includes(".tmp-") || name.includes(".backup-"),
      ),
    ).toBe(false);
  });
});
