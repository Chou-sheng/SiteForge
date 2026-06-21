import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";

export const problemSolutionBlock = defineBlock<Record<string, unknown>>({
  type: "problemSolution",
  name: "痛点方案",
  category: "content",
  description: "先描述客户痛点，再给出清晰解决路径。",
  variants: [
    { id: "side-by-side", name: "左右对照" },
    { id: "stacked", name: "上下叙事" },
  ],
  defaultProps: {
    title: "传统官网建设周期长、落地难",
    problem: "需求梳理、内容撰写、页面搭建和反复修改往往消耗大量沟通成本。",
    solution: "通过行业化区块与 AI 内容生成，快速形成可编辑、可发布的企业官网初稿。",
  },
  defaultStyle: { background: "muted", paddingTop: 80, paddingBottom: 80, textAlign: "left", container: "contained" },
  propsSchema: blockPropsSchemas.problemSolution,
  Renderer: GenericBlockRenderer,
  Inspector: GenericBlockInspector,
});

export default problemSolutionBlock;
