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

function FeatureGridRenderer({ block }: BlockRendererProps) {
  const title = getStringProp(block.props, "title") ?? "企业能力";
  const subtitle = getStringProp(block.props, "subtitle");
  const features = getFeatureList(block.props, "features");

  if (block.variant === "alternating") {
    return (
      <section style={getSectionStyle(block.style)}>
        <div className="mx-auto grid gap-10 px-6 lg:grid-cols-[0.78fr_1.22fr]" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
          <div className="text-left">
            <p className="text-sm font-semibold tracking-normal text-red-600">Workflow</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
            {subtitle ? <p className="mt-5 text-base leading-8 text-slate-600">{subtitle}</p> : null}
          </div>
          <div className="grid gap-4">
            {features.map((item, index) => (
              <article className="grid gap-5 border border-slate-200 bg-white p-5 text-left shadow-sm sm:grid-cols-[88px_1fr]" key={`${item.title}-${index}`}>
                <div className="flex h-16 w-16 items-center justify-center bg-slate-950 text-sm font-semibold text-white">
                  {item.icon ?? String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                  {item.description ? <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (block.variant === "icon-card") {
    return (
      <section style={getSectionStyle(block.style)}>
        <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-normal text-red-600">Capability</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
            {subtitle ? <p className="mt-4 text-base leading-8 text-slate-600">{subtitle}</p> : null}
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {features.map((item, index) => (
              <article className="min-h-64 border border-slate-200 bg-white p-6 text-left shadow-sm" key={`${item.title}-${index}`}>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center bg-red-50 text-sm font-semibold text-red-600">
                    {item.icon ?? `0${index + 1}`}
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="mt-8 text-xl font-semibold text-slate-950">{item.title}</h3>
                {item.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const [featured, ...rest] = features;

  return (
    <section style={getSectionStyle(block.style)}>
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="flex min-h-80 flex-col justify-between bg-slate-950 p-8 text-left text-white">
            <div>
              <p className="text-sm font-semibold text-red-300">Core Module</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">{title}</h2>
              {subtitle ? <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">{subtitle}</p> : null}
            </div>
            {featured ? (
              <div className="mt-10 border-t border-white/15 pt-6">
                <p className="text-sm font-semibold text-red-200">{featured.icon ?? "01"}</p>
                <h3 className="mt-2 text-xl font-semibold">{featured.title}</h3>
                {featured.description ? <p className="mt-2 text-sm leading-7 text-slate-300">{featured.description}</p> : null}
              </div>
            ) : null}
          </article>
          <div className="grid gap-4">
            {rest.map((item, index) => (
              <article className="border border-slate-200 bg-white p-6 text-left shadow-sm" key={`${item.title}-${index}`}>
                <div className="text-sm font-semibold text-red-600">{item.icon ?? String(index + 2).padStart(2, "0")}</div>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">{item.title}</h3>
                {item.description ? <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const featureGridBlock = defineBlock<Record<string, unknown>>({
  type: "featureGrid",
  name: "功能网格",
  category: "content",
  description: "用差异化版式呈现产品能力、服务优势或模块功能。",
  variants: [
    { id: "three-column", name: "主次能力版" },
    { id: "icon-card", name: "图标能力卡" },
    { id: "alternating", name: "流程解释版" },
  ],
  defaultProps: {
    title: "覆盖官网生成全流程",
    subtitle: "从内容结构到区块组合，帮助团队更快进入上线验证。",
    features: [
      { icon: "01", title: "行业内容模板", description: "按行业生成价值主张、案例和转化文案。" },
      { icon: "02", title: "模块化区块", description: "企业官网常用区块可自由组合。" },
      { icon: "03", title: "可编辑输出", description: "生成结果保留结构化数据，便于持续迭代。" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 88, paddingBottom: 88, textAlign: "center", container: "contained" },
  variantDefaults: {
    "icon-card": {
      props: {
        title: "把复杂官网能力拆成清晰模块",
        subtitle: "适合展示产品能力、服务优势和交付承诺。",
        features: [
          { icon: "01", title: "结构化生成", description: "按页面目标自动组织模块顺序。" },
          { icon: "02", title: "风格可调", description: "不同变体提供不同视觉节奏。" },
          { icon: "03", title: "一键发布", description: "编辑完成后可预览、导出或发布。" },
        ],
      },
      style: { background: "muted", paddingTop: 80, paddingBottom: 80 },
    },
    alternating: {
      props: {
        title: "围绕业务流程组织官网内容",
        subtitle: "适合咨询、制造、SaaS 等需要解释完整方案的页面。",
        features: [
          { icon: "01", title: "识别客户问题", description: "先讲清楚访客当前遇到的挑战。" },
          { icon: "02", title: "呈现解决路径", description: "再展示产品、服务和案例证明。" },
          { icon: "03", title: "引导明确行动", description: "最后导向咨询、预约或试用入口。" },
        ],
      },
      style: { background: "default", textAlign: "left", container: "contained" },
    },
  },
  propsSchema: blockPropsSchemas.featureGrid,
  Renderer: FeatureGridRenderer,
  Inspector: GenericBlockInspector,
});

export default featureGridBlock;
