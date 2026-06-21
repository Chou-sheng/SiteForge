import { Fragment, type ComponentType, type ReactNode } from "react";

import { blockRegistry } from "../../modules/registry";
import type { BlockDefinition, BlockRendererProps } from "../../types/block";
import type { EnterprisePageDocument } from "../../types/page";
import { ThemeProvider } from "./ThemeProvider";
import { UnknownBlockFallback } from "./UnknownBlockFallback";

export type PageRendererViewport = "desktop" | "tablet" | "mobile";

type PageRendererProps = {
  document: EnterprisePageDocument;
  viewport?: PageRendererViewport;
  mode?: "view" | "editor";
  className?: string;
  renderBlockWrapper?: (block: EnterprisePageDocument["blocks"][number], renderedBlock: ReactNode) => ReactNode;
};

const registry = blockRegistry as Partial<Record<string, BlockDefinition>>;

export function PageRenderer({
  document,
  viewport = "desktop",
  mode = "view",
  className,
  renderBlockWrapper,
}: PageRendererProps) {
  const rendererClassName = ["page-renderer", className].filter(Boolean).join(" ");

  return (
    <ThemeProvider className={rendererClassName} theme={document.theme}>
      {document.blocks.map((block) => {
        if (block.visibility[viewport] === false) {
          return null;
        }

        const blockType = block.type as string;
        const definition = registry[blockType];
        let renderedBlock: ReactNode;

        if (definition) {
          const Renderer = definition.Renderer as ComponentType<BlockRendererProps>;
          renderedBlock = <Renderer block={block} preview={mode === "editor"} />;
        } else {
          renderedBlock = <UnknownBlockFallback type={blockType} />;
        }

        const animatedBlock = (
          <div
            className="page-renderer__block"
            data-page-block-id={block.id}
            data-page-block-type={blockType}
          >
            {renderedBlock}
          </div>
        );

        if (renderBlockWrapper) {
          return <Fragment key={block.id}>{renderBlockWrapper(block, animatedBlock)}</Fragment>;
        }

        return <Fragment key={block.id}>{animatedBlock}</Fragment>;
      })}
    </ThemeProvider>
  );
}
