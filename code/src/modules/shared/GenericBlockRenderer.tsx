import type { CSSProperties, ReactNode } from "react";

import type { BlockRendererProps } from "../types";
import {
  getContainerMaxWidth,
  getSectionStyle,
  isRecord,
  type ActionLink,
} from "./renderHelpers";

type ImageValue = {
  src: string;
  alt: string;
};

type DisplayItem = {
  title?: string;
  label?: string;
  name?: string;
  value?: string;
  description?: string;
  summary?: string;
  quote?: string;
  author?: string;
  role?: string;
  company?: string;
  question?: string;
  answer?: string;
  icon?: string;
  href?: string;
};

function getString(props: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = props[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function getAction(props: Record<string, unknown>, keys: string[]): ActionLink | undefined {
  for (const key of keys) {
    const value = props[key];
    if (
      isRecord(value) &&
      typeof value.label === "string" &&
      value.label.trim() &&
      typeof value.href === "string" &&
      value.href.trim()
    ) {
      return { label: value.label, href: value.href };
    }
  }

  return undefined;
}

function getImage(props: Record<string, unknown>): ImageValue | undefined {
  const image = props.image;

  if (
    isRecord(image) &&
    typeof image.src === "string" &&
    image.src.trim() &&
    typeof image.alt === "string"
  ) {
    return { src: image.src, alt: image.alt };
  }

  const imageUrl = props.imageUrl;
  if (typeof imageUrl === "string" && imageUrl.trim()) {
    return { src: imageUrl, alt: getString(props, ["title", "companyName"]) ?? "区块图片" };
  }

  return undefined;
}

function getArray(props: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = props[key];
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
  }

  return [];
}

function normalizeItem(item: unknown): DisplayItem {
  if (typeof item === "string") {
    return { title: item };
  }

  if (isRecord(item)) {
    return {
      title: typeof item.title === "string" ? item.title : undefined,
      label: typeof item.label === "string" ? item.label : undefined,
      name: typeof item.name === "string" ? item.name : undefined,
      value: typeof item.value === "string" ? item.value : undefined,
      description: typeof item.description === "string" ? item.description : undefined,
      summary: typeof item.summary === "string" ? item.summary : undefined,
      quote: typeof item.quote === "string" ? item.quote : undefined,
      author: typeof item.author === "string" ? item.author : undefined,
      role: typeof item.role === "string" ? item.role : undefined,
      company: typeof item.company === "string" ? item.company : undefined,
      question: typeof item.question === "string" ? item.question : undefined,
      answer: typeof item.answer === "string" ? item.answer : undefined,
      icon: typeof item.icon === "string" ? item.icon : undefined,
      href: typeof item.href === "string" ? item.href : undefined,
    };
  }

  return {};
}

function renderItem(item: DisplayItem, index: number) {
  const heading = item.title ?? item.name ?? item.label ?? item.question ?? item.value;
  const body = item.description ?? item.summary ?? item.answer ?? item.quote ?? item.company;
  const meta = [item.author, item.role].filter(Boolean).join(" · ");

  return (
    <article
      className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm"
      key={`${heading ?? "item"}-${index}`}
    >
      {item.icon ? <div className="mb-3 text-2xl">{item.icon}</div> : null}
      {item.value ? <div className="mb-1 text-3xl font-semibold text-slate-950">{item.value}</div> : null}
      {heading && heading !== item.value ? (
        <h3 className="text-lg font-semibold leading-7 text-slate-950">{heading}</h3>
      ) : null}
      {body ? <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p> : null}
      {meta ? <p className="mt-4 text-sm font-medium text-slate-700">{meta}</p> : null}
    </article>
  );
}

function renderLogos(items: unknown[]) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      {items.map((item, index) => {
        if (isRecord(item) && typeof item.src === "string") {
          const alt = typeof item.alt === "string" ? item.alt : "客户标识";
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={alt}
              className="h-10 max-w-36 rounded bg-white object-contain px-4 py-2 shadow-sm"
              key={`${item.src}-${index}`}
              src={item.src}
            />
          );
        }

        const label = typeof item === "string" ? item : `客户 ${index + 1}`;
        return (
          <span className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold" key={label}>
            {label}
          </span>
        );
      })}
    </div>
  );
}

