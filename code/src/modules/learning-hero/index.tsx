import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { EducationLearningHeroRenderer } from "../shared/educationMotionRenderers";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";

export const learningHeroBlock = defineBlock<Record<string, unknown>>({
  type: "learningHero",
  name: "动态招生首屏",
  category: "hero",
  description: "面向教育机构的 Canvas 学习路径首屏，带 GSAP 入场和转化按钮。",
  variants: [
    { id: "admissions-canvas", name: "招生 Canvas 首屏" },
    { id: "coach-dashboard", name: "导师陪跑首屏" },
  ],
  defaultProps: {
    eyebrow: "项目制职业教育",
    title: "把学习路径、导师反馈和作品成果讲清楚",
    subtitle: "用动态学习路径舞台呈现从测评、训练、反馈到作品沉淀的完整服务。",
    primaryAction: { label: "预约课程顾问", href: "#contact-sales" },
    secondaryAction: { label: "查看课程方向", href: "#course-tracks" },
    badges: ["项目制训练", "导师陪跑", "作品集输出", "企业内训"],
    stats: [
      { value: "8周", label: "标准训练周期", description: "每周任务和反馈闭环" },
      { value: "1对1", label: "导师答疑", description: "围绕作品和岗位目标反馈" },
      { value: "4份", label: "作品成果", description: "沉淀可展示项目材料" },
    ],
    canvasSequence: { fallbackLabel: "课堂、任务和作品成长 Canvas 动画" },
  },
  defaultStyle: { background: "gradient", paddingTop: 92, paddingBottom: 96, textAlign: "left", container: "contained" },
  variantDefaults: {
    "coach-dashboard": {
      props: {
        eyebrow: "导师陪跑学习服务",
        title: "让访客先看见课程如何被执行",
        subtitle: "用测评、任务、答疑和作品节点建立信任，减少用户对课程质量和学习节奏的疑虑。",
        badges: ["能力测评", "阶段任务", "导师反馈", "作品复盘"],
      },
    },
  },
  propsSchema: blockPropsSchemas.learningHero,
  Renderer: EducationLearningHeroRenderer,
  Inspector: GenericBlockInspector,
});

export default learningHeroBlock;
