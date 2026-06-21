"use client";

import { useEffect, useMemo, useState, type CSSProperties, type PointerEvent } from "react";

import { EmptyState } from "../common/EmptyState";
import { LoadingState } from "../common/LoadingState";
import { useEditorStore } from "../../store/editorStore";
import type { PageBlock } from "../../types/block";
import type { EnterprisePageDocument, PageRecord } from "../../types/page";
import { AICommandPanel } from "./AICommandPanel";
import { Canvas } from "./Canvas";
import { InspectorPanel } from "./InspectorPanel";
import { ModulePanel } from "./ModulePanel";
import { TopToolbar } from "./TopToolbar";

type EditorShellProps = {
  pageId: string;
};

type ShellStatus = {
  tone: "success" | "error" | "info";
  message: string;
} | null;

type PanelSide = "left" | "right";

const aiPagePromptId = "editor-ai-page-prompt";
const aiBlockInstructionId = "editor-ai-block-instruction";
const defaultPanelWidths = {
  left: 280,
  right: 320,
};

function clampPanelWidth(value: number, side: PanelSide) {
  const min = side === "left" ? 240 : 280;
  const max = side === "left" ? 520 : 560;

  return Math.min(max, Math.max(min, value));
}

function getAIResultMessage(action: "page" | "block") {
  return {
    tone: "success" as const,
    message: action === "page" ? "页面已生成" : "模块已修改",
  };
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error("请求失败");
  }

  return (await response.json()) as T;
}

