import { createId } from "../lib/utils/id";
import { pageBlockSchema } from "../lib/validation/pageSchema";
import aboutBlock from "./about";
import announcementBarBlock from "./announcement-bar";
import animatedMetricsBlock from "./animated-metrics";
import audienceGridBlock from "./audience-grid";
import atelierFooterBlock from "./atelier-footer";
import atelierHeroBlock from "./atelier-hero";
import atelierInquiryBlock from "./atelier-inquiry";
import bookingRibbonBlock from "./booking-ribbon";
import caseStudiesBlock from "./case-studies";
import certificationBarBlock from "./certification-bar";
import comparisonTableBlock from "./comparison-table";
import contactSalesBlock from "./contact-sales";
import courseTrackCarouselBlock from "./course-track-carousel";
import ctaBlock from "./cta";
import destinationHeroBlock from "./destination-hero";
import experienceMarqueeBlock from "./experience-marquee";
import faqBlock from "./faq";
import featureGridBlock from "./feature-grid";
import featureSpotlightBlock from "./feature-spotlight";
import footerBlock from "./footer";
import guestMapStoriesBlock from "./guest-map-stories";
import heroBlock from "./hero";
import industrySolutionsBlock from "./industry-solutions";
import immersiveHeroBlock from "./immersive-hero";
import leadFormBlock from "./lead-form";
import learningHeroBlock from "./learning-hero";
import learningMetricsBlock from "./learning-metrics";
import learningPathTimelineBlock from "./learning-path-timeline";
import localGuideGridBlock from "./local-guide-grid";
import logoCloudBlock from "./logo-cloud";
import materialStudyBlock from "./material-study";
import metricsSectionBlock from "./metrics-section";
import navbarBlock from "./navbar";
import pricingBlock from "./pricing";
import processLoomBlock from "./process-loom";
import problemSolutionBlock from "./problem-solution";
import productShowcaseBlock from "./product-showcase";
import projectIndexBlock from "./project-index";
import routeHighlightsBlock from "./route-highlights";
import seasonalTimelineBlock from "./seasonal-timeline";
import showcaseCarouselBlock from "./showcase-carousel";
import spatialProofBlock from "./spatial-proof";
import stayShowcaseBlock from "./stay-showcase";
import studentStoryCarouselBlock from "./student-story-carousel";
import teamBlock from "./team";
import testimonialCarouselBlock from "./testimonial-carousel";
import testimonialsBlock from "./testimonials";
import timelineJourneyBlock from "./timeline-journey";
import travelFooterBlock from "./travel-footer";
import trustStatsBlock from "./trust-stats";
import type { BlockCategory, BlockDefinition, BlockType, PageBlock } from "./types";
import { blockTypes } from "./types";
import useCaseGridBlock from "./use-case-grid";
import workflowStepsBlock from "./workflow-steps";

export const blockRegistry = {
  announcementBar: announcementBarBlock,
  navbar: navbarBlock,
  hero: heroBlock,
  logoCloud: logoCloudBlock,
  trustStats: trustStatsBlock,
  certificationBar: certificationBarBlock,
  problemSolution: problemSolutionBlock,
  featureGrid: featureGridBlock,
  featureSpotlight: featureSpotlightBlock,
  productShowcase: productShowcaseBlock,
  workflowSteps: workflowStepsBlock,
  useCaseGrid: useCaseGridBlock,
  industrySolutions: industrySolutionsBlock,
  caseStudies: caseStudiesBlock,
  testimonials: testimonialsBlock,
  metricsSection: metricsSectionBlock,
  cta: ctaBlock,
  leadForm: leadFormBlock,
  contactSales: contactSalesBlock,
  faq: faqBlock,
  pricing: pricingBlock,
  about: aboutBlock,
  team: teamBlock,
  comparisonTable: comparisonTableBlock,
  immersiveHero: immersiveHeroBlock,
  showcaseCarousel: showcaseCarouselBlock,
  animatedMetrics: animatedMetricsBlock,
  audienceGrid: audienceGridBlock,
  timelineJourney: timelineJourneyBlock,
  testimonialCarousel: testimonialCarouselBlock,
  learningHero: learningHeroBlock,
  learningMetrics: learningMetricsBlock,
  courseTrackCarousel: courseTrackCarouselBlock,
  learningPathTimeline: learningPathTimelineBlock,
  studentStoryCarousel: studentStoryCarouselBlock,
  destinationHero: destinationHeroBlock,
  routeHighlights: routeHighlightsBlock,
  experienceMarquee: experienceMarqueeBlock,
  stayShowcase: stayShowcaseBlock,
  seasonalTimeline: seasonalTimelineBlock,
  localGuideGrid: localGuideGridBlock,
  guestMapStories: guestMapStoriesBlock,
  bookingRibbon: bookingRibbonBlock,
  travelFooter: travelFooterBlock,
  atelierHero: atelierHeroBlock,
  projectIndex: projectIndexBlock,
  materialStudy: materialStudyBlock,
  processLoom: processLoomBlock,
  spatialProof: spatialProofBlock,
  atelierInquiry: atelierInquiryBlock,
  atelierFooter: atelierFooterBlock,
  footer: footerBlock,
} satisfies Record<BlockType, BlockDefinition>;

