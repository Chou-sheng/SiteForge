import { z } from "zod";

import { blockTypes, type BlockType } from "../../types/block";
import { getBlockPropsSchema } from "./blockSchemas";

const blockTypeSchema = z.enum(blockTypes);

export const blockStyleSchema = z.object({
  background: z.enum(["default", "muted", "primary", "gradient", "image"]),
  paddingTop: z.number().nonnegative(),
  paddingBottom: z.number().nonnegative(),
  textAlign: z.enum(["left", "center", "right"]),
  container: z.enum(["full", "contained", "narrow"]),
}).strict();

export const blockVisibilitySchema = z.object({
  desktop: z.boolean(),
  tablet: z.boolean(),
  mobile: z.boolean(),
}).strict();

export const pageBlockSchema = z
  .object({
    id: z.string().min(1),
    type: blockTypeSchema,
    variant: z.string().min(1),
    name: z.string().min(1),
    props: z.record(z.unknown()),
    style: blockStyleSchema,
    visibility: blockVisibilitySchema,
  })
  .strict()
  .superRefine((block, ctx) => {
    const result = getBlockPropsSchema(block.type as BlockType).safeParse(block.props);

    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({
          ...issue,
          path: ["props", ...issue.path],
        });
      }
    }
  });

export const enterpriseThemeSchema = z.object({
  colorTokens: z.object({
    primary: z.string().min(1),
    primaryHover: z.string().min(1),
    secondary: z.string().min(1),
    accent: z.string().min(1),
    background: z.string().min(1),
    surface: z.string().min(1),
    muted: z.string().min(1),
    textPrimary: z.string().min(1),
    textSecondary: z.string().min(1),
    border: z.string().min(1),
  }).strict(),
  typography: z.object({
    fontFamily: z.string().min(1),
    headingWeight: z.number().positive(),
    bodyWeight: z.number().positive(),
    h1Size: z.string().min(1),
    h2Size: z.string().min(1),
    h3Size: z.string().min(1),
    bodySize: z.string().min(1),
  }).strict(),
  radius: z.object({
    sm: z.string().min(1),
    md: z.string().min(1),
    lg: z.string().min(1),
    xl: z.string().min(1),
  }).strict(),
  shadow: z.object({
    card: z.string().min(1),
    elevated: z.string().min(1),
    floating: z.string().min(1),
  }).strict(),
  spacing: z.object({
    sectionY: z.string().min(1),
    containerX: z.string().min(1),
    blockGap: z.string().min(1),
  }).strict(),
}).strict();

const siteMetaSchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1),
  targetAudience: z.string().min(1),
  pageGoal: z.enum([
    "lead-generation",
    "brand-display",
    "product-introduction",
    "course-enrollment",
    "event-conversion",
  ]),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  keywords: z.array(z.string().min(1)),
}).strict();

const pageLayoutSchema = z.object({
  maxWidth: z.enum(["1120px", "1200px", "1280px", "1440px"]),
  contentDensity: z.enum(["compact", "comfortable", "spacious"]),
  responsiveMode: z.enum(["standard", "marketing", "enterprise"]),
}).strict();

export const pageDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  version: z.number().int().positive(),
  siteMeta: siteMetaSchema,
  theme: enterpriseThemeSchema,
  layout: pageLayoutSchema,
  blocks: z.array(pageBlockSchema),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
}).strict();

export const pageRecordSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  document: pageDocumentSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  publishedAt: z.string().min(1).optional(),
}).strict();
