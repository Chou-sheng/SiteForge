// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ModulePanel } from "../../src/components/editor/ModulePanel";
import { getBlockDefinition, runtimeOnlyBlockTypes } from "../../src/modules/registry";

afterEach(() => {
  cleanup();
});

describe("ModulePanel premium preview", () => {
  test("renders premium module hover previews in static editor mode", () => {
    const definition = getBlockDefinition("immersiveHero");
    const variant = definition.variants[0];

    render(<ModulePanel onAddBlock={vi.fn()} />);

    fireEvent.mouseEnter(screen.getByRole("button", { name: `添加 ${definition.name} - ${variant.name}` }));

    const preview = screen.getByTestId("module-variant-preview");

    expect(preview.querySelectorAll(".premium-motion")).toHaveLength(0);
    expect(preview.querySelectorAll('[data-premium-motion="static"]').length).toBeGreaterThan(0);
  });

  test("hides the hover preview when the pointer leaves the module panel", () => {
    const definition = getBlockDefinition("immersiveHero");
    const variant = definition.variants[0];

    render(<ModulePanel onAddBlock={vi.fn()} previewOffset={312} />);

    fireEvent.mouseEnter(screen.getByRole("button", { name: `添加 ${definition.name} - ${variant.name}` }));
    const panel = screen.getByTestId("module-panel");
    const preview = screen.getByTestId("module-variant-preview");

    expect(preview.className).toContain("z-[9999]");
    expect(preview.getAttribute("style")).toContain("left: 312px");

    fireEvent.mouseLeave(panel);

    expect(screen.queryByTestId("module-variant-preview")).toBeNull();
  });

  test("hides the hover preview when the pointer leaves a module variant button", () => {
    const definition = getBlockDefinition("immersiveHero");
    const variant = definition.variants[0];

    render(<ModulePanel onAddBlock={vi.fn()} />);

    const button = screen.getByRole("button", { name: `添加 ${definition.name} - ${variant.name}` });
    fireEvent.mouseEnter(button);
    expect(screen.getByTestId("module-variant-preview")).toBeTruthy();

    fireEvent.mouseLeave(button);

    expect(screen.queryByTestId("module-variant-preview")).toBeNull();
  });

  test("renders the hover preview outside the scrollable module panel", () => {
    const definition = getBlockDefinition("immersiveHero");
    const variant = definition.variants[0];

    render(<ModulePanel onAddBlock={vi.fn()} />);

    fireEvent.mouseEnter(screen.getByRole("button", { name: new RegExp(`${definition.name} - ${variant.name}`) }));

    const preview = screen.getByTestId("module-variant-preview");

    expect(preview.parentElement).toBe(document.body);
  });

  test("does not expose runtime-only AI generated sections in the module library", () => {
    render(<ModulePanel onAddBlock={vi.fn()} />);

    expect(runtimeOnlyBlockTypes).toContain("aiGeneratedSection");
    expect(screen.queryByRole("button", { name: /aiGeneratedSection/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /AI 生成模块/ })).toBeNull();
  });
});
