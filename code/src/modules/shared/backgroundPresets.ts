export const backgroundImagePresets = [
  {
    label: "物流仓配",
    src: "/backgrounds/enterprise-logistics.png",
    alt: "物流仓配",
  },
  {
    label: "企业总部",
    src: "/backgrounds/enterprise-hq.png",
    alt: "企业总部",
  },
  {
    label: "数据运营",
    src: "/backgrounds/enterprise-operations.png",
    alt: "数据运营",
  },
  {
    label: "智能制造",
    src: "/backgrounds/enterprise-manufacturing.png",
    alt: "智能制造",
  },
] as const;

export function supportsBackgroundImagePresets(blockType: string) {
  return ["hero", "featureSpotlight", "about"].includes(blockType);
}
