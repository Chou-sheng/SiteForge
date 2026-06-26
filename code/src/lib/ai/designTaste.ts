export type DesignTasteContext = {
  prompt?: string;
  industry?: string;
  style?: string;
  pageType?: string;
  title?: string;
  instruction?: string;
};

export type DesignTasteScope = "page-generation" | "block-edit";

function contextSummary(context: DesignTasteContext) {
  return [
    context.prompt,
    context.industry,
    context.style,
    context.pageType,
    context.title,
    context.instruction,
  ].flatMap((value) => {
    const text = typeof value === "string" ? value.trim() : "";

    return text ? [text] : [];
  }).join(" / ");
}

export function buildDesignTasteInstruction(context: DesignTasteContext, scope: DesignTasteScope) {
  const summary = contextSummary(context);

  return [
    "DESIGN TASTE SKILL: design-taste-frontend",
    `Scope: ${scope}. Use these rules as generation guidance, not as an industry-specific module-library selection.`,
    summary ? `User brief: ${summary}.` : "User brief: infer the site goal from the current request.",
    "Quality bar:",
    "- Generate the sections this website naturally needs for its stated business, audience, and goal.",
    "- Do not hard-code an industry template; infer navigation, hero, proof, content, conversion, and footer needs from the brief.",
    "- Keep the result structurally usable: every block needs a clear title or intent, coherent copy, responsive spacing, and no empty placeholder grids.",
    "- Use visible images, actions, form fields, metrics, or cards only where they make sense for the requested site.",
    "- If a conversion section is appropriate, include practical fields and a primary action; if it is not appropriate, do not force one.",
    "- Avoid wireframe-like numbered cards unless the number is meaningful content.",
    "- Avoid visible helper labels, debug text, module ids, or English planning labels in user-facing copy.",
    "- Keep color, type, spacing, imagery, and interaction details coherent for the site instead of relying on a one-note palette.",
    "- Use polished Chinese user-facing copy unless the user explicitly asks for another language.",
    "Return only the requested JSON shape. Do not mention this skill, design audit, or these rules in visible page copy.",
  ].join("\n");
}
