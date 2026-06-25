import { describe, expect, test } from "vitest";

import { pageBlockSchema } from "../../src/lib/validation/pageSchema";
import { enterpriseTemplates } from "../../src/lib/templates/enterpriseTemplates";
import {
  blockCategories,
  blockRegistry,
  createDefaultBlock,
  getBlockDefinition,
  runtimeOnlyBlockTypes,
} from "../../src/modules/registry";
import { GenericBlockRenderer } from "../../src/modules/shared/GenericBlockRenderer";
import { blockTypes } from "../../src/modules/types";
import type { BlockDefinition } from "../../src/modules/types";

const premiumBlockTypes = [
  "immersiveHero",
  "animatedMetrics",
  "showcaseCarousel",
  "audienceGrid",
  "timelineJourney",
  "testimonialCarousel",
] as const;

const educationMotionBlockTypes = [
  "learningHero",
  "learningMetrics",
  "courseTrackCarousel",
  "learningPathTimeline",
  "studentStoryCarousel",
] as const;

const travelMotionBlockTypes = [
  "destinationHero",
  "routeHighlights",
  "experienceMarquee",
  "stayShowcase",
  "seasonalTimeline",
  "localGuideGrid",
  "guestMapStories",
  "bookingRibbon",
  "travelFooter",
] as const;

const atelierMotionBlockTypes = [
  "atelierHero",
  "projectIndex",
  "materialStudy",
  "processLoom",
  "spatialProof",
  "atelierInquiry",
  "atelierFooter",
] as const;

function cloneDefault<T>(value: T): T {
  return structuredClone(value);
}

function expectedDefaultsFor(definition: BlockDefinition, variant: string) {
  return {
    props: {
      ...cloneDefault(definition.defaultProps),
      ...cloneDefault(definition.variantDefaults?.[variant]?.props ?? {}),
    },
    style: {
      ...cloneDefault(definition.defaultStyle),
      ...cloneDefault(definition.variantDefaults?.[variant]?.style ?? {}),
    },
  };
}

