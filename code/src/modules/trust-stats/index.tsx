import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import type { BlockRendererProps } from "../types";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import {
  getContainerMaxWidth,
  getMetricList,
  getSectionStyle,
  getStringProp,
} from "../shared/renderHelpers";

function TrustStatsRenderer({ block }: BlockRendererProps) {
  const title = getStringProp(block.props, "title") ?? "可信数据";
  const stats = getMetricList(block.props, "stats");
  const dark = block.style.background === "primary" || block.style.background === "gradient" || block.style.background === "image";

  if (block.variant === "compact-strip") {
    return (
      <section style={getSectionStyle(block.style)}>
        <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
          <div className="grid items-center gap-6 border-y border-slate-200 py-8 lg:grid-cols-[0.9fr_1.1fr]">
            <h2 className="text-left text-2xl font-semibold leading-tight tracking-normal text-slate-950">{title}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div className="text-left" key={`${stat.value}-${stat.label}`}>
                  <div className="text-3xl font-semibold tracking-normal text-red-600">{stat.value}</div>
                  <p className="mt-1 text-sm font-semibold text-slate-950">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (block.variant === "proof-wall") {
    return (
      <section style={getSectionStyle(block.style)}>
        <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
          <div className="grid gap-6 text-left lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold text-red-300">Proof</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl">{title}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <article className="border border-white/15 bg-white/10 p-5 text-white" key={`${stat.value}-${stat.label}`}>
                  <div className="text-4xl font-semibold tracking-normal">{stat.value}</div>
                  <h3 className="mt-4 text-base font-semibold">{stat.label}</h3>
                  {stat.description ? <p className="mt-2 text-sm leading-6 text-slate-300">{stat.description}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={getSectionStyle(block.style)}>
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="grid gap-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-center">
          <div className="text-left">
            <p className={dark ? "text-sm font-semibold text-red-300" : "text-sm font-semibold text-red-600"}>Evidence</p>
            <h2 className={`mt-3 text-3xl font-semibold leading-tight tracking-normal sm:text-4xl ${dark ? "text-white" : "text-slate-950"}`}>
              {title}
            </h2>
          </div>
          <div className="grid divide-y divide-slate-200 border-y border-slate-200 bg-white/95 text-left sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((stat) => (
              <article className="p-6" key={`${stat.value}-${stat.label}`}>
                <div className="text-4xl font-semibold tracking-normal text-red-600">{stat.value}</div>
                <h3 className="mt-3 text-base font-semibold text-slate-950">{stat.label}</h3>
                {stat.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{stat.description}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const trustStatsBlock = defineBlock<Record<string, unknown>>({
  type: "trustStats",
  name: "信任数据",
  category: "trust",
  description: "用关键业务数字建立第一层信任。",
  variants: [
    { id: "three-metrics", name: "横向大数字" },
    { id: "compact-strip", name: "紧凑数据条" },
    { id: "proof-wall", name: "深色证明墙" },
  ],
  defaultProps: {
    title: "被市场验证的企业级交付能力",
    stats: [
      { value: "200+", label: "企业客户", description: "覆盖制造、教育、医疗等行业" },
      { value: "48h", label: "首版交付", description: "快速完成官网初稿" },
      { value: "99.9%", label: "稳定性", description: "面向生产环境设计" },
    ],
  },
  defaultStyle: { background: "muted", paddingTop: 64, paddingBottom: 64, textAlign: "center", container: "contained" },
  variantDefaults: {
    "compact-strip": {
      style: { background: "default", paddingTop: 40, paddingBottom: 40 },
    },
    "proof-wall": {
      props: {
        title: "客户选择我们的关键原因",
        stats: [
          { value: "12+", label: "行业模板", description: "覆盖企业官网高频场景" },
          { value: "60+", label: "模块变体", description: "降低重复搭建成本" },
          { value: "1键", label: "发布导出", description: "支持预览、发布和 HTML 导出" },
        ],
      },
      style: { background: "primary", paddingTop: 80, paddingBottom: 80 },
    },
  },
  propsSchema: blockPropsSchemas.trustStats,
  Renderer: TrustStatsRenderer,
  Inspector: GenericBlockInspector,
});

export default trustStatsBlock;
