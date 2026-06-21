import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { AtelierProjectIndexRenderer } from "../shared/atelierMotionRenderers";

export const projectIndexBlock = defineBlock<Record<string, unknown>>({
  type: "projectIndex",
  name: "项目索引",
  category: "content",
  description: "用错位项目档案展示空间案例，避免传统卡片网格的静态感。",
  variants: [
    { id: "offset-archive", name: "错位项目档案" },
    { id: "gallery-ledger", name: "画廊账本" },
  ],
  defaultProps: {
    visualTone: "atelier-graphite",
    title: "每个项目都从空间问题开始，而不是从效果图开始",
    description: "按场景、面积、材料和运营目标组织案例，让访客快速判断你的方法是否适合他们。",
    items: [
      { icon: "01", title: "品牌展厅", meta: "Retail", description: "把展示、动线和成交节点放进同一条参观路径。" },
      { icon: "02", title: "办公总部", meta: "Workplace", description: "围绕协作、接待和企业文化重组空间层级。" },
      { icon: "03", title: "城市住宅", meta: "Residence", description: "在收纳、采光和家庭动线之间建立清晰权重。" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 88, paddingBottom: 88, textAlign: "left", container: "contained" },
  variantDefaults: {
    "gallery-ledger": {
      style: { background: "muted" },
      props: {
        title: "用项目索引替代普通作品墙",
      },
    },
  },
  propsSchema: blockPropsSchemas.projectIndex,
  Renderer: AtelierProjectIndexRenderer,
  Inspector: GenericBlockInspector,
});

export default projectIndexBlock;
