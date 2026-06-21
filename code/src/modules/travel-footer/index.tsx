import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { TravelFooterRenderer } from "../shared/travelMotionRenderers";

export const travelFooterBlock = defineBlock<Record<string, unknown>>({
  type: "travelFooter",
  name: "文旅页脚",
  category: "footer",
  description: "文旅模板专属页脚，避免复用通用 Footer 模块。",
  variants: [
    { id: "resort-links", name: "度假页脚" },
    { id: "destination-links", name: "目的地页脚" },
  ],
  defaultProps: {
    companyName: "澜屿度假",
    links: [
      { label: "交通指引", href: "#guide" },
      { label: "预订咨询", href: "#booking" },
      { label: "隐私政策", href: "#privacy" },
    ],
    copyright: "© 2026 澜屿度假。保留所有权利。",
  },
  defaultStyle: { background: "primary", paddingTop: 56, paddingBottom: 56, textAlign: "center", container: "contained" },
  variantDefaults: {
    "destination-links": {
      props: {
        companyName: "山海目的地",
        copyright: "© 2026 山海目的地。保留所有权利。",
      },
    },
  },
  propsSchema: blockPropsSchemas.travelFooter,
  Renderer: TravelFooterRenderer,
  Inspector: GenericBlockInspector,
});

export default travelFooterBlock;
