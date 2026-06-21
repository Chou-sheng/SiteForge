import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { TravelDestinationHeroRenderer } from "../shared/travelMotionRenderers";

export const destinationHeroBlock = defineBlock<Record<string, unknown>>({
  type: "destinationHero",
  name: "动态目的地首屏",
  category: "hero",
  description: "面向文旅度假官网的 Canvas 路线首屏，展示目的地、核心卖点和预订入口。",
  variants: [
    { id: "route-canvas", name: "路线 Canvas 首屏" },
    { id: "resort-launch", name: "度假发布首屏" },
  ],
  defaultProps: {
    eyebrow: "Destination Resort",
    title: "把山海风景、行程动线和预订理由一次讲清楚",
    subtitle: "用动态路线舞台呈现抵达、体验、住宿和预订路径，让访客先看到目的地的节奏，再进入具体产品。",
    primaryAction: { label: "咨询度假方案", href: "#booking" },
    secondaryAction: { label: "查看行程亮点", href: "#route" },
    badges: ["山海路线", "住宿体验", "在地活动", "预订咨询"],
    stats: [
      { value: "4天", label: "经典度假周期", description: "从抵达到深度体验的完整节奏" },
      { value: "12+", label: "在地体验", description: "覆盖餐饮、自然、亲子和文化活动" },
      { value: "30分钟", label: "快速定制", description: "顾问按出行人数和偏好推荐方案" },
    ],
    canvasSequence: { fallbackLabel: "山海目的地路线 Canvas 动画" },
  },
  defaultStyle: { background: "gradient", paddingTop: 92, paddingBottom: 96, textAlign: "left", container: "contained" },
  variantDefaults: {
    "resort-launch": {
      props: {
        eyebrow: "New Season Escape",
        title: "让访客在首屏就感受到下一次假期的样子",
        subtitle: "用目的地氛围、路线节点和预订行动组成清晰的度假官网首屏。",
        badges: ["旺季上新", "房型推荐", "活动预约", "管家服务"],
      },
    },
  },
  propsSchema: blockPropsSchemas.destinationHero,
  Renderer: TravelDestinationHeroRenderer,
  Inspector: GenericBlockInspector,
});

export default destinationHeroBlock;
