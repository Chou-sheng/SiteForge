import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { PremiumAnimatedMetricsRenderer } from "../shared/premiumRenderers";

export const animatedMetricsBlock = defineBlock<Record<string, unknown>>({
  type: "animatedMetrics",
  name: "动态指标",
  category: "trust",
  description: "使用 GSAP ScrollTrigger 入场的成果、能力或信任数据。",
  variants: [
    { id: "proof-cards", name: "信任数据卡片" },
    { id: "impact-strip", name: "成果指标条" },
  ],
  defaultProps: {
    title: "用可量化结果建立信任",
    description: "把模板的核心价值转化为用户能快速扫描的数据证明。",
    metrics: [
      { value: "48h", label: "页面初稿", description: "快速形成可编辑页面" },
      { value: "6+", label: "高级区块", description: "覆盖核心叙事场景" },
      { value: "100%", label: "响应式", description: "适配桌面与移动浏览" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 76, paddingBottom: 76, textAlign: "left", container: "contained" },
  propsSchema: blockPropsSchemas.animatedMetrics,
  Renderer: PremiumAnimatedMetricsRenderer,
  Inspector: GenericBlockInspector,
});

export default animatedMetricsBlock;
