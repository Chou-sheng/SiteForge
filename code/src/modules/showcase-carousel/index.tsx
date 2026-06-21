import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { PremiumShowcaseCarouselRenderer } from "../shared/premiumRenderers";

export const showcaseCarouselBlock = defineBlock<Record<string, unknown>>({
  type: "showcaseCarousel",
  name: "内容轮播",
  category: "content",
  description: "基于 Swiper 的课程、产品、能力或服务轮播。",
  variants: [
    { id: "course-track", name: "课程方向轮播" },
    { id: "ai-capabilities", name: "AI 能力轮播" },
    { id: "service-cards", name: "服务卡片轮播" },
  ],
  defaultProps: {
    title: "精选内容模块",
    description: "用横向轮播展示高价值内容入口。",
    items: [
      { icon: "01", title: "核心模块", meta: "Core", description: "说明最重要的产品或服务能力。" },
      { icon: "02", title: "进阶模块", meta: "Advanced", description: "补充进阶能力和差异化优势。" },
      { icon: "03", title: "交付模块", meta: "Delivery", description: "展示落地路径、服务保障和成果。" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 86, paddingBottom: 86, textAlign: "center", container: "contained" },
  propsSchema: blockPropsSchemas.showcaseCarousel,
  Renderer: PremiumShowcaseCarouselRenderer,
  Inspector: GenericBlockInspector,
});

export default showcaseCarouselBlock;
