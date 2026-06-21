import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import type { BlockRendererProps } from "../types";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";
import {
  getContainerMaxWidth,
  getFeatureList,
  getSectionStyle,
  getStringProp,
} from "../shared/renderHelpers";

function ProductShowcaseRenderer({ block, preview }: BlockRendererProps) {
  if (block.variant !== "service-catalog") {
    return <GenericBlockRenderer block={block} preview={preview} />;
  }

  const title = getStringProp(block.props, "title") ?? "服务产品";
  const description = getStringProp(block.props, "description");
  const products = getFeatureList(block.props, "products");

  return (
    <section id="services" style={getSectionStyle(block.style)}>
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="text-left">
            <p className="text-sm font-semibold tracking-normal text-red-600">Products</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-4xl">
              {title}
            </h2>
            {description ? <p className="mt-4 text-base leading-8 text-slate-600">{description}</p> : null}
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {products.map((item, index) => (
              <article className="grid gap-4 bg-white py-6 text-left sm:grid-cols-[88px_1fr]" key={`${item.title}-${index}`}>
                <div className="text-3xl font-semibold text-slate-300">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                  {item.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p> : null}
                  {item.href ? (
                    <a className="mt-4 inline-block text-sm font-semibold text-red-600" href={item.href}>
                      查看详情
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const productShowcaseBlock = defineBlock<Record<string, unknown>>({
  type: "productShowcase",
  name: "产品展示",
  category: "content",
  description: "展示产品线、服务包或核心解决方案。",
  variants: [
    { id: "product-cards", name: "产品卡片" },
    { id: "showcase-row", name: "横向展示" },
    { id: "service-catalog", name: "服务目录" },
  ],
  defaultProps: {
    title: "面向不同增长阶段的官网方案",
    description: "灵活组合品牌展示、获客转化和产品介绍能力。",
    products: [
      { title: "品牌官网", description: "适合建立企业形象和搜索曝光。" },
      { title: "获客落地页", description: "适合活动投放和销售线索收集。" },
      { title: "产品介绍页", description: "适合突出产品功能和客户价值。" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 80, paddingBottom: 80, textAlign: "center", container: "contained" },
  variantDefaults: {
    "product-cards": {
      props: {
        title: "用卡片展示核心产品线",
        description: "适合三到六个产品、服务包或解决方案入口。",
        products: [
          { title: "品牌官网", description: "建立可信企业形象和搜索曝光。" },
          { title: "获客落地页", description: "承接投放活动和销售线索。" },
          { title: "产品介绍页", description: "突出产品能力和客户价值。" },
        ],
      },
    },
    "showcase-row": {
      props: {
        title: "重点展示一个核心解决方案",
        description: "适合需要把产品能力、业务场景和交付价值讲完整的页面段落。",
        products: [
          { title: "行业解决方案", description: "围绕目标行业展示痛点、能力和落地收益。" },
          { title: "客户工作流", description: "说明用户从接触产品到完成目标的关键路径。" },
        ],
      },
      style: { background: "muted", textAlign: "left", paddingTop: 88, paddingBottom: 88 },
    },
    "service-catalog": {
      props: {
        title: "覆盖企业高频需求的服务产品",
        description: "从标准寄递到供应链协同，把服务能力拆成清晰入口，方便客户快速判断适配范围。",
        products: [
          { title: "标准寄递服务", description: "覆盖文件、包裹和商流订单，强调时效、稳定和全程可追踪。", href: "#standard" },
          { title: "企业物流服务", description: "面向合同客户提供批量下单、对账结算、专属客服和异常处理。", href: "#enterprise" },
          { title: "供应链协同服务", description: "围绕仓配、库存、计划和数据看板，支持跨区域业务运营。", href: "#supply-chain" },
        ],
      },
      style: { background: "default", textAlign: "left", paddingTop: 88, paddingBottom: 88 },
    },
  },
  propsSchema: blockPropsSchemas.productShowcase,
  Renderer: ProductShowcaseRenderer,
  Inspector: GenericBlockInspector,
});

export default productShowcaseBlock;
