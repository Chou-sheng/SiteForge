import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";

export const aboutBlock = defineBlock<Record<string, unknown>>({
  type: "about",
  name: "关于我们",
  category: "company",
  description: "介绍企业使命、定位和核心能力。",
  variants: [
    { id: "story", name: "品牌故事" },
    { id: "image-story", name: "图文介绍" },
  ],
  defaultProps: {
    title: "我们专注于企业数字化展示与获客",
    description: "通过 AI、结构化内容和行业区块库，帮助团队更快完成高质量官网建设。",
    image: { src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1100&q=80", alt: "团队协作" },
  },
  defaultStyle: { background: "muted", paddingTop: 88, paddingBottom: 88, textAlign: "left", container: "contained" },
  propsSchema: blockPropsSchemas.about,
  Renderer: GenericBlockRenderer,
  Inspector: GenericBlockInspector,
});

export default aboutBlock;
