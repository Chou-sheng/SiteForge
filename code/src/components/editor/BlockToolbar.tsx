"use client";

import type { MouseEvent } from "react";
import { ArrowDown, ArrowUp, Copy, Trash2 } from "lucide-react";

type BlockToolbarProps = {
  blockName: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
};

function stopAndRun(event: MouseEvent<HTMLButtonElement>, callback: () => void) {
  event.stopPropagation();
  callback();
}

export function BlockToolbar({
  blockName,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
}: BlockToolbarProps) {
  return (
    <div className="absolute left-0 top-0 z-10 flex h-9 max-w-full items-center gap-1 bg-slate-950 px-2 text-white">
      <span className="max-w-48 truncate px-1 text-xs font-medium">{blockName}</span>
      <button
        aria-label="上移"
        className="inline-flex h-7 w-7 items-center justify-center hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canMoveUp}
        onClick={(event) => stopAndRun(event, onMoveUp)}
        type="button"
      >
        <ArrowUp aria-hidden="true" className="h-4 w-4" />
      </button>
      <button
        aria-label="下移"
        className="inline-flex h-7 w-7 items-center justify-center hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canMoveDown}
        onClick={(event) => stopAndRun(event, onMoveDown)}
        type="button"
      >
        <ArrowDown aria-hidden="true" className="h-4 w-4" />
      </button>
      <button
        aria-label="复制"
        className="inline-flex h-7 w-7 items-center justify-center hover:bg-white/15"
        onClick={(event) => stopAndRun(event, onDuplicate)}
        type="button"
      >
        <Copy aria-hidden="true" className="h-4 w-4" />
      </button>
      <button
        aria-label="删除"
        className="inline-flex h-7 w-7 items-center justify-center hover:bg-white/15"
        onClick={(event) => stopAndRun(event, onRemove)}
        type="button"
      >
        <Trash2 aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
