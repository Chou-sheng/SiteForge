import { NextResponse } from "next/server";

import {
  deletePage,
  getPageById,
  updatePage,
} from "../../../../lib/db/pageStore";
import { pageDocumentSchema } from "../../../../lib/validation/pageSchema";
import {
  errorResponse,
  isMismatchedPageIdError,
  isMissingPageError,
  readJson,
} from "../../_utils/routeHelpers";

type PageParamsContext = {
  params: Promise<{
    pageId: string;
  }>;
};

async function readPageId(context: PageParamsContext) {
  const { pageId } = await context.params;
  return pageId;
}

export async function GET(_request: Request, context: PageParamsContext) {
  try {
    const pageId = await readPageId(context);
    const record = await getPageById(pageId);

    if (!record) {
      return errorResponse("页面不存在", 404);
    }

    return NextResponse.json(record);
  } catch {
    return errorResponse("读取页面失败", 500);
  }
}

export async function PATCH(request: Request, context: PageParamsContext) {
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
    const pageId = await readPageId(context);
    const document = documentResult.data;
    const record = await updatePage(pageId, document);

    return NextResponse.json(record);
  } catch (error) {
    if (isMissingPageError(error)) {
      return errorResponse("页面不存在", 404);
    }

    if (isMismatchedPageIdError(error)) {
      return errorResponse("页面 ID 与文档 ID 不一致", 400);
    }

    return errorResponse("保存页面失败", 500);
  }
}

export async function DELETE(_request: Request, context: PageParamsContext) {
  try {
    const pageId = await readPageId(context);

    await deletePage(pageId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isMissingPageError(error)) {
      return errorResponse("页面不存在", 404);
    }

    return errorResponse("删除页面失败", 500);
  }
}
