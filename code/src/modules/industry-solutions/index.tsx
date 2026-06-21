import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import type { BlockRendererProps } from "../types";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import {
  getContainerMaxWidth,
  getFeatureList,
  getSectionStyle,
  getStringProp,
} from "../shared/renderHelpers";

function IndustrySolutionsRenderer({ block }: BlockRendererProps) {
  const title = getStringProp(block.props, "title") ?? "行业解决方案";
  const industries = getFeatureList(block.props, "industries");

  if (block.variant !== "solution-panels") {
    return (
      <section id="solutions" style={getSectionStyle(block.style)}>
        <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
          <div className="grid gap-8 text-left lg:grid-cols-[0.78fr_1.22fr]">
            <div className="bg-slate-950 p-7 text-white">
              <p className="text-sm font-semibold text-red-300">Industries</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">{title}</h2>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                按行业场景组织表达，让访客先找到自己，再进入方案细节。
              </p>
            </div>
            <div className={block.variant === "industry-tabs" ? "grid gap-3" : "grid gap-4 lg:grid-cols-3"}>
              {industries.map((item, index) => (
                <article
                  className={
                    block.variant === "industry-tabs"
                      ? "grid gap-4 border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[96px_1fr]"
                      : "min-h-64 border border-slate-200 bg-white p-6 shadow-sm"
                  }
                  key={`${item.title}-${index}`}
                >
                  <div className="text-sm font-semibold text-red-600">{item.icon ?? String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                    {item.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="solutions" style={getSectionStyle(block.style)}>
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="mb-10 flex flex-col justify-between gap-4 text-left md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold tracking-normal text-red-600">Solutions</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-4xl">
              {title}
            </h2>
          </div>
          <a className="inline-flex w-fit border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-950 hover:border-red-600 hover:text-red-600" href="#lead-form">
            获取行业方案
          </a>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {industries.map((item, index) => (
            <article className="min-h-72 bg-white p-6 text-left shadow-sm" key={`${item.title}-${index}`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                <span className="text-sm font-semibold text-red-600">{item.icon ?? `S${index + 1}`}</span>
              </div>
              {item.description ? <p className="mt-5 text-sm leading-7 text-slate-600">{item.description}</p> : null}
              <div className="mt-8 h-24 border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                需求识别 / 方案匹配 / 专属交付
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export const industrySolutionsBlock = defineBlock<Record<string, unknown>>({
  type: "industrySolutions",
  name: "行业方案",
  category: "content",
  description: "面向不同行业展示差异化解决方案。",
  variants: [
    { id: "industry-cards", name: "行业卡片" },
    { id: "industry-tabs", name: "行业分组" },
    { id: "solution-panels", name: "方案面板" },
  ],
  defaultProps: {
    title: "面向中国企业的行业化表达",
    industries: [
      { title: "制造业", description: "突出工厂能力、质量体系和交付案例。" },
      { title: "教育培训", description: "突出课程体系、师资力量和报名转化。" },
      { title: "企业服务", description: "突出解决方案、客户成功和销售咨询。" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 88, paddingBottom: 88, textAlign: "center", container: "contained" },
  variantDefaults: {
    "solution-panels": {
      props: {
        title: "按行业组织服务能力，让客户快速找到适配路径",
        industries: [
          { icon: "01", title: "电商与零售", description: "承接多渠道订单、仓配协同、逆向退换和大促峰值保障。" },
          { icon: "02", title: "制造与备件", description: "支持工厂到经销网络、备件调拨、售后履约和时效管理。" },
          { icon: "03", title: "医药与冷链", description: "面向温控、追溯、合规交接和跨区域配送提供专属方案。" },
        ],
      },
      style: { background: "muted", paddingTop: 88, paddingBottom: 88, textAlign: "left" },
    },
  },
  propsSchema: blockPropsSchemas.industrySolutions,
  Renderer: IndustrySolutionsRenderer,
  Inspector: GenericBlockInspector,
});

export default industrySolutionsBlock;
