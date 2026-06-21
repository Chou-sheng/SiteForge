import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { AtelierInquiryRenderer } from "../shared/atelierMotionRenderers";

export const atelierInquiryBlock = defineBlock<Record<string, unknown>>({
  type: "atelierInquiry",
  name: "空间咨询转化",
  category: "conversion",
  description: "以图片和需求规格片承接空间咨询，适合高端项目的弱表单转化。",
  variants: [
    { id: "immersive-inquiry", name: "沉浸咨询入口" },
    { id: "brief-builder", name: "需求简报入口" },
  ],
  defaultProps: {
    visualTone: "atelier-graphite",
    title: "先给我们场地限制，再讨论风格偏好",
    description: "高质量空间项目从约束开始。面积、预算、经营方式和交付时间会决定更可靠的设计方向。",
    action: { label: "提交空间简报", href: "#brief" },
    items: [
      { icon: "面积", title: "场地规模", description: "住宅、商业或展陈空间的面积与现状。" },
      { icon: "时间", title: "交付窗口", description: "概念、深化、施工和开业节点。" },
      { icon: "预算", title: "预算边界", description: "硬装、软装、机电和施工预备金。" },
      { icon: "目标", title: "空间目标", description: "品牌展示、客流、居住体验或资产增值。" },
    ],
  },
  defaultStyle: { background: "gradient", paddingTop: 86, paddingBottom: 86, textAlign: "left", container: "contained" },
  variantDefaults: {
    "brief-builder": {
      props: {
        title: "把项目需求整理成可评估的设计简报",
      },
    },
  },
  propsSchema: blockPropsSchemas.atelierInquiry,
  Renderer: AtelierInquiryRenderer,
  Inspector: GenericBlockInspector,
});

export default atelierInquiryBlock;
