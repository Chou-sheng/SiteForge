import type { BlockStyle, BlockType, PageBlock } from "../../types/block";
import type { EnterprisePageDocument, EnterpriseTheme, PageGoal, PageLayout } from "../../types/page";
import { pageDocumentSchema } from "../validation/pageSchema";

export type EnterpriseTemplate = {
  id: string;
  name: string;
  description: string;
  pageType: string;
  document: EnterprisePageDocument;
};

const timestamp = "2026-06-15T00:00:00.000Z";

const defaultVisibility = {
  desktop: true,
  tablet: true,
  mobile: true,
};

const containedCenter: BlockStyle = {
  background: "default",
  paddingTop: 72,
  paddingBottom: 72,
  textAlign: "center",
  container: "contained",
};

const premiumBlockTypes = new Set<BlockType>([
  "immersiveHero",
  "showcaseCarousel",
  "animatedMetrics",
  "audienceGrid",
  "timelineJourney",
  "testimonialCarousel",
  "learningHero",
  "learningMetrics",
  "courseTrackCarousel",
  "learningPathTimeline",
  "studentStoryCarousel",
  "atelierHero",
  "projectIndex",
  "materialStudy",
  "processLoom",
  "spatialProof",
  "atelierInquiry",
  "atelierFooter",
]);

const premiumVisualToneByTemplate: Partial<Record<string, "ai-lab" | "learning-studio" | "atelier-graphite">> = {
  "ai-premium": "ai-lab",
  "education-premium": "learning-studio",
  "atelier-premium": "atelier-graphite",
};

const premiumRhythmByDocument: Partial<Record<string, BlockType[]>> = {
  "template-ai-product-premium": [
    "navbar",
    "immersiveHero",
    "showcaseCarousel",
    "animatedMetrics",
    "audienceGrid",
    "timelineJourney",
    "testimonialCarousel",
    "leadForm",
    "footer",
  ],
  "template-education-premium": [
    "announcementBar",
    "learningHero",
    "logoCloud",
    "learningMetrics",
    "certificationBar",
    "problemSolution",
    "courseTrackCarousel",
    "learningPathTimeline",
    "useCaseGrid",
    "studentStoryCarousel",
    "pricing",
    "faq",
    "contactSales",
    "cta",
    "about",
    "team",
  ],
  "template-travel-premium": [
    "destinationHero",
    "routeHighlights",
    "experienceMarquee",
    "stayShowcase",
    "seasonalTimeline",
    "localGuideGrid",
    "guestMapStories",
    "bookingRibbon",
    "travelFooter",
  ],
  "template-atelier-premium": [
    "atelierHero",
    "projectIndex",
    "materialStudy",
    "processLoom",
    "spatialProof",
    "atelierInquiry",
    "atelierFooter",
  ],
};

type TemplateImage = {
  src: string;
  alt: string;
};

type ItemImageKey = "items" | "steps" | "audiences" | "useCases" | "products" | "features";

type InstalledTemplateAssets = {
  image?: TemplateImage;
  logos?: string[];
} & Partial<Record<ItemImageKey, TemplateImage[]>>;

const itemImageKeys: ItemImageKey[] = ["items", "steps", "audiences", "useCases", "products", "features"];

function templateImage(src: string, alt: string): TemplateImage {
  return { src, alt };
}

function isTemplateRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const installedTemplateAssetsByDocument: Record<string, Record<string, InstalledTemplateAssets>> = {
  "template-ai-product-premium": {
    "ai-premium-2-immersiveHero": {
      image: templateImage(
        "/backgrounds/enterprise-operations.png",
        "企业 AI 控制台与智能工作流界面",
      ),
    },
    "ai-premium-4-showcaseCarousel": {
      items: [
        templateImage(
          "/backgrounds/enterprise-hq.png",
          "企业知识库数据分析看板",
        ),
        templateImage(
          "/backgrounds/enterprise-logistics.png",
          "多模型任务编排工作台",
        ),
        templateImage(
          "/backgrounds/enterprise-manufacturing.png",
          "客户服务团队使用智能助手",
        ),
        templateImage(
          "/template-assets/ai-workflow.jpg",
          "企业运营团队协作自动化流程",
        ),
      ],
    },
  },
  "template-education-premium": {
    "education-premium-2-learningHero": {
      image: templateImage(
        "/template-assets/education-hero.jpg",
        "职业教育课堂与导师辅导现场",
      ),
    },
    "education-premium-3-logoCloud": {
      logos: ["Future Work", "Data Lab", "AI Office", "Career Hub", "Campus Studio", "Growth Academy"],
    },
    "education-premium-7-courseTrackCarousel": {
      items: [
        templateImage(
          "/template-assets/education-data.jpg",
          "数据分析训练营小组研讨",
        ),
        templateImage(
          "/template-assets/education-ai-office.jpg",
          "AI 办公效率课程线上学习",
        ),
        templateImage(
          "/template-assets/education-project.jpg",
          "项目管理实战课程协作演练",
        ),
        templateImage(
          "/template-assets/education-ux.jpg",
          "产品体验课程原型设计工作坊",
        ),
      ],
    },
    "education-premium-15-about": {
      image: templateImage(
        "/template-assets/education-about.jpg",
        "职业教育导师团队与作品集辅导",
      ),
    },
  },
  "template-travel-premium": {
    "travel-premium-1-destinationHero": {
      image: templateImage(
        "/template-assets/travel-hero.jpg",
        "山海度假目的地海岸与沙滩",
      ),
    },
    "travel-premium-2-routeHighlights": {
      items: [
        templateImage(
          "/template-assets/travel-arrival.jpg",
          "度假目的地抵达与接驳区域",
        ),
        templateImage(
          "/template-assets/travel-nature.jpg",
          "山海自然徒步与观景路线",
        ),
        templateImage(
          "/template-assets/travel-food.jpg",
          "在地风味晚宴与开放厨房",
        ),
        templateImage(
          "/template-assets/travel-departure.jpg",
          "返程半日轻探索与旅行整理",
        ),
      ],
    },
    "travel-premium-3-experienceMarquee": {
      items: [
        templateImage(
          "/template-assets/travel-coast-hike.jpg",
          "晨间海岸徒步路线",
        ),
        templateImage(
          "/template-assets/travel-chef-table.jpg",
          "在地风味主厨餐桌",
        ),
        templateImage(
          "/template-assets/travel-family.jpg",
          "亲子自然课堂户外活动",
        ),
        templateImage(
          "/template-assets/travel-night.jpg",
          "夜游与星空导览体验",
        ),
      ],
    },
    "travel-premium-4-stayShowcase": {
      items: [
        templateImage(
          "/template-assets/travel-stay-couple.jpg",
          "海景露台套房",
        ),
        templateImage(
          "/template-assets/travel-stay-family.jpg",
          "亲子庭院房与度假泳池",
        ),
        templateImage(
          "/template-assets/travel-villa.jpg",
          "山谷联排别墅公共客厅",
        ),
      ],
    },
    "travel-premium-6-localGuideGrid": {
      items: [
        templateImage(
          "/template-assets/travel-transfer-guide.jpg",
          "目的地交通接驳指引",
        ),
        templateImage(
          "/template-assets/travel-dining-guide.jpg",
          "度假区餐饮安排",
        ),
        templateImage(
          "/template-assets/travel-service.jpg",
          "管家服务响应场景",
        ),
        templateImage(
          "/template-assets/travel-local-explore.jpg",
          "周边自然探索路线",
        ),
        templateImage(
          "/template-assets/travel-gear.jpg",
          "季节活动装备建议",
        ),
        templateImage(
          "/template-assets/travel-team.jpg",
          "团队定制活动与团建空间",
        ),
      ],
    },
  },
  "template-atelier-premium": {
    "atelier-premium-1-atelierHero": {
      image: templateImage(
        "/template-assets/atelier-hero.jpg",
        "木饰面与清水混凝土构成的现代室内空间",
      ),
    },
    "atelier-premium-2-projectIndex": {
      items: [
        templateImage(
          "/template-assets/atelier-gallery.jpg",
          "现代品牌空间中的长桌、灯光与连续展示界面",
        ),
        templateImage(
          "/template-assets/atelier-workplace.jpg",
          "现代办公总部中的开放工作区与协作桌面",
        ),
        templateImage(
          "/template-assets/atelier-residence.jpg",
          "城市住宅中的木质家具、留白与自然光",
        ),
        templateImage(
          "/template-assets/atelier-hospitality.jpg",
          "精品酒店大堂中的石材、金属与柔和灯光",
        ),
      ],
    },
    "atelier-premium-3-materialStudy": {
      image: templateImage(
        "/template-assets/atelier-materials.jpg",
        "清水混凝土空间中的几何切面与自然光",
      ),
      items: [
        templateImage(
          "/template-assets/atelier-material-concrete.jpg",
          "清水混凝土墙面的细腻肌理",
        ),
        templateImage(
          "/template-assets/atelier-material-metal.jpg",
          "金属格栅与建筑设备形成的线性肌理",
        ),
        templateImage(
          "/template-assets/atelier-material-wood.jpg",
          "木材纹理与建筑表面的细节关系",
        ),
      ],
    },
    "atelier-premium-6-atelierInquiry": {
      image: templateImage(
        "/template-assets/atelier-inquiry.jpg",
        "适合空间咨询会谈的现代室内环境",
      ),
    },
  },
};

