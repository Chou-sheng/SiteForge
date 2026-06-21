// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { PageRenderer } from "../../src/components/page-renderer/PageRenderer";
import type { PageBlock } from "../../src/types/block";
import type { EnterprisePageDocument } from "../../src/types/page";

const visible = {
  desktop: true,
  tablet: true,
  mobile: true,
};

const baseStyle = {
  background: "default",
  paddingTop: 24,
  paddingBottom: 24,
  textAlign: "left",
  container: "contained",
} satisfies PageBlock["style"];

function createDocument(blocks: PageBlock[]): EnterprisePageDocument {
  return {
    id: "page-1",
    title: "企业官网",
    description: "测试页面",
    version: 1,
    siteMeta: {
      companyName: "智造云",
      industry: "工业软件",
      targetAudience: "制造业企业",
      pageGoal: "lead-generation",
      seoTitle: "智造云企业官网",
      seoDescription: "面向制造企业的 AI 官网",
      keywords: ["AI", "企业官网"],
    },
    theme: {
      colorTokens: {
        primary: "#155e75",
        primaryHover: "#164e63",
        secondary: "#0f172a",
        accent: "#f59e0b",
        background: "#ffffff",
        surface: "#f8fafc",
        muted: "#e2e8f0",
        textPrimary: "#0f172a",
        textSecondary: "#475569",
        border: "#cbd5e1",
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
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      shadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.12)",
        elevated: "0 12px 24px rgba(15, 23, 42, 0.16)",
        floating: "0 24px 48px rgba(15, 23, 42, 0.18)",
      },
      spacing: {
        sectionY: "80px",
        containerX: "24px",
        blockGap: "40px",
      },
    },
    layout: {
      maxWidth: "1200px",
      contentDensity: "comfortable",
      responsiveMode: "enterprise",
    },
    blocks,
    createdAt: "2026-06-15T00:00:00.000Z",
    updatedAt: "2026-06-15T00:00:00.000Z",
  };
}

const navbarBlock: PageBlock = {
  id: "block-navbar",
  type: "navbar",
  variant: "classic",
  name: "导航",
  props: {
    logo: "智造云",
    links: [{ label: "产品", href: "#product" }],
    action: { label: "预约演示", href: "#demo" },
  },
  style: baseStyle,
  visibility: visible,
};

const heroBlock: PageBlock = {
  id: "block-hero",
  type: "hero",
  variant: "centered",
  name: "首屏",
  props: {
    eyebrow: "企业 AI 官网生成平台",
    title: "用 AI 快速搭建可信赖的企业官网",
    subtitle: "让销售线索转化更清晰",
  },
  style: { ...baseStyle, background: "muted", paddingTop: 72, paddingBottom: 72 },
  visibility: visible,
};

afterEach(() => {
  cleanup();
});

describe("PageRenderer", () => {
  test("clips horizontal overflow without creating a nested scroll container", () => {
    const globals = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
    const rootRule = globals.match(/html,\s*body\s*\{([^}]*)\}/)?.[1] ?? "";
    const pageRendererRule = globals.match(/\.page-renderer\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rootRule).toContain("overflow-x: clip");
    expect(rootRule).not.toContain("overflow-x: hidden");
    expect(pageRendererRule).toContain("overflow-x: clip");
    expect(pageRendererRule).not.toContain("overflow-x: hidden");
  });

  test("keeps scroll-reactive blocks free of parent transform animations", () => {
    const globals = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
    const stickyOverride =
      globals.match(/\.page-renderer__block:has\(\[data-atelier-scroll="scrub"\]\)\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(stickyOverride).toContain("animation: none");
    expect(stickyOverride).toContain("transform: none");
  });

  test("renders known page blocks through the registry in document order", () => {
    render(<PageRenderer document={createDocument([navbarBlock, heroBlock])} />);

    expect(screen.getByText("智造云")).toBeTruthy();
    expect(screen.getByText("用 AI 快速搭建可信赖的企业官网")).toBeTruthy();
  });

  test("wraps visible blocks with scroll-motion hooks for dynamic desktop browsing", () => {
    const { container } = render(<PageRenderer document={createDocument([navbarBlock, heroBlock])} />);
    const animatedBlocks = container.querySelectorAll(".page-renderer__block");

    expect(animatedBlocks).toHaveLength(2);
    expect(animatedBlocks[0].getAttribute("data-page-block-type")).toBe("navbar");
    expect(animatedBlocks[1].getAttribute("data-page-block-type")).toBe("hero");
  });

  test("renders navigation as a compact nav instead of a generic headline card block", () => {
    render(<PageRenderer document={createDocument([navbarBlock])} />);

    expect(screen.getByRole("navigation", { name: "主导航" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "产品" }).getAttribute("href")).toBe("#product");
    expect(screen.getByRole("link", { name: "预约演示" }).getAttribute("href")).toBe("#demo");
    expect(screen.queryByRole("heading", { name: "智造云" })).toBeNull();
  });

  test("renders footer as page footer without turning footer links into repeated cards", () => {
    const footerBlock: PageBlock = {
      id: "block-footer",
      type: "footer",
      variant: "simple-footer",
      name: "页脚",
      props: {
        companyName: "智造云",
        links: [{ label: "隐私政策", href: "#privacy" }],
        copyright: "© 2026 智造云。",
      },
      style: { ...baseStyle, background: "primary", textAlign: "center" },
      visibility: visible,
    };

    render(<PageRenderer document={createDocument([footerBlock])} />);

    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByRole("link", { name: "隐私政策" }).getAttribute("href")).toBe("#privacy");
    expect(screen.queryByRole("heading", { name: "隐私政策" })).toBeNull();
  });

  test("renders a Chinese fallback for unknown blocks without throwing", () => {
    const unknownBlock = {
      ...heroBlock,
      id: "block-unknown",
      type: "unknownModule",
      name: "未知模块",
    } as unknown as PageBlock;

    render(<PageRenderer document={createDocument([unknownBlock])} />);

    expect(screen.getByText("未知模块：unknownModule")).toBeTruthy();
  });

  test("does not render blocks hidden for the selected mobile viewport", () => {
    const mobileHiddenHero: PageBlock = {
      ...heroBlock,
      visibility: {
        ...visible,
        mobile: false,
      },
    };

    render(<PageRenderer document={createDocument([navbarBlock, mobileHiddenHero])} viewport="mobile" />);

    expect(screen.getByText("智造云")).toBeTruthy();
    expect(screen.queryByText("用 AI 快速搭建可信赖的企业官网")).toBeNull();
  });
});
