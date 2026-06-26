import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import type { BlockRendererProps } from "../types";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import {
  getActionProp,
  getContainerMaxWidth,
  getFeatureList,
  getImageProp,
  getMetricList,
  getSectionStyle,
  getStringProp,
} from "../shared/renderHelpers";

type GeneratedItem = ReturnType<typeof getFeatureList>[number];
type Action = { label: string; href: string };

function identityText(props: Record<string, unknown>, blockName: string) {
  return [
    blockName,
    getStringProp(props, "generatedModuleId"),
    getStringProp(props, "intent"),
    getStringProp(props, "layout"),
    getStringProp(props, "title"),
    getStringProp(props, "subtitle"),
  ].filter(Boolean).join(" ").toLowerCase();
}

function hasIntent(identity: string, pattern: RegExp) {
  return pattern.test(identity);
}

function getStringListProp(props: Record<string, unknown>, key: string) {
  const value = props[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => (typeof item === "string" && item.trim() ? [item] : []));
}

function getDisplayImage(item: GeneratedItem | undefined) {
  return item?.image;
}

function renderActions(primary?: Action, secondary?: Action, align: "left" | "center" = "left") {
  if (!primary && !secondary) {
    return null;
  }

  return (
    <div className={[
      "mt-8 flex flex-wrap items-center gap-3",
      align === "center" ? "justify-center" : "justify-start",
    ].join(" ")}
    >
      {primary ? (
        <a
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#6f1d2b] px-6 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(111,29,43,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#4d1320] active:translate-y-0"
          href={primary.href}
        >
          {primary.label}
        </a>
      ) : null}
      {secondary ? (
        <a
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#3c2a1e]/25 bg-white/70 px-6 text-sm font-semibold text-[#2a1b12] transition duration-300 hover:-translate-y-0.5 hover:border-[#6f1d2b] hover:text-[#6f1d2b] active:translate-y-0"
          href={secondary.href}
        >
          {secondary.label}
        </a>
      ) : null}
    </div>
  );
}

function renderSectionHeader(eyebrow: string | undefined, title: string, subtitle?: string, centered = false) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left"}>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f1d2b]">{eyebrow}</p> : null}
      <h2 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-normal text-[#241911] sm:text-5xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-4 text-base leading-8 text-[#6b5c50]">{subtitle}</p> : null}
    </div>
  );
}

function renderNavigation(
  title: string,
  items: GeneratedItem[],
  primaryAction?: Action,
) {
  return (
    <header className="border-b border-[#eadfce] bg-[#fbf7ef]">
      <nav
        aria-label={`${title}导航`}
        className="mx-auto flex min-h-20 max-w-[1180px] items-center justify-between gap-6 px-6"
      >
        <a className="text-xl font-semibold tracking-normal text-[#241911]" href="#home">
          {title}
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {items.map((item) => (
            <a
              className="text-sm font-medium text-[#59463a] transition duration-300 hover:text-[#6f1d2b]"
              href={item.href ?? `#${item.title}`}
              key={item.title}
            >
              {item.title}
            </a>
          ))}
        </div>
        {primaryAction ? (
          <a
            className="inline-flex min-h-11 items-center rounded-full bg-[#241911] px-5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#6f1d2b] active:translate-y-0"
            href={primaryAction.href}
          >
            {primaryAction.label}
          </a>
        ) : null}
      </nav>
    </header>
  );
}

