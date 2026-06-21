import { describe, expect, test } from "vitest";

import { createSlug, ensureUniqueSlug } from "../../src/lib/utils/slug";

describe("slug utilities", () => {
  test("creates pinyin slug for Chinese enterprise page title", () => {
    expect(createSlug("AI 教育平台企业官网")).toBe(
      "ai-jiao-yu-ping-tai-qi-ye-guan-wang",
    );
  });

  test("adds the next numeric suffix for duplicate slugs", () => {
    expect(ensureUniqueSlug("demo", ["demo", "demo-2"])).toBe("demo-3");
  });

  test("matches common multi-character Chinese dictionary terms", () => {
    expect(createSlug("智能服务产品科技方案")).toBe(
      "zhi-neng-fu-wu-chan-pin-ke-ji-fang-an",
    );
    expect(createSlug("品牌落地页")).toBe("pin-pai-luo-di-ye");
  });
});
