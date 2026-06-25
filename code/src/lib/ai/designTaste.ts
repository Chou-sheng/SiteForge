import type { PageBlock } from "../../types/block";
import type { EnterprisePageDocument } from "../../types/page";

export type DesignTasteContext = {
  prompt?: string;
  industry?: string;
  style?: string;
  pageType?: string;
  title?: string;
  instruction?: string;
};

export type DesignTasteScope = "page-generation" | "block-edit";

type TasteProfile = {
  id: string;
  direction: string;
  requiresFoodPhotography: boolean;
  rules: string[];
};

const helperCopyPattern =
  /\bAI Generated\b|按当前页面需求|模块库|show\s+(menu|popular|customer|signature|category)|hero visual|call to action/i;
const foodPattern =
  /food|dish|menu|restaurant|chef|dining|cuisine|recipe|bistro|餐|菜|美食|料理|私厨|主厨|餐厅|菜单|甜品|饮品|预订/iu;
const foodDishPattern =
  /signature|popular|dish|menu|recommend|chef|主厨|人气|招牌|推荐|菜品|料理|美食/iu;
const categoryPattern = /category|categories|分类|早餐|午餐|晚餐|甜品|饮品/iu;
const navigationPattern = /header|nav|navigation|导航|菜单栏/iu;
const conversionPattern = /reservation|reserve|booking|预订|预约|餐位|contact|form|联系|表单/iu;
const footerPattern = /footer|页脚|地址|营业|电话|social|社交/iu;
const numberedIconPattern = /^0?\d{1,2}$/;

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function contextText(context: DesignTasteContext) {
  return [
    context.prompt,
    context.industry,
    context.style,
    context.pageType,
    context.title,
    context.instruction,
  ].filter(Boolean).join(" ");
}

function resolveTasteProfile(context: DesignTasteContext): TasteProfile {
  const corpus = contextText(context);

  if (foodPattern.test(corpus)) {
    return {
      id: "taste-restaurant-editorial",
      direction: "high-end restaurant homepage blended with an editorial food magazine",
      requiresFoodPhotography: true,
      rules: [
        "Use a warm, premium, appetite-led palette: cream, dark brown, olive, wine red, and restrained black-gold accents.",
        "Hero must feel like a real restaurant or food photography lead, not a split wireframe or generic SaaS hero.",
        "Dish and popular recommendation cards must include image.src, image.alt, a customer-facing tag in meta, and a price in value.",
        "Vary the section rhythm: navigation, immersive hero, photo-rich dishes, split brand story, compact categories, social proof, reservation, footer.",
        "Avoid blue/purple SaaS gradients, numbered placeholder boxes, and visible helper labels such as navigation or hero visual.",
      ],
    };
  }

  return {
    id: "taste-general-frontend",
    direction: "specific, non-template frontend direction inferred from the user brief",
    requiresFoodPhotography: false,
    rules: [
      "Infer the audience, domain, and emotional direction before choosing layout, palette, imagery, and component density.",
      "Use varied, purposeful sections instead of repeating equal cards with 01/02/03 labels.",
      "Make the first viewport unmistakably about the requested brand, product, place, or offer.",
      "Use real visual assets or precise image prompts where the page subject needs to be seen.",
      "Keep responsive behavior explicit: no overflowing forms, clipped headings, or empty grid holes on mobile or desktop.",
    ],
  };
}

export function buildDesignTasteInstruction(context: DesignTasteContext, scope: DesignTasteScope) {
  const profile = resolveTasteProfile(context);

  return [
    "DESIGN TASTE SKILL: design-taste-frontend",
    `Scope: ${scope}. This is a distilled runtime profile from the design-taste-frontend skill, not a module-library selection.`,
    `Design Read: ${profile.direction}.`,
    `Profile: ${profile.id}.`,
    "Quality bar:",
    "- No wireframe-like numbered cards unless the number is meaningful content.",
    "- No visible helper labels, debug text, module ids, or English planning labels in user-facing copy.",
    "- No one-note palettes; keep color, type, spacing, imagery, and interaction details coherent for the domain.",
    "- Hero, cards, forms, and footer must be responsive and must not overflow or leave obvious blank layout gaps.",
    "- Use polished Chinese user-facing copy unless the user explicitly asks for another language.",
    ...profile.rules.map((rule) => `- ${rule}`),
    "Return only the requested JSON shape. Do not mention this skill, design audit, or these rules in visible page copy.",
  ].join("\n");
}

function propRecord(block: PageBlock) {
  return isRecord(block.props) ? block.props : {};
}

function actionLabel(value: unknown) {
  return isRecord(value) ? textValue(value.label) : undefined;
}

function imageRecord(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  const src = textValue(value.src);
  const alt = textValue(value.alt);

  return src && alt ? { src, alt } : undefined;
}

function itemRecords(props: Record<string, unknown>) {
  const items = props.items;

  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(isRecord);
}

