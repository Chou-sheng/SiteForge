import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { AtelierSpatialProofRenderer } from "../shared/atelierMotionRenderers";

export const spatialProofBlock = defineBlock<Record<string, unknown>>({
  type: "spatialProof",
  name: "空间价值账本",
  category: "trust",
  description: "用暗色指标账本和方法条目展示空间项目的商业与体验价值。",
  variants: [
    { id: "metric-ledger", name: "指标账本" },
    { id: "proof-panel", name: "价值证明板" },
  ],
  defaultProps: {
    visualTone: "atelier-graphite",
    title: "高级感不止来自视觉，也来自可验证的空间结果",
    description: "用客流、停留、复购和施工偏差等指标，让作品从审美展示走向商业判断。",
    metrics: [
      { value: "28%", label: "动线停留提升", description: "重点展示区获得更长观察时间。" },
      { value: "15%", label: "施工变更降低", description: "通过节点确认减少现场返工。" },
      { value: "6周", label: "方案深化周期", description: "从概念到可报价图纸更集中。" },
    ],
    items: [
      { icon: "A", title: "运营目标进入平面", description: "从品牌陈列、收银、等候和服务动线倒推空间组织。" },
      { icon: "B", title: "材质选择可被解释", description: "把质感和维护成本同时放在客户可以理解的位置。" },
      { icon: "C", title: "交付边界提前确认", description: "用节点和清单减少后期的模糊沟通。" },
    ],
  },
  defaultStyle: { background: "primary", paddingTop: 92, paddingBottom: 92, textAlign: "left", container: "contained" },
  variantDefaults: {
    "proof-panel": {
      props: {
        title: "让空间结果能被客户、团队和施工方共同理解",
      },
    },
  },
  propsSchema: blockPropsSchemas.spatialProof,
  Renderer: AtelierSpatialProofRenderer,
  Inspector: GenericBlockInspector,
});

export default spatialProofBlock;
