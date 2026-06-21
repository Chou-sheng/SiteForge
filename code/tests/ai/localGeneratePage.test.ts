import { describe, expect, test } from "vitest";

import { generateLocalPage } from "../../src/lib/ai/localGeneratePage";
import { enterpriseTemplates } from "../../src/lib/templates/enterpriseTemplates";
import { pageDocumentSchema } from "../../src/lib/validation/pageSchema";
import { blockRegistry } from "../../src/modules/registry";

function asJson(value: unknown) {
  return JSON.stringify(value);
}

describe("generateLocalPage", () => {
  test("returns a valid Chinese EnterprisePageDocument with fresh ids and timestamps", () => {
    const aiTemplate = enterpriseTemplates.find((template) => template.id === "ai-product");
    const before = new Date();
    const document = generateLocalPage({
      prompt: "为星澜智能生成一个 AI 产品官网，突出销售自动化和私有化部署",
      industry: "人工智能",
      style: "科技蓝",
      pageType: "AI 产品官网",
    });
    const after = new Date();

    expect(pageDocumentSchema.safeParse(document).success).toBe(true);
    expect(aiTemplate).toBeTruthy();
    expect(document.id).not.toBe(aiTemplate?.document.id);
    expect(document.slug).toBeUndefined();
    expect(new Date(document.createdAt).getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(new Date(document.updatedAt).getTime()).toBeLessThanOrEqual(after.getTime());
    expect(document.createdAt).toBe(document.updatedAt);
    expect(new Set(document.blocks.map((block) => block.id)).size).toBe(document.blocks.length);

    for (const [index, block] of document.blocks.entries()) {
      expect(block.id).not.toBe(aiTemplate?.document.blocks[index]?.id);
      expect(
        blockRegistry[block.type].variants.map((variant) => variant.id),
        `${block.type}:${block.variant}`,
      ).toContain(block.variant);
    }

    expect(document.title).toContain("星澜智能");
    expect(document.siteMeta.companyName).toBe("星澜智能");
    expect(document.siteMeta.industry).toBe("人工智能");
    expect(document.siteMeta.targetAudience).toContain("人工智能");
    expect(document.siteMeta.seoTitle).toContain("星澜智能");
    expect(document.siteMeta.seoDescription).toContain("人工智能");
    expect(asJson(document)).toMatch(/[\u4e00-\u9fff]/);
  });

  test("infers a suitable template, includes required blocks, and never returns forbidden output fields", () => {
    const document = generateLocalPage({
      prompt: "给一家企业培训机构做课程招生官网",
      industry: "职业教育",
      style: "温暖可信",
    });

    const blockTypes = document.blocks.map((block) => block.type);
    expect(pageDocumentSchema.safeParse(document).success).toBe(true);
    expect(document.title).toContain("教育");
    expect(blockTypes).toContain("announcementBar");
    expect(blockTypes).toContain("learningHero");
    expect(blockTypes).toContain("learningMetrics");
    expect(blockTypes).toContain("courseTrackCarousel");
    expect(blockTypes).toContain("learningPathTimeline");
    expect(blockTypes).toContain("studentStoryCarousel");
    expect(blockTypes).toContain("pricing");
    expect(blockTypes).toContain("contactSales");
    expect(blockTypes).toContain("team");
    expect(blockTypes).not.toContain("immersiveHero");
    expect(blockTypes).not.toContain("showcaseCarousel");
    for (const block of document.blocks) {
      expect(
        blockRegistry[block.type].variants.map((variant) => variant.id),
        `${block.type}:${block.variant}`,
      ).toContain(block.variant);
    }

    const serialized = asJson(document);
    expect(serialized).not.toMatch(/score|rating|evaluation|html/i);
    expect(document).not.toHaveProperty("html");
    expect(document).not.toHaveProperty("score");
    expect(document).not.toHaveProperty("rating");
    expect(document).not.toHaveProperty("evaluation");
  });

  test("infers the travel template and does not reuse AI or education modules", () => {
    const document = generateLocalPage({
      prompt: "给一家海岛度假酒店生成文旅官网，突出路线、住宿、体验和预订咨询",
      industry: "文旅度假",
      style: "清爽高级",
    });

    const blockTypes = document.blocks.map((block) => block.type);
    expect(pageDocumentSchema.safeParse(document).success).toBe(true);
    expect(document.title).toContain("文旅");
    expect(blockTypes).toEqual([
      "destinationHero",
      "routeHighlights",
      "experienceMarquee",
      "stayShowcase",
      "seasonalTimeline",
      "localGuideGrid",
      "guestMapStories",
      "bookingRibbon",
      "travelFooter",
    ]);
    expect(blockTypes).not.toContain("immersiveHero");
    expect(blockTypes).not.toContain("learningHero");
    expect(blockTypes).not.toContain("footer");

    for (const block of document.blocks) {
      expect(
        blockRegistry[block.type].variants.map((variant) => variant.id),
        `${block.type}:${block.variant}`,
      ).toContain(block.variant);
    }
  });
});
