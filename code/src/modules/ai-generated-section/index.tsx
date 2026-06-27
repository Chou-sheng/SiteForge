import type { CSSProperties } from "react";

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
  getStringProp,
} from "../shared/renderHelpers";

type GeneratedItem = ReturnType<typeof getFeatureList>[number];
type GeneratedMetric = ReturnType<typeof getMetricList>[number];
type Action = { label: string; href: string };

const sectionBaseClass = "px-6";
const surfaceClass = "border border-[var(--page-border)] bg-[var(--page-surface)] shadow-[var(--page-shadow-card)]";
const elevatedSurfaceClass = "border border-[var(--page-border)] bg-[var(--page-surface)] shadow-[var(--page-shadow-elevated)]";

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

function sectionToneStyle(block: BlockRendererProps["block"]): CSSProperties {
  const style = {
    paddingTop: block.style.paddingTop,
    paddingBottom: block.style.paddingBottom,
    textAlign: block.style.textAlign,
  } satisfies CSSProperties;

  if (block.style.background === "primary" || block.style.background === "image") {
    return {
      ...style,
      background: "var(--page-primary)",
      color: "#ffffff",
    };
  }

  if (block.style.background === "muted") {
    return {
      ...style,
      background: "var(--page-muted)",
      color: "var(--page-text-primary)",
    };
  }

  if (block.style.background === "gradient") {
    return {
      ...style,
      background:
        "linear-gradient(135deg, var(--page-background) 0%, var(--page-muted) 48%, color-mix(in srgb, var(--page-secondary) 18%, var(--page-background)) 100%)",
      color: "var(--page-text-primary)",
    };
  }

  return {
    ...style,
    background: "var(--page-background)",
    color: "var(--page-text-primary)",
  };
}

function textSecondaryClass() {
  return "text-[var(--page-text-secondary)]";
}

function renderActions(primary?: Action, secondary?: Action, align: "left" | "center" = "left") {
  if (!primary && !secondary) {
    return null;
  }

  return (
    <div
      className={[
        "mt-8 flex flex-wrap items-center gap-3",
        align === "center" ? "justify-center" : "justify-start",
      ].join(" ")}
    >
      {primary ? (
        <a
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--page-primary)] px-6 text-sm font-semibold text-white shadow-[var(--page-shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--page-primary-hover)] active:translate-y-0"
          href={primary.href}
        >
          {primary.label}
        </a>
      ) : null}
      {secondary ? (
        <a
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--page-border)] bg-[var(--page-surface)] px-6 text-sm font-semibold text-[var(--page-text-primary)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--page-secondary)] hover:text-[var(--page-secondary)] active:translate-y-0"
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
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--page-secondary)]">{eyebrow}</p> : null}
      <h2 className="mt-3 text-4xl font-semibold leading-[1.06] tracking-normal text-[var(--page-text-primary)] sm:text-5xl">
        {title}
      </h2>
      {subtitle ? <p className={`mt-4 text-base leading-8 ${textSecondaryClass()}`}>{subtitle}</p> : null}
    </div>
  );
}

function renderNavigation(
  title: string,
  items: GeneratedItem[],
  primaryAction?: Action,
) {
  return (
    <header className="border-b border-[var(--page-border)] bg-[var(--page-surface)] px-6">
      <nav
        aria-label={`${title}导航`}
        className="mx-auto flex min-h-20 max-w-[1180px] items-center justify-between gap-6"
      >
        <a className="text-xl font-semibold tracking-normal text-[var(--page-text-primary)]" href="#home">
          {title}
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {items.map((item) => (
            <a
              className={`text-sm font-medium transition duration-300 hover:text-[var(--page-secondary)] ${textSecondaryClass()}`}
              href={item.href ?? `#${item.title}`}
              key={item.title}
            >
              {item.title}
            </a>
          ))}
        </div>
        {primaryAction ? (
          <a
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--page-primary)] px-5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--page-primary-hover)] active:translate-y-0"
            href={primaryAction.href}
          >
            {primaryAction.label}
          </a>
        ) : null}
      </nav>
    </header>
  );
}

