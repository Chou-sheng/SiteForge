import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import type { BlockRendererProps } from "../types";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import {
  getContainerMaxWidth,
  getSectionStyle,
  getStringProp,
} from "../shared/renderHelpers";

function getFields(props: Record<string, unknown>) {
  const fields = props.fields;

  return Array.isArray(fields) ? fields.filter((field): field is string => typeof field === "string" && field.trim().length > 0) : [];
}

function LeadFormRenderer({ block }: BlockRendererProps) {
  const title = getStringProp(block.props, "title") ?? "预约咨询";
  const description = getStringProp(block.props, "description");
  const submitLabel = getStringProp(block.props, "submitLabel") ?? "提交";
  const fields = getFields(block.props);
  const compact = block.variant === "compact-form";

  return (
    <section id="lead-form" style={getSectionStyle(block.style)}>
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className={compact ? "grid gap-6 border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[0.8fr_1.2fr]" : "grid gap-6 bg-slate-950 p-6 text-white shadow-xl lg:grid-cols-[0.9fr_1.1fr] lg:p-8"}>
          <div className="flex flex-col justify-between text-left">
            <div>
              <p className={compact ? "text-sm font-semibold text-red-600" : "text-sm font-semibold text-red-300"}>Contact</p>
              <h2 className={compact ? "mt-3 text-3xl font-semibold leading-tight tracking-normal text-slate-950" : "mt-3 text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl"}>
                {title}
              </h2>
              {description ? <p className={compact ? "mt-4 text-base leading-8 text-slate-600" : "mt-4 text-base leading-8 text-slate-300"}>{description}</p> : null}
            </div>
            <div className={compact ? "mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3" : "mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3"}>
              {["1 个工作日响应", "专属顾问沟通", "方案评估建议"].map((item) => (
                <span className={compact ? "border border-slate-200 bg-slate-50 px-3 py-3" : "border border-white/15 bg-white/10 px-3 py-3"} key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <form className="grid gap-4 bg-white p-5 text-left text-slate-950">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field, index) => (
                <label className={index === fields.length - 1 && fields.length % 2 === 1 ? "grid gap-2 text-sm font-medium sm:col-span-2" : "grid gap-2 text-sm font-medium"} key={field}>
                  {field}
                  <input className="h-11 border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" placeholder={`请输入${field}`} />
                </label>
              ))}
            </div>
            <button className="mt-2 h-12 bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700" type="button">
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export const leadFormBlock = defineBlock<Record<string, unknown>>({
  type: "leadForm",
  name: "线索表单",
  category: "conversion",
  description: "收集潜在客户信息并承接销售跟进。",
  variants: [
    { id: "compact-form", name: "紧凑表单" },
    { id: "card-form", name: "咨询卡片" },
    { id: "split-form", name: "左右咨询表单" },
  ],
  defaultProps: {
    title: "预约产品演示",
    description: "留下联系方式，我们将在 1 个工作日内与你沟通。",
    fields: ["姓名", "手机号", "公司名称", "需求说明"],
    submitLabel: "提交预约",
  },
  defaultStyle: { background: "muted", paddingTop: 80, paddingBottom: 80, textAlign: "center", container: "contained" },
  variantDefaults: {
    "compact-form": {
      style: { background: "default", paddingTop: 64, paddingBottom: 64 },
    },
    "split-form": {
      props: {
        title: "和顾问聊聊你的官网需求",
        description: "适合销售咨询、企业服务和项目制交付场景。",
        fields: ["姓名", "手机号", "公司名称", "预算范围", "官网目标"],
        submitLabel: "预约沟通",
      },
      style: { textAlign: "left", container: "contained" },
    },
  },
  propsSchema: blockPropsSchemas.leadForm,
  Renderer: LeadFormRenderer,
  Inspector: GenericBlockInspector,
});

export default leadFormBlock;
