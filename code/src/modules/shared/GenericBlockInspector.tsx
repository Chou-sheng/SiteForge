"use client";

import type { ChangeEvent, ReactElement } from "react";

import type { BlockInspectorProps, PageBlock } from "../types";
import { backgroundImagePresets, supportsBackgroundImagePresets } from "./backgroundPresets";

const commonTextFields = [
  { key: "eyebrow", label: "眉标" },
  { key: "message", label: "公告文案" },
  { key: "logo", label: "品牌名称" },
  { key: "companyName", label: "公司名称" },
  { key: "title", label: "标题" },
  { key: "subtitle", label: "副标题" },
  { key: "description", label: "描述" },
  { key: "imageUrl", label: "图片地址" },
  { key: "copyright", label: "版权信息" },
] as const;

const inspectorStyle = {
  display: "grid",
  gap: 16,
  color: "#0f172a",
  fontSize: 14,
};

const fieldStyle = {
  display: "grid",
  gap: 6,
};

const controlStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  padding: "8px 10px",
  width: "100%",
};

const nestedSectionStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  display: "grid",
  gap: 12,
  padding: 12,
};

const nestedGridStyle = {
  display: "grid",
  gap: 10,
};

const hiddenStructuredKeys = new Set(["visualTone"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getFieldValue(block: PageBlock, key: string) {
  if (key === "imageUrl") {
    const image = block.props.image;
    if (isRecord(image) && typeof image.src === "string") {
      return image.src;
    }
  }

  const value = block.props[key];
  return typeof value === "string" ? value : "";
}

function updateStringProp(block: PageBlock, key: string, value: string): PageBlock {
  if (key === "imageUrl") {
    const currentImage = isRecord(block.props.image) ? block.props.image : {};

    return {
      ...block,
      props: {
        ...block.props,
        image: {
          src: value,
          alt:
            typeof currentImage.alt === "string" && currentImage.alt.trim()
              ? currentImage.alt
              : block.name,
        },
      },
    };
  }

  return {
    ...block,
    props: {
      ...block.props,
      [key]: value,
    },
  };
}

type PathSegment = string | number;

function pathLabel(path: PathSegment[]) {
  return path.map((segment) => (typeof segment === "number" ? String(segment + 1) : segment)).join(" ");
}

function isLongTextField(path: PathSegment[], value: string) {
  const key = String(path.at(-1) ?? "").toLowerCase();

  return value.length > 64 || ["answer", "bio", "description", "quote", "subtitle", "summary"].includes(key);
}

function setValueAtPath(value: unknown, path: PathSegment[], nextValue: unknown): unknown {
  if (path.length === 0) {
    return nextValue;
  }

  const [head, ...rest] = path;

  if (Array.isArray(value)) {
    return value.map((item, index) => (index === head ? setValueAtPath(item, rest, nextValue) : item));
  }

  if (isRecord(value) && typeof head === "string") {
    return {
      ...value,
      [head]: setValueAtPath(value[head], rest, nextValue),
    };
  }

  return value;
}

function updatePropAtPath(block: PageBlock, path: PathSegment[], value: string): PageBlock {
  return {
    ...block,
    props: setValueAtPath(block.props, path, value) as PageBlock["props"],
  };
}

function renderStringField(
  value: string,
  path: PathSegment[],
  block: PageBlock,
  onChange: BlockInspectorProps["onChange"],
) {
  const label = pathLabel(path);
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(updatePropAtPath(block, path, event.target.value));
  };

  return (
    <label key={label} style={fieldStyle}>
      <span>{label}</span>
      {isLongTextField(path, value) ? (
        <textarea
          aria-label={label}
          onChange={handleChange}
          rows={3}
          style={{ ...controlStyle, resize: "vertical" }}
          value={value}
        />
      ) : (
        <input aria-label={label} onChange={handleChange} style={controlStyle} value={value} />
      )}
    </label>
  );
}

function renderStructuredValue(
  value: unknown,
  path: PathSegment[],
  block: PageBlock,
  onChange: BlockInspectorProps["onChange"],
): ReactElement | null {
  if (typeof value === "string") {
    return renderStringField(value, path, block, onChange);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }

    return (
      <section key={pathLabel(path)} style={nestedSectionStyle}>
        <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{pathLabel(path)}</h4>
        <div style={nestedGridStyle}>
          {value.map((item, index) => renderStructuredValue(item, [...path, index], block, onChange))}
        </div>
      </section>
    );
  }

  if (isRecord(value)) {
    const children = Object.entries(value)
      .filter(([key]) => !hiddenStructuredKeys.has(key))
      .map(([key, item]) => renderStructuredValue(item, [...path, key], block, onChange))
      .filter((item): item is ReactElement => item !== null);

    if (children.length === 0) {
      return null;
    }

    return (
      <section key={pathLabel(path)} style={nestedSectionStyle}>
        <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{pathLabel(path)}</h4>
        <div style={nestedGridStyle}>{children}</div>
      </section>
    );
  }

  return null;
}

