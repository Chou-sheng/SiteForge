import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// @ts-expect-error jsdom does not bundle TypeScript declarations in this project.
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import { exportPageToHtml } from "../../src/lib/export/exportHtml";
import { publishStaticSite } from "../../src/lib/publish/staticSitePublisher";
import { enterpriseTemplates } from "../../src/lib/templates/enterpriseTemplates";
import { createDefaultBlock } from "../../src/modules/registry";

describe("static PageRenderer runtime", () => {
  it("renders the registered service-portal hero instead of legacy export markup", async () => {
    const runtimeDirectory = resolve("public/static-runtime");
    const [script, styles] = await Promise.all([
      readFile(resolve(runtimeDirectory, "renderer.js"), "utf8"),
      readFile(resolve(runtimeDirectory, "style.css"), "utf8"),
    ]);
    const document = structuredClone(enterpriseTemplates[0].document);
    document.blocks = [createDefaultBlock("hero", "service-portal")];
    const html = exportPageToHtml(document, {
      runtime: { script, styles },
      runtimeMode: "inline",
    });
    const dom = new JSDOM(html, {
      pretendToBeVisual: true,
      runScripts: "dangerously",
      url: "https://static-site.test/",
    });

    await new Promise<void>((resolveReady, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("static runtime did not become ready")),
        5_000,
      );
      dom.window.addEventListener("static-site-ready", () => {
        clearTimeout(timeout);
        resolveReady();
      });
    });

    const hero = dom.window.document.querySelector(
      '[data-page-block-type="hero"]',
    );
    expect(hero).not.toBeNull();
    expect(hero?.innerHTML).toContain("min-h-[520px]");
    expect(dom.window.document.querySelector(".page-section")).toBeNull();
    dom.window.close();
  });

  it("boots a real published folder directly from its index.html", async () => {
    const root = await mkdtemp(join(tmpdir(), "shared-renderer-site-"));
    const document = structuredClone(enterpriseTemplates[0].document);
    const result = await publishStaticSite({
      document,
      parentDirectory: root,
      publicDirectory: resolve("public"),
    });
    const dom = await JSDOM.fromFile(result.indexFile, {
      pretendToBeVisual: true,
      resources: "usable",
      runScripts: "dangerously",
    });

    await new Promise<void>((resolveReady, reject) => {
      const deadline = Date.now() + 5_000;
      const poll = () => {
        if (dom.window.document.documentElement.dataset.staticSiteReady === "true") {
          resolveReady();
        } else if (Date.now() >= deadline) {
          reject(new Error("published folder runtime did not become ready"));
        } else {
          setTimeout(poll, 20);
        }
      };
      poll();
    });

    expect(
      dom.window.document.querySelectorAll("[data-page-block-type]").length,
    ).toBe(document.blocks.length);
    expect(
      dom.window.document.querySelector('[data-page-block-type="immersiveHero"]'),
    ).not.toBeNull();
    dom.window.close();
    await rm(root, { recursive: true, force: true });
  });
});
