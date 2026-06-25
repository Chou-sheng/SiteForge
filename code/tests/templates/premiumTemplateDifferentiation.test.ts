import { describe, expect, test } from "vitest";

import { enterpriseTemplates } from "../../src/lib/templates/enterpriseTemplates";

const premiumTypes = new Set<string>([
  "immersiveHero",
  "animatedMetrics",
  "showcaseCarousel",
  "audienceGrid",
  "timelineJourney",
  "testimonialCarousel",
]);

const educationMotionTypes = new Set<string>([
  "learningHero",
  "learningMetrics",
  "courseTrackCarousel",
  "learningPathTimeline",
  "studentStoryCarousel",
]);

const travelMotionTypes = new Set<string>([
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

const atelierMotionTypes = new Set<string>([
  "atelierHero",
  "projectIndex",
  "materialStudy",
  "processLoom",
  "spatialProof",
  "atelierInquiry",
  "atelierFooter",
]);

function premiumVisualTones(templateId: string) {
  const template = enterpriseTemplates.find((item) => item.id === templateId);

  if (!template) {
    throw new Error(`Missing template: ${templateId}`);
  }

  return new Set(
    template.document.blocks
      .filter((block) => premiumTypes.has(block.type))
      .map((block) => block.props.visualTone),
  );
}

function blockTypeSequence(templateId: string) {
  const template = enterpriseTemplates.find((item) => item.id === templateId);

  if (!template) {
    throw new Error(`Missing template: ${templateId}`);
  }

  return template.document.blocks.map((block) => block.type);
}

describe("premium template differentiation", () => {
  test("uses completely different module types instead of cloning the same block set", () => {
    const templateIds = ["ai-product", "education", "travel", "atelier"] as const;

    for (let leftIndex = 0; leftIndex < templateIds.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < templateIds.length; rightIndex += 1) {
        const leftTypes = new Set(blockTypeSequence(templateIds[leftIndex]));
        const rightTypes = new Set(blockTypeSequence(templateIds[rightIndex]));
        const sharedTypes = [...leftTypes].filter((type) => rightTypes.has(type));

        expect(sharedTypes, `${templateIds[leftIndex]} vs ${templateIds[rightIndex]}`).toEqual([]);
      }
    }
  });

  test("uses different page rhythms instead of cloning the same block order", () => {
    expect(blockTypeSequence("ai-product")).not.toEqual(blockTypeSequence("education"));
    expect(blockTypeSequence("ai-product")).not.toEqual(blockTypeSequence("travel"));
    expect(blockTypeSequence("ai-product")).not.toEqual(blockTypeSequence("atelier"));
    expect(blockTypeSequence("education")).not.toEqual(blockTypeSequence("travel"));
    expect(blockTypeSequence("education")).not.toEqual(blockTypeSequence("atelier"));
    expect(blockTypeSequence("travel")).not.toEqual(blockTypeSequence("atelier"));
  });

  test("keeps the AI product template on premium animated modules", () => {
    expect(premiumVisualTones("ai-product")).toEqual(new Set(["ai-lab"]));
  });

  test("uses education-specific motion modules instead of static-only blocks", () => {
    const educationTypes = new Set<string>(blockTypeSequence("education"));

    expect([...educationMotionTypes].every((type) => educationTypes.has(type))).toBe(true);
    expect([...premiumTypes].some((type) => educationTypes.has(type))).toBe(false);
  });

  test("uses travel-specific motion modules without borrowing AI or education blocks", () => {
    const travelTypes = new Set<string>(blockTypeSequence("travel"));

    expect([...travelMotionTypes].every((type) => travelTypes.has(type))).toBe(true);
    expect([...premiumTypes].some((type) => travelTypes.has(type))).toBe(false);
    expect([...educationMotionTypes].some((type) => travelTypes.has(type))).toBe(false);
  });

  test("uses atelier-specific motion modules without borrowing previous premium systems", () => {
    const atelierTypes = new Set<string>(blockTypeSequence("atelier"));

    expect([...atelierMotionTypes].every((type) => atelierTypes.has(type))).toBe(true);
    expect([...premiumTypes].some((type) => atelierTypes.has(type))).toBe(false);
    expect([...educationMotionTypes].some((type) => atelierTypes.has(type))).toBe(false);
    expect([...travelMotionTypes].some((type) => atelierTypes.has(type))).toBe(false);
  });
});
