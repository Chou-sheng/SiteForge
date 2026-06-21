import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { TravelLocalGuideGridRenderer } from "../shared/travelMotionRenderers";

export const localGuideGridBlock = defineBlock<Record<string, unknown>>({
  type: "localGuideGrid",
  name: "动态在地指南",
  category: "trust",
  description: "展示交通、餐饮、周边和服务说明，降低用户咨询前的不确定感。",
  variants: [
    { id: "guide-grid", name: "在地指南网格" },
    { id: "service-grid", name: "服务说明网格" },
  ],
  defaultProps: {
    title: "访客真正关心的是到达后会不会顺畅",
    description: "把交通、餐饮、服务和周边注意事项作为信任内容，而不是藏在 FAQ 后面。",
    items: [
      { icon: "交通", title: "抵达方式", description: "说明高铁、机场、自驾和接驳时间。" },
      { icon: "餐饮", title: "用餐安排", description: "标明早餐、主题晚餐和特殊餐食支持。" },
      { icon: "服务", title: "管家响应", description: "展示入住、活动预约和应急服务流程。" },
      { icon: "周边", title: "周边探索", description: "推荐适合半日游的自然和文化节点。" },
      { icon: "装备", title: "携带建议", description: "根据季节和活动强度提示装备。" },
      { icon: "团队", title: "团体定制", description: "说明团建、年会和包场支持范围。" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 82, paddingBottom: 82, textAlign: "center", container: "contained" },
  variantDefaults: {
    "service-grid": {
      props: {
        title: "服务细节决定访客是否愿意提交咨询",
        description: "适合补充管家、餐饮、活动和交通服务。",
      },
    },
  },
  propsSchema: blockPropsSchemas.localGuideGrid,
  Renderer: TravelLocalGuideGridRenderer,
  Inspector: GenericBlockInspector,
});

export default localGuideGridBlock;
