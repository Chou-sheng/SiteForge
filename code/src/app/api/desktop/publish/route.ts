import { join } from "node:path";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getPageById, publishPage } from "../../../../lib/db/pageStore";
import { publishStaticSite } from "../../../../lib/publish/staticSitePublisher";
import { errorResponse, readJson } from "../../_utils/routeHelpers";

const desktopPublishRequestSchema = z
  .object({
    pageId: z.string().trim().min(1),
    parentDirectory: z.string().trim().min(1),
  })
  .strict();

export async function POST(request: Request) {
  const expectedToken = process.env.DESKTOP_SESSION_TOKEN;
  const receivedToken = request.headers.get("x-desktop-token");

  if (!expectedToken || receivedToken !== expectedToken) {
    return errorResponse("桌面发布请求未授权", 401);
  }

  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return errorResponse("请求 JSON 无效", 400);
  }

  const requestResult = desktopPublishRequestSchema.safeParse(body);
  if (!requestResult.success) {
    return errorResponse("发布参数无效", 400);
  }

  const { pageId, parentDirectory } = requestResult.data;
  const record = await getPageById(pageId);
  if (!record) {
    return errorResponse("页面不存在", 404);
  }

  try {
    const result = await publishStaticSite({
      document: record.document,
      parentDirectory,
      publicDirectory:
        process.env.DESKTOP_PUBLIC_DIR ?? join(process.cwd(), "public"),
    });

    await publishPage(pageId);
    return NextResponse.json(result);
  } catch {
    return errorResponse("静态站点发布失败", 500);
  }
}
