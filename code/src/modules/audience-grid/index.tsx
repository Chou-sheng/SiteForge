import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { PremiumAudienceGridRenderer } from "../shared/premiumRenderers";

export const audienceGridBlock = defineBlock<Record<string, unknown>>({
  type: "audienceGrid",
  name: "对象场景",
  category: "content",
  description: "展示适合人群、应用场景、客户类型或服务对象。",
  variants: [
    { id: "audience-cards", name: "人群卡片" },
    { id: "scenario-cards", name: "场景卡片" },
  ],
  defaultProps: {
    title: "为明确人群设计转化路径",
    description: "让访客快速判断这个页面是否适合自己。",
    audiences: [
      { icon: "A", title: "决策者", description: "关注价值、风险和落地回报。" },
      { icon: "B", title: "使用者", description: "关注流程、体验和效率提升。" },
      { icon: "C", title: "运营者", description: "关注数据、管理和持续优化。" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 84, paddingBottom: 84, textAlign: "center", container: "contained" },
  propsSchema: blockPropsSchemas.audienceGrid,
  Renderer: PremiumAudienceGridRenderer,
  Inspector: GenericBlockInspector,
});

export default audienceGridBlock;
