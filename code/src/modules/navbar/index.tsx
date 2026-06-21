import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import type { BlockRendererProps } from "../types";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import {
  getActionProp,
  getContainerMaxWidth,
  getLinkList,
  getSectionStyle,
  getStringProp,
} from "../shared/renderHelpers";

function NavbarRenderer({ block }: BlockRendererProps) {
  const props = block.props;
  const logo = getStringProp(props, "logo") ?? "企业品牌";
  const links = getLinkList(props, "links");
  const action = getActionProp(props, "action");
  const isCentered = block.variant === "center-logo";
  const isCompact = block.variant === "compact";
  const sectionStyle = getSectionStyle(block.style);

  return (
    <section style={sectionStyle}>
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <nav
          aria-label="主导航"
          className={[
            "flex gap-4 text-sm",
            isCentered ? "flex-col items-center justify-center" : "items-center justify-between",
            isCompact ? "min-h-10" : "min-h-14",
          ].join(" ")}
        >
          <a className="shrink-0 text-lg font-semibold tracking-normal text-current" href="#top">
            {logo}
          </a>
          {links.length > 0 ? (
            <div className={["flex flex-wrap items-center gap-4", isCentered ? "justify-center" : "justify-end"].join(" ")}>
              {links.map((link) => (
                <a className="text-current opacity-75 hover:opacity-100" href={link.href} key={`${link.label}-${link.href}`}>
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
          {action ? (
            <a
              className="shrink-0 border border-current px-3 py-2 text-xs font-semibold text-current hover:bg-current hover:text-white"
              href={action.href}
            >
              {action.label}
            </a>
          ) : null}
        </nav>
      </div>
    </section>
  );
}

export const navbarBlock = defineBlock<Record<string, unknown>>({
  type: "navbar",
  name: "导航栏",
  category: "navigation",
  description: "展示品牌、核心导航和主要转化入口。",
  variants: [
    { id: "classic", name: "经典导航", description: "左品牌、右导航和按钮" },
    { id: "center-logo", name: "居中品牌", description: "品牌居中，适合品牌站" },
    { id: "dark", name: "深色导航", description: "深色背景的顶部导航" },
    { id: "compact", name: "紧凑导航", description: "减少高度，适合长页面" },
  ],
  defaultProps: {
    logo: "智造云",
    links: [
      { label: "产品", href: "#product" },
      { label: "方案", href: "#solutions" },
      { label: "案例", href: "#cases" },
    ],
    action: { label: "预约演示", href: "#lead-form" },
  },
  defaultStyle: { background: "default", paddingTop: 18, paddingBottom: 18, textAlign: "center", container: "contained" },
  variantDefaults: {
    "center-logo": {
      style: { textAlign: "center", paddingTop: 22, paddingBottom: 22 },
    },
    dark: {
      props: {
        action: { label: "立即咨询", href: "#lead-form" },
      },
      style: { background: "primary", paddingTop: 18, paddingBottom: 18 },
    },
    compact: {
      props: {
        action: { label: "联系", href: "#lead-form" },
      },
      style: { paddingTop: 10, paddingBottom: 10 },
    },
  },
  propsSchema: blockPropsSchemas.navbar,
  Renderer: NavbarRenderer,
  Inspector: GenericBlockInspector,
});

export default navbarBlock;
