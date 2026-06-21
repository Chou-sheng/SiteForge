import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";

export const teamBlock = defineBlock<Record<string, unknown>>({
  type: "team",
  name: "团队介绍",
  category: "company",
  description: "展示核心团队、顾问或服务人员。",
  variants: [
    { id: "member-grid", name: "成员网格" },
    { id: "leadership", name: "核心团队" },
  ],
  defaultProps: {
    title: "懂技术也懂增长的交付团队",
    members: [
      { name: "张晨", role: "产品负责人", bio: "负责产品策略与企业官网体验设计。" },
      { name: "刘洋", role: "技术负责人", bio: "负责生成引擎、数据结构与工程交付。" },
      { name: "陈静", role: "客户成功", bio: "负责行业需求梳理与上线支持。" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 80, paddingBottom: 80, textAlign: "center", container: "contained" },
  propsSchema: blockPropsSchemas.team,
  Renderer: GenericBlockRenderer,
  Inspector: GenericBlockInspector,
});

export default teamBlock;
