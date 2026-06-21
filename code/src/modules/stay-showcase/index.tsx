import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { TravelStayShowcaseRenderer } from "../shared/travelMotionRenderers";

export const stayShowcaseBlock = defineBlock<Record<string, unknown>>({
  type: "stayShowcase",
  name: "动态住宿展示",
  category: "commerce",
  description: "用 Swiper 展示房型、套票或住宿产品，与路线和预订转化联动。",
  variants: [
    { id: "room-swiper", name: "房型轮播" },
    { id: "package-swiper", name: "套票轮播" },
  ],
  defaultProps: {
    title: "住宿不是列表，而是不同出行场景的选择",
    description: "围绕情侣、家庭、团建和长住需求组织房型卖点，减少访客反复咨询。",
    items: [
      { title: "海景露台套房", meta: "Couple", description: "适合双人度假，突出景观、私密感和晚餐预订。" },
      { title: "亲子庭院房", meta: "Family", description: "靠近活动区，配套亲子课程、加床和儿童餐。" },
      { title: "山谷联排别墅", meta: "Group", description: "适合小型团建或朋友出行，强调公共客厅和烧烤区。" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 86, paddingBottom: 86, textAlign: "center", container: "contained" },
  variantDefaults: {
    "package-swiper": {
      props: {
        title: "把住宿、活动和餐饮打包成清晰套票",
        description: "适合节假日和主题季的套餐展示。",
      },
    },
  },
  propsSchema: blockPropsSchemas.stayShowcase,
  Renderer: TravelStayShowcaseRenderer,
  Inspector: GenericBlockInspector,
});

export default stayShowcaseBlock;
