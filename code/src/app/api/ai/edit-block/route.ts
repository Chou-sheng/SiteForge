import { NextResponse } from "next/server";
import { z } from "zod";

import { editBlockWithAIResult } from "../../../../lib/ai/editBlock";
import { pageBlockSchema, pageDocumentSchema } from "../../../../lib/validation/pageSchema";
import { errorResponse, readJson } from "../../_utils/routeHelpers";

const pageContextSchema = z.union([
  pageDocumentSchema,
  z.object({
    title: z.string().min(1).optional(),
    industry: z.string().min(1).optional(),
  }).strict(),
]);

const editBlockRequestSchema = z.object({
  pageContext: pageContextSchema,
  block: pageBlockSchema,
  instruction: z.string().trim().min(1),
}).strict();

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await readJson(request);
  } catch {
    return errorResponse("请求 JSON 无效", 400);
  }

  const requestResult = editBlockRequestSchema.safeParse(body);

  if (!requestResult.success) {
    return errorResponse("请求参数无效，请提供有效的区块和编辑指令", 400);
  }

  try {
    const input = requestResult.data;
    const result = await editBlockWithAIResult(input);
    const headers = new Headers({
      "x-ai-source": result.source,
    });

    if (result.fallbackReason) {
      headers.set("x-ai-fallback-reason", result.fallbackReason);
    }

    return NextResponse.json({ block: result.block }, { headers });
  } catch {
    return errorResponse("编辑区块失败", 500);
  }
}