function withInstalledTemplateImages(documentId: string, blocks: PageBlock[]): PageBlock[] {
  const assetsByBlock = installedTemplateAssetsByDocument[documentId];

  if (!assetsByBlock) {
    return blocks;
  }

  return blocks.map((pageBlock) => {
    const assets = assetsByBlock[pageBlock.id];

    if (!assets) {
      return pageBlock;
    }

    const props: Record<string, unknown> = { ...pageBlock.props };

    if (assets.image) {
      props.image = assets.image;
    }

    if (assets.logos) {
      props.logos = assets.logos;
    }

    for (const key of itemImageKeys) {
      const images = assets[key];
      const currentItems = props[key];

      if (!images || !Array.isArray(currentItems)) {
        continue;
      }

      props[key] = currentItems.map((item, index) => {
        const image = images[index];

        return image && isTemplateRecord(item) ? { ...item, image } : item;
      });
    }

    return { ...pageBlock, props } as PageBlock;
  });
}

function orderBlocksForTemplate(id: string, blocks: PageBlock[]) {
  const rhythm = premiumRhythmByDocument[id];

  if (!rhythm) {
    return blocks;
  }

  const rank = new Map(rhythm.map((type, index) => [type, index]));

  return blocks
    .map((pageBlock, index) => ({ pageBlock, index }))
    .sort((left, right) => {
      const leftRank = rank.get(left.pageBlock.type) ?? Number.MAX_SAFE_INTEGER;
      const rightRank = rank.get(right.pageBlock.type) ?? Number.MAX_SAFE_INTEGER;

      return leftRank - rightRank || left.index - right.index;
    })
    .map(({ pageBlock }) => pageBlock);
}

function theme(primary: string, primaryHover: string, secondary: string, accent: string): EnterpriseTheme {
  return {
    colorTokens: {
      primary,
      primaryHover,
      secondary,
      accent,
      background: "#ffffff",
      surface: "#ffffff",
      muted: "#f7f8ff",
      textPrimary: "#111827",
      textSecondary: "#4b5563",
      border: "#e5e7eb",
    },
    typography: {
      fontFamily: "Inter, PingFang SC, Microsoft YaHei, sans-serif",
      headingWeight: 700,
      bodyWeight: 400,
      h1Size: "56px",
      h2Size: "40px",
      h3Size: "24px",
      bodySize: "16px",
    },
    radius: {
      sm: "8px",
      md: "12px",
      lg: "18px",
      xl: "28px",
    },
    shadow: {
      card: "0 14px 36px rgba(16, 24, 40, 0.08)",
      elevated: "0 24px 70px rgba(16, 24, 40, 0.14)",
      floating: "0 30px 90px rgba(16, 24, 40, 0.18)",
    },
    spacing: {
      sectionY: "88px",
      containerX: "24px",
      blockGap: "32px",
    },
  };
}

function atelierTheme(): EnterpriseTheme {
  return {
    colorTokens: {
      primary: "#d51f3f",
      primaryHover: "#be123c",
      secondary: "#111214",
      accent: "#a0a69e",
      background: "#fbfcf8",
      surface: "#ffffff",
      muted: "#eef1eb",
      textPrimary: "#111214",
      textSecondary: "#5d625c",
      border: "#d9ded6",
    },
    typography: {
      fontFamily: "Geist, Satoshi, PingFang SC, Microsoft YaHei, sans-serif",
      headingWeight: 650,
      bodyWeight: 400,
      h1Size: "64px",
      h2Size: "44px",
      h3Size: "24px",
      bodySize: "16px",
    },
    radius: {
      sm: "6px",
      md: "10px",
      lg: "10px",
      xl: "10px",
    },
    shadow: {
      card: "0 18px 48px rgba(17, 18, 20, 0.08)",
      elevated: "0 26px 78px rgba(17, 18, 20, 0.12)",
      floating: "0 30px 90px rgba(17, 18, 20, 0.18)",
    },
    spacing: {
      sectionY: "92px",
      containerX: "24px",
      blockGap: "34px",
    },
  };
}

