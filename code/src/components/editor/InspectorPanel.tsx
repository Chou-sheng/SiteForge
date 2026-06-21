"use client";

import type { ChangeEvent, ComponentType } from "react";

import { EmptyState } from "../common/EmptyState";
import { getBlockDefinition } from "../../modules/registry";
import { useEditorStore } from "../../store/editorStore";
import type { BlockInspectorProps, BlockStyle, PageBlock } from "../../types/block";

const fieldClassName = "grid gap-1.5 text-xs font-medium text-slate-600";
const controlClassName = "h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm";

function parseSpacing(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function InspectorPanel() {
  const pageDocument = useEditorStore((state) => state.pageDocument);
  const selectedBlockId = useEditorStore((state) => state.selectedBlockId);
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const selectedBlock = pageDocument?.blocks.find((block) => block.id === selectedBlockId) ?? null;

  if (!pageDocument) {
    return (
      <aside className="min-h-0 h-full border-l border-white/70 bg-white/85 p-4 backdrop-blur" data-testid="inspector-panel">
        <EmptyState description="页面加载后可在此调整模块内容与样式。" title="暂无页面文档" />
      </aside>
    );
  }

  if (!selectedBlock) {
    return (
      <aside className="min-h-0 h-full border-l border-white/70 bg-white/85 p-4 backdrop-blur" data-testid="inspector-panel">
        <EmptyState description="请在画布中选择一个模块后查看属性。" title="未选择模块" />
      </aside>
    );
  }

  const blockId = selectedBlock.id;
  const definition = getBlockDefinition(selectedBlock.type);
  const DefinitionInspector = definition.Inspector as ComponentType<BlockInspectorProps<Record<string, unknown>>>;

  function replaceSelectedBlock(nextBlock: PageBlock) {
    updateBlock(blockId, (currentBlock) => ({
      ...nextBlock,
      id: currentBlock.id,
      type: currentBlock.type,
      variant: currentBlock.variant,
    }));
  }

  function updateStyle<K extends keyof BlockStyle>(key: K, value: BlockStyle[K]) {
    updateBlock(blockId, (currentBlock) => ({
      ...currentBlock,
      style: {
        ...currentBlock.style,
        [key]: value,
      },
    }));
  }

  const handleSpacingChange =
    (key: "paddingTop" | "paddingBottom") => (event: ChangeEvent<HTMLInputElement>) => {
      updateStyle(key, parseSpacing(event.target.value));
    };

  return (
    <aside
      className="min-h-0 h-full overflow-y-auto border-l border-white/70 bg-white/85 backdrop-blur"
      data-testid="inspector-panel"
    >
      <div className="border-b border-slate-100 px-4 py-4">
        <h2 className="text-sm font-semibold text-slate-950">模块属性</h2>
        <p className="mt-1 text-xs text-slate-500">{definition.name}</p>
      </div>

      <div className="space-y-5 p-4">
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500">内容设置</h3>
          <div>
            <DefinitionInspector block={selectedBlock} onChange={replaceSelectedBlock} />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500">共享样式</h3>
          <label className={fieldClassName}>
            背景
            <select
              className={controlClassName}
              onChange={(event) => updateStyle("background", event.target.value as BlockStyle["background"])}
              value={selectedBlock.style.background}
            >
              <option value="default">默认</option>
              <option value="muted">浅色</option>
              <option value="primary">深色</option>
              <option value="gradient">渐变</option>
              <option value="image">图片</option>
            </select>
          </label>
          <label className={fieldClassName}>
            上间距
            <input
              className={controlClassName}
              min={0}
              onChange={handleSpacingChange("paddingTop")}
              type="number"
              value={selectedBlock.style.paddingTop}
            />
          </label>
          <label className={fieldClassName}>
            下间距
            <input
              className={controlClassName}
              min={0}
              onChange={handleSpacingChange("paddingBottom")}
              type="number"
              value={selectedBlock.style.paddingBottom}
            />
          </label>
          <label className={fieldClassName}>
            对齐
            <select
              className={controlClassName}
              onChange={(event) => updateStyle("textAlign", event.target.value as BlockStyle["textAlign"])}
              value={selectedBlock.style.textAlign}
            >
              <option value="left">左对齐</option>
              <option value="center">居中</option>
              <option value="right">右对齐</option>
            </select>
          </label>
          <label className={fieldClassName}>
            容器宽度
            <select
              className={controlClassName}
              onChange={(event) => updateStyle("container", event.target.value as BlockStyle["container"])}
              value={selectedBlock.style.container}
            >
              <option value="full">全宽</option>
              <option value="contained">标准</option>
              <option value="narrow">窄版</option>
            </select>
          </label>
        </section>
      </div>
    </aside>
  );
}
