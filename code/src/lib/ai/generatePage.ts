import { createDefaultBlock } from "../../modules/registry";
import type { BlockStyle, BlockVisibility, PageBlock } from "../../types/block";
import type { EnterprisePageDocument, EnterpriseTheme } from "../../types/page";
import { createId } from "../utils/id";
import { enterpriseThemeSchema, pageBlockSchema, pageDocumentSchema } from "../validation/pageSchema";
import { requestDeepSeekCompletion } from "./deepseekClient";
import { buildDesignTasteInstruction } from "./designTaste";
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

type DeepSeekErrorPayload = {
  error?: string | {
    message?: string;
  };
  message?: string;
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

function compactErrorText(value: string) {
  const text = value.replace(/\s+/g, " ").trim();

  return text.length > 240 ? `${text.slice(0, 240)}...` : text;
}

async function readDeepSeekErrorDetail(response: Response) {
  try {
    const payload = (await response.clone().json()) as DeepSeekErrorPayload;

    if (typeof payload.error === "string" && payload.error.trim()) {
      return compactErrorText(payload.error);
    }

    if (isRecord(payload.error) && typeof payload.error.message === "string" && payload.error.message.trim()) {
      return compactErrorText(payload.error.message);
    }

    if (typeof payload.message === "string" && payload.message.trim()) {
      return compactErrorText(payload.message);
    }
  } catch {
    // Fall back to text below when the provider returns a non-JSON error.
  }

  try {
    const text = await response.text();

    return text.trim() ? compactErrorText(text) : null;
  } catch {
    return null;
  }
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

type SemanticBlockSpec = {
  intent: string;
  layout: GeneratedLayout;
  itemKeys?: string[];
  metricKeys?: string[];
  includeCopyright?: boolean;
};

function identityFromValues(values: unknown[]) {
  return values.flatMap((value) => {
    const text = stringValue(value);

    return text ? [text.toLowerCase()] : [];
  }).join(" ");
}

function semanticBlockSpec(candidate: Record<string, unknown>, props: Record<string, unknown>): SemanticBlockSpec | null {
  const identity = identityFromValues([
    candidate.type,
    candidate.variant,
    candidate.name,
    props.intent,
    props.layout,
    props.title,
  ]);

  if (!identity || identity.includes("aigeneratedsection")) {
    return null;
  }

  if (/(navbar|nav|navigation|header|menu|\u5bfc\u822a|\u83dc\u5355|\u9876\u90e8|\u5934\u90e8)/.test(identity)) {
    return { intent: "navigation", layout: "feature-grid", itemKeys: ["items", "links"] };
  }

  if (/(footer|\u9875\u811a|\u5e95\u90e8)/.test(identity)) {
    return {
      intent: "footer",
      layout: "feature-grid",
      itemKeys: ["items", "links", "contacts"],
      includeCopyright: true,
    };
  }

  if (/(hero|banner|masthead|\u9996\u5c4f|\u4e3b\u89c6\u89c9|\u5f00\u573a)/.test(identity)) {
    return { intent: "hero", layout: "hero", itemKeys: ["items", "badges", "features"] };
  }

  if (/(cta|calltoaction|conversion|leadform|contactsales|booking|\u8f6c\u5316|\u884c\u52a8|\u4f53\u9a8c|\u8d2d\u4e70|\u9884\u7ea6)/.test(identity)) {
    return { intent: "conversion", layout: "conversion", itemKeys: ["items"], metricKeys: ["metrics"] };
  }

  if (/(testimonial|review|proof|case|\u8bc4\u4ef7|\u53e3\u7891|\u7528\u6237|\u6848\u4f8b)/.test(identity)) {
    return { intent: "proof", layout: "proof", itemKeys: ["items", "testimonials", "cases"] };
  }

  if (/(metric|stat|truststats|number|data|\u6307\u6807|\u6570\u636e)/.test(identity)) {
    return { intent: "metrics", layout: "metric-band", itemKeys: ["items"], metricKeys: ["metrics", "stats"] };
  }

  if (/(timeline|workflow|process|steps|journey|\u6d41\u7a0b|\u6b65\u9aa4|\u8def\u5f84)/.test(identity)) {
    return { intent: "timeline", layout: "timeline", itemKeys: ["items", "steps"] };
  }

  if (/(spotlight|split|about|story|\u5173\u4e8e|\u6545\u4e8b|\u56fe\u6587)/.test(identity)) {
    return { intent: "story", layout: "split-story", itemKeys: ["items", "features"] };
  }

  if (/(feature|product|showcase|usecase|solution|highlight|scene|app|\u4eae\u70b9|\u4ea7\u54c1|\u529f\u80fd|\u573a\u666f|\u4f18\u52bf|\u65b9\u6848)/.test(identity)) {
    return {
      intent: "content",
      layout: "feature-grid",
      itemKeys: ["items", "features", "products", "useCases", "solutions", "scenes"],
      metricKeys: ["metrics", "stats"],
    };
  }

  return null;
}

function stringFromKeys(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const text = stringValue(source[key]);

    if (text) {
      return text;
    }
  }

  return undefined;
}

function actionFromKeys(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const action = normalizeAction(source[key]);

    if (action) {
      return action;
    }
  }

  return undefined;
}

function arrayFromKeys(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return undefined;
}

