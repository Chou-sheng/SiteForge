import { join } from "node:path";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getPageById } from "../../../lib/db/pageStore";
import { exportStandaloneHtml } from "../../../lib/publish/staticSitePublisher";
import { errorResponse, readJson } from "../_utils/routeHelpers";

const exportRequestSchema = z.object({
  pageId: z.string().trim().min(1),
}).strict();

const reservedWindowsBasenames = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
]);

function sanitizeBasename(value: string) {
  return value
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/g, "");
}

function isReservedWindowsBasename(value: string) {
  return reservedWindowsBasenames.has(value.toUpperCase());
}

function hashIdentifier(value: string) {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36);
}

function safeFilename(preferred: string, stableId: string) {
  const preferredBasename = sanitizeBasename(preferred);

  if (preferredBasename && !isReservedWindowsBasename(preferredBasename)) {
    return `${preferredBasename}.html`;
  }

  const fallbackBasename = sanitizeBasename(stableId);

  if (fallbackBasename && !isReservedWindowsBasename(fallbackBasename)) {
    return `${fallbackBasename}.html`;
  }

  return `page-${hashIdentifier(stableId)}.html`;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await readJson(request);
  } catch {
    return errorResponse("请求 JSON 无效", 400);
  }

  const requestResult = exportRequestSchema.safeParse(body);

  if (!requestResult.success) {
    return errorResponse("pageId 不能为空", 400);
  }

  try {
    const { pageId } = requestResult.data;
    const record = await getPageById(pageId);

    if (!record) {
      return errorResponse("页面不存在", 404);
    }

    const html = await exportStandaloneHtml({
      document: record.document,
      publicDirectory:
        process.env.DESKTOP_PUBLIC_DIR ?? join(process.cwd(), "public"),
    });
    const filename = safeFilename(record.document.slug ?? record.document.title, record.id);

    return NextResponse.json({ html, filename });
  } catch {
    return errorResponse("导出页面失败", 500);
  }
}
