import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import type { BlockRendererProps } from "../types";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import {
  getCaseList,
  getContainerMaxWidth,
  getSectionStyle,
  getStringProp,
} from "../shared/renderHelpers";

function CaseStudiesRenderer({ block }: BlockRendererProps) {
  const title = getStringProp(block.props, "title") ?? "新闻资讯";
  const cases = getCaseList(block.props, "cases");
  const featured = cases[0];
  const rest = cases.slice(1);

  if (block.variant !== "news-room") {
    return (
      <section id="case-studies" style={getSectionStyle(block.style)}>
        <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
          <div className="mb-10 max-w-3xl text-left">
            <p className="text-sm font-semibold tracking-normal text-red-600">Cases</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            {featured ? (
              <article className="bg-white p-7 text-left shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-red-600">{featured.company ?? "重点案例"}</p>
                <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-normal text-slate-950">{featured.title}</h3>
                {featured.summary ? <p className="mt-4 text-sm leading-7 text-slate-600">{featured.summary}</p> : null}
                {featured.metrics?.length ? (
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {featured.metrics.map((metric) => (
                      <div className="border border-slate-200 bg-slate-50 p-4" key={`${metric.value}-${metric.label}`}>
                        <div className="text-3xl font-semibold text-red-600">{metric.value}</div>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ) : null}
            <div className="grid gap-3">
              {rest.map((item, index) => (
                <article className="border border-slate-200 bg-white p-5 text-left shadow-sm" key={`${item.title}-${index}`}>
                  <p className="text-xs font-semibold uppercase tracking-normal text-red-600">{item.company ?? `Case ${index + 2}`}</p>
                  <h3 className="mt-2 text-lg font-semibold leading-7 text-slate-950">{item.title}</h3>
                  {item.summary ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p> : null}
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
        <div className="mb-10 flex flex-col justify-between gap-4 text-left md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold tracking-normal text-red-600">News</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
          </div>
          <a className="inline-flex w-fit border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-950 hover:border-red-600 hover:text-red-600" href="#news">
            查看全部
          </a>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          {featured ? (
            <article className="bg-slate-950 p-7 text-left text-white">
              <p className="text-sm font-semibold text-red-300">{featured.company ?? "重点动态"}</p>
              <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-normal">{featured.title}</h3>
              {featured.summary ? <p className="mt-4 text-sm leading-7 text-slate-300">{featured.summary}</p> : null}
              {featured.metrics?.length ? (
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {featured.metrics.map((metric) => (
                    <div className="border border-white/15 p-4" key={`${metric.value}-${metric.label}`}>
                      <div className="text-2xl font-semibold text-white">{metric.value}</div>
                      <p className="mt-1 text-sm text-slate-300">{metric.label}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ) : null}
          <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
            {rest.map((item, index) => (
              <article className="grid gap-4 py-5 text-left sm:grid-cols-[72px_1fr]" key={`${item.title}-${index}`}>
                <div className="text-sm font-semibold text-red-600">{item.company ?? `0${index + 1}`}</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                  {item.summary ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const caseStudiesBlock = defineBlock<Record<string, unknown>>({
  type: "caseStudies",
  name: "客户案例",
  category: "trust",
  description: "用真实项目故事和结果证明交付价值。",
  variants: [
    { id: "case-cards", name: "案例卡片" },
    { id: "featured-case", name: "重点案例" },
    { id: "metrics-case", name: "数据案例" },
    { id: "news-room", name: "新闻资讯" },
  ],
  defaultProps: {
    title: "客户成功案例",
    cases: [
      { title: "制造企业官网升级", company: "华东智造", summary: "两周内完成品牌站改版并上线。", metrics: [{ value: "32%", label: "咨询增长" }] },
      { title: "教育机构招生页", company: "启明教育", summary: "生成活动落地页并承接投放流量。", metrics: [{ value: "18%", label: "转化提升" }] },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 88, paddingBottom: 88, textAlign: "center", container: "contained" },
  variantDefaults: {
    "featured-case": {
      props: {
        title: "重点客户案例",
        cases: [
          {
            title: "企业官网重构项目",
            company: "某工业软件企业",
            summary: "用模块化结构重新组织产品、方案和咨询路径。",
            metrics: [{ value: "2周", label: "完成上线" }],
          },
        ],
      },
      style: { background: "muted", textAlign: "left" },
    },
    "metrics-case": {
      props: {
        title: "用结果证明页面价值",
        cases: [
          {
            title: "线索承接优化",
            company: "企业服务团队",
            summary: "把分散介绍页整合为清晰的咨询漏斗。",
            metrics: [{ value: "41%", label: "有效咨询提升" }],
          },
          {
            title: "品牌官网升级",
            company: "AI 产品公司",
            summary: "优化首页价值主张和产品场景表达。",
            metrics: [{ value: "3天", label: "完成初稿" }],
          },
        ],
      },
    },
    "news-room": {
      props: {
        title: "企业动态与客户案例",
        cases: [
          {
            title: "智能仓配项目完成多区域上线",
            company: "客户案例",
            summary: "为连锁零售客户重构仓配协同链路，提升门店补货可视化和异常响应效率。",
            metrics: [{ value: "18%", label: "补货时效提升" }],
          },
          {
            title: "冷链服务网络升级，覆盖更多城市圈",
            company: "服务动态",
            summary: "围绕温控配送、交接追溯和合规检查，进一步完善行业服务能力。",
          },
          {
            title: "企业客户服务台上线新版数据看板",
            company: "产品更新",
            summary: "帮助客户集中查看订单状态、费用趋势、异常处理和服务质量指标。",
          },
          {
            title: "跨境供应链协同方案开放咨询",
            company: "解决方案",
            summary: "面向出海企业提供干线、仓储、清关和末端履约的一体化服务路径。",
          },
        ],
      },
      style: { background: "default", paddingTop: 88, paddingBottom: 88, textAlign: "left" },
    },
  },
  propsSchema: blockPropsSchemas.caseStudies,
  Renderer: CaseStudiesRenderer,
  Inspector: GenericBlockInspector,
});

export default caseStudiesBlock;
