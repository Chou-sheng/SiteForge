import { blockPropsSchemas } from "../../lib/validation/blockSchemas";
import { defineBlock } from "../shared/blockFactory";
import { GenericBlockInspector } from "../shared/GenericBlockInspector";
import { PremiumTestimonialCarouselRenderer } from "../shared/premiumRenderers";

export const testimonialCarouselBlock = defineBlock<Record<string, unknown>>({
  type: "testimonialCarousel",
  name: "评价轮播",
  category: "trust",
  description: "基于 Swiper 的学员反馈、客户评价或案例结果轮播。",
  variants: [
    { id: "student-stories", name: "学员故事" },
    { id: "customer-proof", name: "客户反馈" },
  ],
  defaultProps: {
    title: "来自真实用户的反馈",
    description: "用结果和评价强化最终转化前的信任。",
    testimonials: [
      { outcome: "效率提升", quote: "页面结构清楚，团队可以直接进入内容编辑。", author: "李经理", role: "市场负责人" },
      { outcome: "转化更清晰", quote: "重点信息和行动入口比旧页面更明确。", author: "周总", role: "业务负责人" },
      { outcome: "交付更快", quote: "从模板开始比从零设计节省了大量沟通时间。", author: "陈顾问", role: "项目顾问" },
    ],
  },
  defaultStyle: { background: "default", paddingTop: 84, paddingBottom: 84, textAlign: "center", container: "contained" },
  propsSchema: blockPropsSchemas.testimonialCarousel,
  Renderer: PremiumTestimonialCarouselRenderer,
  Inspector: GenericBlockInspector,
});

export default testimonialCarouselBlock;