function renderFieldInputs(fields: string[], submitLabel?: string, compact = false) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <form className={[
      "mt-8 grid min-w-0 gap-3 rounded-[var(--page-radius-xl)] border border-[var(--page-border)] bg-[var(--page-surface)] p-3 shadow-[var(--page-shadow-card)]",
      compact ? "sm:grid-cols-[1fr_auto]" : "",
    ].join(" ")}
    >
      <div
        className={[
          "grid min-w-0 gap-3",
          compact ? "" : "md:grid-cols-2 xl:grid-cols-3",
        ].join(" ")}
        data-testid={compact ? "generated-hero-fields" : "generated-conversion-fields"}
      >
        {fields.map((field) => (
          <label className="grid min-w-0 gap-2 text-sm font-semibold text-[var(--page-text-primary)]" key={field}>
            {field}
            <input
              className="min-h-12 min-w-0 rounded-full border border-[var(--page-border)] bg-[var(--page-muted)] px-4 text-[var(--page-text-primary)] outline-none transition placeholder:text-[var(--page-text-secondary)] focus:border-[var(--page-secondary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--page-secondary)_20%,transparent)]"
              placeholder={`请输入${field}`}
            />
          </label>
        ))}
      </div>
      <button
        className="min-h-12 rounded-full bg-[var(--page-primary)] px-6 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--page-primary-hover)] active:translate-y-0"
        type="button"
      >
        {submitLabel ?? fields[0]}
      </button>
    </form>
  );
}

function renderItemMiniPanel(items: GeneratedItem[]) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`mt-8 grid gap-3 rounded-[var(--page-radius-xl)] p-4 ${surfaceClass} sm:grid-cols-2`}>
      {items.slice(0, 2).map((item) => (
        <div key={item.title}>
          <p className="font-semibold text-[var(--page-text-primary)]">{item.title}</p>
          {item.description ? <p className={`mt-1 text-sm leading-6 ${textSecondaryClass()}`}>{item.description}</p> : null}
        </div>
      ))}
    </div>
  );
}

