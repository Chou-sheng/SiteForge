import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";

export const faqBlock = defineBlock<Record<string, unknown>>({
  type: "faq",
  name: "常见问题",
  category: "conversion",
  description: "回答购买、交付、部署和服务相关疑问。",
  variants: [
    { id: "accordion", name: "折叠问答" },
    { id: "two-column", name: "双列问答" },
  ],
  defaultProps: {
    title: "常见问题",
    items: [
      { question: "生成后可以继续编辑吗？", answer: "可以。区块内容和样式都保留为结构化数据。" },
      { question: "是否需要真实 AI 密钥？", answer: "MVP 阶段使用本地定义和模拟流程，不依赖真实 DeepSeek 密钥。" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 80, paddingBottom: 80, textAlign: "left", container: "narrow" },
  propsSchema: blockPropsSchemas.faq,
  Renderer: GenericBlockRenderer,
  Inspector: GenericBlockInspector,
});

export default faqBlock;