function stringListProp(props: Record<string, unknown>, key: string) {
  const value = props[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function visibleTextsFromBlock(block: PageBlock) {
  const props = propRecord(block);
  const texts = [
    block.name,
    textValue(props.intent),
    textValue(props.eyebrow),
    textValue(props.title),
    textValue(props.subtitle),
    textValue(props.description),
    actionLabel(props.primaryAction),
    actionLabel(props.secondaryAction),
  ];

  for (const item of itemRecords(props)) {
    texts.push(
      textValue(item.title),
      textValue(item.description),
      textValue(item.value),
      textValue(item.label),
      textValue(item.meta),
    );
  }

  return texts.flatMap((text) => (text ? [text] : []));
}

function blockIdentity(block: PageBlock) {
  return visibleTextsFromBlock(block).join(" ");
}

function blockLayout(block: PageBlock) {
  return textValue(propRecord(block).layout);
}

function blockTitle(block: PageBlock) {
  return textValue(propRecord(block).title) ?? block.name;
}

function hasVisual(block: PageBlock) {
  const props = propRecord(block);

  if (imageRecord(props.image)) {
    return true;
  }

  return itemRecords(props).some((item) => Boolean(imageRecord(item.image)));
}

function isFoodDishBlock(block: PageBlock, profile: TasteProfile) {
  if (!profile.requiresFoodPhotography) {
    return false;
  }

  const identity = blockIdentity(block);

  return foodDishPattern.test(identity) && !categoryPattern.test(identity);
}

function hasPrice(item: Record<string, unknown>) {
  return Boolean(textValue(item.value) ?? textValue(item.price));
}

function hasAction(value: unknown) {
  return Boolean(actionLabel(value));
}

function isConversionBlock(block: PageBlock, identity: string) {
  const layout = blockLayout(block);

  if (layout === "conversion") {
    return true;
  }

  if (layout === "hero" || layout === "split-story") {
    return false;
  }

  return conversionPattern.test(identity);
}

function hasBareNumberedCards(block: PageBlock) {
  if (blockLayout(block) === "timeline") {
    return false;
  }

  const items = itemRecords(propRecord(block));

  if (items.length < 3) {
    return false;
  }

  const bareCount = items.filter((item) => {
    const icon = textValue(item.icon);
    const title = textValue(item.title) ?? "";
    const description = textValue(item.description) ?? "";

    return (
      Boolean(icon && numberedIconPattern.test(icon)) &&
      !imageRecord(item.image) &&
      !hasPrice(item) &&
      title.length <= 12 &&
      description.length <= 28
    );
  }).length;

  return bareCount >= 3;
}

function getBlockIssues(block: PageBlock, profile: TasteProfile) {
  const issues: string[] = [];
  const props = propRecord(block);
  const identity = blockIdentity(block);
  const badCopy = visibleTextsFromBlock(block).find((text) => helperCopyPattern.test(text));

  if (badCopy) {
    issues.push(`visible helper copy: ${badCopy}`);
  }

  if (hasBareNumberedCards(block)) {
    issues.push(`${blockTitle(block)} uses bare numbered placeholder cards`);
  }

  if (blockLayout(block) === "hero" && profile.requiresFoodPhotography && !hasVisual(block)) {
    issues.push(`${blockTitle(block)} is a food hero without photography`);
  }

  if (isFoodDishBlock(block, profile)) {
    const items = itemRecords(props);

    if (items.length >= 3) {
      const visualCount = items.filter((item) => imageRecord(item.image)).length;
      const priceCount = items.filter(hasPrice).length;
      const requiredCount = Math.ceil(items.length * 0.75);

      if (visualCount < requiredCount) {
        issues.push(`${blockTitle(block)} needs matched food photography on dish cards`);
      }

      if (priceCount < requiredCount) {
        issues.push(`${blockTitle(block)} needs customer-facing prices in value`);
      }
    }
  }

  if (navigationPattern.test(identity) && itemRecords(props).length === 0) {
    issues.push(`${blockTitle(block)} needs AI-provided navigation items`);
  }

  if (isConversionBlock(block, identity)) {
    if (stringListProp(props, "fields").length === 0) {
      issues.push(`${blockTitle(block)} needs AI-provided form fields`);
    }

    if (!hasAction(props.primaryAction)) {
      issues.push(`${blockTitle(block)} needs an AI-provided primary action`);
    }
  }

  if (footerPattern.test(identity) && itemRecords(props).length < 3) {
    issues.push(`${blockTitle(block)} needs AI-provided footer contact items`);
  }

  return issues;
}

export function getDesignTasteBlockIssues(block: PageBlock, context: DesignTasteContext) {
  return getBlockIssues(block, resolveTasteProfile(context));
}

export function getDesignTasteIssues(document: EnterprisePageDocument, context: DesignTasteContext) {
  const profile = resolveTasteProfile(context);
  const issues = document.blocks.flatMap((block) => getBlockIssues(block, profile));

  for (let index = 1; index < document.blocks.length; index += 1) {
    const previous = document.blocks[index - 1];
    const current = document.blocks[index];

    if (
      blockLayout(previous) === blockLayout(current) &&
      blockTitle(previous) === blockTitle(current) &&
      textValue(propRecord(previous).description) === textValue(propRecord(current).description)
    ) {
      issues.push(`duplicated adjacent section: ${blockTitle(current)}`);
    }
  }

  return issues;
}
