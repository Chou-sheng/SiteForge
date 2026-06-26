import type { BlockType, PageBlock } from "../../types/block";
import type { EnterprisePageDocument } from "../../types/page";
import { getBlockPropsSchema } from "../validation/blockSchemas";
import { pageBlockSchema } from "../validation/pageSchema";
import { requestDeepSeekCompletion } from "./deepseekClient";
import { buildDesignTasteInstruction } from "./designTaste";
import { blockEditSystemPrompt } from "./prompts";
import { extractJsonObject } from "./repairJson";

export type EditBlockPageContext =
  | EnterprisePageDocument
  | {
      title?: string;
      industry?: string;
    };

export type EditBlockInput = {
  pageContext: EditBlockPageContext;
  block: PageBlock;
  instruction: string;
};

export type AIResultSource = "deepseek";

export type EditBlockResult = {
  block: PageBlock;
  source: AIResultSource;
};

type DeepSeekChoice = {
  message?: {
    content?: string;
  };
};

type DeepSeekResponse = {
  choices?: DeepSeekChoice[];
};

function contextSummary(pageContext: EditBlockPageContext): Record<string, unknown> {
  if ("siteMeta" in pageContext) {
    return {
      title: pageContext.title,
      industry: pageContext.siteMeta.industry,
      companyName: pageContext.siteMeta.companyName,
      pageGoal: pageContext.siteMeta.pageGoal,
    };
  }

  return pageContext;
}

function buildUserPrompt(input: EditBlockInput): string {
  return JSON.stringify({
    pageContext: contextSummary(input.pageContext),
    instruction: input.instruction,
    block: input.block,
  });
}

function candidateBlock(parsed: unknown): unknown {
  if (parsed && typeof parsed === "object" && "block" in parsed) {
    return (parsed as { block?: unknown }).block;
  }

  return parsed;
}

function stableObjectEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validateEditedBlock(parsed: unknown, original: PageBlock): PageBlock | null {
  const result = pageBlockSchema.safeParse(candidateBlock(parsed));

  if (!result.success) {
    return null;
  }

  if (
    result.data.id !== original.id ||
    result.data.type !== original.type ||
    result.data.variant !== original.variant ||
    result.data.name !== original.name ||
    !stableObjectEqual(result.data.style, original.style) ||
    !stableObjectEqual(result.data.visibility, original.visibility)
  ) {
    return null;
  }

  const propsResult = getBlockPropsSchema(result.data.type as BlockType).safeParse(result.data.props);

  if (!propsResult.success) {
    return null;
  }

  return result.data as PageBlock;
}

function tasteContext(input: EditBlockInput) {
  const summary = contextSummary(input.pageContext);

  return {
    title: typeof summary.title === "string" ? summary.title : undefined,
    industry: typeof summary.industry === "string" ? summary.industry : undefined,
    pageType: typeof summary.pageGoal === "string" ? summary.pageGoal : undefined,
    instruction: input.instruction,
  };
}

async function requestDeepSeekBlock(input: EditBlockInput, apiKey: string): Promise<PageBlock | null> {
  const taste = tasteContext(input);
  const systemPrompt = [
    blockEditSystemPrompt,
    buildDesignTasteInstruction(taste, "block-edit"),
  ].join("\n\n");
  const response = await requestDeepSeekCompletion(
    apiKey,
    {
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserPrompt(input) },
      ],
    },
  );

  if (!response.ok) {
    throw new Error("DeepSeek block edit request failed");
  }

  const payload = (await response.json()) as DeepSeekResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  const parsed = extractJsonObject(content);

  const block = validateEditedBlock(parsed, input.block);

  if (!block) {
    return null;
  }

  return block;
}

export async function editBlockWithAI(input: EditBlockInput): Promise<{ block: PageBlock }> {
  const result = await editBlockWithAIResult(input);

  return { block: result.block };
}

export async function editBlockWithAIResult(input: EditBlockInput): Promise<EditBlockResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DeepSeek API Key 未配置");
  }

  let block: PageBlock | null;

  try {
    block = await requestDeepSeekBlock(input, apiKey);
  } catch {
    throw new Error("DeepSeek 区块编辑请求失败");
  }

  if (!block) {
    throw new Error("DeepSeek 区块编辑结果无效");
  }

  return {
    block,
    source: "deepseek",
  };
}
