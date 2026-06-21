import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";

export const comparisonTableBlock = defineBlock<Record<string, unknown>>({
  type: "comparisonTable",
  name: "对比表格",
  category: "commerce",
  description: "对比方案、能力或套餐差异。",
  variants: [
    { id: "feature-table", name: "功能对比" },
    { id: "plan-table", name: "套餐对比" },
  ],
  defaultProps: {
    title: "为什么选择模块化 AI 官网生成",
    columns: ["能力", "传统建设", "AI 模块化生成"],
    rows: [
      ["初稿周期", "1-3 周", "分钟级生成"],
      ["内容结构", "人工反复梳理", "行业模板辅助"],
      ["后续编辑", "依赖开发", "结构化可编辑"],
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 80, paddingBottom: 80, textAlign: "center", container: "contained" },
  propsSchema: blockPropsSchemas.comparisonTable,
  Renderer: GenericBlockRenderer,
  Inspector: GenericBlockInspector,
});

export default comparisonTableBlock;
