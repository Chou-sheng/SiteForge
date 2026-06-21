import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";

export const pricingBlock = defineBlock<Record<string, unknown>>({
  type: "pricing",
  name: "价格方案",
  category: "commerce",
  description: "展示套餐、服务范围和购买入口。",
  variants: [
    { id: "three-plans", name: "三档套餐" },
    { id: "enterprise-plan", name: "企业定制" },
    { id: "service-packages", name: "服务包报价" },
  ],
  defaultProps: {
    title: "选择适合当前阶段的方案",
    plans: [
      { name: "基础版", price: "¥1,999", features: ["官网初稿", "基础区块", "一次修改"] },
      { name: "专业版", price: "¥4,999", features: ["完整官网", "转化区块", "三次修改"] },
      { name: "企业版", price: "联系销售", features: ["私有化", "品牌定制", "专属服务"] },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 88, paddingBottom: 88, textAlign: "center", container: "contained" },
  variantDefaults: {
    "enterprise-plan": {
      props: {
        title: "按企业规模定制交付方案",
        plans: [
          { name: "标准交付", price: "联系顾问", features: ["品牌官网", "基础模板", "上线支持"] },
          { name: "增长交付", price: "定制报价", features: ["多页面结构", "转化模块", "数据埋点建议"] },
        ],
      },
      style: { background: "muted" },
    },
    "service-packages": {
      props: {
        title: "选择适合当前阶段的服务包",
        plans: [
          { name: "启动包", price: "¥1,999", features: ["单页落地页", "模板编辑", "HTML 导出"] },
          { name: "官网包", price: "¥4,999", features: ["完整首页", "案例与表单", "发布链接"] },
          { name: "品牌包", price: "¥9,999", features: ["多模板组合", "品牌文案", "上线陪跑"] },
        ],
      },
    },
  },
  propsSchema: blockPropsSchemas.pricing,
  Renderer: GenericBlockRenderer,
  Inspector: GenericBlockInspector,
});

export default pricingBlock;
