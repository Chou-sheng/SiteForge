import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";

export const certificationBarBlock = defineBlock<Record<string, unknown>>({
  type: "certificationBar",
  name: "资质认证",
  category: "trust",
  description: "集中呈现合规资质、认证与安全背书。",
  variants: [
    { id: "badge-row", name: "徽章横排" },
    { id: "dense-list", name: "紧凑列表" },
  ],
  defaultProps: {
    title: "安全合规能力",
    certifications: ["ISO 27001", "等保三级支持", "数据加密传输", "私有化部署"],
  },
  defaultStyle: { background: "default", paddingTop: 48, paddingBottom: 48, textAlign: "center", container: "contained" },
  propsSchema: blockPropsSchemas.certificationBar,
  Renderer: GenericBlockRenderer,
  Inspector: GenericBlockInspector,
});

export default certificationBarBlock;
