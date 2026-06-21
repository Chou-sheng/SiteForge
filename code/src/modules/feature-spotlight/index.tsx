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

function FeatureSpotlightRenderer({ block, preview }: BlockRendererProps) {
  if (block.variant !== "technology-map") {
    return <GenericBlockRenderer block={block} preview={preview} />;
  }

  const title = getStringProp(block.props, "title") ?? "科技能力";
  const description = getStringProp(block.props, "description");
  const features = getFeatureList(block.props, "features");

  return (
    <section style={getSectionStyle(block.style)}>
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="text-left">
            <p className="text-sm font-semibold tracking-normal text-red-400">Technology</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl">
              {title}
            </h2>
            {description ? <p className="mt-5 text-base leading-8 text-slate-300">{description}</p> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((item, index) => (
              <article className="border border-white/15 bg-white/10 p-5 text-left" key={`${item.title}-${index}`}>
                <span className="text-sm font-semibold text-red-300">{item.icon ?? `0${index + 1}`}</span>
                <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                {item.description ? <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const featureSpotlightBlock = defineBlock<Record<string, unknown>>({
  type: "featureSpotlight",
  name: "重点功能",
  category: "content",
  description: "突出一个核心能力，并补充相关功能点。",
  variants: [
    { id: "image-left", name: "图片在左" },
    { id: "image-right", name: "图片在右" },
    { id: "technology-map", name: "科技能力地图" },
  ],
  defaultProps: {
    title: "企业级页面结构自动编排",
    description: "根据企业类型、目标受众和转化目标，自动推荐更适合的官网页面顺序。",
    features: [
      { title: "内容层级清晰", description: "首屏、信任、功能、案例、转化自然衔接。" },
      { title: "移动端友好", description: "默认适配中文内容和常见移动浏览场景。" },
    ],
    image: { src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1100&q=80", alt: "功能展示" },
  },
  defaultStyle: { background: "muted", paddingTop: 88, paddingBottom: 88, textAlign: "left", container: "contained" },
  variantDefaults: {
    "technology-map": {
      props: {
        title: "用数字化能力支撑服务网络",
        description: "服务门户不只展示业务，还要解释企业如何保障时效、稳定、安全和全程可视。",
        features: [
          { icon: "AI", title: "智能调度", description: "结合订单、网点和运力状态，为服务履约提供动态决策。" },
          { icon: "IoT", title: "全程可视", description: "通过节点采集、轨迹追踪和异常预警提升客户透明度。" },
          { icon: "Data", title: "经营看板", description: "沉淀企业客户、服务质量和区域效率的关键指标。" },
          { icon: "Risk", title: "安全合规", description: "围绕权限、数据、交接和服务标准建立可追溯体系。" },
        ],
      },
      style: { background: "primary", paddingTop: 96, paddingBottom: 96, textAlign: "left" },
    },
  },
  propsSchema: blockPropsSchemas.featureSpotlight,
  Renderer: FeatureSpotlightRenderer,
  Inspector: GenericBlockInspector,
});

export default featureSpotlightBlock;
