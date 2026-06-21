import type { EnterprisePageDocument, EnterpriseTheme } from "../../types/page";
import { enterpriseTemplates, type EnterpriseTemplate } from "../templates/enterpriseTemplates";
import { createId } from "../utils/id";
import { pageDocumentSchema } from "../validation/pageSchema";

export type LocalGeneratePageInput = {
  prompt: string;
  industry?: string;
  style?: string;
  pageType?: string;
};

function cloneDocument(document: EnterprisePageDocument): EnterprisePageDocument {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(document);
  }

  return JSON.parse(JSON.stringify(document)) as EnterprisePageDocument;
}

function templateById(id: string): EnterpriseTemplate {
  const template = enterpriseTemplates.find((item) => item.id === id);

  if (!template) {
    throw new Error(`Template not found: ${id}`);
  }

  return template;
}

function selectTemplate(input: LocalGeneratePageInput): EnterpriseTemplate {
  const searchText = `${input.pageType ?? ""} ${input.industry ?? ""} ${input.prompt}`.toLowerCase();
  const exactPageType = input.pageType?.trim();
  const exact = enterpriseTemplates.find((template) => template.pageType === exactPageType || template.name === exactPageType);

  if (exact) {
    return exact;
  }

  if (/(文旅|旅游|旅行|度假|酒店|民宿|景区|目的地|营地|露营|亲子游|团建游|温泉|乐园)/i.test(searchText)) {
    return templateById("travel");
  }

  if (/(教育|培训|课程|学校|招生|学员)/i.test(searchText)) {
    return templateById("education");
  }

  return templateById("ai-product");
}

function extractCompanyName(prompt: string): string | undefined {
  const patterns = [
    /为([^，,。；;]{2,24}?)(?:生成|创建|制作|设计|搭建)/,
    /给([^，,。；;]{2,24}?)(?:生成|创建|制作|设计|做|搭建)/,
    /公司名(?:称)?[：:]\s*([^，,。；;]{2,24})/,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    const companyName = match?.[1]?.trim();

    if (companyName) {
      return companyName.replace(/^一家/, "");
    }
  }

  return undefined;
}

function applyStyle(theme: EnterpriseTheme, style?: string): EnterpriseTheme {
  if (!style) {
    return theme;
  }

  const nextTheme = cloneTheme(theme);

  if (/蓝|科技|可信/.test(style)) {
    nextTheme.colorTokens.primary = "#2563eb";
    nextTheme.colorTokens.primaryHover = "#1d4ed8";
    nextTheme.colorTokens.accent = "#06b6d4";
  } else if (/暖|温暖|活力|橙/.test(style)) {
    nextTheme.colorTokens.primary = "#ea580c";
    nextTheme.colorTokens.primaryHover = "#c2410c";
    nextTheme.colorTokens.accent = "#f59e0b";
    nextTheme.colorTokens.muted = "#fff7ed";
  } else if (/稳|专业|深色|商务/.test(style)) {
    nextTheme.colorTokens.primary = "#334155";
    nextTheme.colorTokens.primaryHover = "#1e293b";
    nextTheme.colorTokens.accent = "#0f766e";
  }

  return nextTheme;
}

function cloneTheme(theme: EnterpriseTheme): EnterpriseTheme {
  return JSON.parse(JSON.stringify(theme)) as EnterpriseTheme;
}

function patchFooterCompany(document: EnterprisePageDocument, companyName: string) {
  for (const block of document.blocks) {
    if (block.type === "footer" || block.type === "travelFooter") {
      block.props = {
        ...block.props,
        companyName,
        copyright: `© 2026 ${companyName}。保留所有权利。`,
      };
    }
  }
}

export function generateLocalPage(input: LocalGeneratePageInput): EnterprisePageDocument {
  const template = selectTemplate(input);
  const document = cloneDocument(template.document);
  const now = new Date().toISOString();
  const companyName = extractCompanyName(input.prompt) ?? document.siteMeta.companyName;
  const industry = input.industry?.trim() || document.siteMeta.industry;

  document.id = createId("page");
  document.title = `${companyName}${template.name}`;
  document.description = `为${companyName}生成的${template.name}，适用于${industry}场景。`;
  document.slug = undefined;
  document.createdAt = now;
  document.updatedAt = now;
  document.siteMeta = {
    ...document.siteMeta,
    companyName,
    industry,
    targetAudience: input.industry
      ? `关注${industry}解决方案、服务能力与合作价值的中文访客`
      : document.siteMeta.targetAudience,
    seoTitle: `${companyName}${template.name}`,
    seoDescription: `面向${industry}的中文${template.name}，展示核心价值、服务内容、信任背书与咨询入口。`,
    keywords: Array.from(new Set([industry, template.name, ...document.siteMeta.keywords])),
  };
  document.theme = applyStyle(document.theme, input.style);
  document.blocks = document.blocks.map((block) => ({
    ...block,
    id: createId(`block-${block.type}`),
    props: { ...block.props },
    style: { ...block.style },
    visibility: { ...block.visibility },
  }));

  patchFooterCompany(document, companyName);

  return pageDocumentSchema.parse(document) as EnterprisePageDocument;
}
