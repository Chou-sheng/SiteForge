import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { AtelierProcessLoomRenderer } from "../shared/atelierMotionRenderers";

export const processLoomBlock = defineBlock<Record<string, unknown>>({
  type: "processLoom",
  name: "空间流程轨",
  category: "content",
  description: "用纵向编织轨道展示空间设计流程，包含滚动动效和错位步骤。",
  variants: [
    { id: "pinned-sequence", name: "固定叙事轨道" },
    { id: "delivery-rail", name: "交付轨道" },
  ],
  defaultProps: {
    visualTone: "atelier-graphite",
    title: "从场地诊断到落地交付，节奏必须被看见",
    description: "空间设计的信任来自过程透明，把抽象审美拆成可沟通、可确认、可执行的节点。",
    steps: [
      { icon: "01", title: "场地诊断", meta: "Survey", description: "记录采光、动线、人流和运营限制，确定空间优先级。" },
      { icon: "02", title: "概念体块", meta: "Volume", description: "用体块和动线验证核心想法，而不是先堆效果图。" },
      { icon: "03", title: "材料校准", meta: "Material", description: "把预算、耐久、触感和维护成本放进同一张材料表。" },
      { icon: "04", title: "施工协同", meta: "Build", description: "用节点图、清单和现场复盘减少交付偏差。" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 92, paddingBottom: 92, textAlign: "left", container: "contained" },
  variantDefaults: {
    "delivery-rail": {
      style: { background: "muted" },
      props: {
        title: "用透明流程降低高端空间项目的不确定性",
      },
    },
  },
  propsSchema: blockPropsSchemas.processLoom,
  Renderer: AtelierProcessLoomRenderer,
  Inspector: GenericBlockInspector,
});

export default processLoomBlock;
