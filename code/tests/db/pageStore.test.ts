import { mkdir, mkdtemp, readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import {
  createBlankPage,
  createPage,
  deletePage,
  duplicatePage,
  getPageById,
  listPages,
  publishPage,
  renamePage,
  setPageStoreFilePathForTests,
  updatePage,
} from "../../src/lib/db/pageStore";
import type { EnterprisePageDocument } from "../../src/types/page";

const timestamp = "2026-06-15T09:00:00.000Z";

function createDocument(overrides: Partial<EnterprisePageDocument> = {}): EnterprisePageDocument {
  return {
    id: "page-demo",
    title: "AI 教育平台企业官网",
    description: "面向教育机构的智能招生与服务平台",
    version: 1,
    siteMeta: {
      companyName: "智学科技",
      industry: "教育科技",
      targetAudience: "教育机构管理者",
      pageGoal: "lead-generation",
      seoTitle: "AI 教育平台企业官网",
      seoDescription: "面向教育机构的智能招生与服务平台",
      keywords: ["AI", "教育", "企业官网"],
    },
    theme: {
      colorTokens: {
        primary: "#165DFF",
        primaryHover: "#0E42D2",
        secondary: "#14C9C9",
        accent: "#F7BA1E",
        background: "#FFFFFF",
        surface: "#FFFFFF",
        muted: "#F2F3F5",
        textPrimary: "#1D2129",
        textSecondary: "#4E5969",
        border: "#E5E6EB",
      },
      typography: {
        fontFamily: "Noto Sans SC",
        headingWeight: 700,
        bodyWeight: 400,
        h1Size: "48px",
        h2Size: "40px",
        h3Size: "28px",
        bodySize: "16px",
      },
      radius: {
        sm: "4px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      shadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.08)",
        elevated: "0 8px 24px rgba(0, 0, 0, 0.12)",
        floating: "0 16px 48px rgba(0, 0, 0, 0.16)",
      },
      spacing: {
        sectionY: "96px",
        containerX: "24px",
        blockGap: "32px",
      },
    },
    layout: {
      maxWidth: "1200px",
      contentDensity: "comfortable",
      responsiveMode: "enterprise",
    },
    blocks: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

describe("pageStore", () => {
  let tempDir: string;
  let storePath: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "page-store-"));
    storePath = join(tempDir, "pages.json");
    setPageStoreFilePathForTests(storePath);
  });

  afterEach(async () => {
    setPageStoreFilePathForTests(null);
    await rm(tempDir, { force: true, recursive: true });
  });

  test("creates, lists, and retrieves draft pages from an isolated JSON file", async () => {
    const document = createDocument();

    const created = await createPage(document);

    expect(created).toMatchObject({
      id: document.id,
      status: "DRAFT",
      document,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
    expect(created.publishedAt).toBeUndefined();
    await expect(listPages()).resolves.toEqual([created]);
    await expect(getPageById(document.id)).resolves.toEqual(created);
    await expect(getPageById("missing")).resolves.toBeNull();
  });

  test("uses the desktop app data directory when no test file override is set", async () => {
    const previousDataDirectory = process.env.DESKTOP_APP_DATA_DIR;
    setPageStoreFilePathForTests(null);
    process.env.DESKTOP_APP_DATA_DIR = tempDir;

    try {
      await createPage(createDocument({ id: "desktop-page" }));
      const desktopStore = JSON.parse(
        await readFile(join(tempDir, "data", "pages.json"), "utf8"),
      ) as Array<{ id: string }>;

      expect(desktopStore).toHaveLength(1);
      expect(desktopStore[0].id).toBe("desktop-page");
    } finally {
      if (previousDataDirectory === undefined) {
        delete process.env.DESKTOP_APP_DATA_DIR;
      } else {
        process.env.DESKTOP_APP_DATA_DIR = previousDataDirectory;
      }
    }
  });

  test("creates a blank draft page for direct editing", async () => {
    const created = await createBlankPage();

    expect(created.id).toBe(created.document.id);
    expect(created.status).toBe("DRAFT");
    expect(created.document.title).toBe("未命名页面");
    expect(created.document.description).toBe("从空白画布开始编辑。");
    expect(created.document.blocks).toEqual([]);
    expect(created.document.slug).toBeUndefined();
    expect(created.createdAt).toBe(created.document.createdAt);
    expect(created.updatedAt).toBe(created.document.updatedAt);
    expect(new Date(created.createdAt).getTime()).not.toBeNaN();
    await expect(listPages()).resolves.toEqual([created]);
  });

  test("rejects duplicate page ids when creating pages", async () => {
    await createPage(createDocument());

    await expect(createPage(createDocument())).rejects.toThrow("页面已存在");
    await expect(listPages()).resolves.toHaveLength(1);
  });

  test("updates a page while keeping the record id aligned with the document id", async () => {
    await createPage(createDocument());
    const updatedDocument = createDocument({
      title: "企业服务平台",
      updatedAt: "2026-06-15T10:00:00.000Z",
    });

    const updated = await updatePage("page-demo", updatedDocument);

    expect(updated.id).toBe(updatedDocument.id);
    expect(updated.document.title).toBe("企业服务平台");
    expect(updated.updatedAt).toBe(updatedDocument.updatedAt);
    await expect(getPageById("page-demo")).resolves.toEqual(updated);
  });

  test("renames a page title without changing its id or created timestamp", async () => {
    const original = await createPage(createDocument());

    const renamed = await renamePage("page-demo", "  企业服务新名称  ");

    expect(renamed.id).toBe(original.id);
    expect(renamed.createdAt).toBe(original.createdAt);
    expect(renamed.document.id).toBe(original.document.id);
    expect(renamed.document.title).toBe("企业服务新名称");
    expect(renamed.document.siteMeta.seoTitle).toBe("企业服务新名称");
    expect(renamed.document.updatedAt).toBe(renamed.updatedAt);
    expect(new Date(renamed.updatedAt).getTime()).not.toBeNaN();
    await expect(getPageById("page-demo")).resolves.toEqual(renamed);
  });

  test("rejects blank page titles when renaming", async () => {
    const original = await createPage(createDocument());

    await expect(renamePage("page-demo", "   ")).rejects.toThrow("页面名称不能为空");
    await expect(getPageById("page-demo")).resolves.toEqual(original);
  });

  test("rejects update documents with mismatched ids and keeps the original page id", async () => {
    const original = await createPage(createDocument());
    const mismatchedDocument = createDocument({
      id: "page-other",
      title: "错误页面",
      updatedAt: "2026-06-15T10:00:00.000Z",
    });

    await expect(updatePage("page-demo", mismatchedDocument)).rejects.toThrow("页面 ID 不一致");
    await expect(getPageById("page-demo")).resolves.toEqual(original);
    await expect(getPageById("page-other")).resolves.toBeNull();
  });

  test("deletes an existing page and returns null for later lookups", async () => {
    await createPage(createDocument());

    await deletePage("page-demo");

    await expect(listPages()).resolves.toEqual([]);
    await expect(getPageById("page-demo")).resolves.toBeNull();
  });

  test("duplicates a page as a new draft copy without slug or published timestamp", async () => {
    await createPage(createDocument({ slug: "ai-education" }));
    const published = await publishPage("page-demo");

    const duplicated = await duplicatePage(published.id);

    expect(duplicated.id).not.toBe(published.id);
    expect(duplicated.document.id).toBe(duplicated.id);
    expect(duplicated.status).toBe("DRAFT");
    expect(duplicated.document.title).toContain("副本");
    expect(duplicated.document.slug).toBeUndefined();
    expect(duplicated.publishedAt).toBeUndefined();
    expect(new Date(duplicated.createdAt).getTime()).not.toBeNaN();
    await expect(listPages()).resolves.toHaveLength(2);
  });

  test("publishes a page and assigns a unique slug when absent", async () => {
    await createPage(createDocument({ id: "existing", slug: "ai-jiao-yu-ping-tai-qi-ye-guan-wang" }));
    await publishPage("existing");
    await createPage(createDocument({ id: "page-demo", slug: undefined }));

    const published = await publishPage("page-demo");

    expect(published.status).toBe("PUBLISHED");
    expect(published.publishedAt).toBeDefined();
    expect(published.document.slug).toBe("ai-jiao-yu-ping-tai-qi-ye-guan-wang-2");
  });

  test("publishes a page with an existing slug as a unique suffixed slug", async () => {
    await createPage(createDocument({ id: "existing", slug: "demo" }));
    await publishPage("existing");
    await createPage(createDocument({ id: "page-demo", slug: "demo" }));

    const published = await publishPage("page-demo");

    expect(published.document.slug).toBe("demo-2");
  });

  test("serializes parallel writes into a valid array store", async () => {
    await mkdir(tempDir, { recursive: true });

    await Promise.all(
      Array.from({ length: 5 }, (_, index) =>
        createPage(createDocument({ id: `page-${index}`, title: `并发页面 ${index}` })),
      ),
    );

    const rawStore = JSON.parse(await readFile(storePath, "utf8")) as unknown;
    expect(Array.isArray(rawStore)).toBe(true);
    await expect(listPages()).resolves.toHaveLength(5);
  });

  test.each([
    ["updatePage", () => updatePage("missing", createDocument({ id: "missing" }))],
    ["deletePage", () => deletePage("missing")],
    ["duplicatePage", () => duplicatePage("missing")],
    ["publishPage", () => publishPage("missing")],
  ])("%s throws a Chinese missing-page error", async (_, action) => {
    await expect(action()).rejects.toThrow("页面不存在");
  });
});