export function GenericBlockInspector({ block, onChange }: BlockInspectorProps) {
  const handleTextChange = (key: string) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(updateStringProp(block, key, event.target.value));
  };
  const showBackgroundPresets = supportsBackgroundImagePresets(block.type);
  const handledTopLevelKeys: Set<string> = new Set(
    commonTextFields.map((field) => (field.key === "imageUrl" ? "image" : field.key)),
  );
  const structuredFields = Object.entries(block.props)
    .filter(([key]) => !handledTopLevelKeys.has(key) && !hiddenStructuredKeys.has(key))
    .map(([key, value]) => renderStructuredValue(value, [key], block, onChange))
    .filter((item): item is ReactElement => item !== null);

  return (
    <div style={inspectorStyle}>
      <section style={inspectorStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>内容</h3>
        {commonTextFields.map((field) => {
          const value = getFieldValue(block, field.key);
          const hasExistingValue = value.length > 0;
          const isCoreField = ["title", "subtitle", "description", "eyebrow", "imageUrl"].includes(field.key);

          if (!hasExistingValue && !isCoreField) {
            return null;
          }

          return (
            <label key={field.key} style={fieldStyle}>
              <span>{field.label}</span>
              {field.key === "subtitle" || field.key === "description" ? (
                <textarea
                  onChange={handleTextChange(field.key)}
                  rows={3}
                  style={{ ...controlStyle, resize: "vertical" }}
                  value={value}
                />
              ) : (
                <input onChange={handleTextChange(field.key)} style={controlStyle} value={value} />
              )}
            </label>
          );
        })}
        {structuredFields.length > 0 ? (
          <section style={{ display: "grid", gap: 12 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>更多内容</h4>
            {structuredFields}
          </section>
        ) : null}
        {showBackgroundPresets ? (
          <section data-testid="background-image-presets" style={{ display: "grid", gap: 10 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>背景图片</h4>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              {backgroundImagePresets.map((preset) => {
                const selectedImage = block.props.image;
                const isSelected = isRecord(selectedImage) && selectedImage.src === preset.src;

                return (
                  <button
                    aria-label={preset.label}
                    data-testid="background-image-option"
                    key={preset.src}
                    onClick={() => {
                      onChange({
                        ...block,
                        props: {
                          ...block.props,
                          image: {
                            src: preset.src,
                            alt: preset.alt,
                          },
                        },
                        style: {
                          ...block.style,
                          background: "image",
                        },
                      });
                    }}
                    style={{
                      border: isSelected ? "2px solid #0f172a" : "1px solid #cbd5e1",
                      borderRadius: 8,
                      cursor: "pointer",
                      minHeight: 70,
                      overflow: "hidden",
                      padding: 0,
                      position: "relative",
                      textAlign: "left",
                    }}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.08)), url(${preset.src})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        display: "block",
                        inset: 0,
                        position: "absolute",
                      }}
                    />
                    <span
                      style={{
                        color: "#0f172a",
                        display: "block",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: 10,
                        position: "relative",
                      }}
                    >
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}
