import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { EducationStudentStoryCarouselRenderer } from "../shared/educationMotionRenderers";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";

export const studentStoryCarouselBlock = defineBlock<Record<string, unknown>>({
  type: "studentStoryCarousel",
  name: "学员故事动态轮播",
  category: "trust",
  description: "基于 Swiper 的学员反馈和作品成果轮播，适合教育模板信任背书。",
  variants: [
    { id: "portfolio-stories", name: "作品成果故事" },
    { id: "mentor-feedback", name: "导师反馈故事" },
    { id: "wall-of-outcomes", name: "成果证言墙" },
  ],
  defaultProps: {
    title: "学员不是只听课，而是带着成果离开",
    description: "用真实口吻和结果指标强化报名咨询前的信任感。",
    testimonials: [
      { outcome: "3 个项目", quote: "以前只会看教程，训练营让我第一次把数据分析做成完整作品。", author: "王同学", role: "转岗学习者" },
      { outcome: "效率翻倍", quote: "AI 办公课最有用的是把工具放进日常流程，而不是只学一堆技巧。", author: "陈同学", role: "在职提升" },
      { outcome: "作品集成型", quote: "导师反馈很具体，知道哪些内容该放进作品集，哪些只是练习过程。", author: "林同学", role: "应届毕业生" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 80, paddingBottom: 80, textAlign: "center", container: "contained" },
  variantDefaults: {
    "mentor-feedback": {
      props: {
        title: "导师反馈让作品能被持续打磨",
      },
    },
    "wall-of-outcomes": {
      props: {
        title: "用不同学员结果组成可信证言墙",
        description: "不再横向排列同款评价卡，而是用高低错落的结果墙展示作品、效率和转岗信心。",
      },
      style: { background: "primary", paddingTop: 88, paddingBottom: 88, textAlign: "left" },
    },
  },
  propsSchema: blockPropsSchemas.studentStoryCarousel,
  Renderer: EducationStudentStoryCarouselRenderer,
  Inspector: GenericBlockInspector,
});

export default studentStoryCarouselBlock;
