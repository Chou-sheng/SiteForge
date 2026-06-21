import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";

export const contactSalesBlock = defineBlock<Record<string, unknown>>({
  type: "contactSales",
  name: "联系销售",
  category: "conversion",
  description: "展示电话、邮箱、企微或咨询入口。",
  variants: [
    { id: "contact-cards", name: "联系方式卡片" },
    { id: "sales-strip", name: "销售横条" },
  ],
  defaultProps: {
    title: "联系企业顾问",
    description: "根据你的行业与业务目标，提供更具体的官网搭建建议。",
    contacts: [
      { label: "电话咨询", href: "tel:400-000-0000" },
      { label: "邮件联系", href: "mailto:sales@example.com" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 72, paddingBottom: 72, textAlign: "center", container: "contained" },
  propsSchema: blockPropsSchemas.contactSales,
  Renderer: GenericBlockRenderer,
  Inspector: GenericBlockInspector,
});

export default contactSalesBlock;
