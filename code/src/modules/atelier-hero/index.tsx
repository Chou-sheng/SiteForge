import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { AtelierHeroRenderer } from "../shared/atelierMotionRenderers";

export const atelierHeroBlock = defineBlock<Record<string, unknown>>({
  type: "atelierHero",
  name: "建筑空间首屏",
  category: "hero",
  description: "面向建筑、室内与空间品牌的动态首屏，包含图片舞台、平面扫描动效和项目入口。",
  variants: [
    { id: "split-plate-stage", name: "分割图版舞台" },
    { id: "gallery-launch", name: "画廊发布首屏" },
  ],
  defaultProps: {
    visualTone: "atelier-graphite",
    eyebrow: "Spatial Design Studio",
    title: "把空间作品做成可浏览的品牌叙事",
    subtitle: "用建筑平面、材质细节和项目节奏，把高端空间服务讲得更具体、更有记忆点。",
    primaryAction: { label: "预约空间咨询", href: "#inquiry" },
    secondaryAction: { label: "查看项目索引", href: "#projects" },
    links: [
      { label: "项目", href: "#projects" },
      { label: "材质", href: "#materials" },
      { label: "流程", href: "#process" },
    ],
    badges: ["商业空间", "展厅", "住宅改造"],
    stats: [
      { value: "42", label: "完成项目", description: "从概念到落地交付" },
      { value: "8周", label: "概念周期", description: "快速形成可评估方案" },
      { value: "3层", label: "叙事结构", description: "动线、材质和运营目标" },
    ],
    canvasSequence: { fallbackLabel: "建筑平面与动线扫描动画" },
  },
  defaultStyle: { background: "gradient", paddingTop: 0, paddingBottom: 0, textAlign: "left", container: "contained" },
  variantDefaults: {
    "gallery-launch": {
      props: {
        eyebrow: "New Spatial Collection",
        title: "让访客先感到空间气质，再理解设计服务",
        subtitle: "适合建筑事务所、空间品牌、展陈设计与商业改造工作室的高质感发布页。",
      },
    },
  },
  propsSchema: blockPropsSchemas.atelierHero,
  Renderer: AtelierHeroRenderer,
  Inspector: GenericBlockInspector,
});

export default atelierHeroBlock;
