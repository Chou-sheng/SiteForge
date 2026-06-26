import { NextResponse } from "next/server";
import { z } from "zod";

import { generatePageWithAIResult } from "../../../../lib/ai/generatePage";
import { errorResponse, readJson } from "../../_utils/routeHelpers";

const generatePageRequestSchema = z.object({
  prompt: z.string().trim().min(1),
  industry: z.string().trim().min(1).optional(),
  style: z.string().trim().min(1).optional(),
  pageType: z.string().trim().min(1).optional(),
}).strict();

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message.trim()
    ? error.message
    : "生成页面失败";
}

function logGeneratePageError(error: unknown) {
  const name = error instanceof Error ? error.name : typeof error;
  const message = getErrorMessage(error);

  console.error(`[api/ai/generate-page] ${name}: ${message}`);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await readJson(request);
  } catch {
    return errorResponse("请求 JSON 无效", 400);
  }

  const requestResult = generatePageRequestSchema.safeParse(body);

  if (!requestResult.success) {
    return errorResponse("请求参数无效，请提供有效的页面生成需求", 400);
  }

  try {
    const input = requestResult.data;
    const result = await generatePageWithAIResult(input);
    const headers = new Headers({
      "x-ai-source": result.source,
    });

    return NextResponse.json(result.document, { headers });
  } catch (error) {
    logGeneratePageError(error);

    return errorResponse(getErrorMessage(error), 500);
  }
}
