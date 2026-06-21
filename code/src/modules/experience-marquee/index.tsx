import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { TravelExperienceMarqueeRenderer } from "../shared/travelMotionRenderers";

export const experienceMarqueeBlock = defineBlock<Record<string, unknown>>({
  type: "experienceMarquee",
  name: "动态体验横滑",
  category: "content",
  description: "使用 Swiper 展示文旅活动、餐饮和在地体验，适合高质量模板库预览。",
  variants: [
    { id: "activity-marquee", name: "体验横滑" },
    { id: "family-activities", name: "亲子活动横滑" },
  ],
  defaultProps: {
    title: "让体验项目像产品一样被快速比较",
    description: "横向展示核心体验，帮助访客判断适不适合自己、同行人和出行季节。",
    items: [
      { icon: "SEA", title: "晨间海岸徒步", meta: "90 min", description: "适合首次到访者建立目的地记忆，兼顾拍照和轻运动。" },
      { icon: "FOOD", title: "在地风味晚宴", meta: "Chef table", description: "用当季食材和开放厨房讲述目的地风味。" },
      { icon: "KID", title: "亲子自然课堂", meta: "Family", description: "把自然观察、手作和小组互动做成可预约活动。" },
      { icon: "NIGHT", title: "夜游与星空导览", meta: "After dark", description: "用低强度夜间活动延长住宿体验价值。" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 86, paddingBottom: 86, textAlign: "center", container: "contained" },
  variantDefaults: {
    "family-activities": {
      props: {
        title: "亲子和多人出行需要更直观的活动选择",
        description: "用年龄、时长和体验重点帮助家庭快速筛选。",
      },
    },
  },
  propsSchema: blockPropsSchemas.experienceMarquee,
  Renderer: TravelExperienceMarqueeRenderer,
  Inspector: GenericBlockInspector,
});

export default experienceMarqueeBlock;
