import { createRoot } from "react-dom/client";

import { PageRenderer } from "../components/page-renderer/PageRenderer";
import type { EnterprisePageDocument } from "../types/page";

declare global {
  interface Window {
    __STATIC_SITE_READY__?: boolean;
  }
}

const rootElement = document.getElementById("static-site-root");
const dataElement = document.getElementById("static-site-page-data");

if (!rootElement || !dataElement?.textContent) {
  throw new Error("Static site page data is missing.");
}

const pageDocument = JSON.parse(dataElement.textContent) as EnterprisePageDocument;
createRoot(rootElement).render(
  <PageRenderer document={pageDocument} mode="view" />,
);

requestAnimationFrame(() => {
  window.__STATIC_SITE_READY__ = true;
  document.documentElement.dataset.staticSiteReady = "true";
  window.dispatchEvent(new Event("static-site-ready"));
});
