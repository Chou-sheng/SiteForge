import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getDeepSeekConfigStatus,
  readDeepSeekConfig,
  writeDeepSeekConfig,
} from "../../../../lib/ai/configStore";
import { requestDeepSeekCompletion } from "../../../../lib/ai/deepseekClient";
import { errorResponse, readJson } from "../../_utils/routeHelpers";

export const dynamic = "force-dynamic";

const configRequestSchema = z.object({
  apiKey: z.string().trim().optional(),
  model: z.string().trim().min(1),
}).strict();

function validationErrorFromStatus(status: number) {
  if (status === 401 || status === 403) {
    return "API Key 无效或没有访问权限";
  }

  if (status === 400 || status === 404) {
    return "模型名称无效或当前账号无权使用该模型";
  }

  if (status === 429) {
    return "API 调用过于频繁或账号额度不足";
  }

  return "DeepSeek 校验请求失败";
}

async function validateDeepSeekConfig(apiKey: string, model: string) {
  let response: Response;

  try {
    response = await requestDeepSeekCompletion(apiKey, {
      model,
      max_tokens: 128,
      messages: [
        {
          role: "user",
          content: "请只回复 ok",
        },
      ],
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("DeepSeek 校验请求超时");
    }

    throw new Error("无法连接 DeepSeek 服务");
  }

  if (!response.ok) {
    throw new Error(validationErrorFromStatus(response.status));
  }

  const payload = await response.json() as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("DeepSeek 返回结果无效");
  }
}

export async function GET() {
  const status = await getDeepSeekConfigStatus();

  return NextResponse.json({
    configured: status.configured,
    model: status.model,
    mode: status.mode,
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await readJson(request);
  } catch {
    return errorResponse("请求 JSON 无效", 400);
  }

  const requestResult = configRequestSchema.safeParse(body);

  if (!requestResult.success) {
    return errorResponse("请填写有效的 API Key 和模型名称", 400);
  }

  const existingConfig = await readDeepSeekConfig();
  const apiKey = requestResult.data.apiKey || existingConfig?.apiKey || "";
  const model = requestResult.data.model;

  if (!apiKey) {
    return errorResponse("请填写 API Key", 400);
  }

  try {
    await validateDeepSeekConfig(apiKey, model);
    const status = await writeDeepSeekConfig({ apiKey, model });

    return NextResponse.json({
      configured: status.configured,
      model: status.model,
      mode: status.mode,
      restartHint: status.mode === "desktop"
        ? "配置已保存，请重新打开应用后生效。"
        : "配置已保存，请重启开发服务后生效。",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "DeepSeek 校验失败";

    return errorResponse(message, 400);
  }
}
