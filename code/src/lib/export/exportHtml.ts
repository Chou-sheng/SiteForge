import type { EnterprisePageDocument } from "../../types/page";
import { pageDocumentSchema } from "../validation/pageSchema";

export type StaticSiteRuntimeAssets = {
  script: string;
  styles: string;
};

export type ExportPageHtmlOptions =
  | {
      runtime?: StaticSiteRuntimeAssets;
      runtimeMode?: "inline";
    }
  | {
      runtimeMode: "external";
      scriptPath?: string;
      stylePath?: string;
    };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function serializePageDocument(document: EnterprisePageDocument) {
  return JSON.stringify(document)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function renderRuntime(options: ExportPageHtmlOptions) {
  if (options.runtimeMode === "external") {
    const stylePath = escapeHtml(options.stylePath ?? "./assets/style.css");
    const scriptPath = escapeHtml(options.scriptPath ?? "./assets/renderer.js");

    return {
      head: `<link rel="stylesheet" href="${stylePath}">`,
      body: `<script src="${scriptPath}"></script>`,
    };
  }

  const runtime = options.runtime ?? { script: "", styles: "" };
  const safeStyles = runtime.styles.replace(/<\/style/gi, "<\\/style");
  const safeScript = runtime.script.replace(/<\/script/gi, "<\\/script");

  return {
    head: `<style>${safeStyles}</style>`,
    body: `<script>${safeScript}</script>`,
  };
}

export function exportPageToHtml(
  pageDocument: EnterprisePageDocument,
  options: ExportPageHtmlOptions = {},
) {
  const document = pageDocumentSchema.parse(pageDocument);
  const runtime = renderRuntime(options);
  const keywords = document.siteMeta.keywords.map(escapeHtml).join(", ");

  return [
    "<!doctype html>",
    '<html lang="zh-CN" data-static-site-runtime="shared-page-renderer">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(document.siteMeta.seoTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(document.siteMeta.seoDescription)}">`,
    keywords ? `<meta name="keywords" content="${keywords}">` : "",
    runtime.head,
    "</head>",
    "<body>",
    '<div id="static-site-root"></div>',
    `<script id="static-site-page-data" type="application/json">${serializePageDocument(document)}</script>`,
    "<noscript>此网站需要启用 JavaScript 才能显示完整页面。</noscript>",
    runtime.body,
    "</body>",
    "</html>",
  ].filter(Boolean).join("\n");
}