function block<TProps extends Record<string, unknown>>(
  templateId: string,
  index: number,
  type: BlockType,
  variant: string,
  name: string,
  props: TProps,
  style: BlockStyle,
): PageBlock<TProps> {
  const visualTone = premiumBlockTypes.has(type) ? premiumVisualToneByTemplate[templateId] : undefined;
  const blockProps = (visualTone ? { visualTone, ...props } : props) as TProps;

  return {
    id: `${templateId}-${index}-${type}`,
    type,
    variant,
    name,
    props: blockProps,
    style,
    visibility: defaultVisibility,
  };
}

function document(
  id: string,
  title: string,
  description: string,
  siteMeta: {
    companyName: string;
    industry: string;
    targetAudience: string;
    pageGoal: PageGoal;
    seoTitle: string;
    seoDescription: string;
    keywords: string[];
  },
  themeValue: EnterpriseTheme,
  layout: PageLayout,
  blocks: PageBlock[],
): EnterprisePageDocument {
  const orderedBlocks = orderBlocksForTemplate(id, blocks);

  return {
    id,
    title,
    description,
    slug: id,
    version: 1,
    siteMeta,
    theme: themeValue,
    layout,
    blocks: withInstalledTemplateImages(id, orderedBlocks),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

const premiumAiProduct = document(
  "template-ai-product-premium",
  "AI 产品官网",
  "面向企业级 AI 平台的产品介绍、场景说明、安全可信与演示预约页面。",
  {
    companyName: "灵枢智能",
    industry: "企业 AI 软件",
    targetAudience: "正在评估企业 AI 工作流、知识库和智能客服能力的业务负责人、IT 负责人和管理层",
    pageGoal: "product-introduction",
    seoTitle: "灵枢智能企业 AI 产品官网",
    seoDescription: "了解灵枢智能的企业 AI 工作台、私有知识库、多模型编排、安全合规和演示预约。",
    keywords: ["企业 AI", "AI 工作流", "私有知识库", "智能客服"],
  },
  theme("#7c3aed", "#6d28d9", "#0f172a", "#00c4cc"),
  { maxWidth: "1280px", contentDensity: "spacious", responsiveMode: "marketing" },
  [
    block("ai-premium", 1, "navbar", "classic", "导航栏", {
      logo: "灵枢智能",
      links: [
        { label: "AI 能力", href: "#showcase" },
        { label: "应用场景", href: "#scenarios" },
        { label: "落地流程", href: "#journey" },
        { label: "预约演示", href: "#lead-form" },
      ],
      action: { label: "免费演示", href: "#lead-form" },
    }, { ...containedCenter, paddingTop: 18, paddingBottom: 18 }),
    block("ai-premium", 2, "immersiveHero", "product-story", "AI 产品首屏", {
      eyebrow: "企业级 AI 工作流平台",
      title: "把企业知识、流程和客户服务交给可控 AI 工作台",
      subtitle: "灵枢智能把私有知识库、多模型编排、权限审计和业务系统连接在一起，让团队快速落地能管理、可追踪、可迭代的 AI 应用。",
      primaryAction: { label: "预约 AI 演示", href: "#lead-form" },
      secondaryAction: { label: "查看应用场景", href: "#scenarios" },
      badges: ["私有知识库", "多模型编排", "权限审计", "工作流自动化"],
      stats: [
        { value: "30天", label: "完成首批场景上线", description: "从试点到团队可用" },
        { value: "12+", label: "业务系统连接", description: "覆盖知识、客服与销售资料" },
        { value: "100%", label: "权限留痕", description: "访问、生成和调用全程可审计" },
      ],
      canvasSequence: {
        frameCount: 72,
        framePathTemplate: "/canvas/ai-workflow/frame-{index}.jpg",
        fallbackLabel: "AI 工作流序列帧动画接口",
      },
    }, { background: "gradient", paddingTop: 92, paddingBottom: 96, textAlign: "left", container: "contained" }),
    block("ai-premium", 3, "animatedMetrics", "proof-cards", "产品价值数据", {
      title: "从试用工具升级为企业级 AI 基础设施",
      description: "用可量化的部署速度、知识覆盖和安全留痕建立产品信任。",
      metrics: [
        { value: "3x", label: "知识查询效率", description: "让客服、销售和内部员工更快获得可信答案" },
        { value: "85%", label: "重复问题自动处理", description: "常见咨询由 AI 助手先行响应并沉淀反馈" },
        { value: "7x24", label: "业务助手在线", description: "跨团队、跨时区持续支持业务流程" },
      ],
    }, { background: "muted", paddingTop: 80, paddingBottom: 80, textAlign: "left", container: "contained" }),
    block("ai-premium", 4, "showcaseCarousel", "ai-capabilities", "AI 能力轮播", {
      title: "把 AI 能力拆成可落地的产品模块",
      description: "每个模块都面向真实业务动作，而不是泛泛展示模型能力。",
      items: [
        { icon: "KB", title: "私有知识问答", meta: "Knowledge Base", description: "连接企业文档、官网、CRM 和工单知识，回答可追溯、有依据。" },
        { icon: "AI", title: "多模型任务编排", meta: "Orchestration", description: "根据任务类型选择模型、工具和权限策略，减少人工切换。" },
        { icon: "CS", title: "智能客服助手", meta: "Customer Service", description: "自动处理高频问题，识别复杂咨询并转交人工。" },
        { icon: "Ops", title: "自动化运营流程", meta: "Workflow", description: "生成纪要、跟进提醒、资料草稿和跨系统操作建议。" },
      ],
    }, { background: "default", paddingTop: 88, paddingBottom: 88, textAlign: "center", container: "contained" }),
    block("ai-premium", 5, "audienceGrid", "scenario-cards", "AI 应用场景", {
      title: "让不同团队都有清晰的 AI 落地入口",
      description: "官网按部门和任务组织内容，帮助访客快速找到自己的应用场景。",
      audiences: [
        { icon: "售", title: "销售团队", description: "自动生成拜访纪要、方案初稿和客户跟进建议。" },
        { icon: "服", title: "客服团队", description: "基于知识库回答客户问题，并沉淀高频问题反馈。" },
        { icon: "知", title: "知识运营", description: "统一管理文档来源、权限范围、更新周期和引用依据。" },
        { icon: "管", title: "管理团队", description: "通过审计、数据和效果指标掌握 AI 应用质量。" },
        { icon: "IT", title: "IT 与安全", description: "管理系统连接、身份权限、部署方式和访问策略。" },
        { icon: "运", title: "运营团队", description: "批量生成内容草稿、活动复盘和流程自动化建议。" },
      ],
    }, { background: "muted", paddingTop: 88, paddingBottom: 88, textAlign: "center", container: "contained" }),
    block("ai-premium", 6, "timelineJourney", "implementation-path", "AI 落地流程", {
      title: "从场景梳理到持续优化的落地路径",
      description: "把企业 AI 项目拆成可评估、可执行、可复盘的步骤。",
      steps: [
        { title: "场景诊断", description: "梳理高频问题、流程节点、知识来源和权限边界。" },
        { title: "知识接入", description: "连接文档、网页和业务系统，建立可追溯知识底座。" },
        { title: "助手配置", description: "配置角色、工具、模型策略、审核流程和转人工规则。" },
        { title: "上线复盘", description: "跟踪命中率、满意度、节省时间和风险事件，持续迭代。" },
      ],
    }, { background: "default", paddingTop: 88, paddingBottom: 88, textAlign: "center", container: "contained" }),
    block("ai-premium", 7, "testimonialCarousel", "customer-proof", "客户案例轮播", {
      title: "企业客户如何从 AI 试点走向规模化使用",
      description: "用场景结果说明产品价值，降低演示预约前的决策成本。",
      testimonials: [
        { outcome: "40%", quote: "客服团队把重复问答交给 AI 处理后，人工可以专注高价值客户沟通。", author: "某 SaaS 企业", role: "客户成功负责人" },
        { outcome: "2 周", quote: "销售资料库接入后，团队能快速生成更符合行业语境的方案初稿。", author: "某企业服务公司", role: "销售运营总监" },
        { outcome: "0 泄露", quote: "权限、引用和审计记录让管理层更放心地推动 AI 工具进入内部流程。", author: "某集团信息中心", role: "IT 负责人" },
      ],
    }, { background: "muted", paddingTop: 88, paddingBottom: 88, textAlign: "center", container: "contained" }),
    block("ai-premium", 8, "leadForm", "split-form", "演示预约表单", {
      title: "预约企业 AI 产品演示",
      description: "告诉我们你的部门、知识来源和目标场景，我们会准备一套适合的演示路径。",
      fields: ["姓名", "手机号", "公司名称", "AI 应用场景", "期望部署方式"],
      submitLabel: "提交演示预约",
    }, { background: "default", paddingTop: 82, paddingBottom: 82, textAlign: "left", container: "contained" }),
    block("ai-premium", 9, "footer", "link-columns", "页脚", {
      companyName: "灵枢智能",
      links: [
        { label: "安全说明", href: "#security" },
        { label: "隐私政策", href: "#privacy" },
        { label: "联系我们", href: "#lead-form" },
      ],
      copyright: "© 2026 灵枢智能。保留所有权利。",
    }, { ...containedCenter, background: "primary", paddingTop: 56, paddingBottom: 56 }),
  ],
);

const premiumEducation = document(
  "template-education-premium",
  "教育机构官网",
  "面向职业教育和培训机构的招生转化、课程展示、学习路径与报名咨询页面。",
  {
    companyName: "启明学堂",
    industry: "职业教育",
    targetAudience: "希望系统提升职业技能、了解课程路径并预约课程顾问的学习者",
    pageGoal: "course-enrollment",
    seoTitle: "启明学堂职业教育官网",
    seoDescription: "了解启明学堂的项目制课程、导师陪跑、学习路径、学员成果和报名咨询方式。",
    keywords: ["职业教育", "课程报名", "项目制学习", "AI 办公课程"],
  },
  theme("#00a6a6", "#008f8f", "#111827", "#8b5cf6"),
  { maxWidth: "1280px", contentDensity: "spacious", responsiveMode: "marketing" },
  [
    block("education-premium", 1, "announcementBar", "with-action", "招生公告", {
      message: "春季班开放咨询：AI 办公、数据分析、项目管理三大方向正在招生",
      action: { label: "预约课程顾问", href: "#contact-sales" },
    }, { background: "primary", paddingTop: 12, paddingBottom: 12, textAlign: "center", container: "full" }),
    block("education-premium", 2, "learningHero", "admissions-canvas", "动态招生首屏", {
      eyebrow: "项目制职业教育",
      title: "把学习路径、导师反馈和作品成果讲清楚",
      subtitle: "启明学堂面向转岗、在职提升和团队训练，提供从能力测评到作品集沉淀的课程服务。",
      primaryAction: { label: "预约课程顾问", href: "#contact-sales" },
      secondaryAction: { label: "查看课程方向", href: "#course-tracks" },
      badges: ["项目制训练", "导师陪跑", "作品集输出", "企业内训"],
      stats: [
        { value: "8周", label: "标准训练周期", description: "每周任务和反馈闭环" },
        { value: "1对1", label: "导师答疑", description: "围绕作品和岗位目标反馈" },
        { value: "4份", label: "作品成果", description: "沉淀可展示项目材料" },
      ],
      canvasSequence: {
        frameCount: 72,
        framePathTemplate: "/canvas/learning-path/frame-{index}.jpg",
        fallbackLabel: "课堂、任务和作品成长 Canvas 动画",
      },
    }, { background: "gradient", paddingTop: 92, paddingBottom: 96, textAlign: "left", container: "contained" }),
    block("education-premium", 3, "logoCloud", "wrapped-grid", "合作与服务对象", {
      title: "服务成长型企业、职业院校与学习社区",
      logos: ["Future Work", "Data Lab", "AI Office", "Career Hub", "Campus Studio", "Growth Academy"],
    }, { background: "muted", paddingTop: 64, paddingBottom: 64, textAlign: "center", container: "contained" }),
    block("education-premium", 4, "learningMetrics", "impact-split", "学习成果动效指标", {
      title: "用可衡量的学习服务支撑招生转化",
      description: "在首屏之后快速说明课程服务不是单次交付，而是持续陪跑和成果沉淀。",
      metrics: [
        { value: "8周", label: "标准训练周期", description: "每周任务和反馈闭环" },
        { value: "92%", label: "阶段作业完成率", description: "导师跟进任务节奏" },
        { value: "4份", label: "作品集产出", description: "沉淀可展示项目成果" },
      ],
    }, { background: "primary", paddingTop: 82, paddingBottom: 82, textAlign: "left", container: "contained" }),
    block("education-premium", 5, "certificationBar", "badge-row", "课程认证与背书", {
      title: "课程服务与教学质量背书",
      certifications: ["项目制训练", "导师答疑", "阶段测评", "作品集辅导", "企业内训支持"],
    }, { background: "default", paddingTop: 44, paddingBottom: 44, textAlign: "center", container: "contained" }),
    block("education-premium", 6, "problemSolution", "side-by-side", "学习痛点与方案", {
      title: "很多学习者缺的不是资料，而是路径、反馈和成果沉淀",
      problem: "自学内容分散，课程页面只讲大纲，访客很难判断自己适不适合、能学到什么、最后能产出什么。",
      solution: "教育模板用学习阶段、适用人群、课程套餐和咨询入口串成完整招生路径，让访客能快速判断并行动。",
    }, { background: "muted", paddingTop: 80, paddingBottom: 80, textAlign: "left", container: "contained" }),
    block("education-premium", 7, "courseTrackCarousel", "editorial-catalog", "课程路径动态轮播", {
      title: "从兴趣到岗位能力的课程路径",
      description: "用动态轮播展示课程方向，让访客快速比较学习目标、周期和产出。",
      items: [
        { icon: "DA", title: "数据分析训练营", meta: "8 周 / 项目制", description: "学习数据清洗、可视化、业务指标拆解和分析报告表达。" },
        { icon: "AI", title: "AI 办公效率课", meta: "4 周 / 工具实践", description: "掌握提示词、自动化表格、内容生成和日常办公流程优化。" },
        { icon: "PM", title: "项目管理实战课", meta: "6 周 / 协作演练", description: "围绕计划、沟通、风险、复盘和跨部门协作完成项目训练。" },
        { icon: "UX", title: "产品体验入门课", meta: "5 周 / 作品输出", description: "学习用户研究、页面结构、原型表达和体验优化方法。" },
      ],
    }, { background: "default", paddingTop: 90, paddingBottom: 90, textAlign: "left", container: "contained" }),
    block("education-premium", 8, "learningPathTimeline", "mentor-rail", "动态学习阶段", {
      title: "四个阶段把学习转化为作品和能力",
      description: "招生页面要把学习过程讲清楚，降低用户对课程质量和执行难度的疑虑。",
      steps: [
        { title: "能力测评", description: "明确基础、目标岗位、时间投入和适合的课程方向。" },
        { title: "任务训练", description: "每周围绕真实业务案例完成阶段项目和技能练习。" },
        { title: "导师反馈", description: "针对作品结构、表达逻辑和岗位匹配度给出具体建议。" },
        { title: "作品沉淀", description: "整理作品集、复盘报告和面试表达材料，形成可展示成果。" },
      ],
    }, { background: "gradient", paddingTop: 92, paddingBottom: 92, textAlign: "left", container: "contained" }),
    block("education-premium", 9, "useCaseGrid", "scenario-grid", "适合学习人群", {
      title: "不同基础的学员都有清晰入口",
      useCases: [
        { icon: "转", title: "转岗学习者", description: "希望切换到数据、运营、产品或 AI 应用相关方向。" },
        { icon: "升", title: "在职提升者", description: "想把 AI、数据和项目协作能力用到当前工作中。" },
        { icon: "毕", title: "应届毕业生", description: "需要作品集、项目表达和面试素材来补足实践经验。" },
        { icon: "企", title: "企业团队", description: "希望建立统一的数据分析或 AI 办公训练计划。" },
      ],
    }, { background: "default", paddingTop: 80, paddingBottom: 80, textAlign: "center", container: "contained" }),
    block("education-premium", 10, "studentStoryCarousel", "wall-of-outcomes", "学员故事动态轮播", {
      title: "学员不是只听课，而是带着成果离开",
      description: "用真实口吻和结果指标强化报名咨询前的信任感。",
      testimonials: [
        { outcome: "3 个项目", quote: "以前只会看教程，训练营让我第一次把数据分析做成完整作品。", author: "王同学", role: "转岗学习者" },
        { outcome: "效率翻倍", quote: "AI 办公课最有用的是把工具放进日常流程，而不是只学一堆技巧。", author: "陈同学", role: "在职提升" },
        { outcome: "作品集成型", quote: "导师反馈很具体，知道哪些内容该放进作品集，哪些只是练习过程。", author: "林同学", role: "应届毕业生" },
      ],
    }, { background: "primary", paddingTop: 88, paddingBottom: 88, textAlign: "left", container: "contained" }),
    block("education-premium", 11, "pricing", "service-packages", "课程套餐", {
      title: "按学习目标选择课程服务",
      plans: [
        { name: "体验课", price: "¥199", features: ["能力测评", "1 次导师答疑", "课程方向建议"] },
        { name: "训练营", price: "¥3,999", features: ["8 周项目训练", "每周作业反馈", "作品集辅导"] },
        { name: "企业内训", price: "定制报价", features: ["团队能力诊断", "定制课程路径", "结课复盘报告"] },
      ],
    }, { background: "muted", paddingTop: 88, paddingBottom: 88, textAlign: "center", container: "contained" }),
    block("education-premium", 12, "faq", "two-column", "报名常见问题", {
      title: "报名前常见问题",
      items: [
        { question: "没有基础可以报名吗？", answer: "可以。课程顾问会先根据基础和目标推荐适合的方向。" },
        { question: "课程结束后有什么成果？", answer: "每个训练方向都会沉淀阶段项目、复盘报告和作品集素材。" },
        { question: "在职学习时间不固定怎么办？", answer: "课程按周推进，导师会根据可投入时间调整任务节奏。" },
        { question: "企业团队能单独定制吗？", answer: "可以。企业内训支持能力诊断、定制案例和结课复盘。" },
      ],
    }, { background: "default", paddingTop: 80, paddingBottom: 80, textAlign: "left", container: "narrow" }),
    block("education-premium", 13, "contactSales", "contact-cards", "报名咨询方式", {
      title: "和课程顾问确认你的学习路径",
      description: "留下你的学习目标、当前基础和可投入时间，我们会给出更具体的课程建议。",
      contacts: [
        { label: "电话咨询", href: "tel:400-800-2026" },
        { label: "邮件咨询", href: "mailto:admissions@example.com" },
        { label: "预约线下校区", href: "#campus" },
      ],
    }, { background: "muted", paddingTop: 72, paddingBottom: 72, textAlign: "center", container: "contained" }),
    block("education-premium", 14, "cta", "split-contact", "咨询行动区", {
      title: "先确认方向，再开始系统学习",
      description: "如果你还不确定适合哪门课，可以先预约课程顾问做一次简短测评。",
      action: { label: "预约课程顾问", href: "#contact-sales" },
    }, { background: "primary", paddingTop: 72, paddingBottom: 72, textAlign: "left", container: "contained" }),
    block("education-premium", 15, "about", "image-story", "机构介绍", {
      title: "启明学堂专注职业能力训练",
      description: "我们把课程内容拆成任务、反馈和作品三个层次，帮助学习者把知识转化为可说明、可展示、可复盘的成果。",
      image: {
        src: "/template-assets/education-about.jpg",
        alt: "教育机构课堂与导师辅导场景",
      },
    }, { background: "default", paddingTop: 88, paddingBottom: 88, textAlign: "left", container: "contained" }),
    block("education-premium", 16, "team", "member-grid", "导师团队", {
      title: "由懂业务交付的导师提供反馈",
      members: [
        { name: "周老师", role: "数据分析导师", bio: "长期负责业务数据分析、指标体系和可视化报告训练。" },
        { name: "陈老师", role: "AI 办公导师", bio: "擅长把 AI 工具融入文档、表格、运营和协作流程。" },
        { name: "林老师", role: "项目管理导师", bio: "负责项目计划、跨团队沟通和作品复盘训练。" },
      ],
    }, { background: "muted", paddingTop: 80, paddingBottom: 80, textAlign: "center", container: "contained" }),
  ],
);

const premiumTravel = document(
  "template-travel-premium",
  "文旅度假官网",
  "面向度假酒店、目的地营地和文旅项目的路线展示、体验介绍、住宿产品、住客故事与预订咨询页面。",
  {
    companyName: "澜屿度假",
    industry: "文旅度假",
    targetAudience: "正在规划周末度假、亲子出行、团队团建或定制旅行的中文访客",
    pageGoal: "lead-generation",
    seoTitle: "澜屿度假文旅度假官网",
    seoDescription: "了解澜屿度假的山海路线、住宿产品、在地体验、季节活动和预订咨询服务。",
    keywords: ["文旅度假", "度假酒店", "目的地营地", "亲子旅行", "团队团建"],
  },
  theme("#0f766e", "#0d6b63", "#10201d", "#f97316"),
  { maxWidth: "1280px", contentDensity: "spacious", responsiveMode: "marketing" },
  [
    block("travel-premium", 1, "destinationHero", "route-canvas", "目的地动态首屏", {
      eyebrow: "山海目的地度假",
      title: "把山海风景、行程动线和预订理由一次讲清楚",
      subtitle: "澜屿度假把抵达、住宿、在地活动和顾问预订串成清晰路径，让访客在首屏就理解为什么值得来、适合谁来、怎么预订。",
      primaryAction: { label: "咨询度假方案", href: "#booking" },
      secondaryAction: { label: "查看行程亮点", href: "#route" },
      badges: ["山海路线", "在地餐桌", "亲子活动", "团建定制"],
      stats: [
        { value: "4天", label: "经典度假周期", description: "覆盖抵达、深度体验和返程休整" },
        { value: "12+", label: "在地活动", description: "自然、餐饮、文化和夜间体验组合" },
        { value: "30分钟", label: "顾问响应", description: "按人数、日期和预算生成建议方案" },
      ],
      canvasSequence: {
        frameCount: 72,
        framePathTemplate: "/canvas/destination-route/frame-{index}.jpg",
        fallbackLabel: "山海目的地路线 Canvas 动画",
      },
    }, { background: "gradient", paddingTop: 92, paddingBottom: 96, textAlign: "left", container: "contained" }),
    block("travel-premium", 2, "routeHighlights", "route-cards", "路线亮点", {
      title: "从抵达到返程，每一步都有明确体验理由",
      description: "文旅官网不能只罗列景点，需要把路线价值、时间节奏和适合人群讲清楚。",
      items: [
        { icon: "01", title: "抵达与接驳", meta: "Arrival", description: "说明机场、高铁、自驾与度假区接驳方式，让访客对交通成本有预期。" },
        { icon: "02", title: "山海核心体验", meta: "Nature", description: "用海岸徒步、山谷观景和轻量户外活动建立目的地记忆点。" },
        { icon: "03", title: "在地餐桌", meta: "Food", description: "把当季食材、开放厨房和主厨晚宴变成可预约体验。" },
        { icon: "04", title: "返程半日", meta: "Departure", description: "安排伴手礼、轻休整和拍照点，避免行程最后一天空白。" },
      ],
    }, { background: "muted", paddingTop: 82, paddingBottom: 82, textAlign: "left", container: "contained" }),
    block("travel-premium", 3, "experienceMarquee", "activity-marquee", "体验横滑", {
      title: "让体验项目像产品一样被快速比较",
      description: "访客最关心是否适合同行人群、时长是否合理、是否需要提前预约。",
      items: [
        { icon: "SEA", title: "晨间海岸徒步", meta: "90 min", description: "适合首次到访者建立目的地记忆，兼顾拍照和轻运动。" },
        { icon: "FOOD", title: "在地风味晚宴", meta: "Chef table", description: "用当季食材和开放厨房讲述目的地风味。" },
        { icon: "KID", title: "亲子自然课堂", meta: "Family", description: "把自然观察、手作和小组互动做成可预约活动。" },
        { icon: "NIGHT", title: "夜游与星空导览", meta: "After dark", description: "用低强度夜间活动延长住宿体验价值。" },
      ],
    }, { background: "default", paddingTop: 86, paddingBottom: 86, textAlign: "center", container: "contained" }),
    block("travel-premium", 4, "stayShowcase", "room-swiper", "住宿展示", {
      title: "住宿不是列表，而是不同出行场景的选择",
      description: "围绕情侣、家庭、团建和长住需求组织房型卖点，减少访客反复咨询。",
      items: [
        { title: "海景露台套房", meta: "Couple", description: "适合双人度假，突出景观、私密感和晚餐预订。" },
        { title: "亲子庭院房", meta: "Family", description: "靠近活动区，配套亲子课程、加床和儿童餐。" },
        { title: "山谷联排别墅", meta: "Group", description: "适合小型团建或朋友出行，强调公共客厅和烧烤区。" },
      ],
    }, { background: "muted", paddingTop: 86, paddingBottom: 86, textAlign: "center", container: "contained" }),
    block("travel-premium", 5, "seasonalTimeline", "season-rail", "季节时间线", {
      title: "不同季节有不同的到访理由",
      description: "用时间线讲清楚何时来、适合谁、能体验什么，提升淡旺季内容转化。",
      steps: [
        { title: "春季花海", description: "轻徒步、露台下午茶和摄影路线适合周末短住。" },
        { title: "夏季亲水", description: "亲水活动、夜市和家庭房组合成为核心卖点。" },
        { title: "秋季风味", description: "在地餐桌、采摘和小型团建适合企业客户。" },
        { title: "冬季疗愈", description: "温泉、围炉和长住套餐突出松弛感。" },
      ],
    }, { background: "default", paddingTop: 82, paddingBottom: 82, textAlign: "center", container: "contained" }),
    block("travel-premium", 6, "localGuideGrid", "guide-grid", "在地指南", {
      title: "访客真正关心的是到达后会不会顺畅",
      description: "把交通、餐饮、服务和周边注意事项作为信任内容，而不是藏在 FAQ 后面。",
      items: [
        { icon: "交通", title: "抵达方式", description: "说明高铁、机场、自驾和接驳时间。" },
        { icon: "餐饮", title: "用餐安排", description: "标明早餐、主题晚餐和特殊餐食支持。" },
        { icon: "服务", title: "管家响应", description: "展示入住、活动预约和应急服务流程。" },
        { icon: "周边", title: "周边探索", description: "推荐适合半日游的自然和文化节点。" },
        { icon: "装备", title: "携带建议", description: "根据季节和活动强度提示装备。" },
        { icon: "团队", title: "团体定制", description: "说明团建、年会和包场支持范围。" },
      ],
    }, { background: "muted", paddingTop: 82, paddingBottom: 82, textAlign: "center", container: "contained" }),
    block("travel-premium", 7, "guestMapStories", "story-swiper", "住客故事", {
      title: "让不同客群看到自己的出行场景",
      description: "情侣、家庭、企业和朋友出行关注点不同，用故事降低决策成本。",
      testimonials: [
        { outcome: "亲子 4 人", quote: "活动安排不用自己查攻略，孩子白天有自然课堂，晚上还能一起看星空。", author: "林女士", role: "家庭度假客人" },
        { outcome: "团队 18 人", quote: "团建路线、会议空间和晚餐都衔接得很好，官网上看到的信息和现场一致。", author: "某品牌市场团队", role: "企业包场客户" },
        { outcome: "双人 3 天", quote: "最打动我们的是路线节奏清楚，不会像赶景点一样累。", author: "陈先生", role: "情侣度假客人" },
      ],
    }, { background: "default", paddingTop: 82, paddingBottom: 82, textAlign: "center", container: "contained" }),
    block("travel-premium", 8, "bookingRibbon", "booking-panel", "预订转化条", {
      title: "告诉我们出行人数和日期，30 分钟内给出建议方案",
      description: "把预订动作设计成咨询式入口，适合度假酒店、目的地营地和文旅项目。",
      action: { label: "提交出行需求", href: "#booking" },
      items: [
        { icon: "日期", title: "确认档期", description: "根据节假日、天气和房态建议出行时间。" },
        { icon: "人数", title: "匹配房型", description: "按同行人群推荐房型、活动和餐饮组合。" },
        { icon: "预算", title: "生成方案", description: "输出路线、住宿和活动的可执行清单。" },
        { icon: "确认", title: "预订跟进", description: "顾问协助锁定房态和活动席位。" },
      ],
    }, { background: "muted", paddingTop: 76, paddingBottom: 76, textAlign: "left", container: "contained" }),
    block("travel-premium", 9, "travelFooter", "resort-links", "文旅页脚", {
      companyName: "澜屿度假",
      links: [
        { label: "交通指引", href: "#guide" },
        { label: "预订咨询", href: "#booking" },
        { label: "隐私政策", href: "#privacy" },
      ],
      copyright: "© 2026 澜屿度假。保留所有权利。",
    }, { background: "primary", paddingTop: 56, paddingBottom: 56, textAlign: "center", container: "contained" }),
  ],
);

const premiumAtelier = document(
  "template-atelier-premium",
  "建筑空间官网",
  "面向建筑事务所、室内设计工作室、展陈设计团队和高端空间品牌的项目展示、材质研究、流程说明与咨询转化页面。",
  {
    companyName: "矩域 Atelier",
    industry: "建筑空间设计",
    targetAudience: "正在寻找商业空间、展厅、办公总部、住宅改造或精品酒店空间设计服务的品牌主、业主和项目负责人。",
    pageGoal: "brand-display",
    seoTitle: "矩域 Atelier 建筑空间设计官网",
    seoDescription: "了解矩域 Atelier 的空间项目索引、材质研究、设计流程、商业价值证明和空间咨询服务。",
    keywords: ["建筑设计", "空间设计", "室内设计", "商业空间", "展厅设计", "住宅改造"],
  },
  atelierTheme(),
  { maxWidth: "1440px", contentDensity: "spacious", responsiveMode: "marketing" },
  [
    block("atelier-premium", 1, "atelierHero", "split-plate-stage", "建筑空间首屏", {
      eyebrow: "Spatial Design Atelier",
      title: "让空间项目先被感受，再被理解",
      subtitle: "矩域 Atelier 用平面动线、材质秩序和项目档案组织官网，让访客在第一屏看见设计气质，也能继续判断服务是否匹配。",
      primaryAction: { label: "预约空间咨询", href: "#inquiry" },
      secondaryAction: { label: "查看项目索引", href: "#projects" },
      links: [
        { label: "项目", href: "#projects" },
        { label: "材质", href: "#materials" },
        { label: "流程", href: "#process" },
        { label: "咨询", href: "#inquiry" },
      ],
      badges: ["商业空间", "品牌展厅", "住宅改造", "精品酒店"],
      stats: [
        { value: "42", label: "已落地空间", description: "覆盖商业、住宅与展陈项目" },
        { value: "8周", label: "概念到深化", description: "快速形成可报价方案" },
        { value: "3层", label: "空间叙事", description: "动线、材质和运营目标" },
      ],
      canvasSequence: {
        frameCount: 64,
        framePathTemplate: "/canvas/atelier-plan/frame-{index}.jpg",
        fallbackLabel: "建筑平面、材质切片与动线扫描",
      },
    }, { background: "gradient", paddingTop: 0, paddingBottom: 0, textAlign: "left", container: "contained" }),
    block("atelier-premium", 2, "projectIndex", "offset-archive", "项目索引", {
      title: "项目索引不只是作品墙，而是判断方法的入口",
      description: "每个案例都围绕场地限制、空间目标和材料策略展开，让访客快速理解工作室如何解决真实问题。",
      items: [
        { icon: "01", title: "品牌展厅更新", meta: "Retail Gallery", description: "将陈列、洽谈和品牌故事拆成连续参观路径，让空间既能展示也能成交。" },
        { icon: "02", title: "办公总部重组", meta: "Workplace", description: "用接待、会议、开放协作和安静工作区建立更清晰的日常秩序。" },
        { icon: "03", title: "城市住宅改造", meta: "Residence", description: "在收纳、采光、动线和家庭成员习惯之间重新分配空间权重。" },
        { icon: "04", title: "精品酒店公共区", meta: "Hospitality", description: "让前厅、休息、餐饮和夜间体验形成统一但有层次的停留理由。" },
      ],
    }, { background: "default", paddingTop: 92, paddingBottom: 92, textAlign: "left", container: "contained" }),
    block("atelier-premium", 3, "materialStudy", "material-mosaic", "材质研究板", {
      title: "材质策略决定空间是否有记忆点",
      description: "我们把微水泥、金属、木饰面、灯光和软装看成一个整体系统，而不是单独的装饰清单。",
      items: [
        { icon: "M1", title: "冷灰微水泥", meta: "Continuous base", description: "作为低噪声背景，让光线、家具和人流成为空间主角。" },
        { icon: "M2", title: "拉丝不锈钢", meta: "Controlled reflect", description: "在入口、台面和立面细部使用，建立更克制的高级反射。" },
        { icon: "M3", title: "深色木饰面", meta: "Measured warmth", description: "以小面积体块控制温度，避免项目落入常见暖木模板感。" },
      ],
    }, { background: "muted", paddingTop: 92, paddingBottom: 92, textAlign: "left", container: "contained" }),
    block("atelier-premium", 4, "processLoom", "pinned-sequence", "空间流程轨", {
      title: "好的空间流程要能被客户、团队和施工方同时读懂",
      description: "我们把设计流程拆成诊断、概念、材料、施工四段，并用可确认的输出物减少沟通反复。",
      steps: [
        { icon: "01", title: "场地诊断", meta: "Survey", description: "记录采光、结构、机电、人流和运营限制，先确认问题边界。" },
        { icon: "02", title: "概念体块", meta: "Volume", description: "用平面、体块和动线验证方向，再进入视觉深化。" },
        { icon: "03", title: "材料校准", meta: "Material", description: "同步考虑触感、预算、维护、耐久和供应周期。" },
        { icon: "04", title: "施工协同", meta: "Build", description: "通过节点图、材料表和现场复盘降低落地偏差。" },
      ],
    }, { background: "default", paddingTop: 94, paddingBottom: 94, textAlign: "left", container: "contained" }),
    block("atelier-premium", 5, "spatialProof", "metric-ledger", "空间价值账本", {
      title: "空间的高级感应该能转化成可验证的结果",
      description: "对商业空间来说，美感、动线、维护和运营指标需要同时成立。这个模块把项目结果拆成更容易评估的证据。",
      metrics: [
        { value: "28%", label: "重点区停留提升", description: "展厅核心区域获得更长观察时间" },
        { value: "15%", label: "现场变更降低", description: "节点确认减少施工阶段返工" },
        { value: "6周", label: "深化输出周期", description: "从概念到可报价图纸更集中" },
      ],
      items: [
        { icon: "A", title: "运营目标进入平面", description: "从品牌陈列、收银、等候和服务动线倒推空间组织。" },
        { icon: "B", title: "材质选择可被解释", description: "让质感、预算和维护成本同时可见，而不是只谈审美。" },
        { icon: "C", title: "交付边界提前确认", description: "用节点、清单和样板减少后期的模糊沟通。" },
      ],
    }, { background: "primary", paddingTop: 94, paddingBottom: 94, textAlign: "left", container: "contained" }),
    block("atelier-premium", 6, "atelierInquiry", "immersive-inquiry", "空间咨询转化", {
      title: "先把场地限制讲清楚，再讨论风格偏好",
      description: "高质量空间项目从约束开始。面积、预算、经营方式和交付时间会决定更可靠的设计方向。",
      action: { label: "提交空间简报", href: "#brief" },
      items: [
        { icon: "面积", title: "场地规模", description: "住宅、商业或展陈空间的面积与现状。" },
        { icon: "时间", title: "交付窗口", description: "概念、深化、施工和开业节点。" },
        { icon: "预算", title: "预算边界", description: "硬装、软装、机电和施工预备金。" },
        { icon: "目标", title: "空间目标", description: "品牌展示、客流、居住体验或资产增值。" },
      ],
    }, { background: "gradient", paddingTop: 88, paddingBottom: 88, textAlign: "left", container: "contained" }),
    block("atelier-premium", 7, "atelierFooter", "studio-index", "建筑工作室页脚", {
      companyName: "矩域 Atelier",
      links: [
        { label: "项目索引", href: "#projects" },
        { label: "材质研究", href: "#materials" },
        { label: "空间咨询", href: "#inquiry" },
      ],
      copyright: "© 2026 矩域 Atelier。保留所有权利。",
    }, { background: "primary", paddingTop: 58, paddingBottom: 58, textAlign: "left", container: "contained" }),
  ],
);

export const enterpriseTemplates: EnterpriseTemplate[] = [
  {
    id: "ai-product",
    name: "AI 产品官网",
    description: "适用于企业 AI 产品介绍、应用场景、安全合规和演示预约。",
    pageType: "AI 产品官网",
    document: premiumAiProduct,
  },
  {
    id: "education",
    name: "教育机构官网",
    description: "适用于职业教育机构展示课程、学习路径、学员成果和报名咨询。",
    pageType: "教育机构官网",
    document: premiumEducation,
  },
  {
    id: "travel",
    name: "文旅度假官网",
    description: "适用于度假酒店、目的地营地和文旅项目展示路线、体验、住宿和预订咨询。",
    pageType: "文旅度假官网",
    document: premiumTravel,
  },
  {
    id: "atelier",
    name: "建筑空间官网",
    description: "适用于建筑事务所、室内设计工作室、展陈设计团队和高端空间品牌展示项目、材质、流程和咨询入口。",
    pageType: "建筑空间官网",
    document: premiumAtelier,
  },
];

for (const templateItem of enterpriseTemplates) {
  pageDocumentSchema.parse(templateItem.document);
}
