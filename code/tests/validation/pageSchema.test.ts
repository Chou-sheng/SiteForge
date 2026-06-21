import { describe, expect, test } from "vitest";

import { pageDocumentSchema } from "../../src/lib/validation/pageSchema";

describe("pageDocumentSchema", () => {
  test("accepts a minimal valid Chinese enterprise page", () => {
    const result = pageDocumentSchema.safeParse({
      id: "page-demo",
      title: "AI 教育平台企业官网",
      description: "面向教育机构的智能招生与服务平台",
      slug: "ai-jiao-yu-ping-tai",
      version: 1,
      siteMeta: {
        companyName: "智学科技",
        industry: "教育科技",
        targetAudience: "教育机构管理者",
        pageGoal: "lead-generation",
        seoTitle: "AI 教育平台企业官网",
        seoDescription: "面向教育机构的智能招生与服务平台",
        keywords: ["AI", "教育", "企业官网"],
      },
      theme: {
        colorTokens: {
          primary: "#165DFF",
          primaryHover: "#0E42D2",
          secondary: "#14C9C9",
          accent: "#F7BA1E",
          background: "#FFFFFF",
          surface: "#FFFFFF",
          muted: "#F2F3F5",
          textPrimary: "#1D2129",
          textSecondary: "#4E5969",
          border: "#E5E6EB",
        },
        typography: {
          fontFamily: "Noto Sans SC",
          headingWeight: 700,
          bodyWeight: 400,
          h1Size: "clamp(2.5rem, 6vw, 4.5rem)",
          h2Size: "40px",
          h3Size: "28px",
          bodySize: "16px",
        },
        radius: {
          sm: "4px",
          md: "12px",
          lg: "16px",
          xl: "24px",
        },
        shadow: {
          card: "0 1px 3px rgba(0, 0, 0, 0.08)",
          elevated: "0 8px 24px rgba(0, 0, 0, 0.12)",
          floating: "0 16px 48px rgba(0, 0, 0, 0.16)",
        },
        spacing: {
          sectionY: "96px",
          containerX: "24px",
          blockGap: "32px",
        },
      },
      layout: {
        maxWidth: "1200px",
        contentDensity: "comfortable",
        responsiveMode: "enterprise",
      },
      blocks: [
        {
          id: "block-hero",
          type: "hero",
          variant: "split",
          name: "首页主视觉",
          props: {
            eyebrow: "智能教育解决方案",
            title: "让招生和服务更高效",
            subtitle: "用 AI 连接学校、老师与学员",
            primaryAction: { label: "预约演示", href: "#lead-form" },
          },
          style: {
            background: "default",
            paddingTop: 96,
            paddingBottom: 96,
            textAlign: "left",
            container: "contained",
          },
          visibility: {
            desktop: true,
            tablet: true,
            mobile: true,
          },
        },
      ],
      createdAt: "2026-06-15T09:00:00.000Z",
      updatedAt: "2026-06-15T09:00:00.000Z",
    });

    expect(result.success).toBe(true);
    expect(result.data?.theme.typography.h1Size).toBe("clamp(2.5rem, 6vw, 4.5rem)");
    expect(result.data?.theme.radius.md).toBe("12px");
    expect(result.data?.theme.spacing.sectionY).toBe("96px");
  });

  test("rejects the previous goal and meta document shape", () => {
    const result = pageDocumentSchema.safeParse({
      id: "page-demo",
      slug: "ai-jiao-yu-ping-tai",
      goal: "lead-generation",
      meta: {
        title: "AI 教育平台企业官网",
        description: "面向教育机构的智能招生与服务平台",
        keywords: ["AI", "教育", "企业官网"],
      },
      theme: {
        colors: {
          primary: "#165DFF",
          secondary: "#14C9C9",
          accent: "#F7BA1E",
          background: "#FFFFFF",
          foreground: "#1D2129",
          muted: "#F2F3F5",
          border: "#E5E6EB",
        },
        typography: {
          headingFont: "Inter",
          bodyFont: "Noto Sans SC",
          baseSize: 16,
          scaleRatio: 1.2,
        },
        spacing: {
          section: 96,
          container: 1200,
          radius: 8,
        },
      },
      layout: {
        header: "navbar",
        footer: "footer",
        maxWidth: 1200,
      },
      blocks: [],
    });

    expect(result.success).toBe(false);
  });
});
