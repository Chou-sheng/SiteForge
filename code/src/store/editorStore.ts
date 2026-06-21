import { create } from "zustand";

import { createId } from "../lib/utils/id";
import { pageBlockSchema, pageDocumentSchema } from "../lib/validation/pageSchema";
import { createDefaultBlock } from "../modules/registry";
import type { BlockType, PageBlock } from "../types/block";
import type { EnterprisePageDocument, EnterpriseTheme, SiteMeta } from "../types/page";

export type EditorViewport = "desktop" | "tablet" | "mobile";

export type EditorStoreState = {
  pageDocument: EnterprisePageDocument | null;
  selectedBlockId: string | null;
  viewport: EditorViewport;
  isDirty: boolean;
  history: EnterprisePageDocument[];
  future: EnterprisePageDocument[];
  isSaving: boolean;
};

export type EditorStoreActions = {
  setPageDocument: (document: EnterprisePageDocument) => void;
  replacePageDocument: (document: EnterprisePageDocument) => void;
  addBlock: (type: BlockType, variant?: string) => void;
  updateBlock: (
    blockId: string,
    updates: Partial<PageBlock> | ((block: PageBlock) => PageBlock),
  ) => void;
  removeBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  moveBlock: (blockId: string, direction: "up" | "down") => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  selectBlock: (blockId: string | null) => void;
  setViewport: (viewport: EditorViewport) => void;
  updateTheme: (theme: EnterpriseTheme) => void;
  updateSiteMeta: (siteMeta: SiteMeta) => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
  resetEditor: () => void;
  setSaving: (isSaving: boolean) => void;
};

export type EditorStore = EditorStoreState & EditorStoreActions;

const initialState: EditorStoreState = {
  pageDocument: null,
  selectedBlockId: null,
  viewport: "desktop",
  isDirty: false,
  history: [],
  future: [],
  isSaving: false,
};

