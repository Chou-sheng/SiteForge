"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";

import { PageRenderer } from "../page-renderer/PageRenderer";
import { blockCategories, createDefaultBlock, getBlockDefinition } from "../../modules/registry";
import type { BlockType } from "../../types/block";
import type { EnterprisePageDocument } from "../../types/page";

type ModulePanelProps = {
  onAddBlock: (type: BlockType, variant: string) => void;
  previewOffset?: number;
};

type HoveredVariant = {
  type: BlockType;
  variant: string;
};

const previewDocumentBase: Omit<EnterprisePageDocument, "blocks"> = {
  id: "module-preview",
  title: "模块预览",
  description: "模块库悬浮预览",
  version: 1,
  siteMeta: {
    companyName: "智造云科技",
    industry: "企业服务",
    targetAudience: "企业决策团队",
    pageGoal: "lead-generation",
    seoTitle: "模块预览",
    seoDescription: "模块预览",
    keywords: ["模块预览"],
  },
  theme: {
    colorTokens: {
      primary: "#0f172a",
      primaryHover: "#020617",
      secondary: "#155e75",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#ffffff",
      muted: "#f8fafc",
      textPrimary: "#0f172a",
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
  },
  layout: {
    maxWidth: "1200px",
    contentDensity: "comfortable",
    responsiveMode: "enterprise",
  },
  createdAt: "2026-06-16T09:00:00.000Z",
  updatedAt: "2026-06-16T09:00:00.000Z",
};

export function ModulePanel({ onAddBlock, previewOffset = 336 }: ModulePanelProps) {
  const [hoveredVariant, setHoveredVariant] = useState<HoveredVariant | null>(null);
  const hideVariantPreview = (type: BlockType, variant: string) => {
    setHoveredVariant((current) => {
      if (current?.type === type && current.variant === variant) {
        return null;
      }

      return current;
    });
  };
  const moduleCount = blockCategories.reduce((total, category) => total + category.types.length, 0);
  const variantCount = blockCategories.reduce(
    (total, category) => total + category.types.reduce((count, type) => count + getBlockDefinition(type).variants.length, 0),
    0,
  );
  const previewState = useMemo(() => {
    if (!hoveredVariant) {
      return null;
    }

    const definition = getBlockDefinition(hoveredVariant.type);
    const variant = definition.variants.find((item) => item.id === hoveredVariant.variant);

    if (!variant) {
      return null;
    }

    return {
      definition,
      variant,
      document: {
        ...previewDocumentBase,
        blocks: [createDefaultBlock(hoveredVariant.type, hoveredVariant.variant)],
      },
    };
  }, [hoveredVariant]);

  const previewLayer = previewState ? (
    <div
      className="pointer-events-none fixed top-24 z-[9999] w-[440px] overflow-hidden rounded-[22px] border border-white bg-white shadow-2xl"
      data-testid="module-variant-preview"
      style={{ left: previewOffset }}
    >
      <div className="border-b border-slate-100 px-3 py-2">
        <p className="text-xs font-semibold text-slate-950">
          {previewState.definition.name} / {previewState.variant.name}
        </p>
        {previewState.variant.description ? (
          <p className="mt-1 text-xs text-slate-500">{previewState.variant.description}</p>
        ) : null}
      </div>
      <div className="h-72 overflow-hidden bg-slate-100/80">
        <div className="w-[1200px] origin-top-left scale-[0.36]">
          <PageRenderer document={previewState.document} mode="editor" />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <aside
      className="min-h-0 h-full overflow-y-auto border-r border-white/70 bg-white/85 backdrop-blur"
      data-testid="module-panel"
      onMouseLeave={() => setHoveredVariant(null)}
    >
      <div className="border-b border-slate-100 px-4 py-4">
        <h2 className="text-sm font-semibold text-slate-950">模块库</h2>
        <p className="mt-1 text-xs text-slate-500">{moduleCount} 个模块 / {variantCount} 个变体</p>
      </div>

      <div className="space-y-5 px-3 py-4">
        {blockCategories.map((category) => (
          <section key={category.id}>
            <h3 className="mb-2 px-1 text-xs font-semibold text-slate-500">{category.name}</h3>
            <div className="space-y-2">
              {category.types.map((type) => {
                const definition = getBlockDefinition(type);

                return (
                  <section className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm" key={definition.type}>
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-slate-900">{definition.name}</h4>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{definition.description}</p>
                    </div>
                    <div className="grid gap-2">
                      {definition.variants.map((variant) => (
                        <button
                          aria-label={`添加 ${definition.name} - ${variant.name}`}
                          className="flex min-h-9 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-left text-xs text-slate-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800"
                          key={variant.id}
                          onBlur={() => setHoveredVariant(null)}
                          onFocus={() => setHoveredVariant({ type, variant: variant.id })}
                          onMouseEnter={() => setHoveredVariant({ type, variant: variant.id })}
                          onMouseLeave={() => hideVariantPreview(type, variant.id)}
                          onClick={() => onAddBlock(type, variant.id)}
                          type="button"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{variant.name}</span>
                            {variant.description ? (
                              <span className="mt-0.5 block truncate text-slate-500">{variant.description}</span>
                            ) : null}
                          </span>
                          <Plus aria-hidden="true" className="h-4 w-4 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {typeof document === "undefined" ? previewLayer : createPortal(previewLayer, document.body)}
    </aside>
  );
}
