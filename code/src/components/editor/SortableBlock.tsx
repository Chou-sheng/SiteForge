"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type DragHandleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: (node: HTMLButtonElement | null) => void;
};

type SortableBlockProps = {
  id: string;
  children: (dragHandleProps: DragHandleProps) => ReactNode;
};

export function SortableBlock({ id, children }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const dragHandleProps = {
    ...attributes,
    ...listeners,
    ref: setActivatorNodeRef,
  } as DragHandleProps;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
      }}
    >
      {children(dragHandleProps)}
    </div>
  );
}
