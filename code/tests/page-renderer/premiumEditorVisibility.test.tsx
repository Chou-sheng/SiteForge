// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { PageRenderer } from "../../src/components/page-renderer/PageRenderer";
import { enterpriseTemplates } from "../../src/lib/templates/enterpriseTemplates";
import type { PageBlock } from "../../src/types/block";
import type { EnterprisePageDocument } from "../../src/types/page";

const visible = {
  desktop: true,
  tablet: true,
  mobile: true,
};

const baseStyle = {
  background: "gradient",
  paddingTop: 72,
  paddingBottom: 72,
  textAlign: "left",
  container: "contained",
} satisfies PageBlock["style"];

const premiumHeroBlock: PageBlock = {
  id: "block-premium-hero",
  type: "immersiveHero",
  variant: "product-story",
  name: "Premium hero",
  props: {
    eyebrow: "Premium",
    title: "Visible premium hero",
    subtitle: "Editor mode should not hide this section behind scroll animation.",
    badges: ["Canvas", "GSAP"],
    stats: [{ value: "100%", label: "Visible", description: "No hidden editor blocks" }],
    canvasSequence: { fallbackLabel: "Canvas fallback" },
  },
  style: baseStyle,
  visibility: visible,
};

function createDocument(blocks: PageBlock[]): EnterprisePageDocument {
  return {
    id: "page-premium-visibility",
    title: "Premium visibility",
    version: 1,
    siteMeta: {
      companyName: "Demo",
      industry: "Software",
      targetAudience: "Editors",
      pageGoal: "product-introduction",
      seoTitle: "Demo",
      seoDescription: "Demo",
      keywords: ["demo"],
    },
    theme: {
      colorTokens: {
        primary: "#7c3aed",
        primaryHover: "#6d28d9",
        secondary: "#0f172a",
        accent: "#00c4cc",
        background: "#ffffff",
        surface: "#ffffff",
        muted: "#f7f8ff",
        textPrimary: "#111827",
        textSecondary: "#4b5563",
        border: "#e5e7eb",
      },
      typography: {
        fontFamily: "Inter, sans-serif",
        headingWeight: 700,
        bodyWeight: 400,
        h1Size: "56px",
        h2Size: "40px",
        h3Size: "24px",
        bodySize: "16px",
      },
      radius: {
        sm: "8px",
        md: "12px",
        lg: "18px",
        xl: "28px",
      },
      shadow: {
        card: "0 14px 36px rgba(16, 24, 40, 0.08)",
        elevated: "0 24px 70px rgba(16, 24, 40, 0.14)",
        floating: "0 30px 90px rgba(16, 24, 40, 0.18)",
      },
      spacing: {
        sectionY: "88px",
        containerX: "24px",
        blockGap: "32px",
      },
    },
    layout: {
      maxWidth: "1280px",
      contentDensity: "spacious",
      responsiveMode: "marketing",
    },
    blocks,
    createdAt: "2026-06-15T00:00:00.000Z",
    updatedAt: "2026-06-15T00:00:00.000Z",
  };
}

afterEach(() => {
  cleanup();
});

describe("premium renderer editor visibility", () => {
  test("keeps premium blocks static in editor mode so ScrollTrigger cannot hide them", () => {
    const { container } = render(<PageRenderer document={createDocument([premiumHeroBlock])} mode="editor" />);

    expect(screen.getByRole("heading", { name: "Visible premium hero" })).toBeTruthy();
    expect(container.querySelectorAll(".premium-motion")).toHaveLength(0);
    expect(container.querySelectorAll('[data-premium-motion="static"]').length).toBeGreaterThan(0);
  });

  test("keeps premium motion targets in view mode for public browsing", () => {
    const { container } = render(<PageRenderer document={createDocument([premiumHeroBlock])} mode="view" />);

    expect(screen.getByRole("heading", { name: "Visible premium hero" })).toBeTruthy();
    expect(container.querySelectorAll(".premium-motion").length).toBeGreaterThan(0);
  });

  test("renders real template imagery in editor mode", () => {
    for (const template of enterpriseTemplates) {
      const { container, unmount } = render(<PageRenderer document={template.document} mode="editor" />);
      const renderedImages = Array.from(
        container.querySelectorAll<HTMLImageElement>('img[src^="/backgrounds/"], img[src^="/template-assets/"]'),
      );
      const renderedSources = renderedImages.map((image) => image.getAttribute("src"));

      expect(renderedImages.length, template.id).toBeGreaterThanOrEqual(4);
      expect(renderedImages.every((image) => image.alt.trim().length > 0), template.id).toBe(true);
      expect(renderedImages.every((image) => !image.getAttribute("src")?.endsWith(".svg")), template.id).toBe(true);
      expect(new Set(renderedSources).size, template.id).toBe(renderedSources.length);

      unmount();
    }
  });

  test("renders differentiated education module layouts in editor mode", () => {
    const educationTemplate = enterpriseTemplates.find((template) => template.id === "education");

    expect(educationTemplate).toBeTruthy();

    const { container } = render(<PageRenderer document={educationTemplate!.document} mode="editor" />);
    const layouts = new Set(
      Array.from(container.querySelectorAll<HTMLElement>("[data-education-layout]")).map((element) =>
        element.dataset.educationLayout,
      ),
    );

    expect(layouts).toEqual(
      new Set(["admissions-canvas", "impact-split", "editorial-catalog", "mentor-rail", "wall-of-outcomes"]),
    );
  });

  test("renders atelier modules as scroll-reactive sections without image canvas animation", () => {
    const atelierTemplate = enterpriseTemplates.find((template) => template.id === "atelier");

    expect(atelierTemplate).toBeTruthy();

    const { container } = render(<PageRenderer document={atelierTemplate!.document} mode="view" />);
    const scenes = Array.from(container.querySelectorAll<HTMLElement>("[data-atelier-scene]"));
    const atelierImages = Array.from(
      container.querySelectorAll<HTMLImageElement>('img[src^="/template-assets/atelier-"]'),
    );
    const projectStage = container.querySelector<HTMLElement>("[data-atelier-project-stage]");
    const projectDetails = Array.from(
      container.querySelectorAll<HTMLElement>("[data-atelier-project-detail]"),
    );
    const projectTriggers = Array.from(
      container.querySelectorAll<HTMLElement>("[data-atelier-project-trigger]"),
    );

    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelectorAll('[data-atelier-scroll="scrub"]').length).toBeGreaterThanOrEqual(3);
    expect(scenes.length).toBeGreaterThanOrEqual(8);
    expect(scenes.every((scene) => !scene.className.includes("vh"))).toBe(true);
    expect(projectStage).not.toBeNull();
    expect(projectStage?.className ?? "").toContain("lg:sticky");
    expect(projectDetails).toHaveLength(4);
    expect(projectDetails.filter((detail) => detail.classList.contains("is-active"))).toHaveLength(1);
    expect(projectTriggers).toHaveLength(4);
    expect(projectTriggers.every((trigger) => trigger.className.includes("lg:opacity-0"))).toBe(true);
    expect(projectTriggers.every((trigger) => trigger.className.includes("lg:invisible"))).toBe(true);
    expect(atelierImages.length).toBeGreaterThanOrEqual(8);
    expect(atelierImages.every((image) => image.getAttribute("src")?.endsWith(".jpg"))).toBe(true);
  });
});
