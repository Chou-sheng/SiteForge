import type { CSSProperties } from "react";

import type { BlockStyle } from "../types";

export type ActionLink = {
  label: string;
  href: string;
};

export type ImageValue = {
  src: string;
  alt: string;
};

export type FeatureItem = {
  title: string;
  description?: string;
  icon?: string;
  href?: string;
  meta?: string;
  image?: ImageValue;
};

export type MetricItem = {
  value: string;
  label: string;
  description?: string;
};

export type CaseItem = {
  title: string;
  company?: string;
  summary?: string;
  metrics?: MetricItem[];
  href?: string;
};

const backgroundByStyle: Record<BlockStyle["background"], CSSProperties> = {
  default: { background: "#ffffff", color: "#0f172a" },
  muted: { background: "#f8fafc", color: "#0f172a" },
  primary: { background: "#0f172a", color: "#ffffff" },
  gradient: {
    background: "linear-gradient(135deg, #0f172a 0%, #155e75 52%, #f8fafc 100%)",
    color: "#ffffff",
  },
  image: { background: "#0f172a", color: "#ffffff" },
};

export function getSectionStyle(style: BlockStyle): CSSProperties {
  return {
    ...backgroundByStyle[style.background],
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    textAlign: style.textAlign,
  };
}

export function getContainerMaxWidth(style: BlockStyle) {
  if (style.container === "narrow") {
    return "860px";
  }

  return style.container === "contained" ? "1180px" : "100%";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getStringProp(props: Record<string, unknown>, key: string) {
  const value = props[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function getImageProp(props: Record<string, unknown>, key: string): ImageValue | undefined {
  const value = props[key];

  if (
    isRecord(value) &&
    typeof value.src === "string" &&
    value.src.trim() &&
    typeof value.alt === "string"
  ) {
    return { src: value.src, alt: value.alt };
  }

  return undefined;
}

export function getActionProp(props: Record<string, unknown>, key: string): ActionLink | undefined {
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

  return undefined;
}

export function getFeatureList(props: Record<string, unknown>, key: string): FeatureItem[] {
  const value = props[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.title !== "string" || !item.title.trim()) {
      return [];
    }

    return [{
      title: item.title,
      description: typeof item.description === "string" && item.description.trim() ? item.description : undefined,
      icon: typeof item.icon === "string" && item.icon.trim() ? item.icon : undefined,
      href: typeof item.href === "string" && item.href.trim() ? item.href : undefined,
      meta: typeof item.meta === "string" && item.meta.trim() ? item.meta : undefined,
      image: getImageProp(item, "image"),
    }];
  });
}

export function getMetricList(props: Record<string, unknown>, key: string): MetricItem[] {
  const value = props[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      !isRecord(item) ||
      typeof item.value !== "string" ||
      !item.value.trim() ||
      typeof item.label !== "string" ||
      !item.label.trim()
    ) {
      return [];
    }

    return [{
      value: item.value,
      label: item.label,
      description: typeof item.description === "string" && item.description.trim() ? item.description : undefined,
    }];
  });
}

export function getCaseList(props: Record<string, unknown>, key: string): CaseItem[] {
  const value = props[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.title !== "string" || !item.title.trim()) {
      return [];
    }

    return [{
      title: item.title,
      company: typeof item.company === "string" && item.company.trim() ? item.company : undefined,
      summary: typeof item.summary === "string" && item.summary.trim() ? item.summary : undefined,
      href: typeof item.href === "string" && item.href.trim() ? item.href : undefined,
      metrics: getMetricList(item, "metrics"),
    }];
  });
}

export function getLinkList(props: Record<string, unknown>, key: string): ActionLink[] {
  const value = props[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      isRecord(item) &&
      typeof item.label === "string" &&
      item.label.trim() &&
      typeof item.href === "string" &&
      item.href.trim()
    ) {
      return [{ label: item.label, href: item.href }];
    }

    return [];
  });
}
