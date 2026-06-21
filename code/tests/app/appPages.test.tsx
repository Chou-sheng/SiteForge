// @vitest-environment jsdom

import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");

  return {
    ...actual,
    useRouter: () => navigation,
  };
});

import DashboardPage, * as DashboardRoute from "../../src/app/dashboard/page";
import EditorPage from "../../src/app/editor/[pageId]/page";
import Home from "../../src/app/page";
import { metadata } from "../../src/app/layout";
import PreviewPage from "../../src/app/preview/[pageId]/page";
import TemplatesPage from "../../src/app/templates/page";
import { createPage, setPageStoreFilePathForTests } from "../../src/lib/db/pageStore";
import { enterpriseTemplates } from "../../src/lib/templates/enterpriseTemplates";
import type { PageBlock } from "../../src/types/block";
import type { EnterprisePageDocument, PageRecord } from "../../src/types/page";

const timestamp = "2026-06-16T09:00:00.000Z";

function createDocument(overrides: Partial<EnterprisePageDocument> = {}): EnterprisePageDocument {
  const template = enterpriseTemplates[0].document;
  const blocks: PageBlock[] = template.blocks.map((block, index) => {
    const clonedBlock = structuredClone(block);
    const props = { ...clonedBlock.props };

    if (clonedBlock.type === "navbar") {
      props.logo = "云帆科技";
    }

    if (clonedBlock.type === "footer") {
      props.companyName = "云帆科技";
      props.copyright = "© 2026 云帆科技。保留所有权利。";
    }

    return {
      ...clonedBlock,
      id: `page-app-block-${index}`,
      props,
    };
  });

  return {
    ...structuredClone(template),
    id: "page-app",
    title: "云帆科技企业官网",
    description: "用于 App Pages 测试的企业官网",
    slug: "yunfan-home",
    createdAt: timestamp,
    updatedAt: timestamp,
    siteMeta: {
      ...template.siteMeta,
      companyName: "云帆科技",
      industry: "企业服务",
      seoTitle: "云帆科技官网",
      seoDescription: "云帆科技企业官网描述",
    },
    blocks,
    ...overrides,
  };
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json" },
  });
}

function pageParams<T extends Record<string, string>>(params: T) {
  return {
    params: Promise.resolve(params),
  };
}

function firstBlockTitle(document: EnterprisePageDocument) {
  const titledBlock = document.blocks.find((block) => typeof block.props.title === "string");

  return typeof titledBlock?.props.title === "string" ? titledBlock.props.title : document.title;
}

