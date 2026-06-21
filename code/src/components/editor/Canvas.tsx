"use client";

import {
  DndContext,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { EmptyState } from "../common/EmptyState";
import { PageRenderer } from "../page-renderer/PageRenderer";
import { useEditorStore } from "../../store/editorStore";
import { CanvasBlock } from "./CanvasBlock";
import { SortableBlock } from "./SortableBlock";

export function Canvas() {
  const pageDocument = useEditorStore((state) => state.pageDocument);
  const selectedBlockId = useEditorStore((state) => state.selectedBlockId);
  const selectBlock = useEditorStore((state) => state.selectBlock);
  const moveBlock = useEditorStore((state) => state.moveBlock);
  const duplicateBlock = useEditorStore((state) => state.duplicateBlock);
  const removeBlock = useEditorStore((state) => state.removeBlock);
  const reorderBlocks = useEditorStore((state) => state.reorderBlocks);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  if (!pageDocument) {
    return (
      <EmptyState
        className="h-full"
        description="请先加载页面，或从模块库添加新的页面内容。"
        title="暂无页面内容"
      />
    );
  }

  const visibleBlocks = pageDocument.blocks.filter((block) => block.visibility.desktop !== false);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id || !pageDocument) {
      return;
    }

    const fromIndex = pageDocument.blocks.findIndex((block) => block.id === active.id);
    const toIndex = pageDocument.blocks.findIndex((block) => block.id === over.id);

    reorderBlocks(fromIndex, toIndex);
  }

  if (visibleBlocks.length === 0) {
    return (
      <EmptyState
        className="h-full"
        description="当前视口下没有可见模块，请在右侧属性面板调整显示设置。"
        title="当前视口暂无可见模块"
      />
    );
  }

  return (
    <div className="min-h-0 h-full overflow-auto bg-transparent p-6" data-testid="editor-canvas-scroll">
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext items={visibleBlocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
          <PageRenderer
            className="mx-auto max-w-[1240px] overflow-hidden rounded-[22px] bg-white shadow-[0_24px_70px_rgba(16,24,40,0.16)]"
            document={pageDocument}
            mode="editor"
            renderBlockWrapper={(block, renderedBlock) => {
              const blockIndex = pageDocument.blocks.findIndex((candidate) => candidate.id === block.id);

              return (
                <SortableBlock id={block.id} key={block.id}>
                  {(dragHandleProps) => (
                    <CanvasBlock
                      block={block}
                      canMoveDown={blockIndex < pageDocument.blocks.length - 1}
                      canMoveUp={blockIndex > 0}
                      dragHandleProps={dragHandleProps}
                      onDuplicate={() => duplicateBlock(block.id)}
                      onMoveDown={() => moveBlock(block.id, "down")}
                      onMoveUp={() => moveBlock(block.id, "up")}
                      onRemove={() => removeBlock(block.id)}
                      onSelect={() => selectBlock(block.id)}
                      selected={selectedBlockId === block.id}
                    >
                      {renderedBlock}
                    </CanvasBlock>
                  )}
                </SortableBlock>
              );
            }}
            viewport="desktop"
          />
        </SortableContext>
      </DndContext>
    </div>
  );
}