function cloneValue<T>(value: T): T {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function isValidIndex(index: number, length: number) {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function documentsEqual(
  document: EnterprisePageDocument | null,
  savedDocumentSnapshot: EnterprisePageDocument | null,
) {
  if (!document || !savedDocumentSnapshot) {
    return document === savedDocumentSnapshot;
  }

  return JSON.stringify(document) === JSON.stringify(savedDocumentSnapshot);
}

function selectedBlockStillExists(document: EnterprisePageDocument | null, selectedBlockId: string | null) {
  if (!document || !selectedBlockId) {
    return null;
  }

  return document.blocks.some((block) => block.id === selectedBlockId) ? selectedBlockId : null;
}

function createInvalidBlockError(cause: unknown) {
  return new Error("区块数据无效，请检查模块配置。", { cause });
}

function createInvalidPageDocumentError(cause: unknown) {
  return new Error("页面文档无效，请检查生成结果。", { cause });
}

function assertStableBlockIdentity(currentBlock: PageBlock, candidateBlock: PageBlock) {
  if (
    candidateBlock.id !== currentBlock.id ||
    candidateBlock.type !== currentBlock.type ||
    candidateBlock.variant !== currentBlock.variant
  ) {
    throw createInvalidBlockError(new Error("区块身份字段不可修改。"));
  }
}

export const useEditorStore = create<EditorStore>((set, get) => {
  let savedDocumentSnapshot: EnterprisePageDocument | null = null;

  function commitDocument(
    updater: (document: EnterprisePageDocument) => EnterprisePageDocument | null,
    selectedBlockId?: string | null,
  ) {
    const currentDocument = get().pageDocument;
    if (!currentDocument) {
      return;
    }

    const previousDocument = cloneValue(currentDocument);
    const nextDocument = updater(cloneValue(currentDocument));
    if (!nextDocument) {
      return;
    }
    if (documentsEqual(nextDocument, currentDocument)) {
      return;
    }

    const nextSelectedBlockId =
      selectedBlockId === undefined
        ? selectedBlockStillExists(nextDocument, get().selectedBlockId)
        : selectedBlockId;

    set((state) => ({
      pageDocument: nextDocument,
      selectedBlockId: selectedBlockStillExists(nextDocument, nextSelectedBlockId),
      history: [...state.history, previousDocument],
      future: [],
      isDirty: !documentsEqual(nextDocument, savedDocumentSnapshot),
    }));
  }

  return {
    ...initialState,

    setPageDocument: (document) => {
      const documentSnapshot = cloneValue(document);

      set({
        pageDocument: documentSnapshot,
        selectedBlockId: null,
        isDirty: false,
        history: [],
        future: [],
        isSaving: false,
      });
      savedDocumentSnapshot = cloneValue(documentSnapshot);
    },

    replacePageDocument: (document) => {
      const result = pageDocumentSchema.safeParse(cloneValue(document));

      if (!result.success) {
        throw createInvalidPageDocumentError(result.error);
      }

      commitDocument(() => result.data as EnterprisePageDocument);
    },

    addBlock: (type, variant) => {
      const block = createDefaultBlock(type, variant);
      commitDocument((document) => ({
        ...document,
        blocks: [...document.blocks, block],
      }), block.id);
    },

    updateBlock: (blockId, updates) => {
      commitDocument((document) => {
        const blockIndex = document.blocks.findIndex((block) => block.id === blockId);
        if (blockIndex === -1) {
          return null;
        }

        const currentBlock = document.blocks[blockIndex];
        const candidateBlock =
          typeof updates === "function" ? updates(cloneValue(currentBlock)) : { ...currentBlock, ...updates };
        assertStableBlockIdentity(currentBlock, candidateBlock);
        const result = pageBlockSchema.safeParse(candidateBlock);

        if (!result.success) {
          throw createInvalidBlockError(result.error);
        }

        const blocks = document.blocks.slice();
        blocks[blockIndex] = result.data as PageBlock;

        return {
          ...document,
          blocks,
        };
      });
    },

    removeBlock: (blockId) => {
      commitDocument((document) => {
        if (!document.blocks.some((block) => block.id === blockId)) {
          return null;
        }

        return {
          ...document,
          blocks: document.blocks.filter((block) => block.id !== blockId),
        };
      }, get().selectedBlockId === blockId ? null : undefined);
    },

    duplicateBlock: (blockId) => {
      const currentDocument = get().pageDocument;
      const originalBlock = currentDocument?.blocks.find((block) => block.id === blockId);
      const duplicatedBlockId = originalBlock ? createId(`block-${originalBlock.type}`) : null;

      commitDocument((document) => {
        const blockIndex = document.blocks.findIndex((block) => block.id === blockId);
        if (blockIndex === -1 || !duplicatedBlockId) {
          return null;
        }

        const blockToDuplicate = document.blocks[blockIndex];
        const duplicatedBlock = {
          ...cloneValue(blockToDuplicate),
          id: duplicatedBlockId,
          name: blockToDuplicate.name ? `${blockToDuplicate.name} 副本` : blockToDuplicate.name,
        };

        const blocks = document.blocks.slice();
        blocks.splice(blockIndex + 1, 0, pageBlockSchema.parse(duplicatedBlock) as PageBlock);

        return {
          ...document,
          blocks,
        };
      }, duplicatedBlockId);
    },

    moveBlock: (blockId, direction) => {
      commitDocument((document) => {
        const fromIndex = document.blocks.findIndex((block) => block.id === blockId);
        const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;

        if (!isValidIndex(fromIndex, document.blocks.length) || !isValidIndex(toIndex, document.blocks.length)) {
          return null;
        }

        const blocks = document.blocks.slice();
        const [movedBlock] = blocks.splice(fromIndex, 1);
        blocks.splice(toIndex, 0, movedBlock);

        return {
          ...document,
          blocks,
        };
      });
    },

    reorderBlocks: (fromIndex, toIndex) => {
      commitDocument((document) => {
        if (
          fromIndex === toIndex ||
          !isValidIndex(fromIndex, document.blocks.length) ||
          !isValidIndex(toIndex, document.blocks.length)
        ) {
          return null;
        }

        const blocks = document.blocks.slice();
        const [movedBlock] = blocks.splice(fromIndex, 1);
        blocks.splice(toIndex, 0, movedBlock);

        return {
          ...document,
          blocks,
        };
      });
    },

    selectBlock: (blockId) => {
      set((state) => ({
        selectedBlockId: selectedBlockStillExists(state.pageDocument, blockId),
      }));
    },

    setViewport: (viewport) => {
      set({ viewport });
    },

    updateTheme: (theme) => {
      commitDocument((document) => ({
        ...document,
        theme: cloneValue(theme),
      }));
    },

    updateSiteMeta: (siteMeta) => {
      commitDocument((document) => ({
        ...document,
        siteMeta: cloneValue(siteMeta),
      }));
    },

    undo: () => {
      const { history, pageDocument } = get();
      if (!pageDocument || history.length === 0) {
        return;
      }

      const previousDocument = history[history.length - 1];
      const nextHistory = history.slice(0, -1);

      set((state) => ({
        pageDocument: cloneValue(previousDocument),
        selectedBlockId: selectedBlockStillExists(previousDocument, state.selectedBlockId),
        history: nextHistory,
        future: [cloneValue(pageDocument), ...state.future],
        isDirty: !documentsEqual(previousDocument, savedDocumentSnapshot),
      }));
    },

    redo: () => {
      const { future, pageDocument } = get();
      if (!pageDocument || future.length === 0) {
        return;
      }

      const nextDocument = future[0];
      const nextFuture = future.slice(1);

      set((state) => ({
        pageDocument: cloneValue(nextDocument),
        selectedBlockId: selectedBlockStillExists(nextDocument, state.selectedBlockId),
        history: [...state.history, cloneValue(pageDocument)],
        future: nextFuture,
        isDirty: !documentsEqual(nextDocument, savedDocumentSnapshot),
      }));
    },

    markSaved: () => {
      const pageDocument = get().pageDocument;
      savedDocumentSnapshot = pageDocument ? cloneValue(pageDocument) : null;
      set({ isDirty: false });
    },

    resetEditor: () => {
      savedDocumentSnapshot = null;
      set({ ...initialState });
    },

    setSaving: (isSaving) => {
      set({ isSaving });
    },
  };
});
