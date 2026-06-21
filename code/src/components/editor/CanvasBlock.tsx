"use client";

import type { ReactNode } from "react";
import { GripVertical } from "lucide-react";

import type { PageBlock } from "../../types/block";
import { BlockToolbar } from "./BlockToolbar";
import type { DragHandleProps } from "./SortableBlock";

type CanvasBlockProps = {
  block: PageBlock;
  selected: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  children: ReactNode;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  dragHandleProps: DragHandleProps;
};

export function CanvasBlock({
  block,
  selected,
  canMoveUp,
  canMoveDown,
  children,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  dragHandleProps,
}: CanvasBlockProps) {
  return (
    <div
      aria-label={`选择模块 ${block.name}`}
      data-selected={selected ? "true" : "false"}
      className={[
        "group relative border bg-white outline-none transition",
        selected ? "border-violet-500 ring-4 ring-violet-500/20" : "border-transparent hover:border-violet-200",
      ].join(" ")}
      onClick={onSelect}
    >
      <button
        {...dragHandleProps}
        aria-label={`拖拽排序 ${block.name}`}
        className="absolute right-2 top-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 opacity-0 shadow-sm transition hover:bg-violet-50 hover:text-violet-700 focus:opacity-100 group-hover:opacity-100"
        onClick={(event) => event.stopPropagation()}
        type="button"
      >
        <GripVertical aria-hidden="true" className="h-4 w-4" />
      </button>
      <button
        aria-label={`选中 ${block.name}`}
        className="absolute right-12 top-2 z-20 inline-flex h-8 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 opacity-0 shadow-sm transition hover:bg-violet-50 hover:text-violet-700 focus:opacity-100 group-hover:opacity-100"
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        type="button"
      >
        选中
      </button>
      {selected ? (
        <BlockToolbar
          blockName={block.name}
          canMoveDown={canMoveDown}
          canMoveUp={canMoveUp}
          onDuplicate={onDuplicate}
          onMoveDown={onMoveDown}
          onMoveUp={onMoveUp}
          onRemove={onRemove}
        />
      ) : null}
      <div className={selected ? "pt-9" : ""}>{children}</div>
    </div>
  );
}
