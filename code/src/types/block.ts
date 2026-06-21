import type { ComponentType } from "react";
import type { z } from "zod";

export const blockTypes = [
  "announcementBar",
  "navbar",
  "hero",
  "logoCloud",
  "trustStats",
  "certificationBar",
  "problemSolution",
  "featureGrid",
  "featureSpotlight",
  "productShowcase",
  "workflowSteps",
  "useCaseGrid",
  "industrySolutions",
  "caseStudies",
  "testimonials",
  "metricsSection",
  "cta",
  "leadForm",
  "contactSales",
  "faq",
  "pricing",
  "about",
  "team",
  "comparisonTable",
  "immersiveHero",
  "showcaseCarousel",
  "animatedMetrics",
  "audienceGrid",
  "timelineJourney",
  "testimonialCarousel",
  "learningHero",
  "learningMetrics",
  "courseTrackCarousel",
  "learningPathTimeline",
  "studentStoryCarousel",
  "destinationHero",
  "routeHighlights",
  "experienceMarquee",
  "stayShowcase",
  "seasonalTimeline",
  "localGuideGrid",
  "guestMapStories",
  "bookingRibbon",
  "travelFooter",
  "atelierHero",
  "projectIndex",
  "materialStudy",
  "processLoom",
  "spatialProof",
  "atelierInquiry",
  "atelierFooter",
  "footer",
] as const;

export type BlockType = (typeof blockTypes)[number];

export type BlockCategory =
  | "navigation"
  | "hero"
  | "trust"
  | "content"
  | "conversion"
  | "commerce"
  | "company"
  | "footer";

export type BlockStyle = {
  background: "default" | "muted" | "primary" | "gradient" | "image";
  paddingTop: number;
  paddingBottom: number;
  textAlign: "left" | "center" | "right";
  container: "full" | "contained" | "narrow";
};

export type BlockVisibility = {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
};

export type PageBlock<TProps extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  type: BlockType;
  variant: string;
  name: string;
  props: TProps;
  style: BlockStyle;
  visibility: BlockVisibility;
};

export type BlockVariant = {
  id: string;
  name: string;
  description?: string;
};

export type BlockVariantDefaults<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  props?: Partial<TProps>;
  style?: Partial<BlockStyle>;
};

export type BlockRendererProps<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  block: PageBlock<TProps>;
  preview?: boolean;
};

export type BlockInspectorProps<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  block: PageBlock<TProps>;
  onChange: (block: PageBlock<TProps>) => void;
};

export type BlockDefinition<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  type: BlockType;
  name: string;
  category: BlockCategory;
  description: string;
  variants: BlockVariant[];
  defaultProps: TProps;
  defaultStyle: BlockStyle;
  variantDefaults?: Partial<Record<string, BlockVariantDefaults<TProps>>>;
  propsSchema: z.ZodObject<z.ZodRawShape>;
  Renderer: ComponentType<BlockRendererProps<TProps>>;
  Inspector: ComponentType<BlockInspectorProps<TProps>>;
};
