import { beforeEach, describe, expect, test } from "vitest";

import { useEditorStore } from "../../src/store/editorStore";
import { createDefaultBlock } from "../../src/modules/registry";
import type { PageBlock } from "../../src/types/block";
import type { EnterprisePageDocument, EnterpriseTheme, SiteMeta } from "../../src/types/page";

const timestamp = "2026-06-16T09:00:00.000Z";

function createTheme(overrides: Partial<EnterpriseTheme> = {}): EnterpriseTheme {
  return {
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
    ...overrides,
  };
}

function createSiteMeta(overrides: Partial<SiteMeta> = {}): SiteMeta {
  return {
    companyName: "星澜智能",
    industry: "企业服务",
    targetAudience: "企业管理者",
    pageGoal: "lead-generation",
    seoTitle: "星澜智能企业官网",
    seoDescription: "面向企业团队的智能官网",
    keywords: ["AI", "企业官网"],
    ...overrides,
  };
}

function createDocument(blocks: PageBlock[] = []): EnterprisePageDocument {
  return {
    id: "page-demo",
    title: "星澜智能企业官网",
    description: "面向企业团队的智能官网",
    version: 1,
    siteMeta: createSiteMeta(),
    theme: createTheme(),
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

function loadDocument(blocks: PageBlock[] = []) {
  const document = createDocument(blocks);
  useEditorStore.getState().setPageDocument(document);
  return document;
}

describe("editorStore", () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor();
  });

  test("setPageDocument loads a clean document and clears history state", () => {
    const document = createDocument([createDefaultBlock("hero")]);
    useEditorStore.getState().setSaving(true);

    useEditorStore.getState().setPageDocument(document);

    expect(useEditorStore.getState()).toMatchObject({
      pageDocument: document,
      selectedBlockId: null,
      isDirty: false,
      history: [],
      future: [],
      isSaving: false,
    });
    expect(useEditorStore.getState()).not.toHaveProperty("savedDocumentSnapshot");
  });

  test("resetEditor clears public state before a new document establishes a clean baseline", () => {
    const originalDocument = loadDocument([createDefaultBlock("hero")]);
    useEditorStore.getState().addBlock("cta");
    useEditorStore.getState().markSaved();

    useEditorStore.getState().resetEditor();

    expect(useEditorStore.getState()).toMatchObject({
      pageDocument: null,
      selectedBlockId: null,
      viewport: "desktop",
      isDirty: false,
      history: [],
      future: [],
      isSaving: false,
    });
    expect(useEditorStore.getState()).not.toHaveProperty("savedDocumentSnapshot");

    useEditorStore.getState().setPageDocument(originalDocument);
    useEditorStore.getState().addBlock("cta");
    useEditorStore.getState().undo();

    expect(useEditorStore.getState().isDirty).toBe(false);
  });

  test("addBlock creates a default block, appends it, selects it, and records history", () => {
    const document = loadDocument();

    useEditorStore.getState().addBlock("hero", "centered");

    const state = useEditorStore.getState();
    const addedBlock = state.pageDocument?.blocks[0];
    expect(addedBlock).toMatchObject({ type: "hero", variant: "centered" });
    expect(state.selectedBlockId).toBe(addedBlock?.id);
    expect(state.history).toEqual([document]);
    expect(state.future).toEqual([]);
    expect(state.isDirty).toBe(true);
  });

  test("replacePageDocument records generated page changes as dirty and undoable", () => {
    const originalHero = createDefaultBlock("hero");
    const generatedCta = createDefaultBlock("cta");
    const originalDocument = loadDocument([originalHero]);
    const generatedDocument = createDocument([generatedCta]);

    useEditorStore.getState().replacePageDocument(generatedDocument);

    const changedState = useEditorStore.getState();
    expect(changedState.pageDocument).toEqual(generatedDocument);
    expect(changedState.history).toEqual([originalDocument]);
    expect(changedState.future).toEqual([]);
    expect(changedState.isDirty).toBe(true);

    useEditorStore.getState().undo();

    const undoneState = useEditorStore.getState();
    expect(undoneState.pageDocument).toEqual(originalDocument);
    expect(undoneState.isDirty).toBe(false);
  });

  test("updateBlock accepts object and function updates, validates the result, and records history", () => {
    const hero = createDefaultBlock("hero");
    loadDocument([hero]);

    useEditorStore.getState().updateBlock(hero.id, { name: "新版首屏" });
    useEditorStore.getState().updateBlock(hero.id, (block) => ({
      ...block,
      style: { ...block.style, paddingTop: 120 },
    }));

    const state = useEditorStore.getState();
    expect(state.pageDocument?.blocks[0].name).toBe("新版首屏");
    expect(state.pageDocument?.blocks[0].style.paddingTop).toBe(120);
    expect(state.history).toHaveLength(2);
    expect(state.isDirty).toBe(true);
  });

  test("updateBlock ignores semantic no-op updates without recording history", () => {
    const hero = createDefaultBlock("hero");
    loadDocument([hero]);

    useEditorStore.getState().updateBlock(hero.id, { name: hero.name });
    useEditorStore.getState().updateBlock(hero.id, (block) => ({ ...block }));

    const state = useEditorStore.getState();
    expect(state.pageDocument?.blocks).toEqual([hero]);
    expect(state.history).toEqual([]);
    expect(state.isDirty).toBe(false);
  });

  test("updateBlock rejects id changes that would duplicate another block id", () => {
    const hero = createDefaultBlock("hero");
    const cta = createDefaultBlock("cta");
    loadDocument([hero, cta]);

    expect(() => {
      useEditorStore.getState().updateBlock(hero.id, { id: cta.id });
    }).toThrow(/区块数据无效/);

    const state = useEditorStore.getState();
    expect(state.pageDocument?.blocks.map((block) => block.id)).toEqual([hero.id, cta.id]);
    expect(new Set(state.pageDocument?.blocks.map((block) => block.id)).size).toBe(2);
    expect(state.history).toEqual([]);
    expect(state.isDirty).toBe(false);
  });

  test("updateBlock rejects block identity type changes", () => {
    const hero = createDefaultBlock("hero");
    loadDocument([hero]);

    expect(() => {
      useEditorStore.getState().updateBlock(hero.id, { type: "cta" });
    }).toThrow(/区块数据无效/);

    const state = useEditorStore.getState();
    expect(state.pageDocument?.blocks[0]).toMatchObject({ id: hero.id, type: "hero" });
    expect(state.history).toEqual([]);
    expect(state.isDirty).toBe(false);
  });

  test("updateBlock rejects block identity variant changes", () => {
    const hero = createDefaultBlock("hero");
    const cta = createDefaultBlock("cta");
    loadDocument([hero, cta]);
    const originalVariant = hero.variant;

    expect(() => {
      useEditorStore.getState().updateBlock(hero.id, { variant: "centered" });
    }).toThrow(/区块数据无效/);

    const state = useEditorStore.getState();
    const blocks = state.pageDocument?.blocks ?? [];
    expect(blocks[0]).toMatchObject({ id: hero.id, type: "hero", variant: originalVariant });
    expect(blocks[1]).toMatchObject({ id: cta.id, type: "cta", variant: cta.variant });
    expect(new Set(blocks.map((block) => block.id)).size).toBe(2);
    expect(state.history).toEqual([]);
    expect(state.isDirty).toBe(false);
  });

  test("updateBlock throws a Chinese validation error for invalid block data", () => {
    const hero = createDefaultBlock("hero");
    loadDocument([hero]);

    let thrownError: unknown;
    expect(() => {
      useEditorStore.getState().updateBlock(hero.id, { props: {} });
    }).toThrow(/区块数据无效/);

    try {
      useEditorStore.getState().updateBlock(hero.id, { props: {} });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(Error);
    expect((thrownError as Error).cause).toBeDefined();
  });

  test("removeBlock deletes a block, clears selectedBlockId when needed, and records history", () => {
    const hero = createDefaultBlock("hero");
    const cta = createDefaultBlock("cta");
    loadDocument([hero, cta]);
    useEditorStore.getState().selectBlock(hero.id);

    useEditorStore.getState().removeBlock(hero.id);

    const state = useEditorStore.getState();
    expect(state.pageDocument?.blocks.map((block) => block.id)).toEqual([cta.id]);
    expect(state.selectedBlockId).toBeNull();
    expect(state.history).toHaveLength(1);
    expect(state.isDirty).toBe(true);
  });

  test("duplicateBlock deep clones a block with a new id, copy name, insertion position, and selection", () => {
    const hero = createDefaultBlock("hero");
    const cta = createDefaultBlock("cta");
    loadDocument([hero, cta]);

    useEditorStore.getState().duplicateBlock(hero.id);

    const state = useEditorStore.getState();
    const [original, copy, following] = state.pageDocument?.blocks ?? [];
    expect(original.id).toBe(hero.id);
    expect(copy.id).not.toBe(hero.id);
    expect(copy.name).toBe(`${hero.name} 副本`);
    expect(copy.props).toEqual(hero.props);
    expect(copy.props).not.toBe(hero.props);
    expect(following.id).toBe(cta.id);
    expect(state.selectedBlockId).toBe(copy.id);
    expect(state.history).toHaveLength(1);
  });

  test("moveBlock moves a block up or down within bounds and records each actual move", () => {
    const hero = createDefaultBlock("hero");
    const cta = createDefaultBlock("cta");
    const footer = createDefaultBlock("footer");
    loadDocument([hero, cta, footer]);

    useEditorStore.getState().moveBlock(cta.id, "up");
    useEditorStore.getState().selectBlock(cta.id);
    useEditorStore.getState().moveBlock(cta.id, "down");
    useEditorStore.getState().moveBlock(footer.id, "down");

    const state = useEditorStore.getState();
    expect(state.pageDocument?.blocks.map((block) => block.id)).toEqual([hero.id, cta.id, footer.id]);
    expect(state.selectedBlockId).toBe(cta.id);
    expect(state.history).toHaveLength(2);
  });

  test("reorderBlocks moves a block by index and ignores out-of-range indexes", () => {
    const hero = createDefaultBlock("hero");
    const cta = createDefaultBlock("cta");
    const footer = createDefaultBlock("footer");
    loadDocument([hero, cta, footer]);

    useEditorStore.getState().selectBlock(hero.id);
    useEditorStore.getState().reorderBlocks(0, 2);
    useEditorStore.getState().reorderBlocks(-1, 1);

    const state = useEditorStore.getState();
    expect(state.pageDocument?.blocks.map((block) => block.id)).toEqual([cta.id, footer.id, hero.id]);
    expect(state.selectedBlockId).toBe(hero.id);
    expect(state.history).toHaveLength(1);
  });

  test("history snapshots are isolated from loaded documents and later current mutations", () => {
    const hero = createDefaultBlock("hero");
    const loadedDocument = loadDocument([hero]);

    useEditorStore.getState().addBlock("cta");
    const firstHistorySnapshot = useEditorStore.getState().history[0];
    loadedDocument.blocks[0] = { ...loadedDocument.blocks[0], name: "外部改名" };
    useEditorStore.getState().updateBlock(hero.id, { name: "当前改名" });

    const state = useEditorStore.getState();
    expect(firstHistorySnapshot).not.toBe(loadedDocument);
    expect(firstHistorySnapshot).not.toBe(state.pageDocument);
    expect(firstHistorySnapshot.blocks[0].name).toBe(hero.name);
    expect(state.history[0].blocks[0].name).toBe(hero.name);
    expect(state.history[1].blocks[0].name).toBe(hero.name);
    expect(state.pageDocument?.blocks[0].name).toBe("当前改名");
  });

  test("future snapshots are isolated from current documents and later redo mutations", () => {
    const hero = createDefaultBlock("hero");
    loadDocument([hero]);
    useEditorStore.getState().addBlock("cta");
    const changedDocument = useEditorStore.getState().pageDocument;

    useEditorStore.getState().undo();
    const futureSnapshot = useEditorStore.getState().future[0];
    useEditorStore.getState().redo();
    useEditorStore.getState().updateBlock(hero.id, { name: "重做后改名" });

    const state = useEditorStore.getState();
    expect(futureSnapshot).not.toBe(changedDocument);
    expect(futureSnapshot).not.toBe(state.pageDocument);
    expect(futureSnapshot.blocks.map((block) => block.id)).toEqual(changedDocument?.blocks.map((block) => block.id));
    expect(futureSnapshot.blocks[0].name).toBe(hero.name);
    expect(state.pageDocument?.blocks[0].name).toBe("重做后改名");
  });

  test("selectBlock and setViewport update editor-only state without marking dirty", () => {
    const hero = createDefaultBlock("hero");
    loadDocument([hero]);

    useEditorStore.getState().selectBlock(hero.id);
    useEditorStore.getState().setViewport("mobile");

    expect(useEditorStore.getState()).toMatchObject({
      selectedBlockId: hero.id,
      viewport: "mobile",
      isDirty: false,
      history: [],
    });
  });

  test("selectBlock stores null for unknown block ids", () => {
    const hero = createDefaultBlock("hero");
    loadDocument([hero]);

    useEditorStore.getState().selectBlock("missing-block");

    expect(useEditorStore.getState().selectedBlockId).toBeNull();
  });

  test("updateTheme replaces document theme and records history", () => {
    const document = loadDocument();
    const theme = createTheme({ colorTokens: { ...document.theme.colorTokens, primary: "#0066CC" } });

    useEditorStore.getState().updateTheme(theme);

    const state = useEditorStore.getState();
    expect(state.pageDocument?.theme).toEqual(theme);
    expect(state.history).toEqual([document]);
    expect(state.isDirty).toBe(true);
  });

  test("updateSiteMeta replaces document metadata and records history", () => {
    const document = loadDocument();
    const siteMeta = createSiteMeta({ companyName: "云帆科技", keywords: ["云帆", "智能建站"] });

    useEditorStore.getState().updateSiteMeta(siteMeta);

    const state = useEditorStore.getState();
    expect(state.pageDocument?.siteMeta).toEqual(siteMeta);
    expect(state.history).toEqual([document]);
    expect(state.isDirty).toBe(true);
  });

  test("undo restores the previous document and moves current document to future", () => {
    const hero = createDefaultBlock("hero");
    const document = loadDocument([hero]);
    useEditorStore.getState().addBlock("cta");

    useEditorStore.getState().undo();

    const state = useEditorStore.getState();
    expect(state.pageDocument).toEqual(document);
    expect(state.history).toEqual([]);
    expect(state.future).toHaveLength(1);
    expect(state.isDirty).toBe(false);
  });

  test("redo restores the next future document and moves current document to history", () => {
    const hero = createDefaultBlock("hero");
    const document = loadDocument([hero]);
    useEditorStore.getState().addBlock("cta");
    const changedDocument = useEditorStore.getState().pageDocument;
    useEditorStore.getState().undo();

    useEditorStore.getState().redo();

    const state = useEditorStore.getState();
    expect(state.pageDocument).toEqual(changedDocument);
    expect(state.history).toEqual([document]);
    expect(state.future).toEqual([]);
    expect(state.isDirty).toBe(true);
  });

  test("redo to the saved snapshot leaves dirty false", () => {
    loadDocument([createDefaultBlock("hero")]);
    useEditorStore.getState().addBlock("cta");
    const savedDocument = useEditorStore.getState().pageDocument;
    useEditorStore.getState().markSaved();
    useEditorStore.getState().undo();

    useEditorStore.getState().redo();

    const state = useEditorStore.getState();
    expect(state.pageDocument).toEqual(savedDocument);
    expect(state.isDirty).toBe(false);
  });

  test("markSaved after undo records the undone document as the clean baseline", () => {
    const originalDocument = loadDocument([createDefaultBlock("hero")]);
    useEditorStore.getState().addBlock("cta");
    useEditorStore.getState().undo();

    useEditorStore.getState().markSaved();
    useEditorStore.getState().redo();
    useEditorStore.getState().undo();

    const state = useEditorStore.getState();
    expect(state.pageDocument).toEqual(originalDocument);
    expect(state.isDirty).toBe(false);
  });

  test("markSaved clears dirty state while saving flag stays editor-only", () => {
    loadDocument();
    useEditorStore.getState().addBlock("hero");
    useEditorStore.getState().setSaving(true);

    useEditorStore.getState().markSaved();

    expect(useEditorStore.getState()).toMatchObject({
      isDirty: false,
      isSaving: true,
    });
  });
});
