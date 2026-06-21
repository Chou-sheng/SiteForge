import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { PremiumImmersiveHeroRenderer } from "../shared/premiumRenderers";

export const immersiveHeroBlock = defineBlock<Record<string, unknown>>({
  type: "immersiveHero",
  name: "沉浸式首屏",
  category: "hero",
  description: "带 Canvas 序列帧接口、视觉舞台和强转化按钮的高级首屏。",
  variants: [
    { id: "canvas-stage", name: "Canvas 动画舞台" },
    { id: "product-story", name: "产品叙事首屏" },
    { id: "admissions-hero", name: "招生转化首屏" },
  ],
  defaultProps: {
    eyebrow: "AI Website Builder",
    title: "从高质量模板开始创建网站",
    subtitle: "用明亮的 Canva 式体验承载成熟商用官网模板。",
    primaryAction: { label: "开始编辑", href: "#lead-form" },
    secondaryAction: { label: "查看亮点", href: "#showcase" },
    badges: ["Canvas 接口", "可编辑区块", "响应式"],
    stats: [
      { value: "2", label: "精选模板", description: "聚焦教育与 AI 产品" },
      { value: "6", label: "高级模块", description: "可复用视觉组件" },
      { value: "100%", label: "编辑器兼容", description: "保留 Block Editor 流程" },
    ],
    canvasSequence: { fallbackLabel: "首屏序列帧动画接口已预留" },
  },
  defaultStyle: { background: "gradient", paddingTop: 88, paddingBottom: 88, textAlign: "left", container: "contained" },
  variantDefaults: {
    "product-story": {
      props: {
        eyebrow: "Enterprise AI Product",
        title: "把企业知识、流程和客户服务交给可控 AI 工作台",
        subtitle: "用产品官网的方式讲清楚能力、场景、安全和落地路径。",
        primaryAction: { label: "预约产品演示", href: "#lead-form" },
        secondaryAction: { label: "查看 AI 场景", href: "#scenarios" },
        badges: ["私有知识库", "多模型编排", "权限审计"],
        canvasSequence: { fallbackLabel: "企业 AI 工作流序列动画" },
      },
    },
    "admissions-hero": {
      props: {
        eyebrow: "Career Education",
        title: "让每一次学习都转化为可见的职业能力",
        subtitle: "用系统课程、项目训练和导师陪跑，帮助学员从了解课程到预约咨询自然完成转化。",
        primaryAction: { label: "预约课程顾问", href: "#lead-form" },
        secondaryAction: { label: "查看课程方向", href: "#courses" },
        badges: ["项目制训练", "导师反馈", "就业作品集"],
        canvasSequence: { fallbackLabel: "课堂与作品成长序列动画" },
      },
    },
  },
  propsSchema: blockPropsSchemas.immersiveHero,
  Renderer: PremiumImmersiveHeroRenderer,
  Inspector: GenericBlockInspector,
});

export default immersiveHeroBlock;
