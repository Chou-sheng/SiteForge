import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";

export const ctaBlock = defineBlock<Record<string, unknown>>({
  type: "cta",
  name: "行动召唤",
  category: "conversion",
  description: "引导访客预约演示、提交咨询或进入下一步。",
  variants: [
    { id: "simple-banner", name: "简洁横幅" },
    { id: "gradient-card", name: "渐变卡片" },
    { id: "split-contact", name: "联系分栏" },
  ],
  defaultProps: {
    title: "准备生成你的企业官网了吗？",
    description: "填写基础信息，快速获得可编辑的官网页面初稿。",
    action: { label: "立即预约演示", href: "#lead-form" },
  },
  defaultStyle: { background: "gradient", paddingTop: 80, paddingBottom: 80, textAlign: "center", container: "contained" },
  variantDefaults: {
    "simple-banner": {
      props: {
        title: "现在开始搭建企业官网",
        description: "适合页面中段的轻量行动入口。",
        action: { label: "开始创建", href: "#lead-form" },
      },
      style: { background: "primary", paddingTop: 56, paddingBottom: 56 },
    },
    "gradient-card": {
      props: {
        title: "把官网创意变成可发布页面",
        description: "突出活动、新品发布或重点转化目标。",
        action: { label: "查看方案", href: "#pricing" },
      },
      style: { background: "gradient", paddingTop: 88, paddingBottom: 88, container: "narrow" },
    },
    "split-contact": {
      props: {
        title: "需要顾问协助规划页面结构？",
        description: "适合销售咨询、企业服务和定制交付场景。",
        action: { label: "联系顾问", href: "#contact-sales" },
      },
      style: { background: "muted", textAlign: "left", paddingTop: 72, paddingBottom: 72 },
    },
  },
  propsSchema: blockPropsSchemas.cta,
  Renderer: GenericBlockRenderer,
  Inspector: GenericBlockInspector,
});

export default ctaBlock;
