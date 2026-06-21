import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { TravelSeasonalTimelineRenderer } from "../shared/travelMotionRenderers";

export const seasonalTimelineBlock = defineBlock<Record<string, unknown>>({
  type: "seasonalTimeline",
  name: "动态季节时间线",
  category: "content",
  description: "用 GSAP 动态时间线展示四季、主题季或度假档期。",
  variants: [
    { id: "season-rail", name: "四季时间线" },
    { id: "festival-rail", name: "节庆档期" },
  ],
  defaultProps: {
    title: "不同季节有不同的到访理由",
    description: "用时间线讲清楚何时来、适合谁、能体验什么，提升淡旺季内容转化。",
    steps: [
      { title: "春季花海", description: "轻徒步、露台下午茶和摄影路线适合周末短住。" },
      { title: "夏季亲水", description: "亲水活动、夜市和家庭房组合成为核心卖点。" },
      { title: "秋季风味", description: "在地餐桌、采摘和小型团建适合企业客户。" },
      { title: "冬季疗愈", description: "温泉、围炉和长住套餐突出松弛感。" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 82, paddingBottom: 82, textAlign: "center", container: "contained" },
  variantDefaults: {
    "festival-rail": {
      props: {
        title: "把主题季和活动档期讲成连续计划",
        description: "适合露营节、音乐季、亲子营和年会季。",
      },
    },
  },
  propsSchema: blockPropsSchemas.seasonalTimeline,
  Renderer: TravelSeasonalTimelineRenderer,
  Inspector: GenericBlockInspector,
});

export default seasonalTimelineBlock;
