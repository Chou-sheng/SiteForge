import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";

export const logoCloudBlock = defineBlock<Record<string, unknown>>({
  type: "logoCloud",
  name: "客户标识墙",
  category: "trust",
  description: "展示客户、伙伴或生态品牌，强化可信度。",
  variants: [
    { id: "single-row", name: "单行展示" },
    { id: "wrapped-grid", name: "多行网格" },
  ],
  defaultProps: {
    title: "服务超过 200 家成长型企业",
    logos: [
      { src: "https://placehold.co/180x72?text=Alpha", alt: "Alpha" },
      { src: "https://placehold.co/180x72?text=Beta", alt: "Beta" },
      { src: "https://placehold.co/180x72?text=Cloud", alt: "Cloud" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 56, paddingBottom: 56, textAlign: "center", container: "contained" },
  variantDefaults: {
    "single-row": {
      props: {
        title: "被成长型企业团队采用",
        logos: [
          { src: "https://placehold.co/180x72?text=Alpha", alt: "Alpha" },
          { src: "https://placehold.co/180x72?text=Beta", alt: "Beta" },
          { src: "https://placehold.co/180x72?text=Cloud", alt: "Cloud" },
        ],
      },
      style: { background: "default", paddingTop: 48, paddingBottom: 48 },
    },
    "wrapped-grid": {
      props: {
        title: "覆盖多个行业的客户与伙伴",
        logos: [
          { src: "https://placehold.co/180x72?text=AI", alt: "AI" },
          { src: "https://placehold.co/180x72?text=SaaS", alt: "SaaS" },
          { src: "https://placehold.co/180x72?text=Retail", alt: "Retail" },
          { src: "https://placehold.co/180x72?text=Edu", alt: "Edu" },
          { src: "https://placehold.co/180x72?text=Cloud", alt: "Cloud" },
          { src: "https://placehold.co/180x72?text=Growth", alt: "Growth" },
        ],
      },
      style: { background: "muted", paddingTop: 72, paddingBottom: 72 },
    },
  },
  propsSchema: blockPropsSchemas.logoCloud,
  Renderer: GenericBlockRenderer,
  Inspector: GenericBlockInspector,
});

export default logoCloudBlock;
