import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { AtelierMaterialStudyRenderer } from "../shared/atelierMotionRenderers";

export const materialStudyBlock = defineBlock<Record<string, unknown>>({
  type: "materialStudy",
  name: "材质研究板",
  category: "content",
  description: "用斜切图片和材质条目讲清楚空间气质、触感与落地选择。",
  variants: [
    { id: "material-mosaic", name: "斜切材质拼贴" },
    { id: "surface-board", name: "表面样板板" },
  ],
  defaultProps: {
    visualTone: "atelier-graphite",
    title: "材质不是装饰，而是空间记忆的触发器",
    description: "把地面、墙面、金属、灯光和软装当成同一套体验系统来表达。",
    items: [
      { icon: "M1", title: "冷灰微水泥", meta: "Base", description: "作为连续背景，弱化边界并承接灯光层次。" },
      { icon: "M2", title: "拉丝不锈钢", meta: "Reflect", description: "在入口、台面和立面细节中建立克制的反射。" },
      { icon: "M3", title: "深色木饰面", meta: "Warmth", description: "以小面积体块控制温度，避免整体变成暖木风格。" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 88, paddingBottom: 88, textAlign: "left", container: "contained" },
  variantDefaults: {
    "surface-board": {
      props: {
        title: "把材质样板变成客户可理解的决策板",
      },
    },
  },
  propsSchema: blockPropsSchemas.materialStudy,
  Renderer: AtelierMaterialStudyRenderer,
  Inspector: GenericBlockInspector,
});

export default materialStudyBlock;
