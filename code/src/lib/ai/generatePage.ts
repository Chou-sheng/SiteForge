import type { EnterprisePageDocument } from "../../types/page";
import type { BlockStyle, BlockType, BlockVisibility, PageBlock } from "../../types/block";
import { blockTypes } from "../../types/block";
import { createDefaultBlock, getBlockDefinition } from "../../modules/registry";
import { requestDeepSeekCompletion } from "./deepseekClient";
import { generateLocalPage, type LocalGeneratePageInput } from "./localGeneratePage";
import { pageGenerationSystemPrompt } from "./prompts";
import { extractJsonObject } from "./repairJson";
import { pageBlockSchema, pageDocumentSchema } from "../validation/pageSchema";

export type GeneratePageInput = LocalGeneratePageInput;
export type AIResultSource = "deepseek" | "local-fallback";
export type AIFallbackReason = "missing-api-key" | "deepseek-request-failed" | "invalid-ai-response";

export type GeneratePageResult = {
  document: EnterprisePageDocument;
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

const pageGoalValues = [
  "lead-generation",
  "brand-display",
  "product-introduction",
  "course-enrollment",
  "event-conversion",
] as const;
const maxWidthValues = ["1120px", "1200px", "1280px", "1440px"] as const;
const contentDensityValues = ["compact", "comfortable", "spacious"] as const;
const responsiveModeValues = ["standard", "marketing", "enterprise"] as const;
const backgroundValues = ["default", "muted", "primary", "gradient", "image"] as const;
const textAlignValues = ["left", "center", "right"] as const;
const containerValues = ["full", "contained", "narrow"] as const;
const blockTypeSet = new Set<string>(blockTypes);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function stringArrayValue(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : undefined;
}

function enumValue<T extends readonly string[]>(value: unknown, values: T): T[number] | undefined {
  return typeof value === "string" && values.includes(value) ? value : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function normalizeStyle(candidate: unknown, fallback: BlockStyle): BlockStyle {
  if (!isRecord(candidate)) {
    return fallback;
  }

  return {
    background: enumValue(candidate.background, backgroundValues) ?? fallback.background,
    paddingTop: numberValue(candidate.paddingTop) ?? fallback.paddingTop,
    paddingBottom: numberValue(candidate.paddingBottom) ?? fallback.paddingBottom,
    textAlign: enumValue(candidate.textAlign, textAlignValues) ?? fallback.textAlign,
    container: enumValue(candidate.container, containerValues) ?? fallback.container,
  };
}

function normalizeVisibility(candidate: unknown, fallback: BlockVisibility): BlockVisibility {
  if (!isRecord(candidate)) {
    return fallback;
  }

  return {
    desktop: typeof candidate.desktop === "boolean" ? candidate.desktop : fallback.desktop,
    tablet: typeof candidate.tablet === "boolean" ? candidate.tablet : fallback.tablet,
    mobile: typeof candidate.mobile === "boolean" ? candidate.mobile : fallback.mobile,
  };
}

function normalizeBlock(candidate: unknown): PageBlock | null {
  if (!isRecord(candidate) || !blockTypeSet.has(String(candidate.type))) {
    return null;
  }

  const type = candidate.type as BlockType;
  const definition = getBlockDefinition(type);
  const variant = definition.variants.some((item) => item.id === candidate.variant)
    ? String(candidate.variant)
    : undefined;
  const fallbackBlock = createDefaultBlock(type, variant);

  const normalizedBlock = {
    ...fallbackBlock,
    id: stringValue(candidate.id) ?? fallbackBlock.id,
    name: stringValue(candidate.name) ?? fallbackBlock.name,
    props: {
      ...fallbackBlock.props,
      ...(isRecord(candidate.props) ? candidate.props : {}),
    },
    style: normalizeStyle(candidate.style, fallbackBlock.style),
    visibility: normalizeVisibility(candidate.visibility, fallbackBlock.visibility),
  };
  const result = pageBlockSchema.safeParse(normalizedBlock);

  return result.success ? (result.data as PageBlock) : fallbackBlock;
}

function normalizeDeepSeekDocument(parsed: unknown, input: GeneratePageInput): EnterprisePageDocument | null {
  if (!isRecord(parsed)) {
    return null;
  }

  const base = generateLocalPage(input);
  const parsedSiteMeta = isRecord(parsed.siteMeta) ? parsed.siteMeta : {};
  const parsedLayout = isRecord(parsed.layout) ? parsed.layout : {};
  const blocks = Array.isArray(parsed.blocks)
    ? parsed.blocks.flatMap((block) => {
        const normalized = normalizeBlock(block);

        return normalized ? [normalized] : [];
      })
    : [];
  const candidate = {
    ...base,
    id: stringValue(parsed.id) ?? base.id,
    title: stringValue(parsed.title) ?? base.title,
    description: stringValue(parsed.description) ?? base.description,
    version: typeof parsed.version === "number" && parsed.version > 0 ? parsed.version : base.version,
    siteMeta: {
      ...base.siteMeta,
      companyName: stringValue(parsedSiteMeta.companyName) ?? base.siteMeta.companyName,
      industry: stringValue(parsedSiteMeta.industry) ?? base.siteMeta.industry,
      targetAudience: stringValue(parsedSiteMeta.targetAudience) ?? base.siteMeta.targetAudience,
      pageGoal: enumValue(parsedSiteMeta.pageGoal, pageGoalValues) ?? base.siteMeta.pageGoal,
      seoTitle: stringValue(parsedSiteMeta.seoTitle) ?? stringValue(parsedSiteMeta.title) ?? base.siteMeta.seoTitle,
      seoDescription:
        stringValue(parsedSiteMeta.seoDescription) ?? stringValue(parsedSiteMeta.description) ?? base.siteMeta.seoDescription,
      keywords: stringArrayValue(parsedSiteMeta.keywords) ?? base.siteMeta.keywords,
    },
    layout: {
      ...base.layout,
      maxWidth: enumValue(parsedLayout.maxWidth, maxWidthValues) ?? base.layout.maxWidth,
      contentDensity: enumValue(parsedLayout.contentDensity, contentDensityValues) ?? base.layout.contentDensity,
      responsiveMode: enumValue(parsedLayout.responsiveMode, responsiveModeValues) ?? base.layout.responsiveMode,
    },
    blocks: blocks.length > 0 ? blocks : base.blocks,
    createdAt: stringValue(parsed.createdAt) ?? base.createdAt,
    updatedAt: stringValue(parsed.updatedAt) ?? base.updatedAt,
  };
  const result = pageDocumentSchema.safeParse(candidate);

  return result.success ? (result.data as EnterprisePageDocument) : null;
}

function buildUserPrompt(input: GeneratePageInput): string {
  return JSON.stringify({
    prompt: input.prompt,
    industry: input.industry,
    style: input.style,
    pageType: input.pageType,
  });
}

async function requestDeepSeekPage(input: GeneratePageInput, apiKey: string): Promise<EnterprisePageDocument | null> {
  const response = await requestDeepSeekCompletion(
    apiKey,
    {
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: pageGenerationSystemPrompt },
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
  const result = pageDocumentSchema.safeParse(parsed);

  if (result.success) {
    return result.data as EnterprisePageDocument;
  }

  return normalizeDeepSeekDocument(parsed, input);
}

export async function generatePageWithAI(input: GeneratePageInput): Promise<EnterprisePageDocument> {
  return (await generatePageWithAIResult(input)).document;
}

export async function generatePageWithAIResult(input: GeneratePageInput): Promise<GeneratePageResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return {
      document: generateLocalPage(input),
      source: "local-fallback",
      fallbackReason: "missing-api-key",
    };
  }

  try {
    const document = await requestDeepSeekPage(input, apiKey);

    if (document) {
      return {
        document,
        source: "deepseek",
      };
    }

    return {
      document: generateLocalPage(input),
      source: "local-fallback",
      fallbackReason: "invalid-ai-response",
    };
  } catch {
    return {
      document: generateLocalPage(input),
      source: "local-fallback",
      fallbackReason: "deepseek-request-failed",
    };
  }
}
