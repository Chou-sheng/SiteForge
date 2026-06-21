import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { TravelRouteHighlightsRenderer } from "../shared/travelMotionRenderers";

export const routeHighlightsBlock = defineBlock<Record<string, unknown>>({
  type: "routeHighlights",
  name: "动态路线亮点",
  category: "content",
  description: "用独立卡片讲清楚文旅路线的关键节点、体验价值和适合人群。",
  variants: [
    { id: "route-cards", name: "路线亮点卡片" },
    { id: "day-plan", name: "日程节点卡片" },
  ],
  defaultProps: {
    title: "从抵达到返程，每一步都有明确体验理由",
    description: "不是简单罗列景点，而是按访客真实决策路径组织路线、时间和体验价值。",
    items: [
      { icon: "01", title: "抵达与接驳", meta: "Arrival", description: "说明交通、接驳、入住和首日晚餐安排，降低首次到访的不确定感。" },
      { icon: "02", title: "山海核心体验", meta: "Nature", description: "突出目的地最独特的自然体验，让访客快速理解来这里的理由。" },
      { icon: "03", title: "轻量文化活动", meta: "Culture", description: "用手作、餐饮、夜游或市集强化在地感，而不是只做景点清单。" },
      { icon: "04", title: "返程前半日", meta: "Departure", description: "安排适合拍照、伴手礼和休整的轻节奏节点，提高完整体验感。" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 82, paddingBottom: 82, textAlign: "left", container: "contained" },
  variantDefaults: {
    "day-plan": {
      props: {
        title: "把复杂行程拆成清晰的每日节奏",
        description: "适合展示三天两晚、四天三晚或亲子度假路线。",
      },
    },
  },
  propsSchema: blockPropsSchemas.routeHighlights,
  Renderer: TravelRouteHighlightsRenderer,
  Inspector: GenericBlockInspector,
});

export default routeHighlightsBlock;
