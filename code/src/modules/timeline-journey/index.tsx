import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { PremiumTimelineJourneyRenderer } from "../shared/premiumRenderers";

export const timelineJourneyBlock = defineBlock<Record<string, unknown>>({
  type: "timelineJourney",
  name: "路径时间线",
  category: "content",
  description: "展示学习路径、产品落地、服务交付或客户旅程。",
  variants: [
    { id: "learning-path", name: "学习路径" },
    { id: "implementation-path", name: "落地流程" },
  ],
  defaultProps: {
    title: "四步完成从了解到账户落地",
    description: "把复杂决策拆成清晰步骤，降低访客理解成本。",
    steps: [
      { title: "明确目标", description: "确认业务场景、目标和优先级。" },
      { title: "选择方案", description: "根据需求选择合适模块和服务。" },
      { title: "启动执行", description: "完成配置、内容和流程上线。" },
      { title: "持续优化", description: "根据反馈和数据持续迭代。" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 84, paddingBottom: 84, textAlign: "center", container: "contained" },
  propsSchema: blockPropsSchemas.timelineJourney,
  Renderer: PremiumTimelineJourneyRenderer,
  Inspector: GenericBlockInspector,
});

export default timelineJourneyBlock;
