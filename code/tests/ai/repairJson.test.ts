import { describe, expect, test } from "vitest";

import { extractJsonObject } from "../../src/lib/ai/repairJson";

describe("extractJsonObject", () => {
  test("parses a direct JSON object string", () => {
    expect(extractJsonObject('{"title":"企业官网","blocks":[]}')).toEqual({
      title: "企业官网",
      blocks: [],
    });
  });

  test("extracts a JSON object from a fenced json block", () => {
    const text = [
      "以下是结果：",
      "```json",
      '{"type":"hero","props":{"title":"增长方案"}}',
      "```",
    ].join("\n");

    expect(extractJsonObject(text)).toEqual({
      type: "hero",
      props: {
        title: "增长方案",
      },
    });
  });

  test("returns null for text that cannot contain a valid JSON object", () => {
    expect(extractJsonObject("这里只是一段说明，没有结构化对象。")).toBeNull();
  });
});
