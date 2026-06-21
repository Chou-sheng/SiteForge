import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { TravelGuestMapStoriesRenderer } from "../shared/travelMotionRenderers";

export const guestMapStoriesBlock = defineBlock<Record<string, unknown>>({
  type: "guestMapStories",
  name: "动态住客故事",
  category: "trust",
  description: "用 Swiper 展示不同客群的真实度假体验和结果，建立预订前信任。",
  variants: [
    { id: "story-swiper", name: "住客故事轮播" },
    { id: "map-stories", name: "地图故事轮播" },
  ],
  defaultProps: {
    title: "让不同客群看到自己的出行场景",
    description: "情侣、家庭、企业和朋友出行关注点不同，用故事降低决策成本。",
    testimonials: [
      { outcome: "亲子 4 人", quote: "活动安排不用自己查攻略，孩子白天有自然课堂，晚上还能一起看星空。", author: "林女士", role: "家庭度假客人" },
      { outcome: "团队 18 人", quote: "团建路线、会议空间和晚餐都衔接得很好，官网上看到的信息和现场一致。", author: "某品牌市场团队", role: "企业包场客户" },
      { outcome: "双人 3 天", quote: "最打动我们的是路线节奏清楚，不会像赶景点一样累。", author: "陈先生", role: "情侣度假客人" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 82, paddingBottom: 82, textAlign: "center", container: "contained" },
  variantDefaults: {
    "map-stories": {
      props: {
        title: "用地图感故事说明客人为什么选择这里",
        description: "适合展示不同城市客源和到访动机。",
      },
    },
  },
  propsSchema: blockPropsSchemas.guestMapStories,
  Renderer: TravelGuestMapStoriesRenderer,
  Inspector: GenericBlockInspector,
});

export default guestMapStoriesBlock;
