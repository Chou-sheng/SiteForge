import type { BlockType, PageBlock } from "../../types/block";
import type { EnterprisePageDocument } from "../../types/page";
import { getBlockPropsSchema } from "../validation/blockSchemas";
import { pageBlockSchema } from "../validation/pageSchema";
import { requestDeepSeekCompletion } from "./deepseekClient";
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

export type AIResultSource = "deepseek" | "local-fallback";
export type AIFallbackReason = "missing-api-key" | "deepseek-request-failed" | "invalid-ai-response";

export type EditBlockResult = {
  block: PageBlock;
  source: AIResultSource;
  fallbackReason?: AIFallbackReason;
};

type DeepSeekChoice = {
  message?: {
    content?: string;
  };
};

type DeepSeekResponse = {
  choices?: DeepSeekChoice[];
};

const textLikeFields = ["title", "subtitle", "description", "eyebrow", "message"] as const;

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

export function editBlockLocally(input: EditBlockInput): PageBlock {
  const instruction = input.instruction.trim() || "优化文案";
  const nextProps = { ...input.block.props };

  for (const field of textLikeFields) {
    const value = nextProps[field];

    if (typeof value === "string" && value.trim()) {
      nextProps[field] = `${value}（已根据要求优化：${instruction}）`;
    }
  }

  const localBlock = {
    ...input.block,
    props: nextProps,
    style: { ...input.block.style },
    visibility: { ...input.block.visibility },
  };

  return pageBlockSchema.parse(localBlock) as PageBlock;
}

async function requestDeepSeekBlock(input: EditBlockInput, apiKey: string): Promise<PageBlock | null> {
  const response = await requestDeepSeekCompletion(
    apiKey,
    {
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: blockEditSystemPrompt },
        { role: "user", content: buildUserPrompt(input) },
      ],
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as DeepSeekResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  const parsed = extractJsonObject(content);

  return validateEditedBlock(parsed, input.block);
}

export async function editBlockWithAI(input: EditBlockInput): Promise<{ block: PageBlock }> {
  const result = await editBlockWithAIResult(input);

  return { block: result.block };
}

export async function editBlockWithAIResult(input: EditBlockInput): Promise<EditBlockResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return {
      block: editBlockLocally(input),
      source: "local-fallback",
      fallbackReason: "missing-api-key",
    };
  }

  try {
    const block = await requestDeepSeekBlock(input, apiKey);

    if (block) {
      return {
        block,
        source: "deepseek",
      };
    }

    return {
      block: editBlockLocally(input),
      source: "local-fallback",
      fallbackReason: "invalid-ai-response",
    };
  } catch {
    return {
      block: editBlockLocally(input),
      source: "local-fallback",
      fallbackReason: "deepseek-request-failed",
    };
  }
}
