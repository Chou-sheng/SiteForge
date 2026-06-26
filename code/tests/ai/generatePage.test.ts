import { afterEach, describe, expect, test, vi } from "vitest";

import { generatePageWithAI, generatePageWithAIResult } from "../../src/lib/ai/generatePage";
import { pageGenerationSystemPrompt } from "../../src/lib/ai/prompts";
import { pageDocumentSchema } from "../../src/lib/validation/pageSchema";
import type { EnterprisePageDocument, EnterpriseTheme } from "../../src/types/page";

function serialized(value: unknown) {
  return JSON.stringify(value);
}

const theme: EnterpriseTheme = {
  colorTokens: {
    primary: "#3f2a1d",
    primaryHover: "#2a1c13",
    secondary: "#556b2f",
    accent: "#8b1e3f",
    background: "#fffaf0",
    surface: "#ffffff",
    muted: "#f6efe3",
    textPrimary: "#1f1712",
    textSecondary: "#695d52",
    border: "#e5d8c7",
  },
  typography: {
    fontFamily: "Inter, PingFang SC, Microsoft YaHei, sans-serif",
    headingWeight: 700,
    bodyWeight: 400,
    h1Size: "56px",
    h2Size: "36px",
    h3Size: "24px",
    bodySize: "16px",
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },
  shadow: {
    card: "0 8px 28px rgba(31, 23, 18, 0.08)",
    elevated: "0 18px 46px rgba(31, 23, 18, 0.12)",
    floating: "0 24px 60px rgba(31, 23, 18, 0.16)",
  },
  spacing: {
    sectionY: "88px",
    containerX: "24px",
    blockGap: "32px",
  },
};

function aiDocument(overrides: Partial<EnterprisePageDocument> = {}): EnterprisePageDocument {
  return {
    id: "ai-page",
    title: "雾屿高级美食网站首页",
    description: "高级餐厅首页",
    version: 1,
    siteMeta: {
      companyName: "雾屿料理",
      industry: "高端餐饮",
      targetAudience: "关注主厨菜单、私享餐位和酒水搭配的城市客人",
      pageGoal: "event-conversion",
      seoTitle: "雾屿料理高级美食网站首页",
      seoDescription: "预约雾屿料理的当季主厨菜单与私享餐位。",
      keywords: ["高级美食", "主厨菜单", "餐厅预约"],
    },
    theme,
    layout: {
      maxWidth: "1440px",
      contentDensity: "spacious",
      responsiveMode: "marketing",
    },
    blocks: [
      {
        id: "food-hero",
        type: "aiGeneratedSection",
        variant: "generated",
        name: "餐厅首屏",
        props: {
          generatedModuleId: "generated-food-hero",
          intent: "预约转化",
          layout: "hero",
          eyebrow: "Seasonal Fine Dining",
          title: "以深红酒香开启一场城市晚餐",
          description: "雾屿料理用当季食材、开放厨房和克制留白营造高级餐饮体验。",
          image: {
            src: "/template-assets/travel-food.jpg",
            alt: "Seasonal fine dining table",
          },
          items: [
            { title: "主厨菜单", description: "随季节更换的六道式品鉴菜单。" },
            { title: "酒水搭配", description: "以深红、咖啡与木质香气组织餐酒线索。" },
          ],
        },
        style: {
          background: "default",
          paddingTop: 96,
          paddingBottom: 96,
          textAlign: "left",
          container: "contained",
        },
        visibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
    ],
    createdAt: "2026-06-17T00:00:00.000Z",
    updatedAt: "2026-06-17T00:00:00.000Z",
    ...overrides,
  };
}

function mockDeepSeekDocument(document: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({
      choices: [
        {
          message: {
            content: JSON.stringify(document),
          },
        },
      ],
    }), { status: 200, headers: { "Content-Type": "application/json" } })),
  );
}