export function EditorShell({ pageId }: EditorShellProps) {
  const pageDocument = useEditorStore((state) => state.pageDocument);
  const selectedBlockId = useEditorStore((state) => state.selectedBlockId);
  const isDirty = useEditorStore((state) => state.isDirty);
  const history = useEditorStore((state) => state.history);
  const future = useEditorStore((state) => state.future);
  const isSaving = useEditorStore((state) => state.isSaving);
  const setPageDocument = useEditorStore((state) => state.setPageDocument);
  const replacePageDocument = useEditorStore((state) => state.replacePageDocument);
  const addBlock = useEditorStore((state) => state.addBlock);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const setViewport = useEditorStore((state) => state.setViewport);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const markSaved = useEditorStore((state) => state.markSaved);
  const setSaving = useEditorStore((state) => state.setSaving);
  const resetEditor = useEditorStore((state) => state.resetEditor);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [status, setStatus] = useState<ShellStatus>(null);
  const [panelWidths, setPanelWidths] = useState(defaultPanelWidths);

  const selectedBlock = useMemo(
    () => pageDocument?.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [pageDocument, selectedBlockId],
  );

  useEffect(() => {
    setViewport("desktop");
    let active = true;

    async function loadPage() {
      setIsLoading(true);
      setLoadFailed(false);
      setStatus(null);

      try {
        const response = await fetch(`/api/pages/${pageId}`);
        const record = await readJsonResponse<PageRecord>(response);

        if (!active) {
          return;
        }

        setPageDocument(record.document);
      } catch {
        if (active) {
          setLoadFailed(true);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      active = false;
      resetEditor();
    };
  }, [pageId, resetEditor, setPageDocument, setViewport]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  async function saveCurrentDocument(options: { silent?: boolean } = {}) {
    const documentToSave = useEditorStore.getState().pageDocument;

    if (!documentToSave) {
      return;
    }

    setSaving(true);
    if (!options.silent) {
      setStatus(null);
    }

    try {
      await readJsonResponse<PageRecord>(
        await fetch(`/api/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(documentToSave),
        }),
      );
      markSaved();
      if (!options.silent) {
        setStatus({ tone: "success", message: "页面已保存" });
      }
    } catch {
      setStatus({ tone: "error", message: "页面保存失败，请稍后重试" });
      throw new Error("页面保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function ensureSavedBeforeRemoteAction() {
    if (useEditorStore.getState().isDirty) {
      await saveCurrentDocument({ silent: true });
    }
  }

  async function handleSave() {
    try {
      await saveCurrentDocument();
    } catch {
      // saveCurrentDocument already reports the Chinese error state.
    }
  }

  async function handlePreview() {
    try {
      await ensureSavedBeforeRemoteAction();
      window.open(`/preview/${pageId}`, "_blank", "noopener,noreferrer");
      setStatus({ tone: "info", message: "预览页面已打开" });
    } catch {
      setStatus({ tone: "error", message: "请先保存页面后再预览" });
    }
  }

  async function handleExportHtml() {
    setStatus(null);

    try {
      await ensureSavedBeforeRemoteAction();
      const result = await readJsonResponse<{ html: string; filename: string }>(
        await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId }),
        }),
      );
      const url = URL.createObjectURL(new Blob([result.html], { type: "text/html;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      link.click();
      URL.revokeObjectURL(url);
      setStatus({ tone: "success", message: "HTML 已导出" });
    } catch {
      setStatus({ tone: "error", message: "导出 HTML 失败，请稍后重试" });
    }
  }

  async function handlePublish() {
    setStatus(null);

    try {
      await ensureSavedBeforeRemoteAction();
      if (!window.desktopApi) {
        throw new Error("静态站点发布仅在桌面版中可用");
      }

      const result = await window.desktopApi.publishSite(pageId);
      if (result.canceled) {
        setStatus({ tone: "info", message: "已取消静态站点发布" });
        return;
      }

      setStatus({
        tone: "success",
        message: `静态站点已发布：${result.outputDirectory}`,
      });
    } catch {
      setStatus({ tone: "error", message: "静态站点发布失败，请稍后重试" });
    }
  }

  async function handleGeneratePage(prompt: string) {
    const currentDocument = useEditorStore.getState().pageDocument;
    const response = await fetch("/api/ai/generate-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        industry: currentDocument?.siteMeta.industry,
        pageType: currentDocument?.siteMeta.pageGoal,
      }),
    });
    const generatedDocument = await readJsonResponse<EnterprisePageDocument>(response);
    const resultMessage = getAIResultMessage("page");

    replacePageDocument({
      ...generatedDocument,
      id: pageId,
      title: generatedDocument.title || currentDocument?.title || "未命名页面",
    });
    setStatus(resultMessage);

    return resultMessage.message;
  }

  async function handleEditCurrentBlock(instruction: string) {
    const currentDocument = useEditorStore.getState().pageDocument;
    const currentBlock = currentDocument?.blocks.find((block) => block.id === selectedBlockId);

    if (!currentDocument || !currentBlock) {
      throw new Error("未选择模块");
    }

    const response = await fetch("/api/ai/edit-block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageContext: currentDocument,
        block: currentBlock,
        instruction,
      }),
    });
    const result = await readJsonResponse<{ block: PageBlock }>(response);
    const resultMessage = getAIResultMessage("block");

    updateBlock(currentBlock.id, result.block);
    setStatus(resultMessage);

    return resultMessage.message;
  }

  function focusEditorInput(inputId: string) {
    requestAnimationFrame(() => {
      document.getElementById(inputId)?.focus();
    });
  }

  function startPanelResize(side: PanelSide, event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();

    const startX = event.clientX;
    const startWidths = { ...panelWidths };

    function handlePointerMove(moveEvent: globalThis.PointerEvent) {
      const delta = moveEvent.clientX - startX;

      setPanelWidths({
        left: side === "left" ? clampPanelWidth(startWidths.left + delta, "left") : startWidths.left,
        right: side === "right" ? clampPanelWidth(startWidths.right - delta, "right") : startWidths.right,
      });
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  const workspaceStyle = {
    "--editor-left-width": `${panelWidths.left}px`,
    "--editor-right-width": `${panelWidths.right}px`,
  } as CSSProperties;

  if (isLoading) {
    return <LoadingState className="h-screen" title="正在加载编辑器" />;
  }

  if (loadFailed || !pageDocument) {
    return (
      <EmptyState
        className="h-screen"
        description="请返回控制台确认页面是否存在，或稍后重试。"
        title="页面加载失败"
      />
    );
  }

  return (
    <div
      className="grid h-screen grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(0,196,204,0.16),transparent_28%),radial-gradient(circle_at_88%_6%,rgba(255,91,138,0.14),transparent_24%),#f7f8ff] text-slate-950"
      data-testid="editor-shell"
    >
      <TopToolbar
        canRedo={future.length > 0}
        canUndo={history.length > 0}
        hasSelectedBlock={Boolean(selectedBlock)}
        isDirty={isDirty}
        isSaving={isSaving}
        onEditCurrentBlock={() => {
          setStatus({ tone: "info", message: selectedBlock ? "请在右侧输入当前模块修改指令" : "请先选择一个模块" });
          if (selectedBlock) {
            focusEditorInput(aiBlockInstructionId);
          }
        }}
        onExportHtml={handleExportHtml}
        onGenerate={() => {
          setStatus({ tone: "info", message: "请在右侧输入页面生成提示" });
          focusEditorInput(aiPagePromptId);
        }}
        onPreview={handlePreview}
        onPublish={handlePublish}
        onRedo={redo}
        onSave={handleSave}
        onUndo={undo}
        pageTitle={pageDocument.title}
      />

      <div
        className="grid min-h-0 overflow-hidden grid-cols-[var(--editor-left-width)_12px_minmax(760px,1fr)_12px_var(--editor-right-width)]"
        data-testid="editor-workspace"
        style={workspaceStyle}
      >
        <ModulePanel onAddBlock={addBlock} previewOffset={panelWidths.left + 16} />

        <div
          aria-label="调整模块栏宽度"
          aria-orientation="vertical"
          className="group flex cursor-col-resize items-center justify-center border-r border-white/70 bg-white/35 hover:bg-white/70"
          data-testid="left-panel-resizer"
          onPointerDown={(event) => startPanelResize("left", event)}
          role="separator"
          tabIndex={0}
        >
          <span className="h-12 w-1 rounded-full bg-slate-300 group-hover:bg-violet-400" />
        </div>

        <main className="grid min-h-0 min-w-0 overflow-hidden grid-rows-[auto_minmax(0,1fr)]">
          <div className="flex h-12 items-center justify-between border-b border-white/70 bg-white/70 px-4 backdrop-blur">
            <p className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">桌面画布</p>
            {status ? (
              <p
                className={[
                  "text-xs",
                  status.tone === "success"
                    ? "text-emerald-700"
                    : status.tone === "error"
                      ? "text-rose-700"
                      : "text-slate-500",
                ].join(" ")}
              >
                {status.message}
              </p>
            ) : null}
          </div>
          <Canvas />
        </main>

        <div
          aria-label="调整属性栏宽度"
          aria-orientation="vertical"
          className="group flex cursor-col-resize items-center justify-center border-l border-white/70 bg-white/35 hover:bg-white/70"
          data-testid="right-panel-resizer"
          onPointerDown={(event) => startPanelResize("right", event)}
          role="separator"
          tabIndex={0}
        >
          <span className="h-12 w-1 rounded-full bg-slate-300 group-hover:bg-violet-400" />
        </div>

        <div className="grid min-h-0 overflow-hidden grid-rows-[minmax(0,1fr)_auto]">
          <InspectorPanel />
          <AICommandPanel
            blockInstructionId={aiBlockInstructionId}
            hasSelectedBlock={Boolean(selectedBlock)}
            onEditCurrentBlock={handleEditCurrentBlock}
            onGeneratePage={handleGeneratePage}
            pagePromptId={aiPagePromptId}
          />
        </div>
      </div>
    </div>
  );
}
