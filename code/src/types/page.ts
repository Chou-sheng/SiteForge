import type { PageBlock } from "./block";

export type PageStatus = "DRAFT" | "PUBLISHED";

export type PageGoal =
  | "lead-generation"
  | "brand-display"
  | "product-introduction"
  | "course-enrollment"
  | "event-conversion";

export type SiteMeta = {
  companyName: string;
  industry: string;
  targetAudience: string;
  pageGoal: PageGoal;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
};

export type EnterpriseTheme = {
  colorTokens: {
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    muted: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    headingWeight: number;
    bodyWeight: number;
    h1Size: string;
    h2Size: string;
    h3Size: string;
    bodySize: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadow: {
    card: string;
    elevated: string;
    floating: string;
  };
  spacing: {
    sectionY: string;
    containerX: string;
    blockGap: string;
  };
};

export type PageLayout = {
  maxWidth: "1120px" | "1200px" | "1280px" | "1440px";
  contentDensity: "compact" | "comfortable" | "spacious";
  responsiveMode: "standard" | "marketing" | "enterprise";
};

export type EnterprisePageDocument = {
  id: string;
  title: string;
  description?: string;
  slug?: string;
  version: number;
  siteMeta: SiteMeta;
  theme: EnterpriseTheme;
  layout: PageLayout;
  blocks: PageBlock[];
  createdAt: string;
  updatedAt: string;
};

export type PageRecord = {
  id: string;
  status: PageStatus;
  document: EnterprisePageDocument;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};
