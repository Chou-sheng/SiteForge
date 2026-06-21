import { afterEach, describe, expect, test, vi } from "vitest";

import { editBlockWithAI } from "../../src/lib/ai/editBlock";
import { generateLocalPage } from "../../src/lib/ai/localGeneratePage";
import { pageBlockSchema } from "../../src/lib/validation/pageSchema";
import { createDefaultBlock } from "../../src/modules/registry";

describe("editBlockWithAI", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("uses deterministic local edit without a key while preserving block identity and shape", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");
    const block = createDefaultBlock("hero");
    const originalKeys = Object.keys(block.props).sort();

    const result = await editBlockWithAI({
      pageContext: {
        title: "AI 产品官网",
        industry: "人工智能",
      },
      block,
      instruction: "强调金融行业客户的安全合规能力",
    });

    expect(result.block.id).toBe(block.id);
    expect(result.block.type).toBe(block.type);
    expect(result.block.variant).toBe(block.variant);
    expect(result.block.name).toBe(block.name);
    expect(result.block.style).toEqual(block.style);
    expect(result.block.visibility).toEqual(block.visibility);
    expect(Object.keys(result.block.props).sort()).toEqual(originalKeys);
    expect(result.block.props.title).toContain("金融行业客户");
    expect(pageBlockSchema.safeParse(result.block).success).toBe(true);
  });

  test("rejects invalid AI block type or schema and falls back to a valid local edit", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubEnv("DEEPSEEK_MODEL", "deepseek-test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  id: "changed-id",
                  type: "unknownBlock",
                  variant: "default",
                  name: "无效模块",
                  props: {},
                  style: {
                    background: "default",
                    paddingTop: 1,
                    paddingBottom: 1,
                    textAlign: "left",
                    container: "contained",
                  },
                  visibility: {
                    desktop: true,
                    tablet: true,
                    mobile: true,
                  },
                }),
              },
            },
          ],
        }),
      })),
    );
    const page = generateLocalPage({
      prompt: "为企业服务平台生成官网",
      industry: "企业服务",
    });
    const block = createDefaultBlock("cta");

    const result = await editBlockWithAI({
      pageContext: page,
      block,
      instruction: "突出预约演示",
    });

    expect(result.block.id).toBe(block.id);
    expect(result.block.type).toBe("cta");
    expect(result.block.props.title).toContain("预约演示");
    expect(pageBlockSchema.safeParse(result.block).success).toBe(true);
  });
  test("rejects AI edits that change variant or style and falls back while preserving them", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    const block = createDefaultBlock("hero");
    const changedStyle = {
      ...block.style,
      paddingTop: block.style.paddingTop + 8,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  ...block,
                  variant: "centered",
                  style: changedStyle,
                  props: {
                    ...block.props,
                    title: "AI 返回的有效标题",
                  },
                }),
              },
            },
          ],
        }),
      })),
    );

    const result = await editBlockWithAI({
      pageContext: {
        title: "AI 产品官网",
        industry: "人工智能",
      },
      block,
      instruction: "突出合规能力",
    });

    expect(result.block.id).toBe(block.id);
    expect(result.block.type).toBe(block.type);
    expect(result.block.variant).toBe(block.variant);
    expect(result.block.name).toBe(block.name);
    expect(result.block.style).toEqual(block.style);
    expect(result.block.visibility).toEqual(block.visibility);
    expect(result.block.props.title).toContain("突出合规能力");
    expect(result.block.props.title).not.toBe("AI 返回的有效标题");
    expect(pageBlockSchema.safeParse(result.block).success).toBe(true);
  });
});
