import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { EducationCourseTrackCarouselRenderer } from "../shared/educationMotionRenderers";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";

export const courseTrackCarouselBlock = defineBlock<Record<string, unknown>>({
  type: "courseTrackCarousel",
  name: "课程路径动态轮播",
  category: "content",
  description: "基于 Swiper 的教育课程方向轮播，用于展示训练营、短课和企业内训。",
  variants: [
    { id: "curriculum-swiper", name: "课程方向轮播" },
    { id: "track-stack", name: "学习路径卡片" },
    { id: "editorial-catalog", name: "编辑式课程目录" },
  ],
  defaultProps: {
    title: "从兴趣到岗位能力的课程路径",
    description: "用横向轮播展示课程方向，让访客快速比较学习目标、周期和产出。",
    items: [
      { icon: "DA", title: "数据分析训练营", meta: "8 周 / 项目制", description: "学习数据清洗、可视化、业务指标拆解和分析报告表达。" },
      { icon: "AI", title: "AI 办公效率课", meta: "4 周 / 工具实践", description: "掌握提示词、自动化表格、内容生成和办公流程优化。" },
      { icon: "PM", title: "项目管理实战课", meta: "6 周 / 协作演练", description: "围绕计划、沟通、风险、复盘和跨部门协作完成项目训练。" },
      { icon: "UX", title: "产品体验入门课", meta: "5 周 / 作品输出", description: "学习用户研究、页面结构、原型表达和体验优化方法。" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 86, paddingBottom: 86, textAlign: "center", container: "contained" },
  variantDefaults: {
    "track-stack": {
      props: {
        title: "把课程拆成更容易选择的方向",
        description: "适合在招生页中展示多个可报名方向，并引导用户继续咨询。",
      },
    },
    "editorial-catalog": {
      props: {
        title: "像课程手册一样展示每个学习方向",
        description: "用一张主课程海报带出重点方向，再用紧凑列表让访客快速比较周期、产出和适合人群。",
      },
      style: { background: "default", paddingTop: 90, paddingBottom: 90, textAlign: "left" },
    },
  },
  propsSchema: blockPropsSchemas.courseTrackCarousel,
  Renderer: EducationCourseTrackCarouselRenderer,
  Inspector: GenericBlockInspector,
});

export default courseTrackCarouselBlock;
