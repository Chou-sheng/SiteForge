import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import type { BlockRendererProps } from "../types";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";
import {
  getContainerMaxWidth,
  getMetricList,
  getSectionStyle,
  getStringProp,
} from "../shared/renderHelpers";

function MetricsSectionRenderer({ block, preview }: BlockRendererProps) {
  if (block.variant !== "proof-strip") {
    return <GenericBlockRenderer block={block} preview={preview} />;
  }

  const title = getStringProp(block.props, "title") ?? "企业实力";
  const metrics = getMetricList(block.props, "metrics");

  return (
    <section style={getSectionStyle(block.style)}>
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="grid gap-6 border-y border-slate-200 py-8 lg:grid-cols-[280px_1fr] lg:items-center">
          <h2 className="text-left text-2xl font-semibold tracking-normal text-slate-950">{title}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((item, index) => (
              <div className="text-left" key={`${item.label}-${index}`}>
                <div className="text-4xl font-semibold tracking-normal text-red-600">{item.value}</div>
                <p className="mt-2 text-sm font-semibold text-slate-950">{item.label}</p>
                {item.description ? <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const metricsSectionBlock = defineBlock<Record<string, unknown>>({
  type: "metricsSection",
  name: "指标区块",
  category: "trust",
  description: "展示增长、效率、覆盖范围等核心结果。",
  variants: [
    { id: "metric-cards", name: "指标卡片" },
    { id: "large-numbers", name: "大数字" },
    { id: "proof-strip", name: "企业实力条" },
  ],
  defaultProps: {
    title: "让官网建设进入可量化流程",
    metrics: [
      { value: "5x", label: "初稿效率", description: "减少从零搭建时间" },
      { value: "25", label: "内置区块", description: "覆盖企业官网常见模块" },
      { value: "100%", label: "结构化", description: "内容可持续编辑复用" },
    ],
  },
  defaultStyle: { background: "primary", paddingTop: 80, paddingBottom: 80, textAlign: "center", container: "contained" },
  variantDefaults: {
    "proof-strip": {
      props: {
        title: "用可量化实力建立信任",
        metrics: [
          { value: "320+", label: "直营网点与服务站", description: "覆盖核心城市和重点产业带" },
          { value: "99.2%", label: "关键节点扫描率", description: "支持订单全程状态追踪" },
          { value: "7x24", label: "企业服务响应", description: "为重点客户提供持续保障" },
        ],
      },
      style: { background: "default", paddingTop: 72, paddingBottom: 72, textAlign: "left" },
    },
  },
  propsSchema: blockPropsSchemas.metricsSection,
  Renderer: MetricsSectionRenderer,
  Inspector: GenericBlockInspector,
});

export default metricsSectionBlock;
