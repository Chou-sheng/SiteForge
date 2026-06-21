import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";

export const testimonialsBlock = defineBlock<Record<string, unknown>>({
  type: "testimonials",
  name: "客户评价",
  category: "trust",
  description: "展示客户反馈和关键推荐语。",
  variants: [
    { id: "quote-grid", name: "评价网格" },
    { id: "single-quote", name: "单条重点" },
    { id: "story-quotes", name: "故事式评价" },
  ],
  defaultProps: {
    title: "客户如何评价我们",
    testimonials: [
      { quote: "生成的页面结构很接近销售团队的真实表达。", author: "李女士", role: "市场负责人" },
      { quote: "我们用它快速完成了投放落地页初稿。", author: "王先生", role: "增长负责人" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 80, paddingBottom: 80, textAlign: "center", container: "contained" },
  variantDefaults: {
    "single-quote": {
      props: {
        title: "客户评价",
        testimonials: [
          { quote: "页面结构清晰，销售团队能直接拿去做后续跟进。", author: "赵女士", role: "市场总监" },
        ],
      },
      style: { container: "narrow" },
    },
    "story-quotes": {
      props: {
        title: "真实团队的使用反馈",
        testimonials: [
          { quote: "从模板预览到编辑发布，内部评审速度明显更快。", author: "周先生", role: "企业服务负责人" },
          { quote: "模块不再重复堆叠，页面结构更容易和客户解释。", author: "陈女士", role: "运营负责人" },
        ],
      },
      style: { background: "default", textAlign: "left" },
    },
  },
  propsSchema: blockPropsSchemas.testimonials,
  Renderer: GenericBlockRenderer,
  Inspector: GenericBlockInspector,
});

export default testimonialsBlock;
