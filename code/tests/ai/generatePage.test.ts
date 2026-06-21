import { afterEach, describe, expect, test, vi } from "vitest";

import { generatePageWithAI, generatePageWithAIResult } from "../../src/lib/ai/generatePage";
import { generateLocalPage } from "../../src/lib/ai/localGeneratePage";
import { pageGenerationSystemPrompt } from "../../src/lib/ai/prompts";
import { pageDocumentSchema } from "../../src/lib/validation/pageSchema";

function serialized(value: unknown) {
  return JSON.stringify(value);
}

describe("generatePageWithAI", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  test("returns a valid Chinese EnterprisePageDocument from local fallback when no DeepSeek key is configured", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");

    const document = await generatePageWithAI({
      prompt: "为星澜智能生成一个 AI 产品官网，突出销售自动化和私有化部署",
      industry: "人工智能",
      style: "科技蓝",
      pageType: "AI 产品官网",
    });

    expect(pageDocumentSchema.safeParse(document).success).toBe(true);
    expect(serialized(document)).toMatch(/[\u4e00-\u9fff]/);
    expect(document.blocks.length).toBeGreaterThan(0);

    const forbidden = serialized(document);
    expect(forbidden).not.toMatch(/<html|<\/|```|markdown|score|rating|evaluation/i);
    expect(document).not.toHaveProperty("html");
    expect(document).not.toHaveProperty("score");
    expect(document).not.toHaveProperty("rating");
    expect(document).not.toHaveProperty("evaluation");
  });

  test("falls back to local generation when the DeepSeek request times out", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubEnv("DEEPSEEK_TIMEOUT_MS", "1");
    const fetchMock = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const document = await generatePageWithAI({
      prompt: "为智能制造企业生成一页官网",
      industry: "智能制造",
      pageType: "企业官网",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(pageDocumentSchema.safeParse(document).success).toBe(true);
    expect(serialized(document)).toMatch(/[\u4e00-\u9fff]/);
  }, 1000);

  test("sends DeepSeek JSON mode instructions with a token budget", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubEnv("DEEPSEEK_MODEL", "deepseek-test");
    vi.stubEnv("DEEPSEEK_MAX_TOKENS", "2048");
    const aiDocument = generateLocalPage({
      prompt: "为智能制造企业生成一页官网",
      industry: "智能制造",
    });
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      choices: [
        {
          message: {
            content: JSON.stringify(aiDocument),
          },
        },
      ],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await generatePageWithAI({
      prompt: "为智能制造企业生成一页官网",
      industry: "智能制造",
      pageType: "企业官网",
    });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

    expect(requestBody.model).toBe("deepseek-test");
    expect(requestBody.max_tokens).toBe(2048);
    expect(requestBody.response_format).toEqual({ type: "json_object" });
    expect(requestBody.messages[0].content).toMatch(/json/i);
  });

  test("normalizes usable DeepSeek page output that is missing required editor fields", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubEnv("DEEPSEEK_MODEL", "deepseek-test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                id: "ai-page",
                title: "AI 物流官网",
                description: "AI 返回的页面",
                version: 1,
                siteMeta: {
                  title: "错误字段标题",
                  description: "错误字段描述",
                },
                theme: generateLocalPage({ prompt: "物流官网", industry: "物流服务" }).theme,
                layout: { maxWidth: "1280px" },
                blocks: [
                  {
                    id: "ai-hero",
                    type: "hero",
                    variant: "centered",
                    name: "AI 首屏",
                    props: {
                      title: "AI 生成的首屏标题",
                    },
                  },
                ],
                createdAt: "2026-06-17T00:00:00.000Z",
                updatedAt: "2026-06-17T00:00:00.000Z",
              }),
            },
          },
        ],
      }), { status: 200, headers: { "Content-Type": "application/json" } })),
    );

    const result = await generatePageWithAIResult({
      prompt: "生成一个物流服务公司官网",
      industry: "物流服务",
      pageType: "lead-generation",
    });

    expect(result.source).toBe("deepseek");
    expect(pageDocumentSchema.safeParse(result.document).success).toBe(true);
    expect(result.document.siteMeta.industry).toBe("物流服务");
    expect(result.document.blocks[0].style).toBeTruthy();
    expect(result.document.blocks[0].visibility).toEqual({
      desktop: true,
      tablet: true,
      mobile: true,
    });
    expect(result.document.blocks[0].props.title).toBe("AI 生成的首屏标题");
  });

  test("tells DeepSeek the exact page and block schema needed to pass validation", () => {
    expect(pageGenerationSystemPrompt).toContain("siteMeta.companyName");
    expect(pageGenerationSystemPrompt).toContain("siteMeta.seoDescription");
    expect(pageGenerationSystemPrompt).toContain("layout.maxWidth");
    expect(pageGenerationSystemPrompt).toContain("block.style");
    expect(pageGenerationSystemPrompt).toContain("block.visibility");
    expect(pageGenerationSystemPrompt).toContain("href");
    expect(pageGenerationSystemPrompt).toContain("Do not invent unrelated industries");
    expect(pageGenerationSystemPrompt).toContain("AI 产品官网");
    expect(pageGenerationSystemPrompt).toContain("教育机构官网");
    expect(pageGenerationSystemPrompt).toContain("文旅度假官网");
    expect(pageGenerationSystemPrompt).toContain("不要混用模块家族");
  });
});
