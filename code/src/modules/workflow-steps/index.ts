import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";

export const workflowStepsBlock = defineBlock<Record<string, unknown>>({
  type: "workflowSteps",
  name: "流程步骤",
  category: "content",
  description: "说明从输入需求到上线发布的完整工作流。",
  variants: [
    { id: "numbered-steps", name: "编号步骤" },
    { id: "timeline", name: "时间线" },
  ],
  defaultProps: {
    title: "三步生成企业官网初稿",
    steps: [
      { title: "填写业务信息", description: "输入行业、客户、产品和页面目标。" },
      { title: "生成区块结构", description: "自动组合适合的官网模块。" },
      { title: "编辑并发布", description: "调整内容样式后进入上线流程。" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 80, paddingBottom: 80, textAlign: "center", container: "contained" },
  variantDefaults: {
    "numbered-steps": {
      props: {
        title: "三步完成官网初稿",
        steps: [
          { title: "输入业务信息", description: "提供行业、客户和页面目标。" },
          { title: "选择模块组合", description: "按场景生成首屏、方案、案例和表单。" },
          { title: "调整并发布", description: "在编辑器里修改内容后上线。" },
        ],
      },
      style: { background: "muted", textAlign: "center" },
    },
    timeline: {
      props: {
        title: "从需求到上线的交付时间线",
        steps: [
          { title: "需求整理", description: "明确品牌定位、转化目标和内容边界。" },
          { title: "页面搭建", description: "组合不同模块变体形成完整页面。" },
          { title: "发布复盘", description: "检查预览效果并导出可交付页面。" },
        ],
      },
      style: { background: "default", textAlign: "left", paddingTop: 72, paddingBottom: 72 },
    },
  },
  propsSchema: blockPropsSchemas.workflowSteps,
  Renderer: GenericBlockRenderer,
  Inspector: GenericBlockInspector,
});

export default workflowStepsBlock;
