import { afterEach, describe, expect, test, vi } from "vitest";

import { editBlockWithAI } from "../../src/lib/ai/editBlock";
import { pageBlockSchema } from "../../src/lib/validation/pageSchema";
import { createDefaultBlock } from "../../src/modules/registry";

describe("editBlockWithAI", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("fails instead of using local edit when no DeepSeek key is configured", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");
    const block = createDefaultBlock("hero");

    await expect(editBlockWithAI({
      pageContext: {
        title: "AI 产品官网",
        industry: "人工智能",
      },
      block,
      instruction: "强调金融行业客户的安全合规能力",
    })).rejects.toThrow("DeepSeek API Key 未配置");
  });

  test("uses a valid DeepSeek edit while preserving block identity and shape", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubEnv("DEEPSEEK_MODEL", "deepseek-test");
    const block = createDefaultBlock("hero");
    const editedBlock = {
      ...block,
      props: {
        ...block.props,
        title: "面向金融行业客户的安全合规 AI 平台",
      },
    };
    const fetchMock = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => {
      void _url;
      void _init;

      return new Response(JSON.stringify({
      choices: [
        {
          message: {
            content: JSON.stringify(editedBlock),
          },
        },
      ],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);

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
    expect(result.block.props.title).toBe("面向金融行业客户的安全合规 AI 平台");
    expect(pageBlockSchema.safeParse(result.block).success).toBe(true);

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));

    expect(requestBody.messages[0].content).toContain("design-taste-frontend");
    expect(requestBody.messages[0].content).toContain("No wireframe-like numbered cards");
  });

  test("rejects invalid AI block type or schema instead of falling back", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubEnv("DEEPSEEK_MODEL", "deepseek-test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({
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
      }), { status: 200, headers: { "Content-Type": "application/json" } })),
    );
    const block = createDefaultBlock("cta");

    await expect(editBlockWithAI({
      pageContext: {
        title: "企业服务平台官网",
        industry: "企业服务",
      },
      block,
      instruction: "突出预约演示",
    })).rejects.toThrow("DeepSeek 区块编辑结果无效");
  });

  test("rejects AI edits that change variant or style instead of falling back", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    const block = createDefaultBlock("hero");
    const changedStyle = {
      ...block.style,
      paddingTop: block.style.paddingTop + 8,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({
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
      }), { status: 200, headers: { "Content-Type": "application/json" } })),
    );

    await expect(editBlockWithAI({
      pageContext: {
        title: "AI 产品官网",
        industry: "人工智能",
      },
      block,
      instruction: "突出合规能力",
    })).rejects.toThrow("DeepSeek 区块编辑结果无效");
  });
});