describe("app pages", () => {
  let tempDir: string;

  beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "app-pages-"));
    setPageStoreFilePathForTests(join(tempDir, "pages.json"));
    navigation.push.mockReset();
  });

  afterEach(async () => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    setPageStoreFilePathForTests(null);
    await rm(tempDir, { force: true, recursive: true });
  });

  test("home and metadata describe available functions without product positioning", () => {
    render(<Home />);

    expect(metadata).toMatchObject({
      title: "页面工作台",
      description: "模板、模块编辑、智能生成、预览、HTML 导出和发布",
    });
    expect(screen.getByRole("heading", { level: 1, name: "页面工作台" })).toBeTruthy();
    expect(screen.getByText("提供模板、模块编辑、智能生成、预览、HTML 导出和发布。")).toBeTruthy();
    expect(screen.getByText("查看页面、草稿和发布状态。")).toBeTruthy();
    expect(screen.getByText("搜索、筛选和预览整页模板。")).toBeTruthy();
    expect(screen.queryByText("站点工坊 SiteForge")).toBeNull();
  });

  test("dashboard renders Chinese page cards and workspace actions", async () => {
    await createPage(createDocument());

    render(await DashboardPage());

    const dashboardShell = screen.getByRole("main");
    expect(dashboardShell.className).toContain("#f7f8ff");
    expect(dashboardShell.className).not.toContain("#020617");

    expect(screen.getByText("页面管理")).toBeTruthy();
    expect(screen.getByText("页面名称、类型、状态和更新时间。")).toBeTruthy();
    expect(screen.getByText("云帆科技企业官网")).toBeTruthy();
    expect(screen.getByText("类型：企业服务")).toBeTruthy();
    expect(screen.getByText("状态：草稿")).toBeTruthy();
    expect(screen.getByText(/更新时间：/)).toBeTruthy();

    for (const label of ["继续编辑", "复制页面", "删除页面", "新建页面", "模板中心", "智能创建页面"]) {
      expect(screen.getByText(label)).toBeTruthy();
    }

    expect(screen.getByRole("link", { name: "模板中心" }).getAttribute("href")).toBe("/templates");
    expect(screen.queryByRole("link", { name: "新建页面" })).toBeNull();
    expect(screen.getByRole("button", { name: "新建页面" })).toBeTruthy();
    expect(screen.getByDisplayValue("云帆科技企业官网").getAttribute("name")).toBe("title");
    expect(screen.getByRole("button", { name: "重命名" })).toBeTruthy();
  });

  test("dashboard route reads mutable page data dynamically", () => {
    expect((DashboardRoute as { dynamic?: string }).dynamic).toBe("force-dynamic");
  });

  test("template center previews a full template before confirmation creates a page", async () => {
    const template = enterpriseTemplates[0];
    const createdRecord: PageRecord = {
      id: "created-from-template",
      status: "DRAFT",
      document: { ...structuredClone(template.document), id: "created-from-template" },
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(createdRecord, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    render(<TemplatesPage />);

    expect(screen.getByText("模板中心")).toBeTruthy();
    expect(screen.getByText("提供模板搜索、类型筛选、整页预览和页面创建。")).toBeTruthy();
    expect(screen.getByPlaceholderText("搜索模板名称、类型或关键词")).toBeTruthy();
    expect(screen.getAllByText("预览模板")).toHaveLength(enterpriseTemplates.length);
    expect(screen.queryByText("Canva-like Template Gallery")).toBeNull();
    expect(screen.queryByText("企业官网")).toBeNull();
    expect(screen.queryByText("服务门户型官网")).toBeNull();
    expect(screen.getAllByText("AI 产品官网").length).toBeGreaterThan(0);
    expect(screen.getAllByText("教育机构官网").length).toBeGreaterThan(0);
    expect(screen.getAllByText("文旅度假官网").length).toBeGreaterThan(0);
    expect(screen.getAllByText("建筑空间官网").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("official-site-card-preview")).toHaveLength(enterpriseTemplates.length);
    expect(screen.queryByText("推荐模板")).toBeNull();
    expect(screen.queryByText("招生转化")).toBeNull();

    fireEvent.click(screen.getAllByText("预览模板")[0]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText("模板预览")).toBeTruthy();
    const templatePreview = screen.getByTestId("template-preview");
    expect(within(templatePreview).getAllByText(template.document.title).length).toBeGreaterThan(0);
    expect(within(templatePreview).getByText("用这个模板开始编辑")).toBeTruthy();

    fireEvent.click(within(templatePreview).getByText("用这个模板开始编辑"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/pages",
      expect.objectContaining({ method: "POST", body: expect.any(String) }),
    ));
    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/editor/created-from-template"));

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as EnterprisePageDocument;
    expect(requestBody.title).toBe(template.document.title);
    expect(requestBody.id).not.toBe(template.document.id);
    expect(requestBody.slug).toBeUndefined();
  });

  test("template center renders template previews in static mode so animations cannot hide them", () => {
    render(<TemplatesPage />);

    expect(screen.getAllByTestId("official-site-card-preview")).toHaveLength(enterpriseTemplates.length);
    expect(document.querySelectorAll('[data-testid="official-site-card-preview"] .page-renderer')).toHaveLength(0);
    expect(document.querySelectorAll(".premium-motion")).toHaveLength(0);

    const previewButton = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("预览模板"));

    expect(previewButton).toBeTruthy();
    fireEvent.click(previewButton as HTMLElement);

    const templatePreview = screen.getByTestId("template-preview");
    expect(templatePreview.querySelectorAll(".premium-motion")).toHaveLength(0);
    expect(templatePreview.querySelectorAll('[data-premium-motion="static"]').length).toBeGreaterThan(0);
  });

  test("editor route renders EditorShell for the requested page id", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => undefined)));

    render(await EditorPage(pageParams({ pageId: "page-app" })));

    expect(screen.getByText("正在加载编辑器")).toBeTruthy();
  });

  test("preview route renders a read-only page from the server store", async () => {
    const document = createDocument();
    await createPage(document);

    render(await PreviewPage(pageParams({ pageId: "page-app" })));

    expect(screen.getAllByText("云帆科技").length).toBeGreaterThan(0);
    expect(screen.getByText(firstBlockTitle(document))).toBeTruthy();
  });

});
