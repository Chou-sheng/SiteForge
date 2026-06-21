"use client";

import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";

type AICommandPanelProps = {
  hasSelectedBlock: boolean;
  pagePromptId?: string;
  blockInstructionId?: string;
  onGeneratePage: (prompt: string) => Promise<string | void> | string | void;
  onEditCurrentBlock: (instruction: string) => Promise<string | void> | string | void;
};

type PanelStatus = {
  tone: "success" | "error" | "info";
  message: string;
} | null;

export function AICommandPanel({
  hasSelectedBlock,
  pagePromptId,
  blockInstructionId,
  onGeneratePage,
  onEditCurrentBlock,
}: AICommandPanelProps) {
  const [pagePrompt, setPagePrompt] = useState("");
  const [blockInstruction, setBlockInstruction] = useState("");
  const [status, setStatus] = useState<PanelStatus>(null);
  const [pendingAction, setPendingAction] = useState<"page" | "block" | null>(null);

  async function handleGeneratePage() {
    const prompt = pagePrompt.trim();

    if (!prompt) {
      setStatus({ tone: "error", message: "请输入页面生成提示" });
      return;
    }

    setPendingAction("page");
    setStatus({ tone: "info", message: "正在智能生成页面，请稍等" });

    try {
      const message = await onGeneratePage(prompt);
      setStatus({
        tone: message?.includes("未生效") ? "info" : "success",
        message: message ?? "页面已生成",
      });
    } catch {
      setStatus({ tone: "error", message: "页面生成失败，请稍后重试" });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleEditCurrentBlock() {
    const instruction = blockInstruction.trim();

    if (!hasSelectedBlock) {
      setStatus({ tone: "error", message: "请先选择一个模块" });
      return;
    }

    if (!instruction) {
      setStatus({ tone: "error", message: "请输入当前模块修改指令" });
      return;
    }

    setPendingAction("block");
    setStatus({ tone: "info", message: "正在智能修改当前模块，请稍等" });

    try {
      const message = await onEditCurrentBlock(instruction);
      setStatus({
        tone: message?.includes("未生效") ? "info" : "success",
        message: message ?? "模块已修改",
      });
    } catch {
      setStatus({ tone: "error", message: "当前模块修改失败，请稍后重试" });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <section className="border-t border-white/70 bg-white/85 p-4 backdrop-blur">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-950">智能工具</h2>
        <p className="mt-1 text-xs text-slate-500">页面生成与模块修改</p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-1.5 text-xs font-medium text-slate-600">
          页面生成提示
          <textarea
            className="min-h-20 resize-y rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-violet-300"
            id={pagePromptId}
            onChange={(event) => setPagePrompt(event.target.value)}
            value={pagePrompt}
          />
        </label>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-violet-600 to-pink-500 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={pendingAction === "page"}
          onClick={handleGeneratePage}
          type="button"
        >
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          {pendingAction === "page" ? "正在生成页面" : "生成页面"}
        </button>

        <label className="grid gap-1.5 text-xs font-medium text-slate-600">
          当前模块修改指令
          <textarea
            className="min-h-20 resize-y rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-violet-300 disabled:bg-slate-100"
            disabled={!hasSelectedBlock}
            id={blockInstructionId}
            onChange={(event) => setBlockInstruction(event.target.value)}
            value={blockInstruction}
          />
        </label>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasSelectedBlock || pendingAction === "block"}
          onClick={handleEditCurrentBlock}
          type="button"
        >
          <Wand2 aria-hidden="true" className="h-4 w-4" />
          {pendingAction === "block" ? "正在修改模块" : "修改当前模块"}
        </button>

        {status ? (
          <p
            className={[
              "rounded-2xl border px-3 py-2 text-xs",
              status.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : status.tone === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-sky-200 bg-sky-50 text-sky-700",
            ].join(" ")}
          >
            {status.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
