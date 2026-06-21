import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { randomUUID } from "crypto";

import type { EnterprisePageDocument, PageRecord } from "../../types/page";
import { createSlug, ensureUniqueSlug } from "../utils/slug";
import { pageRecordSchema } from "../validation/pageSchema";

const pageRecordsSchema = pageRecordSchema.array();
let pageStoreFilePathForTests: string | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function getDefaultPageStoreFilePath() {
  const desktopDataDirectory = process.env.DESKTOP_APP_DATA_DIR;

  return desktopDataDirectory
    ? join(desktopDataDirectory, "data", "pages.json")
    : join(process.cwd(), "data", "pages.json");
}

function getPageStoreFilePath() {
  return pageStoreFilePathForTests ?? getDefaultPageStoreFilePath();
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function ensureStoreDirectory(filePath: string) {
  await mkdir(dirname(filePath), { recursive: true });
}

async function readPagesFromFile() {
  const filePath = getPageStoreFilePath();

  try {
    const rawStore = await readFile(filePath, "utf8");
    return pageRecordsSchema.parse(JSON.parse(rawStore)) as PageRecord[];
  } catch (error) {
    if (isMissingFileError(error)) {
      await ensureStoreDirectory(filePath);
      await writeFile(filePath, "[]\n", "utf8");
      return [];
    }

    throw error;
  }
}

async function writePagesToFile(pages: PageRecord[]) {
  const filePath = getPageStoreFilePath();
  const validatedPages = pageRecordsSchema.parse(pages);

  await ensureStoreDirectory(filePath);
  await writeFile(filePath, `${JSON.stringify(validatedPages, null, 2)}\n`, "utf8");
}

function queueWrite<T>(operation: () => Promise<T>) {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function createMissingPageError(pageId: string) {
  return new Error(`页面不存在：${pageId}`);
}

function createDuplicatePageError(pageId: string) {
  return new Error(`页面已存在：${pageId}`);
}

function createMismatchedPageIdError(pageId: string, documentId: string) {
  return new Error(`页面 ID 不一致：${pageId} 与 ${documentId}`);
}

function createBlankPageTitleError() {
  return new Error("页面名称不能为空");
}

function createDraftRecord(document: EnterprisePageDocument): PageRecord {
  return pageRecordSchema.parse({
    id: document.id,
    status: "DRAFT",
    document,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  });
}

function createBlankPageDocument(timestamp: string): EnterprisePageDocument {
  return {
    id: randomUUID(),
    title: "未命名页面",
    description: "从空白画布开始编辑。",
    version: 1,
    siteMeta: {
      companyName: "未命名公司",
      industry: "自定义页面",
      targetAudience: "目标客户",
      pageGoal: "brand-display",
      seoTitle: "未命名页面",
      seoDescription: "从空白画布开始编辑。",
      keywords: ["空白页面"],
    },
    theme: {
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
    },
    layout: {
      maxWidth: "1200px",
      contentDensity: "comfortable",
      responsiveMode: "enterprise",
    },
    blocks: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function listPages(): Promise<PageRecord[]> {
  await writeQueue;
  return readPagesFromFile();
}

export async function createBlankPage(): Promise<PageRecord> {
  const timestamp = new Date().toISOString();
  return createPage(createBlankPageDocument(timestamp));
}

export async function createPage(document: EnterprisePageDocument): Promise<PageRecord> {
  return queueWrite(async () => {
    const pages = await readPagesFromFile();

    if (pages.some((page) => page.id === document.id)) {
      throw createDuplicatePageError(document.id);
    }

    const record = createDraftRecord(document);

    await writePagesToFile([...pages, record]);

    return record;
  });
}

export async function renamePage(pageId: string, title: string): Promise<PageRecord> {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw createBlankPageTitleError();
  }

  return queueWrite(async () => {
    const pages = await readPagesFromFile();
    const pageIndex = pages.findIndex((page) => page.id === pageId);

    if (pageIndex === -1) {
      throw createMissingPageError(pageId);
    }

    const timestamp = new Date().toISOString();
    const previousPage = pages[pageIndex];
    const updatedDocument: EnterprisePageDocument = {
      ...previousPage.document,
      title: trimmedTitle,
      siteMeta: {
        ...previousPage.document.siteMeta,
        seoTitle: trimmedTitle,
      },
      updatedAt: timestamp,
    };
    const updatedRecord = pageRecordSchema.parse({
      ...previousPage,
      document: updatedDocument,
      updatedAt: timestamp,
    });
    const updatedPages = pages.toSpliced(pageIndex, 1, updatedRecord);

    await writePagesToFile(updatedPages);

    return updatedRecord;
  });
}

export async function getPageById(pageId: string): Promise<PageRecord | null> {
  const pages = await listPages();
  return pages.find((page) => page.id === pageId) ?? null;
}

export async function updatePage(
  pageId: string,
  document: EnterprisePageDocument,
): Promise<PageRecord> {
  return queueWrite(async () => {
    const pages = await readPagesFromFile();
    const pageIndex = pages.findIndex((page) => page.id === pageId);

    if (pageIndex === -1) {
      throw createMissingPageError(pageId);
    }

    if (document.id !== pageId) {
      throw createMismatchedPageIdError(pageId, document.id);
    }

    const previousPage = pages[pageIndex];
    const updatedRecord = pageRecordSchema.parse({
      id: document.id,
      status: previousPage.status,
      document,
      createdAt: previousPage.createdAt,
      updatedAt: document.updatedAt,
      publishedAt: previousPage.publishedAt,
    });
    const updatedPages = pages.toSpliced(pageIndex, 1, updatedRecord);

    await writePagesToFile(updatedPages);

    return updatedRecord;
  });
}

export async function deletePage(pageId: string): Promise<void> {
  return queueWrite(async () => {
    const pages = await readPagesFromFile();
    const pageIndex = pages.findIndex((page) => page.id === pageId);

    if (pageIndex === -1) {
      throw createMissingPageError(pageId);
    }

    await writePagesToFile(pages.toSpliced(pageIndex, 1));
  });
}

export async function duplicatePage(pageId: string): Promise<PageRecord> {
  return queueWrite(async () => {
    const pages = await readPagesFromFile();
    const sourcePage = pages.find((page) => page.id === pageId);

    if (!sourcePage) {
      throw createMissingPageError(pageId);
    }

    const timestamp = new Date().toISOString();
    const duplicatedDocument: EnterprisePageDocument = {
      ...sourcePage.document,
      id: randomUUID(),
      title: `${sourcePage.document.title} 副本`,
      slug: undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const duplicatedRecord = createDraftRecord(duplicatedDocument);

    await writePagesToFile([...pages, duplicatedRecord]);

    return duplicatedRecord;
  });
}

export async function publishPage(pageId: string): Promise<PageRecord> {
  return queueWrite(async () => {
    const pages = await readPagesFromFile();
    const pageIndex = pages.findIndex((page) => page.id === pageId);

    if (pageIndex === -1) {
      throw createMissingPageError(pageId);
    }

    const page = pages[pageIndex];
    const existingSlugs = pages
      .filter((existingPage) => existingPage.id !== pageId)
      .map((existingPage) => existingPage.document.slug)
      .filter((slug): slug is string => Boolean(slug));
    const slugBase = page.document.slug ?? createSlug(page.document.title);
    const slug = ensureUniqueSlug(slugBase, existingSlugs);
    const timestamp = new Date().toISOString();
    const publishedRecord = pageRecordSchema.parse({
      ...page,
      status: "PUBLISHED",
      document: {
        ...page.document,
        slug,
        updatedAt: timestamp,
      },
      updatedAt: timestamp,
      publishedAt: timestamp,
    });
    const updatedPages = pages.toSpliced(pageIndex, 1, publishedRecord);

    await writePagesToFile(updatedPages);

    return publishedRecord;
  });
}

export function setPageStoreFilePathForTests(filePath: string | null) {
  pageStoreFilePathForTests = filePath;
  writeQueue = Promise.resolve();
}
