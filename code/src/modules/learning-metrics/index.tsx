import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { EducationLearningMetricsRenderer } from "../shared/educationMotionRenderers";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";

export const learningMetricsBlock = defineBlock<Record<string, unknown>>({
  type: "learningMetrics",
  name: "学习成果动效指标",
  category: "trust",
  description: "用 GSAP 入场展示课程完成率、作品产出和答疑响应等教育成果。",
  variants: [
    { id: "progress-rings", name: "成果动效卡片" },
    { id: "outcome-cards", name: "学习结果证明" },
    { id: "impact-split", name: "转化数据分栏" },
  ],
  defaultProps: {
    title: "用可衡量的学习服务支撑招生转化",
    description: "在首屏之后快速说明课程服务不是单次交付，而是持续陪跑和成果沉淀。",
    metrics: [
      { value: "92%", label: "阶段作业完成率", description: "导师跟进任务节奏" },
      { value: "24h", label: "答疑响应", description: "阻塞点在一个工作日内反馈" },
      { value: "4份", label: "作品集产出", description: "每个方向沉淀项目成果" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 76, paddingBottom: 76, textAlign: "left", container: "contained" },
  variantDefaults: {
    "outcome-cards": {
      props: {
        title: "学员能看见自己的阶段进步",
        metrics: [
          { value: "3轮", label: "作品反馈", description: "从结构、表达和岗位匹配度修正" },
          { value: "6次", label: "阶段练习", description: "围绕真实业务任务推进" },
          { value: "1份", label: "结课复盘", description: "整理可展示成果和后续计划" },
        ],
      },
    },
    "impact-split": {
      props: {
        title: "把招生承诺变成可衡量的学习证明",
        description: "用深色数据面板突出训练周期、导师反馈和作品产出，让访客先看到结果，再继续了解课程细节。",
      },
      style: { background: "primary", paddingTop: 82, paddingBottom: 82, textAlign: "left" },
    },
  },
  propsSchema: blockPropsSchemas.learningMetrics,
  Renderer: EducationLearningMetricsRenderer,
  Inspector: GenericBlockInspector,
});

export default learningMetricsBlock;
