// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { AICommandPanel } from "../../src/components/editor/AICommandPanel";
import { Canvas } from "../../src/components/editor/Canvas";
import { EditorShell } from "../../src/components/editor/EditorShell";
import { InspectorPanel } from "../../src/components/editor/InspectorPanel";
import { ModulePanel } from "../../src/components/editor/ModulePanel";
import { TopToolbar } from "../../src/components/editor/TopToolbar";
import { createDefaultBlock, getBlockDefinition } from "../../src/modules/registry";
import { useEditorStore } from "../../src/store/editorStore";
import type { PageBlock } from "../../src/types/block";
import type { EnterprisePageDocument, PageRecord } from "../../src/types/page";

const timestamp = "2026-06-16T09:00:00.000Z";

function createDocument(blocks: PageBlock[] = [createDefaultBlock("hero")]): EnterprisePageDocument {
  return {
    id: "page-editor",
    title: "企业官网编辑页",
    description: "面向企业团队的中文编辑器测试页",
    version: 1,
    siteMeta: {
      companyName: "云帆科技",
      industry: "企业服务",
      targetAudience: "企业管理团队",
      pageGoal: "lead-generation",
      seoTitle: "云帆科技企业官网",
      seoDescription: "面向企业客户的智能官网",
      keywords: ["AI", "企业官网"],
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
    blocks,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createRecord(document = createDocument()): PageRecord {
  return {
    id: document.id,
    status: "DRAFT",
    document,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers,
  });
}

beforeAll(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  cleanup();
  delete window.desktopApi;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  useEditorStore.getState().resetEditor();
});

describe("TopToolbar", () => {
  test("renders Chinese actions and calls supplied callbacks without store setup", () => {
    const callbacks = {
      onSave: vi.fn(),
      onPreview: vi.fn(),
      onGenerate: vi.fn(),
      onEditCurrentBlock: vi.fn(),
      onExportHtml: vi.fn(),
      onPublish: vi.fn(),
      onUndo: vi.fn(),
      onRedo: vi.fn(),
    };

    render(
      <TopToolbar
        canRedo
        canUndo
        hasSelectedBlock
        isDirty
        pageTitle="企业官网编辑页"
        {...callbacks}
      />,
    );

    expect(screen.getByRole("link", { name: "返回页面管理" }).getAttribute("href")).toBe("/dashboard");

    for (const label of ["保存", "预览", "智能生成", "智能修改模块", "导出 HTML", "发布静态站点", "撤销", "重做"]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
    }

    expect(callbacks.onSave).toHaveBeenCalledTimes(1);
    expect(callbacks.onPreview).toHaveBeenCalledTimes(1);
    expect(callbacks.onGenerate).toHaveBeenCalledTimes(1);
    expect(callbacks.onEditCurrentBlock).toHaveBeenCalledTimes(1);
    expect(callbacks.onExportHtml).toHaveBeenCalledTimes(1);
    expect(callbacks.onPublish).toHaveBeenCalledTimes(1);
    expect(callbacks.onUndo).toHaveBeenCalledTimes(1);
    expect(callbacks.onRedo).toHaveBeenCalledTimes(1);
  });
});

describe("ModulePanel", () => {
  test("renders grouped modules and variants, then calls add with type and variant", () => {
    const onAddBlock = vi.fn();
    const heroDefinition = getBlockDefinition("hero");
    const firstVariant = heroDefinition.variants[0];

    render(<ModulePanel onAddBlock={onAddBlock} />);

    expect(screen.getByTestId("module-panel").className).toContain("min-h-0");
    expect(screen.getByTestId("module-panel").className).toContain("overflow-y-auto");
    expect(screen.getByTestId("module-panel").textContent).toMatch(/\d+ 个模块 \/ \d+ 个变体/);

    const heroModule = screen.getByText(heroDefinition.name).closest("section");
    expect(heroModule).not.toBeNull();
    expect(within(heroModule as HTMLElement).getByText(firstVariant.name)).toBeTruthy();

    fireEvent.click(within(heroModule as HTMLElement).getByRole("button", { name: `添加 ${heroDefinition.name} - ${firstVariant.name}` }));

    expect(onAddBlock).toHaveBeenCalledWith("hero", firstVariant.id);
  });

  test("previews the hovered module variant with the real block renderer", () => {
    const onAddBlock = vi.fn();
    const heroDefinition = getBlockDefinition("hero");
    const firstVariant = heroDefinition.variants[0];

    render(<ModulePanel onAddBlock={onAddBlock} />);

    expect(screen.queryByTestId("module-variant-preview")).toBeNull();

    fireEvent.mouseEnter(screen.getByRole("button", { name: `添加 ${heroDefinition.name} - ${firstVariant.name}` }));

    const preview = screen.getByTestId("module-variant-preview");

    expect(within(preview).getByText(`${heroDefinition.name} / ${firstVariant.name}`)).toBeTruthy();
    expect(within(preview).getByText(String(createDefaultBlock("hero", firstVariant.id).props.title))).toBeTruthy();
  });
});

describe("InspectorPanel", () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor();
  });

  test("renders selected inspector plus shared desktop style controls without tablet or mobile visibility toggles", () => {
    const hero = createDefaultBlock("hero");

    act(() => {
      useEditorStore.getState().setPageDocument(createDocument([hero]));
      useEditorStore.getState().selectBlock(hero.id);
    });

    render(<InspectorPanel />);

    expect(screen.getByTestId("inspector-panel").className).toContain("min-h-0");
    expect(screen.getByTestId("inspector-panel").className).toContain("overflow-y-auto");
    expect(screen.getByText("模块属性")).toBeTruthy();
    expect(screen.getByLabelText("背景")).toBeTruthy();
    expect(screen.getByLabelText("上间距")).toBeTruthy();
    expect(screen.getByLabelText("下间距")).toBeTruthy();
    expect(screen.getByLabelText("对齐")).toBeTruthy();
    expect(screen.getByLabelText("容器宽度")).toBeTruthy();
    expect(screen.queryByText("响应式显示")).toBeNull();
    expect(screen.queryByText("平板显示")).toBeNull();
    expect(screen.queryByText("手机显示")).toBeNull();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(screen.getByTestId("background-image-presets")).toBeTruthy();
    expect(screen.getAllByTestId("background-image-option")).toHaveLength(4);

    fireEvent.change(screen.getByLabelText("背景"), { target: { value: "muted" } });
    fireEvent.click(screen.getByRole("button", { name: "数据运营" }));

    const updatedBlock = useEditorStore.getState().pageDocument?.blocks[0];
    expect(updatedBlock?.style.background).toBe("image");
    expect(updatedBlock?.visibility.mobile).toBe(true);
    expect(updatedBlock?.props.image).toEqual({
      src: "/backgrounds/enterprise-operations.png",
      alt: "数据运营",
    });
  });
});