function renderComparison(props: Record<string, unknown>) {
  const columns = Array.isArray(props.columns) ? props.columns.filter((value) => typeof value === "string") : [];
  const rows = Array.isArray(props.rows) ? props.rows : [];

  if (columns.length === 0 || rows.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-slate-950">
          <tr>
            {columns.map((column) => (
              <th className="border-b border-slate-200 px-4 py-3 font-semibold" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const cells = Array.isArray(row) ? row.filter((value) => typeof value === "string") : [];
            return (
              <tr key={rowIndex}>
                {columns.map((column, columnIndex) => (
                  <td className="border-b border-slate-100 px-4 py-3 text-slate-700" key={`${column}-${rowIndex}`}>
                    {cells[columnIndex] ?? ""}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function renderForm(props: Record<string, unknown>) {
  const fields = Array.isArray(props.fields)
    ? props.fields.filter((field): field is string => typeof field === "string")
    : [];

  if (fields.length === 0) {
    return null;
  }

  return (
    <form className="mx-auto mt-8 grid max-w-2xl gap-4 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm">
      {fields.map((field) => (
        <label className="grid gap-2 text-sm font-medium text-slate-700" key={field}>
          {field}
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder={`请输入${field}`} />
        </label>
      ))}
      <button className="rounded-md bg-slate-950 px-4 py-3 font-semibold text-white" type="button">
        {getString(props, ["submitLabel"]) ?? "提交"}
      </button>
    </form>
  );
}

function renderActions(primary?: ActionLink, secondary?: ActionLink) {
  if (!primary && !secondary) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      {primary ? (
        <a className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white" href={primary.href}>
          {primary.label}
        </a>
      ) : null}
      {secondary ? (
        <a className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950" href={secondary.href}>
          {secondary.label}
        </a>
      ) : null}
    </div>
  );
}

export function GenericBlockRenderer({ block }: BlockRendererProps) {
  const props = block.props;
  const eyebrow = getString(props, ["eyebrow", "message"]);
  const title = getString(props, ["title", "companyName", "logo"]);
  const description = getString(props, [
    "subtitle",
    "description",
    "problem",
    "solution",
    "copyright",
  ]);
  const primaryAction = getAction(props, ["primaryAction", "primaryButton", "action"]);
  const secondaryAction = getAction(props, ["secondaryAction", "secondaryButton"]);
  const image = getImage(props);
  const logoItems = getArray(props, ["logos", "certifications"]);
  const contentItems = getArray(props, [
    "features",
    "items",
    "stats",
    "products",
    "steps",
    "useCases",
    "industries",
    "cases",
    "testimonials",
    "metrics",
    "contacts",
    "plans",
    "members",
    "links",
  ]);
  const imageBackedHero = Boolean(image && (block.style.background === "image" || block.variant === "background-image"));
  const sectionStyle: CSSProperties = imageBackedHero && image
    ? {
        ...getSectionStyle(block.style),
        backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.42) 42%, rgba(15, 23, 42, 0.08) 100%), url(${image.src})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        color: "#ffffff",
        minHeight: 560,
      }
    : getSectionStyle(block.style);
  const maxWidth = getContainerMaxWidth(block.style);
  const hasSplitImage = image && !imageBackedHero && ["split-layout", "dashboard-preview"].includes(block.variant);
  const content: ReactNode = (
    <>
      {eyebrow ? <p className="text-sm font-semibold tracking-wide text-cyan-600">{eyebrow}</p> : null}
      {title ? <h2 className="mt-3 text-3xl font-semibold leading-tight text-current sm:text-5xl">{title}</h2> : null}
      {description ? <p className="mx-auto mt-4 max-w-3xl text-base leading-8 opacity-80">{description}</p> : null}
      {renderActions(primaryAction, secondaryAction)}
    </>
  );

  return (
    <section style={sectionStyle}>
      <div className="mx-auto px-6" style={{ maxWidth }}>
        {hasSplitImage ? (
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.92fr]">
            <div>{content}</div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={image.alt} className="aspect-[4/3] w-full object-cover" src={image.src} />
            </div>
          </div>
        ) : (
          <div>{content}</div>
        )}

        {image && !hasSplitImage && !imageBackedHero ? (
          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={image.alt} className="aspect-[16/9] w-full object-cover" src={image.src} />
          </div>
        ) : null}

        {logoItems.length > 0 ? renderLogos(logoItems) : null}
        {contentItems.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contentItems.map((item, index) => renderItem(normalizeItem(item), index))}
          </div>
        ) : null}
        {renderComparison(props)}
        {renderForm(props)}
      </div>
    </section>
  );
}