function normalizeSemanticItem(value: unknown) {
  const text = stringValue(value);

  if (text) {
    return { title: text };
  }

  if (!isRecord(value)) {
    return null;
  }

  const title =
    stringValue(value.title)
    ?? stringValue(value.name)
    ?? stringValue(value.label)
    ?? stringValue(value.author)
    ?? stringValue(value.question)
    ?? stringValue(value.value);

  if (!title) {
    return null;
  }

  const displayValue = stringValue(value.value) ?? stringValue(value.price);

  return stripUndefined({
    title,
    description:
      stringValue(value.description)
      ?? stringValue(value.summary)
      ?? stringValue(value.quote)
      ?? stringValue(value.answer),
    icon: stringValue(value.icon),
    value: displayValue && displayValue !== title ? displayValue : undefined,
    label: stringValue(value.rating),
    meta: stringValue(value.meta) ?? stringValue(value.role),
    href: stringValue(value.href),
    image: normalizeImage(value.image),
  });
}

function normalizeSemanticItems(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value.flatMap((item) => {
    const normalized = normalizeSemanticItem(item);

    return normalized ? [normalized] : [];
  });

  return items.length > 0 ? items : undefined;
}

function normalizeSemanticMetrics(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const metrics = value.flatMap((metric) => {
    const normalized = normalizeMetric(metric);

    return normalized ? [normalized] : [];
  });

  return metrics.length > 0 ? metrics : undefined;
}

function semanticGeneratedProps(candidate: Record<string, unknown>, props: Record<string, unknown>, spec: SemanticBlockSpec) {
  const itemKeys = spec.itemKeys ?? ["items"];
  const metricKeys = spec.metricKeys ?? ["metrics"];
  const items = normalizeSemanticItems(arrayFromKeys(props, itemKeys));
  const metrics = normalizeSemanticMetrics(arrayFromKeys(props, metricKeys));
  const copyright = spec.includeCopyright ? stringValue(props.copyright) : undefined;
  const title =
    stringFromKeys(props, ["title", "companyName", "logo", "heading", "name"])
    ?? stringValue(candidate.name)
    ?? spec.intent;

  return stripUndefined({
    generatedModuleId: stringValue(props.generatedModuleId) ?? createId("generated-module"),
    intent: stringValue(props.intent) ?? stringValue(candidate.name) ?? spec.intent,
    layout: normalizeGeneratedLayout(props.layout) ?? spec.layout,
    eyebrow: stringValue(props.eyebrow),
    title,
    subtitle: stringFromKeys(props, ["subtitle", "tagline"]),
    description: stringFromKeys(props, ["description", "summary"]),
    primaryAction: actionFromKeys(props, ["primaryAction", "action", "cta"]),
    secondaryAction: actionFromKeys(props, ["secondaryAction"]),
    image: normalizeImage(props.image),
    items: copyright
      ? [...(items ?? []), { title: "Copyright", description: copyright }]
      : items,
    metrics,
    fields: stringArrayValue(props.fields),
    tone: normalizeTone(props.tone),
    styleNotes: stringArrayValue(props.styleNotes),
  });
}

function normalizeBlockCandidate(candidate: Record<string, unknown>) {
  if (candidate.type === "aiGeneratedSection") {
    return candidate;
  }

  const props = isRecord(candidate.props) ? candidate.props : {};
  const spec = semanticBlockSpec(candidate, props);

  if (!spec) {
    return null;
  }

  return {
    ...candidate,
    type: "aiGeneratedSection",
    variant: "generated",
    props: semanticGeneratedProps(candidate, props, spec),
  };
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
  if (!isRecord(candidate)) {
    return null;
  }

  const generatedCandidate = normalizeBlockCandidate(candidate);

  if (!generatedCandidate) {
    return null;
  }

  const variant = ["generated", "generated-hero", "generated-grid"].includes(String(generatedCandidate.variant))
    ? String(generatedCandidate.variant)
    : undefined;
  const fallbackBlock = createDefaultBlock("aiGeneratedSection", variant);
  const props = normalizeGeneratedProps(generatedCandidate.props, generatedCandidate);

  if (!props) {
    return null;
  }

  const normalizedBlock = {
    ...fallbackBlock,
    id: stringValue(generatedCandidate.id) ?? fallbackBlock.id,
    name: stringValue(candidate.name) ?? stringValue(props.intent) ?? fallbackBlock.name,
    props,
    style: normalizeStyle(generatedCandidate.style, fallbackBlock.style),
    visibility: normalizeVisibility(generatedCandidate.visibility, fallbackBlock.visibility),
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

async function requestDeepSeekPage(input: GeneratePageInput, apiKey: string): Promise<EnterprisePageDocument> {
  const systemPrompt = [
    pageGenerationSystemPrompt,
    buildDesignTasteInstruction(input, "page-generation"),
  ].join("\n\n");

  let response: Response;

  try {
    response = await requestDeepSeekCompletion(
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
  } catch {
    throw new Error("DeepSeek 页面生成请求失败");
  }

  if (!response.ok) {
    const detail = await readDeepSeekErrorDetail(response);
    const statusMessage = `DeepSeek 页面生成请求失败（HTTP ${response.status}）`;

    throw new Error(detail ? `${statusMessage}：${detail}` : statusMessage);
  }

  const payload = (await response.json()) as DeepSeekResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content?.trim()) {
    throw new Error("DeepSeek 返回页面内容为空");
  }

  const document = normalizeDeepSeekDocument(extractJsonObject(content), input);

  if (!document) {
    throw new Error("DeepSeek 页面结构无效");
  }

  return document;
}

export async function generatePageWithAI(input: GeneratePageInput): Promise<EnterprisePageDocument> {
  return (await generatePageWithAIResult(input)).document;
}

export async function generatePageWithAIResult(input: GeneratePageInput): Promise<GeneratePageResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DeepSeek API Key 未配置");
  }

  let document: EnterprisePageDocument;

  try {
    document = await requestDeepSeekPage(input, apiKey);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("DeepSeek 页面生成失败");
  }

  return {
    document,
    source: "deepseek",
  };
}
