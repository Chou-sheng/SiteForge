import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { AtelierFooterRenderer } from "../shared/atelierMotionRenderers";

export const atelierFooterBlock = defineBlock<Record<string, unknown>>({
  type: "atelierFooter",
  name: "建筑工作室页脚",
  category: "footer",
  description: "适合空间设计品牌的极简深色页脚，保留项目、流程和咨询入口。",
  variants: [
    { id: "studio-index", name: "工作室索引" },
    { id: "contact-slab", name: "联系石板" },
  ],
  defaultProps: {
    visualTone: "atelier-graphite",
    companyName: "矩域 Atelier",
    links: [
      { label: "项目索引", href: "#projects" },
      { label: "材质研究", href: "#materials" },
      { label: "空间咨询", href: "#inquiry" },
    ],
    copyright: "© 2026 矩域 Atelier。保留所有权利。",
  },
  defaultStyle: { background: "primary", paddingTop: 58, paddingBottom: 58, textAlign: "left", container: "contained" },
  variantDefaults: {
    "contact-slab": {
      props: {
        companyName: "矩域空间研究室",
      },
    },
  },
  propsSchema: blockPropsSchemas.atelierFooter,
  Renderer: AtelierFooterRenderer,
  Inspector: GenericBlockInspector,
});

export default atelierFooterBlock;
