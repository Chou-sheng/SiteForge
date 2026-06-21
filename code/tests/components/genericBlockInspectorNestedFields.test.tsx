// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { GenericBlockInspector } from "../../src/modules/shared/GenericBlockInspector";
import type { PageBlock } from "../../src/types/block";

const visible = {
  desktop: true,
  tablet: true,
  mobile: true,
};

const block: PageBlock = {
  id: "block-showcase",
  type: "showcaseCarousel",
  variant: "ai-capabilities",
  name: "Showcase",
  props: {
    title: "Section title",
    description: "Section description",
    items: [
      { icon: "A", title: "First card", meta: "Meta one", description: "First description" },
      { icon: "B", title: "Second card", meta: "Meta two", description: "Second description" },
    ],
  },
  style: {
    background: "default",
    paddingTop: 80,
    paddingBottom: 80,
    textAlign: "center",
    container: "contained",
  },
  visibility: visible,
};

afterEach(() => {
  cleanup();
});

describe("GenericBlockInspector nested fields", () => {
  test("edits nested array item strings instead of only top-level titles", () => {
    const onChange = vi.fn();

    render(<GenericBlockInspector block={block} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("items 2 title"), {
      target: { value: "Updated second card" },
    });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      props: expect.objectContaining({
        items: [
          { icon: "A", title: "First card", meta: "Meta one", description: "First description" },
          { icon: "B", title: "Updated second card", meta: "Meta two", description: "Second description" },
        ],
      }),
    }));
  });

  test("edits nested array item descriptions with a multiline control", () => {
    const onChange = vi.fn();

    render(<GenericBlockInspector block={block} onChange={onChange} />);

    const descriptionField = screen.getByLabelText("items 1 description");
    expect(descriptionField.tagName).toBe("TEXTAREA");

    fireEvent.change(descriptionField, {
      target: { value: "Updated first description" },
    });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      props: expect.objectContaining({
        items: [
          { icon: "A", title: "First card", meta: "Meta one", description: "Updated first description" },
          { icon: "B", title: "Second card", meta: "Meta two", description: "Second description" },
        ],
      }),
    }));
  });
});
