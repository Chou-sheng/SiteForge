import { describe, expect, it } from "vitest";

import {
  assertTrustedSender,
  parsePublishResponse,
  validatePageId,
} from "../../desktop/src/ipc";

describe("desktop IPC validation", () => {
  it("accepts and trims a valid page id", () => {
    expect(validatePageId("  page-123  ")).toBe("page-123");
  });

  it.each([undefined, null, 123, "", "   "])(
    "rejects invalid page id %s",
    (value) => {
      expect(() => validatePageId(value)).toThrow("页面 ID 无效");
    },
  );

  it("accepts only sender URLs from the local application origin", () => {
    expect(() =>
      assertTrustedSender(
        "http://127.0.0.1:43125/editor/page-1",
        "http://127.0.0.1:43125",
      ),
    ).not.toThrow();

    expect(() =>
      assertTrustedSender(
        "https://example.com/editor/page-1",
        "http://127.0.0.1:43125",
      ),
    ).toThrow("不受信任");
  });

  it("parses a valid publish response and rejects malformed responses", () => {
    expect(
      parsePublishResponse({
        outputDirectory: "D:\\Sites\\demo",
        indexFile: "D:\\Sites\\demo\\index.html",
        assetCount: 3,
      }),
    ).toEqual({
      outputDirectory: "D:\\Sites\\demo",
      indexFile: "D:\\Sites\\demo\\index.html",
      assetCount: 3,
    });

    expect(() => parsePublishResponse({ outputDirectory: "" })).toThrow(
      "发布响应无效",
    );
  });
});
