// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { createDefaultBlock, getBlockDefinition } from "../../src/modules/registry";
import type { PageBlock } from "../../src/types/block";

function renderGeneratedSection(block: PageBlock) {
  const Renderer = getBlockDefinition("aiGeneratedSection").Renderer;

  return render(<Renderer block={block} />);
}

function generatedBlock(props: Record<string, unknown>): PageBlock {
  return {
    ...createDefaultBlock("aiGeneratedSection"),
    id: "generated-test-block",
    name: String(props.intent ?? props.title ?? "页面级生成模块"),
    props: {
      generatedModuleId: "generated-test-block",
      layout: "feature-grid",
      ...props,
    },
  };
}

afterEach(() => {
  cleanup();
});

describe("aiGeneratedSection renderer", () => {
  test("renders header-style generated sections as navigation instead of numbered cards", () => {
    renderGeneratedSection(generatedBlock({
      intent: "Header navigation",
      title: "美食空间",
      items: [
        { title: "首页", href: "#home" },
        { title: "菜单", href: "#menu" },
        { title: "关于", href: "#about" },
      ],
      primaryAction: { label: "预订座位", href: "#reservation" },
    }));

    expect(screen.getByRole("navigation", { name: "美食空间导航" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "首页" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "预订座位" })).toBeTruthy();
    expect(screen.queryByText("01")).toBeNull();
  });

  test("renders food item grids with photography and prices", () => {
    renderGeneratedSection(generatedBlock({
      intent: "showcase signature dishes",
      title: "主厨甄选",
      subtitle: "Signatures",
      items: [
        {
          title: "松露烩饭",
          description: "黑松露与帕玛森干酪的柔和交融",
          value: "¥128",
          meta: "招牌",
          image: {
            src: "https://images.unsplash.com/photo-1543353071-10c8ba85a904",
            alt: "松露烩饭",
          },
        },
        {
          title: "低温慢煮三文鱼",
          description: "莳萝奶油酱与柑橘香气",
          value: "¥168",
          meta: "主厨推荐",
          image: {
            src: "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
            alt: "低温慢煮三文鱼",
          },
        },
      ],
    }));

    expect(screen.getByAltText("松露烩饭")).toBeTruthy();
    expect(screen.getByAltText("低温慢煮三文鱼")).toBeTruthy();
    expect(screen.getByText("¥128")).toBeTruthy();
    expect(screen.getByText("¥168")).toBeTruthy();
  });

  test("uses a balanced four-column desktop grid for four food cards", () => {
    renderGeneratedSection(generatedBlock({
      intent: "showcase signature dishes",
      title: "主厨甄选",
      items: ["松露烩饭", "香煎鹅肝", "龙虾浓汤", "澳洲和牛"].map((title, index) => ({
        title,
        description: "季节限定风味",
        value: `¥${index + 1}88`,
      })),
    }));

    expect(screen.getByTestId("generated-food-grid").className).toContain("xl:grid-cols-4");
  });

  test("renders reservation conversion sections as a booking form", () => {
    renderGeneratedSection(generatedBlock({
      intent: "call to action reservation",
      layout: "conversion",
      title: "预订餐位",
      description: "留下日期、人数和联系方式，我们将在营业时段内确认座位。",
      fields: ["日期", "人数", "联系方式"],
      primaryAction: { label: "立即预订", href: "#reservation" },
    }));

    expect(screen.getByLabelText("日期")).toBeTruthy();
    expect(screen.getByLabelText("人数")).toBeTruthy();
    expect(screen.getByLabelText("联系方式")).toBeTruthy();
    expect(screen.getByTestId("generated-reservation-fields").className).toContain("xl:grid-cols-3");
    expect(screen.getByTestId("generated-reservation-fields").className).not.toContain("sm:grid-cols-3");
    expect(screen.getByRole("button", { name: "立即预订" })).toBeTruthy();
  });
});