function renderHero(
  block: BlockRendererProps["block"],
  title: string,
  subtitle: string | undefined,
  eyebrow: string | undefined,
  items: GeneratedItem[],
  primaryAction?: Action,
  secondaryAction?: Action,
) {
  const image = getImageProp(block.props, "image") ?? getDisplayImage(items[0]);

  return (
    <section className="bg-[#fbf7ef] px-6 py-14 sm:py-20">
      <div
        className={[
          "mx-auto grid max-w-[1180px] items-center gap-12",
          image ? "lg:grid-cols-[0.9fr_1.1fr]" : "",
        ].join(" ")}
      >
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f1d2b]">{eyebrow}</p> : null}
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-normal text-[#241911] sm:text-7xl">
            {title}
          </h1>
          {subtitle ? <p className="mt-6 max-w-xl text-lg leading-9 text-[#6b5c50]">{subtitle}</p> : null}
          {renderActions(primaryAction, secondaryAction)}
        </div>
        {image ? (
          <div className="relative">
            <div className="absolute -left-5 top-8 hidden h-44 w-32 border border-[#b9a98e] md:block" />
            <div className="relative overflow-hidden rounded-[28px] bg-[#241911] p-3 shadow-[0_28px_80px_rgba(36,25,17,0.20)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={image.alt}
                className="aspect-[5/4] w-full rounded-[22px] object-cover transition duration-700 hover:scale-[1.03]"
                src={image.src}
              />
            </div>
            {items.length > 0 ? (
              <div className="absolute -bottom-8 left-6 right-6 rounded-2xl border border-[#eadfce] bg-white/92 p-5 shadow-[0_18px_50px_rgba(36,25,17,0.14)] backdrop-blur">
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {items.slice(0, 2).map((item) => (
                    <div key={item.title}>
                      <p className="font-semibold text-[#241911]">{item.title}</p>
                      {item.description ? <p className="mt-1 text-sm leading-6 text-[#6b5c50]">{item.description}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function renderDishGrid(
  block: BlockRendererProps["block"],
  title: string,
  subtitle: string | undefined,
  eyebrow: string | undefined,
  items: GeneratedItem[],
) {
  const maxWidth = getContainerMaxWidth(block.style);

  return (
    <section className="bg-[#fffaf2] px-6 py-20 sm:py-24">
      <div className="mx-auto" style={{ maxWidth }}>
        {renderSectionHeader(eyebrow, title, subtitle)}
        <div
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          data-testid="generated-food-grid"
        >
          {items.map((item, index) => {
            const image = getDisplayImage(item);
            const price = item.value ?? item.label;

            return (
              <article
                className="group overflow-hidden rounded-[24px] border border-[#eadfce] bg-white shadow-[0_18px_48px_rgba(36,25,17,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(36,25,17,0.14)]"
                key={`${item.title}-${index}`}
              >
                {image ? (
                  <div className="overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={image.alt}
                      className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                      src={image.src}
                    />
                  </div>
                ) : null}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {item.meta ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f1d2b]">{item.meta}</p> : null}
                      <h3 className="mt-2 text-2xl font-semibold leading-tight text-[#241911]">{item.title}</h3>
                    </div>
                    {price ? <p className="shrink-0 text-lg font-semibold text-[#6f1d2b]">{price}</p> : null}
                  </div>
                  {item.description ? <p className="mt-4 text-sm leading-7 text-[#6b5c50]">{item.description}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function renderCategoryGrid(
  block: BlockRendererProps["block"],
  title: string,
  subtitle: string | undefined,
  eyebrow: string | undefined,
  items: GeneratedItem[],
) {
  const maxWidth = getContainerMaxWidth(block.style);

  return (
    <section className="bg-[#fbf7ef] px-6 py-20">
      <div className="mx-auto" style={{ maxWidth }}>
        {renderSectionHeader(eyebrow, title, subtitle, true)}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item, index) => (
            <a
              className="rounded-[22px] border border-[#d8c6aa] bg-white/70 p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-[#6f1d2b] hover:bg-white"
              href={item.href ?? `#category-${index + 1}`}
              key={`${item.title}-${index}`}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f1d2b]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-2xl font-semibold text-[#241911]">{item.title}</h3>
              {item.description ? <p className="mt-3 text-sm leading-6 text-[#6b5c50]">{item.description}</p> : null}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderSplitStory(
  block: BlockRendererProps["block"],
  title: string,
  subtitle: string | undefined,
  eyebrow: string | undefined,
  items: GeneratedItem[],
  primaryAction?: Action,
  secondaryAction?: Action,
) {
  const maxWidth = getContainerMaxWidth(block.style);
  const image = getImageProp(block.props, "image") ?? getDisplayImage(items[0]);

  return (
    <section className="bg-white px-6 py-20 sm:py-28">
      <div
        className={[
          "mx-auto grid items-center gap-12",
          image ? "lg:grid-cols-[1fr_0.92fr]" : "",
        ].join(" ")}
        style={{ maxWidth }}
      >
        <div>
          {renderSectionHeader(eyebrow, title, subtitle)}
          {items.length > 0 ? (
            <div className="mt-9 grid gap-4">
              {items.slice(0, 3).map((item) => (
                <div className="border-l border-[#6f1d2b] pl-5" key={item.title}>
                  <h3 className="text-lg font-semibold text-[#241911]">{item.title}</h3>
                  {item.description ? <p className="mt-2 text-sm leading-7 text-[#6b5c50]">{item.description}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
          {renderActions(primaryAction, secondaryAction)}
        </div>
        {image ? (
          <div className="overflow-hidden rounded-[28px] bg-[#2d3520] p-3 shadow-[0_24px_70px_rgba(36,25,17,0.16)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={image.alt}
              className="aspect-[4/5] w-full rounded-[22px] object-cover transition duration-700 hover:scale-[1.03]"
              src={image.src}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function renderMetrics(metrics: ReturnType<typeof getMetricList>) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <article className="rounded-[22px] border border-[#eadfce] bg-white/78 p-6" key={`${metric.value}-${metric.label}`}>
          <p className="text-4xl font-semibold text-[#6f1d2b]">{metric.value}</p>
          <h3 className="mt-3 text-base font-semibold text-[#241911]">{metric.label}</h3>
          {metric.description ? <p className="mt-2 text-sm leading-6 text-[#6b5c50]">{metric.description}</p> : null}
        </article>
      ))}
    </div>
  );
}

function renderTimeline(
  block: BlockRendererProps["block"],
  title: string,
  subtitle: string | undefined,
  eyebrow: string | undefined,
  items: GeneratedItem[],
) {
  const maxWidth = getContainerMaxWidth(block.style);

  return (
    <section className="bg-[#fbf7ef] px-6 py-20">
      <div className="mx-auto" style={{ maxWidth }}>
        {renderSectionHeader(eyebrow, title, subtitle)}
        <div className="mt-12 grid gap-5">
          {items.map((item, index) => (
            <article
              className="grid gap-5 rounded-[24px] border border-[#eadfce] bg-white/78 p-6 sm:grid-cols-[90px_1fr]"
              key={`${item.title}-${index}`}
            >
              <p className="text-sm font-semibold tracking-[0.16em] text-[#6f1d2b]">
                {item.icon ?? String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <h3 className="text-2xl font-semibold text-[#241911]">{item.title}</h3>
                {item.description ? <p className="mt-3 text-sm leading-7 text-[#6b5c50]">{item.description}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderProof(
  block: BlockRendererProps["block"],
  title: string,
  subtitle: string | undefined,
  eyebrow: string | undefined,
  items: GeneratedItem[],
) {
  const maxWidth = getContainerMaxWidth(block.style);

  return (
    <section className="bg-white px-6 py-20 sm:py-24">
      <div className="mx-auto" style={{ maxWidth }}>
        {renderSectionHeader(eyebrow, title, subtitle, true)}
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {items.map((item, index) => (
            <figure
              className="rounded-[24px] border border-[#eadfce] bg-[#fffaf2] p-6 text-left"
              key={`${item.title}-${index}`}
            >
              <p className="text-sm font-semibold tracking-[0.12em] text-[#6f1d2b]">{item.meta ?? item.label ?? "★★★★★"}</p>
              <blockquote className="mt-5 text-lg font-medium leading-8 text-[#241911]">
                {item.description ?? item.title}
              </blockquote>
              <figcaption className="mt-6 text-sm text-[#6b5c50]">{item.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderConversion(
  block: BlockRendererProps["block"],
  title: string,
  subtitle: string | undefined,
  eyebrow: string | undefined,
  fields: string[],
  primaryAction?: Action,
) {
  const maxWidth = getContainerMaxWidth(block.style);

  return (
    <section className="bg-[#28351f] px-4 py-16 sm:px-6 sm:py-24">
      <div
        className="mx-auto grid min-w-0 gap-8 overflow-hidden rounded-[30px] bg-[#fffaf2] p-6 shadow-[0_26px_70px_rgba(36,25,17,0.18)] sm:p-8 lg:grid-cols-[0.72fr_1.28fr] lg:p-10"
        style={{ maxWidth }}
      >
        <div className="min-w-0">
          {renderSectionHeader(eyebrow, title, subtitle)}
        </div>
        <form className="grid min-w-0 gap-4 rounded-[24px] border border-[#eadfce] bg-white p-4 shadow-[0_16px_42px_rgba(36,25,17,0.08)] sm:p-5">
          <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3" data-testid="generated-reservation-fields">
            {fields.map((field) => (
              <label className="grid min-w-0 gap-2 text-sm font-semibold text-[#3c2a1e]" key={field}>
                {field}
                <input
                  className="min-h-12 min-w-0 rounded-full border border-[#d8c6aa] bg-[#fffaf2] px-4 text-[#241911] outline-none transition focus:border-[#6f1d2b] focus:ring-2 focus:ring-[#6f1d2b]/15"
                  placeholder={`请输入${field}`}
                />
              </label>
            ))}
          </div>
          {primaryAction ? (
            <button
              className="mt-2 min-h-12 rounded-full bg-[#6f1d2b] px-6 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#4d1320] active:translate-y-0"
              type="button"
            >
              {primaryAction.label}
            </button>
          ) : null}
        </form>
      </div>
    </section>
  );
}

function renderFooter(
  title: string,
  subtitle: string | undefined,
  items: GeneratedItem[],
  primaryAction?: Action,
  secondaryAction?: Action,
) {
  return (
    <footer className="bg-[#1f1712] px-6 py-16 text-white">
      <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-3xl font-semibold">{title}</h2>
          {subtitle ? <p className="mt-4 max-w-md text-sm leading-7 text-[#d8c6aa]">{subtitle}</p> : null}
          {renderActions(primaryAction, secondaryAction)}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div className="border-t border-white/15 pt-4" key={item.title}>
              <h3 className="text-sm font-semibold text-[#e8d7b9]">{item.title}</h3>
              {item.description ? <p className="mt-2 text-sm leading-6 text-white/72">{item.description}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

function AiGeneratedSectionRenderer({ block }: BlockRendererProps) {
  const props = block.props;
  const layout = getStringProp(props, "layout") ?? "feature-grid";
  const eyebrow = getStringProp(props, "eyebrow");
  const title = getStringProp(props, "title") ?? "精选内容";
  const subtitle = getStringProp(props, "subtitle") ?? getStringProp(props, "description");
  const primaryAction = getActionProp(props, "primaryAction");
  const secondaryAction = getActionProp(props, "secondaryAction");
  const items = getFeatureList(props, "items");
  const metrics = getMetricList(props, "metrics");
  const fields = getStringListProp(props, "fields");
  const identity = identityText(props, block.name);

  if (hasIntent(identity, /header|nav|navigation|导航|菜单栏/)) {
    return renderNavigation(title, items, primaryAction);
  }

  if (hasIntent(identity, /footer|页脚|地址|营业|电话|social|社交/)) {
    return renderFooter(title, subtitle, items, primaryAction, secondaryAction);
  }

  if (layout === "hero") {
    return renderHero(block, title, subtitle, eyebrow, items, primaryAction, secondaryAction);
  }

  if (layout === "split-story") {
    return renderSplitStory(block, title, subtitle, eyebrow, items, primaryAction, secondaryAction);
  }

  if (layout === "conversion" || hasIntent(identity, /reservation|reserve|booking|预订|预约|餐位/)) {
    return renderConversion(block, title, subtitle, eyebrow, fields, primaryAction);
  }

  if (layout === "timeline") {
    return renderTimeline(block, title, subtitle, eyebrow, items);
  }

  if (layout === "proof" || hasIntent(identity, /review|testimonial|评价|评论|心声|顾客|口碑/)) {
    return renderProof(block, title, subtitle, eyebrow, items);
  }

  if (hasIntent(identity, /category|categories|分类|早餐|午餐|晚餐|甜品|饮品/)) {
    return renderCategoryGrid(block, title, subtitle, eyebrow, items);
  }

  if (items.length > 0) {
    return renderDishGrid(block, title, subtitle, eyebrow, items);
  }

  return (
    <section style={getSectionStyle(block.style)}>
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        {renderSectionHeader(eyebrow, title, subtitle, layout === "proof")}
        {renderMetrics(metrics)}
      </div>
    </section>
  );
}

export const aiGeneratedSectionBlock = defineBlock<Record<string, unknown>>({
  type: "aiGeneratedSection",
  name: "AI 生成模块",
  category: "content",
  description: "页面级一次性生成区块，只用于承载 AI 为当前页面生成的新模块结构。",
  variants: [
    { id: "generated", name: "页面级生成" },
    { id: "generated-hero", name: "生成首屏" },
    { id: "generated-grid", name: "生成网格" },
  ],
  defaultProps: {
    generatedModuleId: "generated-default",
    intent: "精选内容",
    layout: "feature-grid",
    eyebrow: "Selected",
    title: "精选体验",
    description: "以统一的视觉节奏承接当前页面的核心内容。",
    items: [
      { icon: "sparkles", title: "核心亮点", description: "突出最重要的页面信息。" },
      { icon: "layout", title: "视觉节奏", description: "保持内容、图片和行动入口统一。" },
      { icon: "target", title: "转化路径", description: "帮助访客快速完成下一步操作。" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 88, paddingBottom: 88, textAlign: "left", container: "contained" },
  variantDefaults: {
    "generated-hero": {
      props: {
        layout: "hero",
        intent: "首屏转化",
        title: "面向当前页面的一次性首屏模块",
      },
      style: { background: "gradient", paddingTop: 104, paddingBottom: 104 },
    },
    "generated-grid": {
      props: {
        layout: "feature-grid",
        intent: "内容展示",
      },
      style: { background: "muted" },
    },
  },
  propsSchema: blockPropsSchemas.aiGeneratedSection,
  Renderer: AiGeneratedSectionRenderer,
  Inspector: GenericBlockInspector,
});

export default aiGeneratedSectionBlock;
