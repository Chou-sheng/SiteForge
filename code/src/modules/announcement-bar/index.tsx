import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import type { BlockRendererProps } from "../types";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import {
  getActionProp,
  getContainerMaxWidth,
  getSectionStyle,
  getStringProp,
} from "../shared/renderHelpers";

function AnnouncementBarRenderer({ block }: BlockRendererProps) {
  const message = getStringProp(block.props, "message") ?? "公告消息";
  const action = getActionProp(block.props, "action");

  return (
    <section style={getSectionStyle(block.style)}>
      <div
        className="mx-auto flex flex-wrap items-center justify-center gap-3 px-6 text-sm"
        style={{ maxWidth: getContainerMaxWidth(block.style) }}
      >
        <span className="font-medium text-current">{message}</span>
        {action ? (
          <a className="border-b border-current text-xs font-semibold text-current" href={action.href}>
            {action.label}
          </a>
        ) : null}
      </div>
    </section>
  );
}

export const announcementBarBlock = defineBlock<Record<string, unknown>>({
  type: "announcementBar",
  name: "公告栏",
  category: "navigation",
  description: "用于顶部通知、活动入口和重点消息提示。",
  variants: [
    { id: "centered", name: "居中公告", description: "单行消息提示" },
    { id: "with-action", name: "带行动按钮", description: "消息加跳转链接" },
    { id: "urgent", name: "重点提醒", description: "深色高优先级通知" },
    { id: "soft", name: "浅色提示", description: "轻量公告条" },
  ],
  defaultProps: {
    message: "新一代企业 AI 官网方案已开放预约演示",
  },
  defaultStyle: { background: "primary", paddingTop: 12, paddingBottom: 12, textAlign: "center", container: "full" },
  variantDefaults: {
    "with-action": {
      props: { action: { label: "了解详情", href: "#cta" } },
    },
    urgent: {
      props: {
        message: "限时活动：企业官网方案咨询通道已开放",
        action: { label: "立即预约", href: "#lead-form" },
      },
      style: { background: "gradient", paddingTop: 14, paddingBottom: 14 },
    },
    soft: {
      props: {
        message: "新版本已支持模板预览、发布与 HTML 导出",
        action: { label: "查看更新", href: "#features" },
      },
      style: { background: "muted", paddingTop: 10, paddingBottom: 10 },
    },
  },
  propsSchema: blockPropsSchemas.announcementBar,
  Renderer: AnnouncementBarRenderer,
  Inspector: GenericBlockInspector,
});

export default announcementBarBlock;
