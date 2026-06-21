"use client";

import Link from "next/link";
import { ArrowLeft, Download, Eye, Redo2, Save, Send, Sparkles, Undo2, Wand2 } from "lucide-react";

type TopToolbarProps = {
  pageTitle: string;
  isDirty?: boolean;
  isSaving?: boolean;
  hasSelectedBlock: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onPreview: () => void;
  onGenerate: () => void;
  onEditCurrentBlock: () => void;
  onExportHtml: () => void;
  onPublish: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

type ToolbarButtonProps = {
  label: string;
  icon: typeof Save;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
};

function ToolbarButton({ label, icon: Icon, onClick, disabled, primary }: ToolbarButtonProps) {
  return (
    <button
      className={[
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition",
        primary
          ? "border-transparent bg-gradient-to-r from-cyan-500 via-violet-600 to-pink-500 text-white shadow-lg shadow-violet-500/20 hover:brightness-105"
          : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700",
        disabled ? "cursor-not-allowed opacity-45 hover:bg-white" : "",
      ].join(" ")}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {label}
    </button>
  );
}

export function TopToolbar({
  pageTitle,
  isDirty,
  isSaving,
  hasSelectedBlock,
  canUndo,
  canRedo,
  onSave,
  onPreview,
  onGenerate,
  onEditCurrentBlock,
  onExportHtml,
  onPublish,
  onUndo,
  onRedo,
}: TopToolbarProps) {
  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-white/70 bg-white/85 px-4 shadow-sm backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700"
          href="/dashboard"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          返回页面管理
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">{pageTitle}</p>
          <p className="text-xs text-slate-500">{isSaving ? "正在保存" : isDirty ? "有未保存修改" : "已保存"}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <ToolbarButton disabled={!canUndo} icon={Undo2} label="撤销" onClick={onUndo} />
        <ToolbarButton disabled={!canRedo} icon={Redo2} label="重做" onClick={onRedo} />
        <ToolbarButton disabled={isSaving} icon={Save} label="保存" onClick={onSave} primary />
        <ToolbarButton icon={Eye} label="预览" onClick={onPreview} />
        <ToolbarButton icon={Sparkles} label="智能生成" onClick={onGenerate} />
        <ToolbarButton
          disabled={!hasSelectedBlock}
          icon={Wand2}
          label="智能修改模块"
          onClick={onEditCurrentBlock}
        />
        <ToolbarButton icon={Download} label="导出 HTML" onClick={onExportHtml} />
        <ToolbarButton icon={Send} label="发布静态站点" onClick={onPublish} />
      </div>
    </header>
  );
}