describe("block registry", () => {
  test("registers every block type exactly once", () => {
    expect(Object.keys(blockRegistry).sort()).toEqual(blockTypes.slice().sort());
  });

  test("includes required core variants", () => {
    expect(blockRegistry.hero.variants.length).toBeGreaterThanOrEqual(4);
    expect(blockRegistry.navbar.variants.length).toBeGreaterThanOrEqual(4);
    expect(blockRegistry.announcementBar.variants.length).toBeGreaterThanOrEqual(3);
    expect(blockRegistry.featureGrid.variants.length).toBeGreaterThanOrEqual(3);
    expect(blockRegistry.cta.variants.length).toBeGreaterThanOrEqual(3);
    expect(Object.values(blockRegistry).reduce((total, definition) => total + definition.variants.length, 0))
      .toBeGreaterThanOrEqual(90);
  });

  test("registers reusable premium modules for Canva-like templates", () => {
    for (const type of premiumBlockTypes) {
      const definition = getBlockDefinition(type);

      expect(definition.category).not.toBe("footer");
      expect(definition.Renderer).not.toBe(GenericBlockRenderer);
      expect(definition.variants.length).toBeGreaterThanOrEqual(2);
      expect(createDefaultBlock(type).type).toBe(type);
    }
  });

  test("registers education-specific dynamic modules in the module library", () => {
    for (const type of educationMotionBlockTypes) {
      const definition = getBlockDefinition(type);

      expect(definition.Renderer).not.toBe(GenericBlockRenderer);
      expect(definition.variants.length).toBeGreaterThanOrEqual(2);
      expect(createDefaultBlock(type).type).toBe(type);
    }
  });

  test("registers travel-specific dynamic modules in the module library", () => {
    for (const type of travelMotionBlockTypes) {
      const definition = getBlockDefinition(type);

      expect(definition.Renderer).not.toBe(GenericBlockRenderer);
      expect(definition.variants.length).toBeGreaterThanOrEqual(2);
      expect(createDefaultBlock(type).type).toBe(type);
    }
  });

  test("registers atelier-specific dynamic modules in the module library", () => {
    for (const type of atelierMotionBlockTypes) {
      const definition = getBlockDefinition(type);

      expect(definition.Renderer).not.toBe(GenericBlockRenderer);
      expect(definition.variants.length).toBeGreaterThanOrEqual(2);
      expect(createDefaultBlock(type).type).toBe(type);
    }
  });

  test("provides renderers, inspectors, styles, and defaults for every definition", () => {
    for (const type of blockTypes) {
      const definition = getBlockDefinition(type);

      expect(definition.type).toBe(type);
      expect(definition.defaultStyle.container).toBeTruthy();
      expect(typeof definition.Renderer).toBe("function");
      expect(typeof definition.Inspector).toBe("function");
      expect(definition.variants.length).toBeGreaterThanOrEqual(2);

      const block = createDefaultBlock(type);
      expect(block.id).toBeTruthy();
      expect(block.type).toBe(type);
      expect(block.variant).toBe(definition.variants[0].id);
      expect(block.name).toBe(definition.name);
      const expectedDefaults = expectedDefaultsFor(definition, block.variant);
      expect(block.props).toEqual(expectedDefaults.props);
      expect(block.style).toEqual(expectedDefaults.style);
      expect(block.visibility).toEqual({
        desktop: true,
        tablet: true,
        mobile: true,
      });
      expect(pageBlockSchema.safeParse(block).success).toBe(true);
    }
  });

  test("keeps AI generated sections registered for rendering but hidden from the module library", () => {
    const categorizedTypes = blockCategories.flatMap((category) => category.types);
    const definition = getBlockDefinition("aiGeneratedSection");
    const block = createDefaultBlock("aiGeneratedSection");

    expect(runtimeOnlyBlockTypes).toContain("aiGeneratedSection");
    expect(categorizedTypes).not.toContain("aiGeneratedSection");
    expect(definition.name).toContain("AI");
    expect(block.type).toBe("aiGeneratedSection");
    expect(block.props.generatedModuleId).toMatch(/^generated-/);
    expect(pageBlockSchema.safeParse(block).success).toBe(true);
  });

  test("creates independent default block objects", () => {
    const first = createDefaultBlock("hero");
    const second = createDefaultBlock("hero", "centered");

    first.props.title = "changed";
    first.style.paddingTop = 12;
    first.visibility.mobile = false;

    expect(second.variant).toBe("centered");
    expect(second.props.title).toBe(blockRegistry.hero.variantDefaults?.centered?.props?.title);
    expect(second.style.paddingTop).toBe(blockRegistry.hero.defaultStyle.paddingTop);
    expect(second.style.textAlign).toBe("center");
    expect(second.visibility.mobile).toBe(true);
    expect(pageBlockSchema.safeParse(second).success).toBe(true);
  });

  test("validates explicit block variants", () => {
    expect(createDefaultBlock("hero", "dashboard-preview").variant).toBe("dashboard-preview");
    expect(() => createDefaultBlock("hero", "missing-variant")).toThrow("未知模块变体");
  });

  test("applies variant-specific defaults so module variants are visually distinct", () => {
    const splitHero = createDefaultBlock("hero", "split-layout");
    const centeredHero = createDefaultBlock("hero", "centered");
    const darkNavbar = createDefaultBlock("navbar", "dark");

    expect(centeredHero.style.textAlign).toBe("center");
    expect(centeredHero.style.background).not.toBe(splitHero.style.background);
    expect(darkNavbar.style.background).toBe("primary");
    expect(darkNavbar.props.action).not.toEqual(blockRegistry.navbar.defaultProps.action);
  });

  test("premium AI and education templates use separate module systems", () => {
    expect(enterpriseTemplates.map((template) => template.id)).toEqual(["ai-product", "education", "travel", "atelier"]);
    const templateSequences = Object.fromEntries(
      enterpriseTemplates.map((template) => [template.id, template.document.blocks.map((block) => block.type)]),
    );
    const aiBlockTypes = templateSequences["ai-product"];
    const educationBlockTypes = templateSequences.education;
    const travelBlockTypes = templateSequences.travel;
    const atelierBlockTypes = templateSequences.atelier;

    expect(aiBlockTypes).not.toEqual(educationBlockTypes);
    expect(aiBlockTypes).not.toEqual(travelBlockTypes);
    expect(aiBlockTypes).not.toEqual(atelierBlockTypes);
    expect(educationBlockTypes).not.toEqual(travelBlockTypes);
    expect(educationBlockTypes).not.toEqual(atelierBlockTypes);
    expect(travelBlockTypes).not.toEqual(atelierBlockTypes);
    expect(aiBlockTypes.slice(0, 2)).toEqual(["navbar", "immersiveHero"]);
    expect(aiBlockTypes.at(-2)).toBe("leadForm");
    expect(aiBlockTypes.at(-1)).toBe("footer");

    for (const type of premiumBlockTypes) {
      expect(aiBlockTypes, "AI 产品官网").toContain(type);
      expect(educationBlockTypes, "教育机构官网").not.toContain(type);
    }

    expect(educationBlockTypes.slice(0, 2)).toEqual(["announcementBar", "learningHero"]);
    for (const type of educationMotionBlockTypes) {
      expect(educationBlockTypes, "教育机构官网").toContain(type);
    }
    expect(educationBlockTypes).toContain("pricing");
    expect(educationBlockTypes).toContain("contactSales");
    expect(educationBlockTypes.at(-1)).toBe("team");
    expect(aiBlockTypes.filter((type) => educationBlockTypes.includes(type))).toEqual([]);

    expect(travelBlockTypes.slice(0, 2)).toEqual(["destinationHero", "routeHighlights"]);
    for (const type of travelMotionBlockTypes) {
      expect(travelBlockTypes, "文旅度假官网").toContain(type);
    }
    expect(travelBlockTypes.filter((type) => aiBlockTypes.includes(type))).toEqual([]);
    expect(travelBlockTypes.filter((type) => educationBlockTypes.includes(type))).toEqual([]);

    expect(atelierBlockTypes.slice(0, 2)).toEqual(["atelierHero", "projectIndex"]);
    for (const type of atelierMotionBlockTypes) {
      expect(atelierBlockTypes, "建筑空间官网").toContain(type);
    }
    expect(atelierBlockTypes.filter((type) => aiBlockTypes.includes(type))).toEqual([]);
    expect(atelierBlockTypes.filter((type) => educationBlockTypes.includes(type))).toEqual([]);
    expect(atelierBlockTypes.filter((type) => travelBlockTypes.includes(type))).toEqual([]);
  });

  test("groups registered types into Chinese categories", () => {
    const categorizedTypes = blockCategories.flatMap((category) => category.types);
    const moduleLibraryTypes = blockTypes.filter(
      (type) => !(runtimeOnlyBlockTypes as readonly string[]).includes(type),
    );

    expect(categorizedTypes.slice().sort()).toEqual(moduleLibraryTypes.slice().sort());
    expect(categorizedTypes).not.toContain("aiGeneratedSection");
    expect(blockCategories.every((category) => /[\u4e00-\u9fff]/.test(category.name))).toBe(true);
  });
});
