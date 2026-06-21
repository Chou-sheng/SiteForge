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

function UseCaseGridRenderer({ block, preview }: BlockRendererProps) {
  if (block.variant !== "quick-actions") {
    return <GenericBlockRenderer block={block} preview={preview} />;
  }

  const title = getStringProp(block.props, "title") ?? "快捷服务";
  const useCases = getFeatureList(block.props, "useCases");

  return (
    <section style={getSectionStyle(block.style)}>
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="grid gap-5 lg:grid-cols-[260px_1fr] lg:items-stretch">
          <div className="border-l-4 border-red-600 bg-white p-6 text-left shadow-sm">
            <p className="text-sm font-semibold tracking-normal text-red-600">Service</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">{title}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              将高频操作前置，减少访客寻找路径，强化服务门户的实用性。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((item, index) => (
              <a
                className="group flex min-h-36 flex-col justify-between border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-red-600 hover:shadow-md"
                href={item.href ?? "#"}
                key={`${item.title}-${index}`}
              >
                <span className="text-2xl font-semibold text-red-600">{item.icon ?? `0${index + 1}`}</span>
                <span>
                  <span className="block text-lg font-semibold text-slate-950">{item.title}</span>
                  {item.description ? (
                    <span className="mt-2 block text-sm leading-6 text-slate-600">{item.description}</span>
                  ) : null}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const useCaseGridBlock = defineBlock<Record<string, unknown>>({
  type: "useCaseGrid",
  name: "使用场景",
  category: "content",
  description: "按业务场景说明产品或服务的适用方式。",
  variants: [
    { id: "scenario-grid", name: "场景网格" },
    { id: "scenario-list", name: "场景列表" },
    { id: "quick-actions", name: "快捷服务入口" },
  ],
  defaultProps: {
    title: "适用于多种官网建设场景",
    useCases: [
      { title: "新品发布", description: "快速生成产品介绍与预约咨询页面。" },
      { title: "市场活动", description: "搭建投放落地页并收集销售线索。" },
      { title: "品牌升级", description: "统一表达企业能力与行业背书。" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 80, paddingBottom: 80, textAlign: "center", container: "contained" },
  variantDefaults: {
    "quick-actions": {
      props: {
        title: "一站式服务入口",
        useCases: [
          { icon: "寄", title: "在线寄件", description: "快速填写寄件信息，承接官网高频需求。", href: "#ship" },
          { icon: "查", title: "运单查询", description: "输入单号查看物流状态与预计到达时间。", href: "#track" },
          { icon: "点", title: "网点查询", description: "查找附近服务网点、营业时间与覆盖范围。", href: "#network" },
          { icon: "询", title: "专属咨询", description: "对接企业客户、供应链方案与大客户服务。", href: "#lead-form" },
        ],
      },
      style: { background: "default", paddingTop: 0, paddingBottom: 80, textAlign: "left" },
    },
  },
  propsSchema: blockPropsSchemas.useCaseGrid,
  Renderer: UseCaseGridRenderer,
  Inspector: GenericBlockInspector,
});

export default useCaseGridBlock;