describe("AICommandPanel", () => {
  test("shows a visible pending state while page generation is running", async () => {
    let resolveGenerate: () => void = () => undefined;
    const onGeneratePage = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveGenerate = resolve;
        }),
    );

    render(
      <AICommandPanel
        hasSelectedBlock
        onEditCurrentBlock={vi.fn()}
        onGeneratePage={onGeneratePage}
      />,
    );

    expect(screen.getByText("智能工具")).toBeTruthy();
    expect(screen.getByText("页面生成与模块修改")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("页面生成提示"), {
      target: { value: "为智能制造企业生成一页官网" },
    });
    fireEvent.click(screen.getByRole("button", { name: "生成页面" }));

    expect((screen.getByRole("button", { name: "正在生成页面" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("正在智能生成页面，请稍等")).toBeTruthy();

    await act(async () => {
      resolveGenerate();
    });

    expect(await screen.findByText("页面已生成")).toBeTruthy();
  });

  test("calls page and block handlers and reports Chinese success states", async () => {
    const onGeneratePage = vi.fn().mockResolvedValue(undefined);
    const onEditCurrentBlock = vi.fn().mockResolvedValue(undefined);

    render(
      <AICommandPanel
        hasSelectedBlock
        onEditCurrentBlock={onEditCurrentBlock}
        onGeneratePage={onGeneratePage}
      />,
    );

    expect(screen.getByText("智能工具")).toBeTruthy();
    expect(screen.getByText("页面生成与模块修改")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("页面生成提示"), {
      target: { value: "为智能制造企业生成一页官网" },
    });
    fireEvent.click(screen.getByRole("button", { name: "生成页面" }));

    await waitFor(() => expect(onGeneratePage).toHaveBeenCalledWith("为智能制造企业生成一页官网"));
    expect(await screen.findByText("页面已生成")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("当前模块修改指令"), {
      target: { value: "强化首屏转化文案" },
    });
    fireEvent.click(screen.getByRole("button", { name: "修改当前模块" }));

    await waitFor(() => expect(onEditCurrentBlock).toHaveBeenCalledWith("强化首屏转化文案"));
    expect(await screen.findByText("模块已修改")).toBeTruthy();
  });

  test("reports a Chinese failure state when a handler rejects", async () => {
    render(
      <AICommandPanel
        hasSelectedBlock
        onEditCurrentBlock={vi.fn().mockRejectedValue(new Error("failed"))}
        onGeneratePage={vi.fn().mockRejectedValue(new Error("failed"))}
      />,
    );

    fireEvent.change(screen.getByLabelText("页面生成提示"), {
      target: { value: "生成官网" },
    });
    fireEvent.click(screen.getByRole("button", { name: "生成页面" }));

    expect(await screen.findByText("页面生成失败，请稍后重试")).toBeTruthy();
  });
});

