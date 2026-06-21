// @ts-expect-error jsdom does not bundle TypeScript declarations in this project.
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import { exportPageToHtml } from "../../src/lib/export/exportHtml";
import { enterpriseTemplates } from "../../src/lib/templates/enterpriseTemplates";

function createDocument() {
  return structuredClone(enterpriseTemplates[0].document);
}

describe("exportPageToHtml", () => {
  it("uses the shared PageRenderer runtime and embeds the complete document", () => {
    const document = createDocument();
    const html = exportPageToHtml(document);
    const dom = new JSDOM(html);
    const data = dom.window.document.getElementById("static-site-page-data");

    expect(html).toContain('data-static-site-runtime="shared-page-renderer"');
    expect(html).not.toContain('class="page-section');
    expect(JSON.parse(data?.textContent ?? "null")).toEqual(document);
  });

  it("escapes SEO metadata and prevents embedded JSON from closing its script", () => {
    const document = createDocument();
    document.siteMeta.seoTitle = '标题 </title><script>alert("x")</script>';
    document.siteMeta.seoDescription = '描述 <script>alert("x")</script>';
    document.title = "页面 </script><script>alert('x')</script>";
    const html = exportPageToHtml(document);

    expect(html).not.toContain("</title><script>");
    expect(html).not.toContain("页面 </script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("\\u003c/script\\u003e");
  });

  it("supports inline runtime assets for a standalone downloaded HTML file", () => {
    const html = exportPageToHtml(createDocument(), {
      runtimeMode: "inline",
      runtime: {
        styles: "body{color:red}</style><style>unsafe",
        script: "window.RUNTIME=true</script><script>unsafe",
      },
    });

    expect(html).toContain("body{color:red}<\\/style>");
    expect(html).toContain("window.RUNTIME=true<\\/script>");
  });

  it("supports external runtime assets for a published site folder", () => {
    const html = exportPageToHtml(createDocument(), {
      runtimeMode: "external",
      stylePath: "./assets/style.css",
      scriptPath: "./assets/renderer.js",
    });

    expect(html).toContain('href="./assets/style.css"');
    expect(html).toContain('src="./assets/renderer.js"');
  });

  it("rejects invalid page documents", () => {
    const document = createDocument();
    document.id = "";

    expect(() => exportPageToHtml(document)).toThrow();
  });
});
