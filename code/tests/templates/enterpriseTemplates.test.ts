import { describe, expect, test } from "vitest";

import { enterpriseTemplates } from "../../src/lib/templates/enterpriseTemplates";
import { blockPropsSchemas } from "../../src/lib/validation/blockSchemas";
import { pageDocumentSchema } from "../../src/lib/validation/pageSchema";
import { blockRegistry } from "../../src/modules/registry";

const requiredBlockTypesByTemplate = {
  "ai-product": ["navbar", "immersiveHero", "animatedMetrics", "showcaseCarousel", "audienceGrid", "timelineJourney", "testimonialCarousel", "leadForm", "footer"],
  education: ["announcementBar", "learningHero", "logoCloud", "learningMetrics", "certificationBar", "problemSolution", "courseTrackCarousel", "learningPathTimeline", "useCaseGrid", "studentStoryCarousel", "pricing", "faq", "contactSales", "cta", "about", "team"],
  travel: ["destinationHero", "routeHighlights", "experienceMarquee", "stayShowcase", "seasonalTimeline", "localGuideGrid", "guestMapStories", "bookingRibbon", "travelFooter"],
  atelier: ["atelierHero", "projectIndex", "materialStudy", "processLoom", "spatialProof", "atelierInquiry", "atelierFooter"],
} as const;

function stringify(value: unknown) {
  return JSON.stringify(value);
}

function getTemplate(templateId: string) {
  const template = enterpriseTemplates.find((item) => item.id === templateId);

  if (!template) {
    throw new Error(`Missing template: ${templateId}`);
  }

  return template;
}

describe("enterprise templates", () => {
  test("exports four premium Chinese templates for the Canva-like catalog", () => {
    expect(enterpriseTemplates).toHaveLength(4);
    expect(enterpriseTemplates.map((template) => template.name)).toEqual([
      "AI 产品官网",
      "教育机构官网",
      "文旅度假官网",
      "建筑空间官网",
    ]);
  });

  test("each template validates and uses its own high-impact module set", () => {
    for (const template of enterpriseTemplates) {
      const result = pageDocumentSchema.safeParse(template.document);

      expect(result.success, template.name).toBe(true);
      const requiredBlockTypes = requiredBlockTypesByTemplate[template.id as keyof typeof requiredBlockTypesByTemplate];

      expect(template.document.blocks.length, template.name).toBeGreaterThanOrEqual(requiredBlockTypes.length);

      const blockTypes = template.document.blocks.map((block) => block.type);
      for (const blockType of requiredBlockTypes) {
        expect(blockTypes, template.name).toContain(blockType);
      }

      expect(stringify(template.document), template.name).toMatch(/[\u4e00-\u9fff]/);
      expect(template.document.siteMeta.companyName, template.name).toMatch(/[\u4e00-\u9fff]/);
      expect(template.document.siteMeta.seoTitle, template.name).toMatch(/[\u4e00-\u9fff]/);

      for (const block of template.document.blocks) {
        expect(blockPropsSchemas[block.type].safeParse(block.props).success, `${template.name}:${block.type}`).toBe(true);
        expect(
          blockRegistry[block.type].variants.map((variant) => variant.id),
          `${template.name}:${block.type}:${block.variant}`,
        ).toContain(block.variant);
      }
    }
  });

  test("ships real page imagery instead of default placeholder artwork", () => {
    for (const template of enterpriseTemplates) {
      const serialized = stringify(template.document);
      const productionImages = serialized.match(/"\/(?:backgrounds|template-assets)\/[^"]+\.(?:png|jpe?g|webp)"/g) ?? [];
      const productionImageSources = productionImages.map((image) => image.slice(1, -1));

      expect(serialized, template.id).not.toContain("placehold.co");
      expect(serialized, template.id).not.toContain("images.unsplash.com");
      expect(serialized, template.id).not.toContain(".svg");
      expect(productionImages.length, template.id).toBeGreaterThanOrEqual(4);
      expect(new Set(productionImageSources).size, template.id).toBe(productionImageSources.length);
    }
  });

  test("gives the education template a unified background rhythm and varied module layouts", () => {
    const education = getTemplate("education");
    const educationBlocks = education.document.blocks;
    const educationMotionBlocks = educationBlocks.filter((block) =>
      ["learningHero", "learningMetrics", "courseTrackCarousel", "learningPathTimeline", "studentStoryCarousel"].includes(block.type),
    );
    const backgroundSequence = educationBlocks.map((block) => block.style.background);
    const longBackgroundRuns = backgroundSequence.reduce(
      (longest, background, index) => {
        const runLength = index > 0 && background === backgroundSequence[index - 1] ? longest.current + 1 : 1;

        return {
          current: runLength,
          max: Math.max(longest.max, runLength),
        };
      },
      { current: 0, max: 0 },
    );

    expect(longBackgroundRuns.max).toBeLessThanOrEqual(2);
    expect(new Set(backgroundSequence)).toEqual(new Set(["default", "muted", "primary", "gradient"]));
    expect(new Set(educationMotionBlocks.map((block) => block.variant))).toEqual(
      new Set(["admissions-canvas", "impact-split", "editorial-catalog", "mentor-rail", "wall-of-outcomes"]),
    );
    expect(educationMotionBlocks.every((block) => block.props.visualTone === "learning-studio")).toBe(true);
  });

  test("gives the atelier template a new motion-led block system and cold gallery rhythm", () => {
    const atelier = getTemplate("atelier");
    const atelierBlocks = atelier.document.blocks;
    const atelierTypes = atelierBlocks.map((block) => block.type);
    const atelierOnlyTypes = requiredBlockTypesByTemplate.atelier;

    expect(atelierTypes).toEqual([...atelierOnlyTypes]);
    expect(atelierBlocks.every((block) => block.props.visualTone === "atelier-graphite")).toBe(true);
    expect(new Set(atelierBlocks.map((block) => block.variant))).toEqual(
      new Set([
        "split-plate-stage",
        "offset-archive",
        "material-mosaic",
        "pinned-sequence",
        "metric-ledger",
        "immersive-inquiry",
        "studio-index",
      ]),
    );
    expect(new Set(atelierBlocks.map((block) => block.style.background))).toEqual(
      new Set(["default", "muted", "primary", "gradient"]),
    );
    expect(JSON.stringify(atelier.document)).toContain("/template-assets/atelier-hero.jpg");
  });
});