export type BlockCategoryGroup = {
  id: BlockCategory;
  name: string;
  types: BlockType[];
};

export const blockCategories: BlockCategoryGroup[] = [
  { id: "navigation", name: "导航与公告", types: ["announcementBar", "navbar"] },
  { id: "hero", name: "首屏展示", types: ["hero", "immersiveHero", "learningHero", "destinationHero", "atelierHero"] },
  {
    id: "trust",
    name: "信任背书",
    types: [
      "logoCloud",
      "trustStats",
      "certificationBar",
      "caseStudies",
      "testimonials",
      "metricsSection",
      "animatedMetrics",
      "testimonialCarousel",
      "learningMetrics",
      "studentStoryCarousel",
      "localGuideGrid",
      "guestMapStories",
      "spatialProof",
    ],
  },
  {
    id: "content",
    name: "内容与方案",
    types: [
      "problemSolution",
      "featureGrid",
      "featureSpotlight",
      "productShowcase",
      "showcaseCarousel",
      "workflowSteps",
      "timelineJourney",
      "courseTrackCarousel",
      "learningPathTimeline",
      "routeHighlights",
      "experienceMarquee",
      "seasonalTimeline",
      "useCaseGrid",
      "audienceGrid",
      "industrySolutions",
      "projectIndex",
      "materialStudy",
      "processLoom",
    ],
  },
  { id: "conversion", name: "转化获客", types: ["cta", "leadForm", "contactSales", "faq", "bookingRibbon", "atelierInquiry"] },
  { id: "commerce", name: "商业信息", types: ["pricing", "comparisonTable", "stayShowcase"] },
  { id: "company", name: "企业介绍", types: ["about", "team"] },
  { id: "footer", name: "页脚", types: ["footer", "travelFooter", "atelierFooter"] },
];

function cloneDefault<T>(value: T): T {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

export function getBlockDefinition(type: BlockType): BlockDefinition {
  return blockRegistry[type];
}

export function createDefaultBlock(type: BlockType, variant?: string): PageBlock {
  const definition = getBlockDefinition(type);
  const selectedVariant = variant ?? definition.variants[0].id;
  const validVariantIds = definition.variants.map((blockVariant) => blockVariant.id);

  if (!validVariantIds.includes(selectedVariant)) {
    throw new Error(`未知模块变体：type=${type}, variant=${selectedVariant}`);
  }

  const block = {
    id: createId(`block-${type}`),
    type,
    variant: selectedVariant,
    name: definition.name,
    props: {
      ...cloneDefault(definition.defaultProps),
      ...cloneDefault(definition.variantDefaults?.[selectedVariant]?.props ?? {}),
    },
    style: {
      ...cloneDefault(definition.defaultStyle),
      ...cloneDefault(definition.variantDefaults?.[selectedVariant]?.style ?? {}),
    },
    visibility: cloneDefault({
      desktop: true,
      tablet: true,
      mobile: true,
    }),
  };

  return pageBlockSchema.parse(block) as PageBlock;
}

const registeredTypes = new Set(Object.keys(blockRegistry));
for (const type of blockTypes) {
  if (!registeredTypes.has(type)) {
    throw new Error(`Block type "${type}" is missing from blockRegistry.`);
  }
}
