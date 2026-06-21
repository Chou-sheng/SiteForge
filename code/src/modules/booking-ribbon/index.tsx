import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { TravelBookingRibbonRenderer } from "../shared/travelMotionRenderers";

export const bookingRibbonBlock = defineBlock<Record<string, unknown>>({
  type: "bookingRibbon",
  name: "动态预订转化条",
  category: "conversion",
  description: "文旅模板专属转化模块，用清晰咨询入口和服务承诺推动预订。",
  variants: [
    { id: "booking-panel", name: "预订面板" },
    { id: "advisor-panel", name: "顾问咨询面板" },
  ],
  defaultProps: {
    title: "告诉我们出行人数和日期，30 分钟内给出建议方案",
    description: "把预订动作设计成咨询式入口，适合度假酒店、目的地营地和文旅项目。",
    action: { label: "提交出行需求", href: "#booking" },
    items: [
      { icon: "日期", title: "确认档期", description: "根据节假日、天气和房态建议出行时间。" },
      { icon: "人数", title: "匹配房型", description: "按同行人群推荐房型、活动和餐饮组合。" },
      { icon: "预算", title: "生成方案", description: "输出路线、住宿和活动的可执行清单。" },
      { icon: "确认", title: "预订跟进", description: "顾问协助锁定房态和活动席位。" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 76, paddingBottom: 76, textAlign: "left", container: "contained" },
  variantDefaults: {
    "advisor-panel": {
      props: {
        title: "先和目的地顾问确认，再决定是否预订",
        description: "适合高客单价度假产品和定制游咨询入口。",
      },
    },
  },
  propsSchema: blockPropsSchemas.bookingRibbon,
  Renderer: TravelBookingRibbonRenderer,
  Inspector: GenericBlockInspector,
});

export default bookingRibbonBlock;