describe("generatePageWithAI", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  test("fails instead of using local generation when no DeepSeek key is configured", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");

    await expect(generatePageWithAI({
      prompt: "为星澜智能生成一个 AI 产品官网",
      industry: "人工智能",
    })).rejects.toThrow("DeepSeek API Key 未配置");
  });

  test("fails instead of using local generation when the DeepSeek request times out", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubEnv("DEEPSEEK_TIMEOUT_MS", "1");
    const fetchMock = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(generatePageWithAI({
      prompt: "为智能制造企业生成一页官网",
      industry: "智能制造",
      pageType: "企业官网",
    })).rejects.toThrow("DeepSeek 页面生成请求失败");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  }, 1000);

  test("sends DeepSeek JSON mode instructions with a token budget", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubEnv("DEEPSEEK_MODEL", "deepseek-test");
    vi.stubEnv("DEEPSEEK_MAX_TOKENS", "2048");
    const fetchMock = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => {
      void _url;
      void _init;

      return new Response(JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify(aiDocument()),
            },
          },
        ],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    await generatePageWithAI({
      prompt: "为智能制造企业生成一页官网",
      industry: "智能制造",
      pageType: "企业官网",
    });

    const requestInit = fetchMock.mock.calls[0]?.[1];
    const requestBody = JSON.parse(String(requestInit?.body));

    expect(requestBody.model).toBe("deepseek-test");
    expect(requestBody.max_tokens).toBe(2048);
    expect(requestBody.response_format).toEqual({ type: "json_object" });
    expect(requestBody.messages[0].content).toMatch(/json/i);
    expect(requestBody.messages[0].content).toContain("design-taste-frontend");
    expect(requestBody.messages[0].content).toContain("Avoid wireframe-like numbered cards");
    expect(requestBody.messages[0].content).not.toContain("restaurant");
    expect(requestBody.messages[0].content).not.toContain("signature dishes");
  });

  test("normalizes usable DeepSeek page output that is missing required editor fields", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubEnv("DEEPSEEK_MODEL", "deepseek-test");
    mockDeepSeekDocument({
      id: "ai-page",
      title: "AI 物流官网",
      description: "AI 返回的页面",
      version: 1,
      siteMeta: {
        title: "错误字段标题",
        description: "错误字段描述",
      },
      theme,
      layout: { maxWidth: "1280px" },
      blocks: [
        {
          id: "ai-hero",
          type: "aiGeneratedSection",
          variant: "generated",
          name: "AI 生成首屏",
          props: {
            generatedModuleId: "generated-hero",
            intent: "首屏转化",
            layout: "hero",
            title: "AI 生成的首屏标题",
          },
        },
      ],
      createdAt: "2026-06-17T00:00:00.000Z",
      updatedAt: "2026-06-17T00:00:00.000Z",
    });

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
    expect(result.document.blocks[0].props.generatedModuleId).toBe("generated-hero");
  });

  test("keeps useful AI generated section copy when layout values need repair", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubEnv("DEEPSEEK_MODEL", "deepseek-test");
    mockDeepSeekDocument(aiDocument({
      blocks: [
        {
          ...aiDocument().blocks[0],
          props: {
            ...aiDocument().blocks[0].props,
            layout: "left-right-feature",
          },
        },
      ],
    }));

    const result = await generatePageWithAIResult({
      prompt: "高级美食网站首页，使用高级排版和大面积留白，色彩以奶油白、深棕、橄榄绿、酒红为主",
      industry: "高端餐饮",
      pageType: "event-conversion",
    });

    const firstBlock = result.document.blocks[0];

    expect(result.source).toBe("deepseek");
    expect(firstBlock.type).toBe("aiGeneratedSection");
    expect(firstBlock.props.layout).toBe("split-story");
    expect(firstBlock.props.title).toBe("以深红酒香开启一场城市晚餐");
    expect(firstBlock.props.description).toContain("雾屿料理");
    expect(serialized(firstBlock)).not.toContain("按当前页面需求生成的新模块");
    expect(serialized(firstBlock)).not.toContain("模块库");
  });

  test("keeps structurally valid output instead of failing on style-quality warnings", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    mockDeepSeekDocument(aiDocument({
      blocks: [
        {
          ...aiDocument().blocks[0],
          props: {
            ...aiDocument().blocks[0].props,
            title: "AI Generated",
            description: "This should never be visible page copy.",
          },
        },
      ],
    }));

    const result = await generatePageWithAIResult({
      prompt: "高级美食网站首页",
      industry: "高端餐饮",
      pageType: "event-conversion",
    });

    expect(result.document.blocks[0].props.title).toBe("AI Generated");
  });

  test("does not block generated pages with industry-specific style gaps", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    const baseBlock = aiDocument().blocks[0];

    mockDeepSeekDocument(aiDocument({
      blocks: [
        {
          ...baseBlock,
          id: "bad-dishes",
          name: "Signature dishes",
          props: {
            generatedModuleId: "generated-bad-dishes",
            intent: "signature dishes",
            layout: "feature-grid",
            title: "Signature dishes",
            items: [
              { title: "Truffle rice", description: "Seasonal special" },
              { title: "Roasted duck liver", description: "Chef favorite" },
              { title: "Lobster soup", description: "Popular dish" },
              { title: "Wagyu steak", description: "Dinner signature" },
            ],
          },
        },
      ],
    }));

    const result = await generatePageWithAIResult({
      prompt: "高级美食网站首页",
      industry: "高端餐饮",
      pageType: "event-conversion",
    });

    expect(result.document.blocks[0].id).toBe("bad-dishes");
  });

  test("does not treat navigation or home reservation copy as a food photography failure", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    const baseBlock = aiDocument().blocks[0];

    mockDeepSeekDocument(aiDocument({
      title: "未来之家",
      siteMeta: {
        ...aiDocument().siteMeta,
        companyName: "未来之家",
        industry: "智能家居",
        pageGoal: "lead-generation",
      },
      blocks: [
        {
          ...baseBlock,
          id: "home-navigation",
          name: "导航栏",
          props: {
            generatedModuleId: "generated-home-navigation",
            intent: "导航栏",
            layout: "hero",
            title: "导航栏",
            description: "预约参观未来之家样板空间",
          },
        },
      ],
    }));

    const result = await generatePageWithAIResult({
      prompt: "为智能家居品牌未来之家生成官网，突出预约参观和空间方案",
      industry: "智能家居",
      pageType: "lead-generation",
    });

    expect(result.document.blocks[0].name).toBe("导航栏");
  });

  test("converts common semantic DeepSeek blocks into generated sections", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    const blockStyle = {
      background: "default",
      paddingTop: 72,
      paddingBottom: 72,
      textAlign: "left",
      container: "contained",
    };
    const visibility = {
      desktop: true,
      tablet: true,
      mobile: true,
    };

    mockDeepSeekDocument({
      id: "smart-home-page",
      title: "Aether Home",
      description: "Smart home brand homepage",
      version: 1,
      siteMeta: {
        companyName: "Aether Home",
        industry: "Smart Home",
        targetAudience: "Home owners and IoT product buyers",
        pageGoal: "product-introduction",
        seoTitle: "Aether Home Smart Living",
        seoDescription: "A premium smart home brand homepage.",
        keywords: ["smart home", "IoT"],
      },
      theme,
      layout: {
        maxWidth: "1440px",
        contentDensity: "spacious",
        responsiveMode: "marketing",
      },
      blocks: [
        {
          id: "semantic-nav",
          type: "navbar",
          variant: "default",
          name: "Header",
          props: {
            logo: "Aether Home",
            links: [
              { label: "Products", href: "#products" },
              { label: "App", href: "#app" },
            ],
            action: { label: "Buy", href: "#buy" },
          },
          style: blockStyle,
          visibility,
        },
        {
          id: "semantic-hero",
          type: "hero",
          variant: "default",
          name: "Hero",
          props: {
            eyebrow: "Smart Living",
            title: "Design your future home",
            subtitle: "Control lighting, security, climate, and scenes from one quiet interface.",
            primaryAction: { label: "Buy now", href: "#buy" },
            secondaryAction: { label: "Learn more", href: "#products" },
          },
          style: blockStyle,
          visibility,
        },
        {
          id: "semantic-footer",
          type: "footer",
          variant: "default",
          name: "Footer",
          props: {
            companyName: "Aether Home",
            links: [
              { label: "Support", href: "#support" },
              { label: "Contact", href: "#contact" },
            ],
            copyright: "2026 Aether Home",
          },
          style: blockStyle,
          visibility,
        },
      ],
      createdAt: "2026-06-17T00:00:00.000Z",
      updatedAt: "2026-06-17T00:00:00.000Z",
    });

    const result = await generatePageWithAIResult({
      prompt: "Create a premium smart home brand homepage with header, hero and footer.",
      industry: "Smart Home",
      pageType: "product-introduction",
    });

    expect(result.document.blocks).toHaveLength(3);
    expect(result.document.blocks.map((block) => block.type)).toEqual([
      "aiGeneratedSection",
      "aiGeneratedSection",
      "aiGeneratedSection",
    ]);
    expect(result.document.blocks[0].props.title).toBe("Aether Home");
    expect(result.document.blocks[0].props.items).toEqual([
      { title: "Products", href: "#products" },
      { title: "App", href: "#app" },
    ]);
    expect(result.document.blocks[1].props.layout).toBe("hero");
    expect(result.document.blocks[1].props.primaryAction).toEqual({ label: "Buy now", href: "#buy" });
    expect(result.document.blocks[2].props.title).toBe("Aether Home");
    expect(result.document.blocks[2].props.items).toEqual([
      { title: "Support", href: "#support" },
      { title: "Contact", href: "#contact" },
      { title: "Copyright", description: "2026 Aether Home" },
    ]);
  });

  test("fails when DeepSeek returns no valid generated sections", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    mockDeepSeekDocument(aiDocument({ blocks: [] }));

    await expect(generatePageWithAIResult({
      prompt: "高级美食网站首页",
      industry: "高端餐饮",
    })).rejects.toThrow("DeepSeek 页面结构无效");
  });

  test("tells DeepSeek to generate page-scoped modules instead of selecting module-library families", () => {
    expect(pageGenerationSystemPrompt).toContain("siteMeta.companyName");
    expect(pageGenerationSystemPrompt).toContain("siteMeta.seoDescription");
    expect(pageGenerationSystemPrompt).toContain("layout.maxWidth");
    expect(pageGenerationSystemPrompt).toContain("block.style");
    expect(pageGenerationSystemPrompt).toContain("block.visibility");
    expect(pageGenerationSystemPrompt).toContain("href");
    expect(pageGenerationSystemPrompt).toContain("Do not invent unrelated industries");
    expect(pageGenerationSystemPrompt).toContain("aiGeneratedSection");
    expect(pageGenerationSystemPrompt).toContain("generatedModuleId");
    expect(pageGenerationSystemPrompt).toContain("page-scoped");
    expect(pageGenerationSystemPrompt).toContain("不要从模块库选择");
    expect(pageGenerationSystemPrompt).not.toContain("只能使用已注册模块类型");
    expect(pageGenerationSystemPrompt).not.toContain("restaurant");
    expect(pageGenerationSystemPrompt).not.toContain("signature dishes");
  });
});
