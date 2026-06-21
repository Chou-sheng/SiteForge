import type { CSSProperties, ReactNode } from "react";

import type { EnterpriseTheme } from "../../types/page";

type ThemeProviderProps = {
  theme: EnterpriseTheme;
  children: ReactNode;
  className?: string;
};

type ThemeVariables = CSSProperties & Record<`--page-${string}`, string>;

export function ThemeProvider({ theme, children, className }: ThemeProviderProps) {
  const variables: ThemeVariables = {
    "--page-primary": theme.colorTokens.primary,
    "--page-primary-hover": theme.colorTokens.primaryHover,
    "--page-secondary": theme.colorTokens.secondary,
    "--page-accent": theme.colorTokens.accent,
    "--page-background": theme.colorTokens.background,
    "--page-surface": theme.colorTokens.surface,
    "--page-muted": theme.colorTokens.muted,
    "--page-text-primary": theme.colorTokens.textPrimary,
    "--page-text-secondary": theme.colorTokens.textSecondary,
    "--page-border": theme.colorTokens.border,
    "--page-font-family": theme.typography.fontFamily,
    "--page-heading-weight": String(theme.typography.headingWeight),
    "--page-body-weight": String(theme.typography.bodyWeight),
    "--page-h1-size": theme.typography.h1Size,
    "--page-h2-size": theme.typography.h2Size,
    "--page-h3-size": theme.typography.h3Size,
    "--page-body-size": theme.typography.bodySize,
    "--page-radius-sm": theme.radius.sm,
    "--page-radius-md": theme.radius.md,
    "--page-radius-lg": theme.radius.lg,
    "--page-radius-xl": theme.radius.xl,
    "--page-shadow-card": theme.shadow.card,
    "--page-shadow-elevated": theme.shadow.elevated,
    "--page-shadow-floating": theme.shadow.floating,
    "--page-section-y": theme.spacing.sectionY,
    "--page-container-x": theme.spacing.containerX,
    "--page-block-gap": theme.spacing.blockGap,
  };

  return (
    <div className={className} style={variables}>
      {children}
    </div>
  );
}
