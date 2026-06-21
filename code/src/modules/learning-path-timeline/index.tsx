import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { EducationLearningPathTimelineRenderer } from "../shared/educationMotionRenderers";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";

export const learningPathTimelineBlock = defineBlock<Record<string, unknown>>({
  type: "learningPathTimeline",
  name: "动态学习阶段",
  category: "content",
  description: "用 GSAP 入场的学习阶段时间线，讲清楚测评、训练、反馈和作品沉淀。",
  variants: [
    { id: "milestone-rail", name: "学习里程碑" },
    { id: "studio-steps", name: "陪跑步骤" },
    { id: "mentor-rail", name: "导师陪跑时间轴" },
  ],
  defaultProps: {
    title: "四个阶段把学习转化为作品和能力",
    description: "招生页面要把学习过程讲清楚，降低用户对课程质量和执行难度的疑虑。",
    steps: [
      { title: "能力测评", description: "明确基础、目标岗位、时间投入和适合的课程方向。" },
      { title: "任务训练", description: "每周围绕真实业务案例完成阶段项目和技能练习。" },
      { title: "导师反馈", description: "针对作品结构、表达逻辑和岗位匹配度给出具体建议。" },
      { title: "作品沉淀", description: "整理作品集、复盘报告和面试表达材料，形成可展示成果。" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 82, paddingBottom: 82, textAlign: "center", container: "contained" },
  variantDefaults: {
    "studio-steps": {
      props: {
        title: "学习不是看完课程，而是完成一次交付",
      },
    },
    "mentor-rail": {
      props: {
        title: "把学习过程做成导师陪跑路线",
        description: "时间轴不再只是四张卡片，而是展示从测评、训练到反馈、沉淀的真实服务过程。",
      },
      style: { background: "gradient", paddingTop: 92, paddingBottom: 92, textAlign: "left" },
    },
  },
  propsSchema: blockPropsSchemas.learningPathTimeline,
  Renderer: EducationLearningPathTimelineRenderer,
  Inspector: GenericBlockInspector,
});

export default learningPathTimelineBlock;
