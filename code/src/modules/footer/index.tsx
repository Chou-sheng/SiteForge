import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import type { BlockRendererProps } from "../types";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import {
  getContainerMaxWidth,
  getLinkList,
  getSectionStyle,
  getStringProp,
} from "../shared/renderHelpers";

function FooterRenderer({ block }: BlockRendererProps) {
  const companyName = getStringProp(block.props, "companyName") ?? "企业名称";
  const copyright = getStringProp(block.props, "copyright");
  const links = getLinkList(block.props, "links");

  return (
    <footer style={getSectionStyle(block.style)}>
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-base font-semibold text-current">{companyName}</p>
            {copyright ? <p className="mt-1 text-xs opacity-75">{copyright}</p> : null}
          </div>
          {links.length > 0 ? (
            <nav aria-label="页脚导航" className="flex flex-wrap items-center justify-center gap-4">
              {links.map((link) => (
                <a className="text-current opacity-75 hover:opacity-100" href={link.href} key={`${link.label}-${link.href}`}>
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export const footerBlock = defineBlock<Record<string, unknown>>({
  type: "footer",
  name: "页脚",
  category: "footer",
  description: "承载底部导航、版权和企业信息。",
  variants: [
    { id: "simple-footer", name: "简洁页脚", description: "品牌、链接、版权一行展示" },
    { id: "link-columns", name: "链接分组", description: "适合多链接底部导航" },
    { id: "compact-legal", name: "紧凑版权", description: "只保留必要法务信息" },
    { id: "brand-strip", name: "品牌底栏", description: "强化企业名称和联系入口" },
  ],
  defaultProps: {
    companyName: "智造云科技",
    links: [
      { label: "隐私政策", href: "#privacy" },
      { label: "服务条款", href: "#terms" },
      { label: "联系我们", href: "#contact" },
    ],
    copyright: "© 2026 智造云科技。保留所有权利。",
  },
  defaultStyle: { background: "primary", paddingTop: 56, paddingBottom: 56, textAlign: "center", container: "contained" },
  variantDefaults: {
    "compact-legal": {
      props: {
        links: [{ label: "隐私政策", href: "#privacy" }],
      },
      style: { paddingTop: 32, paddingBottom: 32 },
    },
    "brand-strip": {
      props: {
        links: [{ label: "联系我们", href: "#contact" }],
      },
      style: { background: "default", paddingTop: 44, paddingBottom: 44 },
    },
  },
  propsSchema: blockPropsSchemas.footer,
  Renderer: FooterRenderer,
  Inspector: GenericBlockInspector,
});

export default footerBlock;
