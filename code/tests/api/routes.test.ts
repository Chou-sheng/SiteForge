import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { setPageStoreFilePathForTests } from "../../src/lib/db/pageStore";
import { pageDocumentSchema } from "../../src/lib/validation/pageSchema";
import { createDefaultBlock } from "../../src/modules/registry";
import type { EnterprisePageDocument } from "../../src/types/page";
import { GET as getPage, PATCH, DELETE } from "../../src/app/api/pages/[pageId]/route";
import { GET as list, POST as create } from "../../src/app/api/pages/route";
import { POST as generatePage } from "../../src/app/api/ai/generate-page/route";
import { POST as editBlock } from "../../src/app/api/ai/edit-block/route";
import { POST as exportPage } from "../../src/app/api/export/route";

const timestamp = "2026-06-15T09:00:00.000Z";

function request(path: string, body?: unknown) {
  return new Request(`http://localhost${path}`, {
    method: body === undefined ? "GET" : "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
  });
}

function pageParams(pageId: string) {
  return {
    params: Promise.resolve({ pageId }),
  };
}

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

describe("API routes", () => {
  let tempDir: string;
  let storePath: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "page-api-"));
    storePath = join(tempDir, "pages.json");
    setPageStoreFilePathForTests(storePath);
  });

  afterEach(async () => {
    setPageStoreFilePathForTests(null);
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    await rm(tempDir, { force: true, recursive: true });
  });

  test("creates, lists, reads, updates, and deletes pages", async () => {
    const createdResponse = await create(request("/api/pages", createDocument()));

    expect(createdResponse.status).toBe(201);
    await expect(createdResponse.json()).resolves.toMatchObject({
      id: "page-demo",
      status: "DRAFT",
      document: { title: "AI 教育平台企业官网" },
    });

    const summariesResponse = await list();
    const summaries = (await summariesResponse.json()) as unknown[];

    expect(summariesResponse.status).toBe(200);
    expect(summaries).toEqual([
      expect.objectContaining({
        id: "page-demo",
        title: "AI 教育平台企业官网",
        status: "DRAFT",
        description: "面向教育机构的智能招生与服务平台",
        companyName: "智学科技",
        industry: "教育科技",
      }),
    ]);
    expect(summaries[0]).not.toHaveProperty("document");

    const recordResponse = await getPage(request("/api/pages/page-demo"), pageParams("page-demo"));

    expect(recordResponse.status).toBe(200);
    await expect(recordResponse.json()).resolves.toMatchObject({
      id: "page-demo",
      document: { id: "page-demo" },
    });

    const updatedResponse = await PATCH(
      request(
        "/api/pages/page-demo",
        createDocument({
          title: "企业服务平台",
          updatedAt: "2026-06-15T10:00:00.000Z",
        }),
      ),
      pageParams("page-demo"),
    );

    expect(updatedResponse.status).toBe(200);
    await expect(updatedResponse.json()).resolves.toMatchObject({
      id: "page-demo",
      document: { title: "企业服务平台" },
    });

    const deletedResponse = await DELETE(request("/api/pages/page-demo"), pageParams("page-demo"));

    expect(deletedResponse.status).toBe(200);
    await expect(deletedResponse.json()).resolves.toEqual({ ok: true });

    const missingResponse = await getPage(request("/api/pages/page-demo"), pageParams("page-demo"));

    expect(missingResponse.status).toBe(404);
    await expect(missingResponse.json()).resolves.toMatchObject({
      error: expect.stringContaining("页面不存在"),
    });
  });

  test("returns 400 for duplicate creates and mismatched update document ids", async () => {
    await create(request("/api/pages", createDocument()));

    const duplicateResponse = await create(request("/api/pages", createDocument()));
    const mismatchedResponse = await PATCH(
      request("/api/pages/page-demo", createDocument({ id: "page-other" })),
      pageParams("page-demo"),
    );

    expect(duplicateResponse.status).toBe(400);
    expect(mismatchedResponse.status).toBe(400);
    await expect(duplicateResponse.json()).resolves.toMatchObject({
      error: expect.stringContaining("页面已存在"),
    });
    await expect(mismatchedResponse.json()).resolves.toMatchObject({
      error: expect.stringContaining("页面 ID"),
    });
  });

  test("exports a page with a sanitized HTML filename", async () => {
    await create(request("/api/pages", createDocument({ slug: "企业 官网/2026" })));

    const exportedResponse = await exportPage(request("/api/export", { pageId: "page-demo" }));
    const exported = await exportedResponse.json();

    expect(exportedResponse.status).toBe(200);
    expect(exported.html).toContain("<!doctype html>");
    expect(exported.html).toContain('data-static-site-runtime="shared-page-renderer"');
    expect(exported.html).toContain("static-site-ready");
    expect(exported.html).not.toContain('href="./assets/style.css"');
    expect(exported.filename).toMatch(/^[a-zA-Z0-9-_]+\.html$/);
  });

  test("uses stable export filenames for normal, Chinese-only, empty, and reserved slugs", async () => {
    await create(request("/api/pages", createDocument({ id: "page-normal", slug: "product-site_2026" })));
    await create(request("/api/pages", createDocument({ id: "page-chinese", slug: "企业官网" })));
    await create(request("/api/pages", createDocument({ id: "page-empty", slug: "///" })));
    await create(request("/api/pages", createDocument({ id: "page-reserved", slug: "CON" })));

    await expect((await exportPage(request("/api/export", { pageId: "page-normal" }))).json()).resolves.toMatchObject({
      filename: "product-site_2026.html",
    });
    await expect((await exportPage(request("/api/export", { pageId: "page-chinese" }))).json()).resolves.toMatchObject({
      filename: "page-chinese.html",
    });
    await expect((await exportPage(request("/api/export", { pageId: "page-empty" }))).json()).resolves.toMatchObject({
      filename: "page-empty.html",
    });
    await expect((await exportPage(request("/api/export", { pageId: "page-reserved" }))).json()).resolves.toMatchObject({
      filename: "page-reserved.html",
    });
  });

  test("rejects whitespace page ids for export requests", async () => {
    const exportResponse = await exportPage(request("/api/export", { pageId: "   " }));

    expect(exportResponse.status).toBe(400);
    await expect(exportResponse.json()).resolves.toMatchObject({
      error: expect.stringContaining("pageId"),
    });
  });

  test("reports downstream store schema failures as server errors for export", async () => {
    await writeFile(storePath, `${JSON.stringify([{ id: "broken-page" }])}\n`, "utf8");

    const exportResponse = await exportPage(request("/api/export", { pageId: "broken-page" }));

    expect(exportResponse.status).toBe(500);
    await expect(exportResponse.json()).resolves.not.toMatchObject({
      error: expect.stringContaining("pageId"),
    });
  });

  test("returns 404 for missing pages in export, update, and delete routes", async () => {
    const missingDocument = createDocument({ id: "missing-page" });

    const exportResponse = await exportPage(request("/api/export", { pageId: "missing-page" }));
    const patchResponse = await PATCH(
      request("/api/pages/missing-page", missingDocument),
      pageParams("missing-page"),
    );
    const deleteResponse = await DELETE(request("/api/pages/missing-page"), pageParams("missing-page"));

    expect(exportResponse.status).toBe(404);
    expect(patchResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
  });

  test("returns Chinese validation errors for invalid AI request bodies", async () => {
    const generateResponse = await generatePage(request("/api/ai/generate-page", { prompt: "" }));
    const editResponse = await editBlock(request("/api/ai/edit-block", {
      block: createDefaultBlock("hero"),
      instruction: "",
    }));

    expect(generateResponse.status).toBe(400);
    expect(editResponse.status).toBe(400);
    await expect(generateResponse.json()).resolves.toMatchObject({
      error: expect.stringContaining("请求"),
    });
    await expect(editResponse.json()).resolves.toMatchObject({
      error: expect.stringContaining("请求"),
    });
  });

  test("generates a page and edits a block for valid AI route requests", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    const block = createDefaultBlock("hero");
    const generatedBlock = {
      ...createDefaultBlock("aiGeneratedSection"),
      id: "generated-manufacturing-hero",
      name: "智能制造首屏",
      props: {
        generatedModuleId: "generated-manufacturing-hero",
        intent: "官网线索转化",
        layout: "hero",
        eyebrow: "Smart Manufacturing",
        title: "让智能制造线索更快进入销售流程",
        description: "用设备能力、交付案例和预约演示入口承接制造业客户的采购判断。",
      },
    };
    const generatedDocument = createDocument({
      id: "ai-route-generated-page",
      title: "智能制造企业官网",
      siteMeta: {
        ...createDocument().siteMeta,
        industry: "智能制造",
      },
      blocks: [generatedBlock],
    });
    const editedBlock = {
      ...block,
      props: {
        ...block.props,
        title: "预约演示智能制造解决方案",
      },
    };
    const fetchMock = vi.fn();
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      choices: [
        {
          message: {
            content: JSON.stringify(generatedDocument),
          },
        },
      ],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      choices: [
        {
          message: {
            content: JSON.stringify(editedBlock),
          },
        },
      ],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const generatedResponse = await generatePage(
      request("/api/ai/generate-page", {
        prompt: "为制造业企业生成官网",
        industry: "智能制造",
      }),
    );
    const editedResponse = await editBlock(
      request("/api/ai/edit-block", {
        pageContext: { title: "企业官网", industry: "智能制造" },
        block,
        instruction: "强调预约演示",
      }),
    );

    expect(generatedResponse.status).toBe(200);
    await expect(generatedResponse.json()).resolves.toMatchObject({
      title: expect.any(String),
      siteMeta: { industry: expect.any(String) },
    });

    expect(editedResponse.status).toBe(200);
    await expect(editedResponse.json()).resolves.toMatchObject({
      block: {
        id: block.id,
        type: block.type,
      },
    });
  });

  test("marks generated pages with the AI source response header", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubEnv("DEEPSEEK_MODEL", "deepseek-test");
    const aiDocument = createDocument({
      id: "ai-generated-page",
      blocks: [createDefaultBlock("aiGeneratedSection")],
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify(aiDocument),
            },
          },
        ],
      }), { status: 200, headers: { "Content-Type": "application/json" } })),
    );

    const response = await generatePage(request("/api/ai/generate-page", {
      prompt: "为智能制造企业生成一页官网",
      industry: "智能制造",
    }));
    const generated = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-ai-source")).toBe("deepseek");
    expect(response.headers.get("x-ai-fallback-reason")).toBeNull();
    expect(pageDocumentSchema.safeParse(generated).success).toBe(true);
  });

  test("fails page generation when DeepSeek is not configured", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await generatePage(request("/api/ai/generate-page", {
      prompt: "为智能制造企业生成一页官网",
      industry: "智能制造",
    }));

    expect(response.status).toBe(500);
    expect(response.headers.get("x-ai-source")).toBeNull();
    expect(response.headers.get("x-ai-fallback-reason")).toBeNull();
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("DeepSeek API Key"),
    });
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining("DeepSeek API Key"));
  });
});
