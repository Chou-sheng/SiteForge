import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import type { BlockRendererProps } from "../types";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { GenericBlockRenderer } from "../shared/GenericBlockRenderer";
import {
  getActionProp,
  getContainerMaxWidth,
  getSectionStyle,
  getStringProp,
} from "../shared/renderHelpers";

function HeroRenderer({ block, preview }: BlockRendererProps) {
  if (block.variant !== "service-portal") {
    return <GenericBlockRenderer block={block} preview={preview} />;
  }

  const props = block.props;
  const eyebrow = getStringProp(props, "eyebrow");
  const title = getStringProp(props, "title") ?? "企业服务门户";
  const subtitle = getStringProp(props, "subtitle");
  const primaryAction = getActionProp(props, "primaryAction");
  const secondaryAction = getActionProp(props, "secondaryAction");

  return (
    <section style={getSectionStyle(block.style)}>
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="grid min-h-[520px] items-stretch overflow-hidden border border-slate-200 bg-white shadow-xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center px-6 py-12 text-slate-950 sm:px-10 lg:px-12">
            {eyebrow ? <p className="text-sm font-semibold tracking-normal text-red-600">{eyebrow}</p> : null}
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              {title}
            </h1>
            {subtitle ? <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">{subtitle}</p> : null}
            {(primaryAction || secondaryAction) ? (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {primaryAction ? (
                  <a className="bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700" href={primaryAction.href}>
                    {primaryAction.label}
                  </a>
                ) : null}
                {secondaryAction ? (
                  <a className="border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:border-slate-950" href={secondaryAction.href}>
                    {secondaryAction.label}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="relative min-h-[320px] bg-slate-950 p-6 text-white">
            <div className="grid h-full min-h-[440px] content-between gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-white/15 bg-white/10 p-4">
                  <p className="text-sm text-slate-300">今日服务请求</p>
                  <p className="mt-3 text-3xl font-semibold">12,846</p>
                </div>
                <div className="border border-white/15 bg-white/10 p-4">
                  <p className="text-sm text-slate-300">异常响应时长</p>
                  <p className="mt-3 text-3xl font-semibold">18min</p>
                </div>
              </div>
              <div className="relative h-44 border border-white/15 bg-slate-900/80 p-5">
                <div className="absolute left-8 right-8 top-1/2 h-px bg-red-400" />
                {["客户", "网点", "仓配", "签收"].map((label, index) => (
                  <div
                    className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-2"
                    key={label}
                    style={{ left: `${10 + index * 27}%` }}
                  >
                    <span className="h-4 w-4 border-2 border-red-300 bg-slate-950" />
                    <span className="text-xs font-semibold text-slate-200">{label}</span>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["时效预测", "轨迹可视", "企业对账"].map((label) => (
                  <span className="border border-white/15 bg-white/10 px-3 py-3 text-center text-sm font-semibold" key={label}>
                    {label}
                  </span>
                ))}
              </div>
              <div className="grid gap-3 bg-white/95 p-4 text-slate-950 shadow-lg sm:grid-cols-3">
                {["在线下单", "运单查询", "服务咨询"].map((label) => (
                  <span className="border border-slate-200 px-3 py-3 text-center text-sm font-semibold" key={label}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const heroBlock = defineBlock<Record<string, unknown>>({
  type: "hero",
  name: "首页首屏",
  category: "hero",
  description: "承载企业官网核心价值主张与首个转化入口。",
  variants: [
    { id: "split-layout", name: "左右分栏" },
    { id: "centered", name: "居中主张" },
    { id: "dashboard-preview", name: "仪表盘预览" },
    { id: "background-image", name: "背景图片" },
    { id: "service-portal", name: "服务门户首屏" },
  ],
  defaultProps: {
    eyebrow: "企业 AI 官网生成平台",
    title: "用 AI 快速搭建可信赖的企业官网",
    subtitle: "从行业定位、页面结构到转化区块，一站式生成适合中国企业展示与获客的官网。",
    primaryAction: { label: "开始生成", href: "#lead-form" },
    secondaryAction: { label: "查看案例", href: "#case-studies" },
    image: { src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80", alt: "企业数据仪表盘" },
  },
  defaultStyle: { background: "gradient", paddingTop: 96, paddingBottom: 96, textAlign: "left", container: "contained" },
  variantDefaults: {
    "service-portal": {
      props: {
        eyebrow: "企业级服务门户",
        title: "把查询、下单、方案与企业实力集中在一个首页",
        subtitle: "适合物流、供应链、园区服务和集团型企业，用清晰入口承接高频服务，用方案内容建立长期信任。",
        primaryAction: { label: "立即咨询服务", href: "#lead-form" },
        secondaryAction: { label: "查看解决方案", href: "#solutions" },
        image: {
          src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80",
          alt: "物流仓储与企业服务场景",
        },
      },
      style: { background: "muted", paddingTop: 48, paddingBottom: 72, textAlign: "left", container: "contained" },
    },
    centered: {
      props: {
        title: "让企业官网从想法快速变成可发布页面",
        subtitle: "适合品牌展示、业务介绍和销售线索收集的居中首屏。",
      },
      style: { background: "default", textAlign: "center", container: "narrow" },
    },
    "dashboard-preview": {
      props: {
        eyebrow: "数据驱动的官网运营",
        title: "把页面内容、转化入口和发布流程集中管理",
        subtitle: "适合 SaaS、AI 产品和企业服务官网，突出产品能力与工作台体验。",
      },
      style: { background: "muted", textAlign: "left" },
    },
    "background-image": {
      props: {
        eyebrow: "品牌故事与活动落地",
        title: "用更有记忆点的视觉承载品牌表达",
        subtitle: "适合新品发布、活动页面和品牌主张强烈的官网首屏。",
      },
      style: { background: "image", paddingTop: 112, paddingBottom: 112 },
    },
  },
  propsSchema: blockPropsSchemas.hero,
  Renderer: HeroRenderer,
  Inspector: GenericBlockInspector,
});

export default heroBlock;
