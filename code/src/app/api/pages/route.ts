import { NextResponse } from "next/server";

import { createPage, listPages } from "../../../lib/db/pageStore";
import { pageDocumentSchema } from "../../../lib/validation/pageSchema";
import type { PageRecord } from "../../../types/page";
import { errorResponse, isDuplicatePageError, readJson } from "../_utils/routeHelpers";

type PageSummary = {
  id: string;
  title: string;
  status: PageRecord["status"];
  slug?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  description?: string;
  companyName: string;
  industry: string;
};

function toSummary(record: PageRecord): PageSummary {
  return {
    id: record.id,
    title: record.document.title,
    status: record.status,
    slug: record.document.slug,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    publishedAt: record.publishedAt,
    description: record.document.description,
    companyName: record.document.siteMeta.companyName,
    industry: record.document.siteMeta.industry,
  };
}

export async function GET() {
  try {
    const pages = await listPages();

    return NextResponse.json(pages.map(toSummary));
  } catch {
    return errorResponse("读取页面列表失败", 500);
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await readJson(request);
  } catch {
    return errorResponse("请求 JSON 无效", 400);
  }

  const documentResult = pageDocumentSchema.safeParse(body);

  if (!documentResult.success) {
    return errorResponse("页面文档格式无效", 400);
  }

  try {
    const document = documentResult.data;
    const record = await createPage(document);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (isDuplicatePageError(error)) {
      return errorResponse("页面已存在", 400);
    }

    return errorResponse("创建页面失败", 500);
  }
}
