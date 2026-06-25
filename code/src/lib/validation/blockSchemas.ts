import { z } from "zod";

import type { BlockType } from "../../types/block";

const actionSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
});

const metricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional(),
});

const featureSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  href: z.string().optional(),
  meta: z.string().optional(),
  image: imageSchema.optional(),
});

const visualToneSchema = z.enum(["ai-lab", "learning-studio"]).optional();
const atelierToneSchema = z.enum(["atelier-graphite"]).optional();

const personSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  avatar: z.string().optional(),
  bio: z.string().optional(),
});

const generatedSectionLayoutSchema = z.enum([
  "hero",
  "feature-grid",
  "split-story",
  "metric-band",
  "timeline",
  "proof",
  "conversion",
]);

const generatedSectionItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  value: z.string().optional(),
  label: z.string().optional(),
  meta: z.string().optional(),
  href: z.string().optional(),
  image: imageSchema.optional(),
});

const generatedSectionToneSchema = z.object({
  surface: z.enum(["light", "muted", "dark", "brand"]).optional(),
  accent: z.string().optional(),
  rhythm: z.enum(["quiet", "editorial", "dense", "dramatic"]).optional(),
}).optional();

// Block props schemas intentionally remain permissive for MVP template iteration.
export const blockPropsSchemas = {
  announcementBar: z.object({
    message: z.string().min(1),
    action: actionSchema.optional(),
  }),
  navbar: z.object({
    logo: z.string().min(1),
    links: z.array(linkSchema).optional(),
    action: actionSchema.optional(),
  }),
  hero: z.object({
    eyebrow: z.string().optional(),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    primaryAction: actionSchema.optional(),
    secondaryAction: actionSchema.optional(),
    image: imageSchema.optional(),
  }),
  logoCloud: z.object({
    title: z.string().optional(),
    logos: z.array(z.union([imageSchema, z.string().min(1)])).optional(),
  }),
  trustStats: z.object({
    title: z.string().optional(),
    stats: z.array(metricSchema).optional(),
  }),
  certificationBar: z.object({
    title: z.string().optional(),
    certifications: z.array(z.string().min(1)).optional(),
  }),
  problemSolution: z.object({
    title: z.string().min(1),
    problem: z.string().min(1),
    solution: z.string().min(1),
  }),
  featureGrid: z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    features: z.array(featureSchema).optional(),
  }),
  featureSpotlight: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    features: z.array(featureSchema).optional(),
    image: imageSchema.optional(),
  }),
  productShowcase: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    products: z.array(featureSchema).optional(),
  }),
  workflowSteps: z.object({
    title: z.string().min(1),
    steps: z.array(featureSchema).optional(),
  }),
  useCaseGrid: z.object({
    title: z.string().min(1),
    useCases: z.array(featureSchema).optional(),
  }),
  industrySolutions: z.object({
    title: z.string().min(1),
    industries: z.array(featureSchema).optional(),
  }),
  caseStudies: z.object({
    title: z.string().min(1),
    cases: z
      .array(
        z.object({
          title: z.string().min(1),
          company: z.string().optional(),
          summary: z.string().optional(),
          metrics: z.array(metricSchema).optional(),
        }),
      )
      .optional(),
  }),
  testimonials: z.object({
    title: z.string().optional(),
    testimonials: z
      .array(
        z.object({
          quote: z.string().min(1),
          author: z.string().min(1),
          role: z.string().optional(),
        }),
      )
      .optional(),
  }),
  metricsSection: z.object({
    title: z.string().optional(),
    metrics: z.array(metricSchema).optional(),
  }),
  cta: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    action: actionSchema.optional(),
  }),
  leadForm: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    fields: z.array(z.string().min(1)).optional(),
    submitLabel: z.string().optional(),
  }),
  contactSales: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    contacts: z.array(linkSchema).optional(),
  }),
  faq: z.object({
    title: z.string().min(1),
    items: z
      .array(
        z.object({
          question: z.string().min(1),
          answer: z.string().min(1),
        }),
      )
      .optional(),
  }),
  pricing: z.object({
    title: z.string().min(1),
    plans: z
      .array(
        z.object({
          name: z.string().min(1),
          price: z.string().optional(),
          features: z.array(z.string().min(1)).optional(),
        }),
      )
      .optional(),
  }),
  about: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    image: imageSchema.optional(),
  }),
  team: z.object({
    title: z.string().min(1),
    members: z.array(personSchema).optional(),
  }),
  comparisonTable: z.object({
    title: z.string().min(1),
    columns: z.array(z.string().min(1)).optional(),
    rows: z.array(z.array(z.string())).optional(),
  }),
  immersiveHero: z.object({
    visualTone: visualToneSchema,
    eyebrow: z.string().optional(),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    primaryAction: actionSchema.optional(),
    secondaryAction: actionSchema.optional(),
    image: imageSchema.optional(),
    badges: z.array(z.string().min(1)).optional(),
    stats: z.array(metricSchema).optional(),
    canvasSequence: z
      .object({
        frameCount: z.number().int().positive().optional(),
        framePathTemplate: z.string().min(1).optional(),
        fallbackLabel: z.string().min(1).optional(),
      })
      .optional(),
  }),
  showcaseCarousel: z.object({
    visualTone: visualToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    items: z.array(featureSchema).optional(),
  }),
  animatedMetrics: z.object({
    visualTone: visualToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    metrics: z.array(metricSchema).optional(),
  }),
  audienceGrid: z.object({
    visualTone: visualToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    audiences: z.array(featureSchema).optional(),
  }),
  timelineJourney: z.object({
    visualTone: visualToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    steps: z.array(featureSchema).optional(),
  }),
  testimonialCarousel: z.object({
    visualTone: visualToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    testimonials: z
      .array(
        z.object({
          quote: z.string().min(1),
          author: z.string().min(1),
          role: z.string().optional(),
          outcome: z.string().optional(),
        }),
      )
      .optional(),
  }),
  learningHero: z.object({
    visualTone: visualToneSchema,
    eyebrow: z.string().optional(),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    primaryAction: actionSchema.optional(),
    secondaryAction: actionSchema.optional(),
    image: imageSchema.optional(),
    badges: z.array(z.string().min(1)).optional(),
    stats: z.array(metricSchema).optional(),
    canvasSequence: z
      .object({
        frameCount: z.number().int().positive().optional(),
        framePathTemplate: z.string().min(1).optional(),
        fallbackLabel: z.string().min(1).optional(),
      })
      .optional(),
  }),
  learningMetrics: z.object({
    visualTone: visualToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    metrics: z.array(metricSchema).optional(),
  }),
  courseTrackCarousel: z.object({
    visualTone: visualToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    items: z.array(featureSchema).optional(),
  }),
  learningPathTimeline: z.object({
    visualTone: visualToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    steps: z.array(featureSchema).optional(),
  }),
  studentStoryCarousel: z.object({
    visualTone: visualToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    testimonials: z
      .array(
        z.object({
          quote: z.string().min(1),
          author: z.string().min(1),
          role: z.string().optional(),
          outcome: z.string().optional(),
        }),
      )
      .optional(),
  }),
  destinationHero: z.object({
    eyebrow: z.string().optional(),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    primaryAction: actionSchema.optional(),
    secondaryAction: actionSchema.optional(),
    image: imageSchema.optional(),
    badges: z.array(z.string().min(1)).optional(),
    stats: z.array(metricSchema).optional(),
    canvasSequence: z
      .object({
        frameCount: z.number().int().positive().optional(),
        framePathTemplate: z.string().min(1).optional(),
        fallbackLabel: z.string().min(1).optional(),
      })
      .optional(),
  }),
  routeHighlights: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    items: z.array(featureSchema).optional(),
  }),
  experienceMarquee: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    items: z.array(featureSchema).optional(),
  }),
  stayShowcase: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    items: z.array(featureSchema).optional(),
  }),
  seasonalTimeline: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    steps: z.array(featureSchema).optional(),
  }),
  localGuideGrid: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    items: z.array(featureSchema).optional(),
  }),
  guestMapStories: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    testimonials: z
      .array(
        z.object({
          quote: z.string().min(1),
          author: z.string().min(1),
          role: z.string().optional(),
          outcome: z.string().optional(),
        }),
      )
      .optional(),
  }),
  bookingRibbon: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    action: actionSchema.optional(),
    items: z.array(featureSchema).optional(),
  }),
  travelFooter: z.object({
    companyName: z.string().min(1),
    links: z.array(linkSchema).optional(),
    copyright: z.string().optional(),
  }),
  atelierHero: z.object({
    visualTone: atelierToneSchema,
    eyebrow: z.string().optional(),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    primaryAction: actionSchema.optional(),
    secondaryAction: actionSchema.optional(),
    image: imageSchema.optional(),
    links: z.array(linkSchema).optional(),
    badges: z.array(z.string().min(1)).optional(),
    stats: z.array(metricSchema).optional(),
    canvasSequence: z
      .object({
        frameCount: z.number().int().positive().optional(),
        framePathTemplate: z.string().min(1).optional(),
        fallbackLabel: z.string().min(1).optional(),
      })
      .optional(),
  }),
  projectIndex: z.object({
    visualTone: atelierToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    items: z.array(featureSchema).optional(),
  }),
  materialStudy: z.object({
    visualTone: atelierToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    image: imageSchema.optional(),
    items: z.array(featureSchema).optional(),
  }),
  processLoom: z.object({
    visualTone: atelierToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    steps: z.array(featureSchema).optional(),
  }),
  spatialProof: z.object({
    visualTone: atelierToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    metrics: z.array(metricSchema).optional(),
    items: z.array(featureSchema).optional(),
  }),
  atelierInquiry: z.object({
    visualTone: atelierToneSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    action: actionSchema.optional(),
    image: imageSchema.optional(),
    items: z.array(featureSchema).optional(),
  }),
  atelierFooter: z.object({
    visualTone: atelierToneSchema,
    companyName: z.string().min(1),
    links: z.array(linkSchema).optional(),
    copyright: z.string().optional(),
  }),
  aiGeneratedSection: z.object({
    generatedModuleId: z.string().min(1),
    intent: z.string().min(1),
    layout: generatedSectionLayoutSchema,
    eyebrow: z.string().optional(),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    primaryAction: actionSchema.optional(),
    secondaryAction: actionSchema.optional(),
    image: imageSchema.optional(),
    items: z.array(generatedSectionItemSchema).optional(),
    metrics: z.array(metricSchema).optional(),
    fields: z.array(z.string().min(1)).optional(),
    tone: generatedSectionToneSchema,
    styleNotes: z.array(z.string().min(1)).optional(),
  }),
  footer: z.object({
    companyName: z.string().min(1),
    links: z.array(linkSchema).optional(),
    copyright: z.string().optional(),
  }),
} satisfies Record<BlockType, z.ZodObject<z.ZodRawShape>>;

export function getBlockPropsSchema(type: BlockType) {
  return blockPropsSchemas[type];
}