function renderHero(
  block: BlockRendererProps["block"],
  title: string,
  subtitle: string | undefined,
  eyebrow: string | undefined,
  items: GeneratedItem[],
  fields: string[],
  primaryAction?: Action,
  secondaryAction?: Action,
) {
  const image = getImageProp(block.props, "image") ?? getDisplayImage(items[0]);

  return (
    <section className={sectionBaseClass} style={sectionToneStyle(block)}>
      <div
        className={[
          "mx-auto grid max-w-[1180px] items-center gap-12",
          image ? "lg:grid-cols-[0.94fr_1.06fr]" : "",
        ].join(" ")}
      >
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--page-secondary)]">{eyebrow}</p> : null}
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-normal text-[var(--page-text-primary)] sm:text-7xl">
            {title}
          </h1>
          {subtitle ? <p className={`mt-6 max-w-xl text-lg leading-9 ${textSecondaryClass()}`}>{subtitle}</p> : null}
          {renderFieldInputs(fields.slice(0, 1), fields[0], true)}
          {renderActions(primaryAction, secondaryAction)}
          {!image ? renderItemMiniPanel(items) : null}
        </div>
        {image ? (
          <div className="relative">
            <div className={`relative overflow-hidden rounded-[calc(var(--page-radius-xl)+12px)] p-3 ${elevatedSurfaceClass}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={image.alt}
                className="aspect-[5/4] w-full rounded-[var(--page-radius-xl)] object-cover transition duration-700 hover:scale-[1.03]"
                src={image.src}
              />
            </div>
            {renderItemMiniPanel(items)}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function renderContentGrid(
  block: BlockRendererProps["block"],
  title: string,
  subtitle: string | undefined,
  eyebrow: string | undefined,
  items: GeneratedItem[],
) {
  const maxWidth = getContainerMaxWidth(block.style);

  return (
    <section className={sectionBaseClass} style={sectionToneStyle(block)}>
      <div className="mx-auto" style={{ maxWidth }}>
        {renderSectionHeader(eyebrow, title, subtitle)}
        <div
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          data-testid="generated-content-grid"
        >
          {items.map((item, index) => {
            const image = getDisplayImage(item);

            return (
              <article
                className={`group overflow-hidden rounded-[var(--page-radius-xl)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--page-shadow-elevated)] ${surfaceClass}`}
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
                      {item.meta ? <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--page-secondary)]">{item.meta}</p> : null}
                      <h3 className="mt-2 text-2xl font-semibold leading-tight text-[var(--page-text-primary)]">{item.title}</h3>
                    </div>
                    {item.value ? <p className="shrink-0 text-lg font-semibold text-[var(--page-secondary)]">{item.value}</p> : null}
                  </div>
                  {item.label ? (
                    <p className="mt-4 inline-flex rounded-full bg-[var(--page-muted)] px-3 py-1 text-xs font-semibold text-[var(--page-text-primary)]">
                      {item.label}
                    </p>
                  ) : null}
                  {item.description ? <p className={`mt-4 text-sm leading-7 ${textSecondaryClass()}`}>{item.description}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function renderCompactGrid(
  block: BlockRendererProps["block"],
  title: string,
  subtitle: string | undefined,
  eyebrow: string | undefined,
  items: GeneratedItem[],
) {
  const maxWidth = getContainerMaxWidth(block.style);

  return (
    <section className={sectionBaseClass} style={sectionToneStyle(block)}>
      <div className="mx-auto" style={{ maxWidth }}>
        {renderSectionHeader(eyebrow, title, subtitle, true)}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {items.map((item, index) => (
            <a
              className={`rounded-[var(--page-radius-xl)] p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-[var(--page-secondary)] ${surfaceClass}`}
              href={item.href ?? `#category-${index + 1}`}
              key={`${item.title}-${index}`}
            >
              {item.icon ? <span className="text-sm font-semibold text-[var(--page-secondary)]">{item.icon}</span> : null}
              <h3 className="mt-3 text-xl font-semibold text-[var(--page-text-primary)]">{item.title}</h3>
              {item.description ? <p className={`mt-3 text-sm leading-6 ${textSecondaryClass()}`}>{item.description}</p> : null}
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
    <section className={sectionBaseClass} style={sectionToneStyle(block)}>
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
              {items.slice(0, 4).map((item) => (
                <div className="border-l border-[var(--page-secondary)] pl-5" key={item.title}>
                  <h3 className="text-lg font-semibold text-[var(--page-text-primary)]">{item.title}</h3>
                  {item.description ? <p className={`mt-2 text-sm leading-7 ${textSecondaryClass()}`}>{item.description}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
          {renderActions(primaryAction, secondaryAction)}
        </div>
        {image ? (
          <div className={`overflow-hidden rounded-[calc(var(--page-radius-xl)+12px)] p-3 ${elevatedSurfaceClass}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={image.alt}
              className="aspect-[4/5] w-full rounded-[var(--page-radius-xl)] object-cover transition duration-700 hover:scale-[1.03]"
              src={image.src}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function renderMetrics(metrics: GeneratedMetric[]) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <article className={`rounded-[var(--page-radius-xl)] p-6 ${surfaceClass}`} key={`${metric.value}-${metric.label}`}>
          <p className="text-4xl font-semibold text-[var(--page-secondary)]">{metric.value}</p>
          <h3 className="mt-3 text-base font-semibold text-[var(--page-text-primary)]">{metric.label}</h3>
          {metric.description ? <p className={`mt-2 text-sm leading-6 ${textSecondaryClass()}`}>{metric.description}</p> : null}
        </article>
      ))}
    </div>
  );
}

function renderMetricSection(
  block: BlockRendererProps["block"],
  title: string,
  subtitle: string | undefined,
  eyebrow: string | undefined,
  metrics: GeneratedMetric[],
  items: GeneratedItem[],
) {
  const maxWidth = getContainerMaxWidth(block.style);

  return (
    <section className={sectionBaseClass} style={sectionToneStyle(block)}>
      <div className="mx-auto" style={{ maxWidth }}>
        {renderSectionHeader(eyebrow, title, subtitle)}
        {renderMetrics(metrics)}
        {items.length > 0 ? (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {items.slice(0, 4).map((item) => (
              <article className={`rounded-[var(--page-radius-xl)] p-5 ${surfaceClass}`} key={item.title}>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-[var(--page-text-primary)]">{item.title}</h3>
                  {item.value ? <span className="text-sm font-semibold text-[var(--page-secondary)]">{item.value}</span> : null}
                </div>
                {item.description ? <p className={`mt-3 text-sm leading-7 ${textSecondaryClass()}`}>{item.description}</p> : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
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
    <section className={sectionBaseClass} style={sectionToneStyle(block)}>
      <div className="mx-auto" style={{ maxWidth }}>
        {renderSectionHeader(eyebrow, title, subtitle)}
        <div className="mt-12 grid gap-5">
          {items.map((item, index) => (
            <article
              className={`grid gap-5 rounded-[var(--page-radius-xl)] p-6 sm:grid-cols-[90px_1fr] ${surfaceClass}`}
              key={`${item.title}-${index}`}
            >
              <p className="text-sm font-semibold tracking-[0.14em] text-[var(--page-secondary)]">
                {item.icon ?? String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <h3 className="text-2xl font-semibold text-[var(--page-text-primary)]">{item.title}</h3>
                {item.description ? <p className={`mt-3 text-sm leading-7 ${textSecondaryClass()}`}>{item.description}</p> : null}
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
    <section className={sectionBaseClass} style={sectionToneStyle(block)}>
      <div className="mx-auto" style={{ maxWidth }}>
        {renderSectionHeader(eyebrow, title, subtitle, true)}
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {items.map((item, index) => (
            <figure
              className={`rounded-[var(--page-radius-xl)] p-6 text-left ${surfaceClass}`}
              key={`${item.title}-${index}`}
            >
              <p className="text-sm font-semibold tracking-[0.12em] text-[var(--page-secondary)]">{item.meta ?? item.label ?? "真实反馈"}</p>
              <blockquote className="mt-5 text-lg font-medium leading-8 text-[var(--page-text-primary)]">
                {item.description ?? item.title}
              </blockquote>
              <figcaption className={`mt-6 text-sm ${textSecondaryClass()}`}>{item.title}</figcaption>
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
    <section className={sectionBaseClass} style={sectionToneStyle(block)}>
      <div
        className={`mx-auto grid min-w-0 gap-8 overflow-hidden rounded-[calc(var(--page-radius-xl)+14px)] p-6 sm:p-8 lg:grid-cols-[0.72fr_1.28fr] lg:p-10 ${elevatedSurfaceClass}`}
        style={{ maxWidth }}
      >
        <div className="min-w-0">
          {renderSectionHeader(eyebrow, title, subtitle)}
        </div>
        <div>
          {renderFieldInputs(fields, primaryAction?.label)}
        </div>
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
    <footer className="bg-[var(--page-primary)] px-6 py-16 text-white">
      <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-3xl font-semibold">{title}</h2>
          {subtitle ? <p className="mt-4 max-w-md text-sm leading-7 text-white/72">{subtitle}</p> : null}
          {renderActions(primaryAction, secondaryAction)}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div className="border-t border-white/15 pt-4" key={item.title}>
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
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

  if (hasIntent(identity, /footer|页脚|地址|电话|social|社交|联系/)) {
    return renderFooter(title, subtitle, items, primaryAction, secondaryAction);
  }

  if (layout === "hero") {
    return renderHero(block, title, subtitle, eyebrow, items, fields, primaryAction, secondaryAction);
  }

  if (layout === "split-story") {
    return renderSplitStory(block, title, subtitle, eyebrow, items, primaryAction, secondaryAction);
  }

  if (layout === "conversion" || hasIntent(identity, /cta|contact|lead|conversion|预约|咨询|联系|转化|报名|试用|购买/)) {
    return renderConversion(block, title, subtitle, eyebrow, fields, primaryAction);
  }

  if (layout === "timeline") {
    return renderTimeline(block, title, subtitle, eyebrow, items);
  }

  if (layout === "proof" || hasIntent(identity, /review|testimonial|评价|评论|用户|口碑|案例|反馈|proof/)) {
    return renderProof(block, title, subtitle, eyebrow, items);
  }

  if (layout === "metric-band") {
    return renderMetricSection(block, title, subtitle, eyebrow, metrics, items);
  }

  if (
    hasIntent(identity, /category|categories|分类|目录|catalog/)
    && items.every((item) => !item.image && !item.value && !item.label && !item.meta)
  ) {
    return renderCompactGrid(block, title, subtitle, eyebrow, items);
  }

  if (items.length > 0) {
    return renderContentGrid(block, title, subtitle, eyebrow, items);
  }

  return (
    <section className={sectionBaseClass} style={sectionToneStyle(block)}>
      <div className="mx-auto" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
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
