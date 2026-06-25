import { createDefaultBlock } from "../../modules/registry";
import type { BlockStyle, BlockVisibility, PageBlock } from "../../types/block";
import type { EnterprisePageDocument, EnterpriseTheme } from "../../types/page";
import { createId } from "../utils/id";
import { enterpriseThemeSchema, pageBlockSchema, pageDocumentSchema } from "../validation/pageSchema";
import { requestDeepSeekCompletion } from "./deepseekClient";
import { buildDesignTasteInstruction, getDesignTasteIssues } from "./designTaste";
import { pageGenerationSystemPrompt } from "./prompts";
import { extractJsonObject } from "./repairJson";

export type GeneratePageInput = {
  prompt: string;
  industry?: string;
  style?: string;
  pageType?: string;
};

export type AIResultSource = "deepseek";

export type GeneratePageResult = {
  document: EnterprisePageDocument;
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
const generatedLayoutValues = [
  "hero",
  "feature-grid",
  "split-story",
  "metric-band",
  "timeline",
  "proof",
  "conversion",
] as const;
const toneSurfaceValues = ["light", "muted", "dark", "brand"] as const;
const toneRhythmValues = ["quiet", "editorial", "dense", "dramatic"] as const;

type GeneratedLayout = (typeof generatedLayoutValues)[number];

const defaultTheme: EnterpriseTheme = {
  colorTokens: {
    primary: "#0f172a",
    primaryHover: "#1e293b",
    secondary: "#0e7490",
    accent: "#be123c",
    background: "#ffffff",
    surface: "#ffffff",
    muted: "#f8fafc",
    textPrimary: "#020617",
    textSecondary: "#475569",
    border: "#e2e8f0",
  },
  typography: {
    fontFamily: "Inter, PingFang SC, Microsoft YaHei, sans-serif",
    headingWeight: 700,
    bodyWeight: 400,
    h1Size: "56px",
    h2Size: "36px",
    h3Size: "24px",
    bodySize: "16px",
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },
  shadow: {
    card: "0 8px 28px rgba(15, 23, 42, 0.08)",
    elevated: "0 18px 46px rgba(15, 23, 42, 0.12)",
    floating: "0 24px 60px rgba(15, 23, 42, 0.16)",
  },
  spacing: {
    sectionY: "88px",
    containerX: "24px",
    blockGap: "32px",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringArrayValue(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value.flatMap((item) => {
    const text = stringValue(item);

    return text ? [text] : [];
  });

  return items.length > 0 ? items : undefined;
}

function enumValue<T extends readonly string[]>(value: unknown, values: T): T[number] | undefined {
  return typeof value === "string" && values.includes(value) ? value : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function stripUndefined(record: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
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

function normalizeGeneratedLayout(value: unknown): GeneratedLayout | undefined {
  const text = stringValue(value)?.toLowerCase();

  if (!text) {
    return undefined;
  }

  if ((generatedLayoutValues as readonly string[]).includes(text)) {
    return text as GeneratedLayout;
  }

  if (/hero|banner|opening|首屏/.test(text)) {
    return "hero";
  }

  if (/split|left|right|image|story|左右|图文|叙事/.test(text)) {
    return "split-story";
  }

  if (/metric|stat|number|data|指标|数字|数据/.test(text)) {
    return "metric-band";
  }

  if (/timeline|process|step|flow|步骤|流程|路径/.test(text)) {
    return "timeline";
  }

  if (/proof|trust|case|testimonial|信任|案例|口碑|背书/.test(text)) {
    return "proof";
  }

  if (/cta|contact|form|reserve|booking|conversion|预约|咨询|联系|转化/.test(text)) {
    return "conversion";
  }

  if (/grid|card|feature|能力|卖点|服务/.test(text)) {
    return "feature-grid";
  }

  return undefined;
}

function normalizeAction(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  const label = stringValue(value.label);
  const href = stringValue(value.href);

  return label && href ? { label, href } : undefined;
}

function normalizeImage(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  const src = stringValue(value.src);
  const alt = stringValue(value.alt);

  return src && alt ? { src, alt } : undefined;
}

function normalizeGeneratedItem(value: unknown) {
  const text = stringValue(value);

  if (text) {
    return { title: text };
  }

  if (!isRecord(value)) {
    return null;
  }

  const title = stringValue(value.title) ?? stringValue(value.label) ?? stringValue(value.value);

  if (!title) {
    return null;
  }
  const displayValue = stringValue(value.value) ?? stringValue(value.price);
  const displayLabel = stringValue(value.label) ?? stringValue(value.rating);

  return stripUndefined({
    title,
    description: stringValue(value.description),
    icon: stringValue(value.icon),
    value: displayValue,
    label: displayLabel,
    meta: stringValue(value.meta),
    href: stringValue(value.href),
    image: normalizeImage(value.image),
  });
}

function normalizeMetric(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const valueText = stringValue(value.value);
  const label = stringValue(value.label);

  if (!valueText || !label) {
    return null;
  }

  return stripUndefined({
    value: valueText,
    label,
    description: stringValue(value.description),
  });
}

function normalizeTone(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  const tone = stripUndefined({
    surface: enumValue(value.surface, toneSurfaceValues),
    accent: stringValue(value.accent),
    rhythm: enumValue(value.rhythm, toneRhythmValues),
  });

  return Object.keys(tone).length > 0 ? tone : undefined;
}

function normalizeGeneratedProps(candidateProps: unknown, candidate: Record<string, unknown>) {
  if (!isRecord(candidateProps)) {
    return null;
  }

  const title = stringValue(candidateProps.title) ?? stringValue(candidate.name);
  const intent = stringValue(candidateProps.intent) ?? stringValue(candidateProps.eyebrow) ?? stringValue(candidate.name);

  if (!title || !intent) {
    return null;
  }

  const items = Array.isArray(candidateProps.items)
    ? candidateProps.items.flatMap((item) => {
        const normalized = normalizeGeneratedItem(item);

        return normalized ? [normalized] : [];
      })
    : undefined;
  const metrics = Array.isArray(candidateProps.metrics)
    ? candidateProps.metrics.flatMap((metric) => {
        const normalized = normalizeMetric(metric);

        return normalized ? [normalized] : [];
      })
    : undefined;

  return stripUndefined({
    generatedModuleId: stringValue(candidateProps.generatedModuleId) ?? createId("generated-module"),
    intent,
    layout: normalizeGeneratedLayout(candidateProps.layout) ?? normalizeGeneratedLayout(candidate.variant) ?? "feature-grid",
    eyebrow: stringValue(candidateProps.eyebrow),
    title,
    subtitle: stringValue(candidateProps.subtitle),
    description: stringValue(candidateProps.description),
    primaryAction: normalizeAction(candidateProps.primaryAction),
    secondaryAction: normalizeAction(candidateProps.secondaryAction),
    image: normalizeImage(candidateProps.image),
    items: items && items.length > 0 ? items : undefined,
    metrics: metrics && metrics.length > 0 ? metrics : undefined,
    fields: stringArrayValue(candidateProps.fields),
    tone: normalizeTone(candidateProps.tone),
    styleNotes: stringArrayValue(candidateProps.styleNotes),
  });
}

function normalizeBlock(candidate: unknown): PageBlock | null {
  if (!isRecord(candidate) || candidate.type !== "aiGeneratedSection") {
    return null;
  }

  const variant = ["generated", "generated-hero", "generated-grid"].includes(String(candidate.variant))
    ? String(candidate.variant)
    : undefined;
  const fallbackBlock = createDefaultBlock("aiGeneratedSection", variant);
  const props = normalizeGeneratedProps(candidate.props, candidate);

  if (!props) {
    return null;
  }

  const normalizedBlock = {
    ...fallbackBlock,
    id: stringValue(candidate.id) ?? fallbackBlock.id,
    name: stringValue(candidate.name) ?? stringValue(props.intent) ?? fallbackBlock.name,
    props,
    style: normalizeStyle(candidate.style, fallbackBlock.style),
    visibility: normalizeVisibility(candidate.visibility, fallbackBlock.visibility),
  };
  const result = pageBlockSchema.safeParse(normalizedBlock);

  return result.success ? (result.data as PageBlock) : null;
}

function normalizeTheme(candidate: unknown): EnterpriseTheme {
  const result = enterpriseThemeSchema.safeParse(candidate);

  return result.success ? (result.data as EnterpriseTheme) : defaultTheme;
}

function normalizeDeepSeekDocument(parsed: unknown, input: GeneratePageInput): EnterprisePageDocument | null {
  if (!isRecord(parsed)) {
    return null;
  }

  const parsedSiteMeta = isRecord(parsed.siteMeta) ? parsed.siteMeta : {};
  const parsedLayout = isRecord(parsed.layout) ? parsed.layout : {};
  const blocks = Array.isArray(parsed.blocks)
    ? parsed.blocks.flatMap((block) => {
        const normalized = normalizeBlock(block);

        return normalized ? [normalized] : [];
      })
    : [];

  if (blocks.length === 0) {
    return null;
  }

  const now = new Date().toISOString();
  const industry = stringValue(parsedSiteMeta.industry) ?? input.industry ?? "未指定行业";
  const title = stringValue(parsed.title) ?? stringValue(parsedSiteMeta.seoTitle) ?? input.prompt;
  const description =
    stringValue(parsed.description)
    ?? stringValue(parsedSiteMeta.seoDescription)
    ?? stringValue(parsedSiteMeta.description)
    ?? input.prompt;
  const candidate = {
    id: stringValue(parsed.id) ?? createId("page-ai"),
    title,
    description,
    slug: stringValue(parsed.slug),
    version: typeof parsed.version === "number" && Number.isInteger(parsed.version) && parsed.version > 0
      ? parsed.version
      : 1,
    siteMeta: {
      companyName: stringValue(parsedSiteMeta.companyName) ?? title,
      industry,
      targetAudience: stringValue(parsedSiteMeta.targetAudience) ?? "当前页面目标客户",
      pageGoal: enumValue(parsedSiteMeta.pageGoal, pageGoalValues) ?? enumValue(input.pageType, pageGoalValues) ?? "lead-generation",
      seoTitle: stringValue(parsedSiteMeta.seoTitle) ?? title,
      seoDescription: stringValue(parsedSiteMeta.seoDescription) ?? description,
      keywords: stringArrayValue(parsedSiteMeta.keywords) ?? [industry],
    },
    theme: normalizeTheme(parsed.theme),
    layout: {
      maxWidth: enumValue(parsedLayout.maxWidth, maxWidthValues) ?? "1200px",
      contentDensity: enumValue(parsedLayout.contentDensity, contentDensityValues) ?? "comfortable",
      responsiveMode: enumValue(parsedLayout.responsiveMode, responsiveModeValues) ?? "enterprise",
    },
    blocks,
    createdAt: stringValue(parsed.createdAt) ?? now,
    updatedAt: stringValue(parsed.updatedAt) ?? now,
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
  const systemPrompt = [
    pageGenerationSystemPrompt,
    buildDesignTasteInstruction(input, "page-generation"),
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
    throw new Error("DeepSeek page request failed");
  }

  const payload = (await response.json()) as DeepSeekResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  return normalizeDeepSeekDocument(extractJsonObject(content), input);
}

export async function generatePageWithAI(input: GeneratePageInput): Promise<EnterprisePageDocument> {
  return (await generatePageWithAIResult(input)).document;
}

export async function generatePageWithAIResult(input: GeneratePageInput): Promise<GeneratePageResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DeepSeek API Key 未配置");
  }

  let document: EnterprisePageDocument | null;

  try {
    document = await requestDeepSeekPage(input, apiKey);
  } catch {
    throw new Error("DeepSeek 页面生成请求失败");
  }

  if (!document) {
    throw new Error("DeepSeek 页面生成结果无效");
  }

  const tasteIssues = getDesignTasteIssues(document, input);

  if (tasteIssues.length > 0) {
    throw new Error(`DeepSeek design-taste validation failed: ${tasteIssues.slice(0, 3).join("; ")}`);
  }

  return {
    document,
    source: "deepseek",
  };
}