describe("Canvas", () => {
  test("renders selectable blocks without nesting them inside button semantics", () => {
    const hero = createDefaultBlock("hero");

    act(() => {
      useEditorStore.getState().setPageDocument(createDocument([hero]));
    });

    render(<Canvas />);

    expect(screen.getByTestId("editor-canvas-scroll").className).toContain("min-h-0");
    expect(screen.getByTestId("editor-canvas-scroll").className).toContain("overflow-auto");
    expect(screen.getByLabelText(`选择模块 ${hero.name}`)).toBeTruthy();
    expect(screen.queryByRole("button", { name: `选择模块 ${hero.name}` })).toBeNull();
  });
});

describe("EditorShell", () => {
  test("loads a page record, shows Chinese loading text, and saves the current document", async () => {
    const hero = createDefaultBlock("hero");
    const document = createDocument([hero]);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(createRecord(document)))
      .mockResolvedValueOnce(jsonResponse(createRecord(document)));

    vi.stubGlobal("fetch", fetchMock);

    render(<EditorShell pageId="page-editor" />);

    expect(screen.getByText("正在加载编辑器")).toBeTruthy();
    expect(await screen.findByText("企业官网编辑页")).toBeTruthy();
    expect(screen.getByTestId("editor-shell").className).toContain("h-screen");
    expect(screen.getByTestId("editor-shell").className).toContain("overflow-hidden");
    expect(screen.getByTestId("editor-workspace").className).toContain("min-h-0");
    expect(screen.getByTestId("editor-workspace").className).toContain("overflow-hidden");
    expect(screen.getByTestId("editor-workspace").getAttribute("style")).toContain("--editor-left-width");
    expect(screen.getByTestId("left-panel-resizer")).toBeTruthy();
    expect(screen.getByTestId("right-panel-resizer")).toBeTruthy();
    expect(screen.queryByLabelText("视口切换")).toBeNull();
    expect(screen.queryByRole("button", { name: "平板" })).toBeNull();
    expect(screen.queryByRole("button", { name: "手机" })).toBeNull();

    act(() => {
      useEditorStore.getState().updateBlock(hero.id, {
        name: "测试当前模块",
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/pages/page-editor",
        expect.objectContaining({
          method: "PATCH",
          body: expect.any(String),
        }),
      );
    });

    const [, saveOptions] = fetchMock.mock.calls[1];
    const savedDocument = JSON.parse(String(saveOptions.body)) as EnterprisePageDocument;

    expect(savedDocument.blocks[0].name).toBe("测试当前模块");
    expect(await screen.findByText("页面已保存")).toBeTruthy();
  });

  test("marks AI generated pages dirty and saves generated content", async () => {
    const originalDocument = createDocument([createDefaultBlock("hero")]);
    const generatedBlock = createDefaultBlock("aiGeneratedSection");
    const generatedDocument = createDocument([generatedBlock]);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(createRecord(originalDocument)))
      .mockResolvedValueOnce(jsonResponse(generatedDocument))
      .mockResolvedValueOnce(jsonResponse(createRecord(generatedDocument)));

    vi.stubGlobal("fetch", fetchMock);

    render(<EditorShell pageId="page-editor" />);

    expect(await screen.findByText("企业官网编辑页")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("页面生成提示"), {
      target: { value: "为智能制造企业生成一页官网" },
    });
    fireEvent.click(screen.getByRole("button", { name: "生成页面" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai/generate-page",
      expect.objectContaining({ method: "POST" }),
    ));
    expect(await screen.findAllByText("页面已生成")).not.toHaveLength(0);
    expect(screen.getByText("有未保存修改")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/pages/page-editor",
        expect.objectContaining({
          method: "PATCH",
          body: expect.any(String),
        }),
      );
    });

    const [, , saveOptions] = fetchMock.mock.calls;
    const savedDocument = JSON.parse(String(saveOptions[1].body)) as EnterprisePageDocument;

    expect(savedDocument.blocks[0].id).toBe(generatedBlock.id);
  });

  test("reports failure when AI page generation endpoint fails", async () => {
    const originalDocument = createDocument([createDefaultBlock("hero")]);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(createRecord(originalDocument)))
      .mockResolvedValueOnce(jsonResponse({ error: "生成页面失败" }, { status: 500 }));

    vi.stubGlobal("fetch", fetchMock);

    render(<EditorShell pageId="page-editor" />);

    expect(await screen.findByText("企业官网编辑页")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("页面生成提示"), {
      target: { value: "为智能制造企业生成一页官网" },
    });
    fireEvent.click(screen.getByRole("button", { name: "生成页面" }));

    expect(await screen.findByText("页面生成失败，请稍后重试")).toBeTruthy();
    expect(screen.queryByText("页面已生成")).toBeNull();
  });

  test("top toolbar AI generate action focuses the page prompt input", async () => {
    const document = createDocument([createDefaultBlock("hero")]);
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(createRecord(document)));

    vi.stubGlobal("fetch", fetchMock);

    render(<EditorShell pageId="page-editor" />);

    expect(await screen.findByText("企业官网编辑页")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "智能生成" }));

    await waitFor(() => expect(globalThis.document.activeElement).toBe(screen.getByLabelText("页面生成提示")));
  });

  test("saves dirty content before publishing the page", async () => {
    const hero = createDefaultBlock("hero");
    const document = createDocument([hero]);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(createRecord(document)))
      .mockResolvedValueOnce(jsonResponse(createRecord(document)));
    const publishSite = vi.fn().mockResolvedValue({
      canceled: false,
      outputDirectory: "D:\\Sites\\page-editor",
    });
    window.desktopApi = {
      publishSite,
      getAppInfo: vi.fn(),
      openUserDataDirectory: vi.fn(),
    };

    vi.stubGlobal("fetch", fetchMock);

    render(<EditorShell pageId="page-editor" />);

    expect(await screen.findByText("企业官网编辑页")).toBeTruthy();

    act(() => {
      useEditorStore.getState().updateBlock(hero.id, {
        name: "发布前保存模块",
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "发布静态站点" }));

    await waitFor(() => expect(publishSite).toHaveBeenCalledWith("page-editor"));

    expect(fetchMock.mock.calls[1][0]).toBe("/api/pages/page-editor");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      await screen.findByText("静态站点已发布：D:\\Sites\\page-editor"),
    ).toBeTruthy();

    const savedDocument = JSON.parse(String(fetchMock.mock.calls[1][1]?.body)) as EnterprisePageDocument;

    expect(savedDocument.blocks[0].name).toBe("发布前保存模块");
  });

  test("treats canceling the desktop folder picker as informational", async () => {
    const document = createDocument();
    const publishSite = vi.fn().mockResolvedValue({ canceled: true });
    window.desktopApi = {
      publishSite,
      getAppInfo: vi.fn(),
      openUserDataDirectory: vi.fn(),
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(createRecord(document))),
    );

    render(<EditorShell pageId="page-editor" />);
    expect(await screen.findByText("企业官网编辑页")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "发布静态站点" }),
    );

    expect(await screen.findByText("已取消静态站点发布")).toBeTruthy();
    expect(publishSite).toHaveBeenCalledWith("page-editor");
  });

  test("shows a Chinese error state when page loading fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(jsonResponse({ error: "not found" }, { status: 404 })));

    render(<EditorShell pageId="missing-page" />);

    expect(await screen.findByText("页面加载失败")).toBeTruthy();
    expect(screen.getByText("请返回控制台确认页面是否存在，或稍后重试。")).toBeTruthy();
  });
});
