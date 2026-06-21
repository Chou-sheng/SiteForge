"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import type { BlockRendererProps } from "../types";
import {
  getActionProp,
  getContainerMaxWidth,
  getFeatureList,
  getImageProp,
  getMetricList,
  getSectionStyle,
  getStringProp,
  isRecord,
  type FeatureItem,
  type MetricItem,
} from "./renderHelpers";

type SwiperInstance = {
  destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void;
};

type TestimonialItem = {
  quote: string;
  author: string;
  role?: string;
  outcome?: string;
};

type VisualTone = "default" | "ai-lab" | "learning-studio";

type ToneConfig = {
  heroBackground: string;
  heroColor: string;
  heroGridClass: string;
  heroTitleClass: string;
  heroTextClass: string;
  eyebrowClass: string;
  introEyebrowClass: string;
  primaryActionClass: string;
  secondaryActionClass: string;
  badgeClass: string;
  heroMetricCardClass: string;
  metricValueClass: string;
  metricCardClass: string;
  cardClass: string;
  iconClass: string;
  accentTextClass: string;
  stageClass: string;
  stageCaptionClass: string;
  stageLabelClass: string;
  sectionStyle?: CSSProperties;
};

const toneConfigs: Record<VisualTone, ToneConfig> = {
  default: {
    heroBackground:
      "radial-gradient(circle at 12% 18%, rgba(0,196,204,0.24), transparent 32%), radial-gradient(circle at 82% 12%, rgba(255,91,138,0.2), transparent 28%), linear-gradient(135deg, #f4fffe 0%, #fff7fb 48%, #f6f0ff 100%)",
    heroColor: "#101828",
    heroGridClass: "lg:grid-cols-[0.92fr_1.08fr]",
    heroTitleClass: "text-slate-950",
    heroTextClass: "text-slate-600",
    eyebrowClass: "border-violet-200 bg-white/80 text-violet-700",
    introEyebrowClass: "border-cyan-200 bg-cyan-50 text-cyan-700",
    primaryActionClass: "bg-gradient-to-r from-cyan-500 via-violet-600 to-pink-500 text-white shadow-lg shadow-violet-500/20",
    secondaryActionClass: "border border-slate-200 bg-white text-slate-800 shadow-sm",
    badgeClass: "border-white/70 bg-white/70 text-slate-700 shadow-sm",
    heroMetricCardClass: "border-white/70 bg-white/78 text-slate-950 shadow-sm backdrop-blur",
    metricValueClass: "text-transparent [background:linear-gradient(90deg,#00c4cc,#7c3aed,#ff5b8a)] bg-clip-text",
    metricCardClass: "border-white/70 bg-white text-slate-950 shadow-[0_16px_42px_rgba(16,24,40,0.08)]",
    cardClass: "border-slate-200 bg-white text-slate-950 shadow-[0_14px_36px_rgba(16,24,40,0.08)]",
    iconClass: "bg-gradient-to-br from-cyan-100 to-violet-100 text-violet-700",
    accentTextClass: "text-cyan-700",
    stageClass: "border-white/70 bg-white/40 shadow-[0_24px_70px_rgba(16,24,40,0.18)]",
    stageCaptionClass: "bg-white/90 text-slate-950 shadow-xl",
    stageLabelClass: "text-cyan-700",
  },
  "ai-lab": {
    heroBackground:
      "radial-gradient(circle at 16% 18%, rgba(0,196,204,0.34), transparent 30%), radial-gradient(circle at 82% 14%, rgba(124,58,237,0.38), transparent 34%), linear-gradient(135deg, #070816 0%, #17112f 48%, #062f3b 100%)",
    heroColor: "#f8fafc",
    heroGridClass: "lg:grid-cols-[0.9fr_1.1fr]",
    heroTitleClass: "text-white",
    heroTextClass: "text-slate-300",
    eyebrowClass: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
    introEyebrowClass: "border-cyan-300/30 bg-cyan-50 text-cyan-700",
    primaryActionClass: "bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-white shadow-lg shadow-cyan-500/25",
    secondaryActionClass: "border border-white/20 bg-white/10 text-white shadow-sm backdrop-blur",
    badgeClass: "border-white/15 bg-white/10 text-slate-100 shadow-sm backdrop-blur",
    heroMetricCardClass: "border-white/15 bg-white/10 text-white shadow-sm backdrop-blur",
    metricValueClass: "text-transparent [background:linear-gradient(90deg,#22d3ee,#818cf8,#c084fc)] bg-clip-text",
    metricCardClass: "border-slate-800 bg-slate-950 text-white shadow-[0_16px_42px_rgba(15,23,42,0.22)]",
    cardClass: "border-slate-800 bg-slate-950 text-white shadow-[0_18px_48px_rgba(15,23,42,0.22)]",
    iconClass: "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/20",
    accentTextClass: "text-cyan-500",
    stageClass: "border-cyan-300/20 bg-slate-950/70 shadow-[0_28px_80px_rgba(6,182,212,0.18)]",
    stageCaptionClass: "bg-slate-950/88 text-white shadow-2xl ring-1 ring-white/10",
    stageLabelClass: "text-cyan-300",
    sectionStyle: {
      background:
        "radial-gradient(circle at 10% 0%, rgba(34,211,238,0.08), transparent 30%), linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    },
  },
  "learning-studio": {
    heroBackground:
      "radial-gradient(circle at 12% 20%, rgba(255,183,77,0.28), transparent 30%), radial-gradient(circle at 84% 18%, rgba(45,212,191,0.25), transparent 34%), linear-gradient(135deg, #fff8ec 0%, #f2fff8 46%, #f7f0ff 100%)",
    heroColor: "#172033",
    heroGridClass: "lg:grid-cols-[1.05fr_0.95fr]",
    heroTitleClass: "text-slate-950",
    heroTextClass: "text-slate-600",
    eyebrowClass: "border-orange-200 bg-white/82 text-orange-700",
    introEyebrowClass: "border-orange-200 bg-orange-50 text-orange-700",
    primaryActionClass: "bg-gradient-to-r from-orange-400 via-rose-400 to-violet-500 text-white shadow-lg shadow-orange-400/20",
    secondaryActionClass: "border border-emerald-200 bg-white text-emerald-800 shadow-sm",
    badgeClass: "border-orange-100 bg-white/78 text-slate-700 shadow-sm",
    heroMetricCardClass: "border-white/80 bg-white/82 text-slate-950 shadow-sm backdrop-blur",
    metricValueClass: "text-transparent [background:linear-gradient(90deg,#f97316,#14b8a6,#8b5cf6)] bg-clip-text",
    metricCardClass: "border-orange-100 bg-white text-slate-950 shadow-[0_16px_42px_rgba(249,115,22,0.1)]",
    cardClass: "border-orange-100 bg-white text-slate-950 shadow-[0_14px_36px_rgba(249,115,22,0.1)]",
    iconClass: "bg-gradient-to-br from-orange-100 to-emerald-100 text-emerald-700",
    accentTextClass: "text-orange-600",
    stageClass: "border-white/80 bg-white/55 shadow-[0_24px_70px_rgba(249,115,22,0.16)]",
    stageCaptionClass: "bg-white/92 text-slate-950 shadow-xl",
    stageLabelClass: "text-orange-600",
    sectionStyle: {
      background:
        "radial-gradient(circle at 88% 0%, rgba(20,184,166,0.08), transparent 32%), linear-gradient(180deg, #ffffff 0%, #fffaf2 100%)",
    },
  },
};

function isJsdomRuntime() {
  return typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("jsdom");
}

function getVisualTone(props: Record<string, unknown>): VisualTone {
  const value = props.visualTone;

  if (value === "ai-lab" || value === "learning-studio") {
    return value;
  }

  return "default";
}

function getToneConfig(props: Record<string, unknown>) {
  return toneConfigs[getVisualTone(props)];
}

function motionClass(preview: boolean | undefined, className: string) {
  return [preview ? "" : "premium-motion", className].filter(Boolean).join(" ");
}

function motionState(preview: boolean | undefined) {
  return preview ? "static" : "animated";
}

function useGsapReveal<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!enabled || !element || typeof window === "undefined" || isJsdomRuntime()) {
      return;
    }

    const gsapScope: Element = element;
    let active = true;
    let context: { revert: () => void } | undefined;

    async function run() {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");

      if (!active) {
        return;
      }

      const gsap = gsapModule.gsap;
      gsap.registerPlugin(scrollTriggerModule.ScrollTrigger);
      context = gsap.context(() => {
        gsap.fromTo(
          ".premium-motion",
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: gsapScope,
              start: "top 76%",
            },
          },
        );
      }, gsapScope);
    }

    run();

    return () => {
      active = false;
      context?.revert();
    };
  }, [enabled]);

  return ref;
}

function useSwiper<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled || !ref.current || typeof window === "undefined" || isJsdomRuntime()) {
      return;
    }

    let active = true;
    let instance: SwiperInstance | undefined;

    async function run() {
      const swiperModule = await import("swiper");

      if (!active || !ref.current) {
        return;
      }

      instance = new swiperModule.default(ref.current, {
        grabCursor: true,
        slidesPerView: "auto",
        spaceBetween: 18,
      });
    }

    run();

    return () => {
      active = false;
      instance?.destroy(true, true);
    };
  }, [enabled]);

  return ref;
}

function getStringArray(props: Record<string, unknown>, key: string) {
  const value = props[key];

  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function getTestimonials(props: Record<string, unknown>) {
  const value = props.testimonials;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): TestimonialItem[] => {
    if (!isRecord(item) || typeof item.quote !== "string" || typeof item.author !== "string") {
      return [];
    }

    return [{
      quote: item.quote,
      author: item.author,
      role: typeof item.role === "string" ? item.role : undefined,
      outcome: typeof item.outcome === "string" ? item.outcome : undefined,
    }];
  });
}

function SectionShell({ block, children, preview }: BlockRendererProps & { children: ReactNode }) {
  const ref = useGsapReveal<HTMLElement>(!preview);
  const tone = getToneConfig(block.props);

  return (
    <section
      data-premium-motion={motionState(preview)}
      data-premium-tone={getVisualTone(block.props)}
      ref={ref}
      style={{ ...getSectionStyle(block.style), ...tone.sectionStyle }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        {children}
      </div>
    </section>
  );
}

function Intro({
  eyebrow,
  title,
  description,
  align = "center",
  preview,
  tone = toneConfigs.default,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
  preview?: boolean;
  tone?: ToneConfig;
}) {
  return (
    <div
      className={motionClass(preview, align === "left" ? "text-left" : "mx-auto max-w-3xl text-center")}
      data-premium-motion={motionState(preview)}
    >
      {eyebrow ? (
        <p className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${tone.introEyebrowClass}`}>
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl">
          {title}
        </h2>
      ) : null}
      {description ? <p className="mt-4 text-base leading-8 text-slate-600">{description}</p> : null}
    </div>
  );
}

function HeroCanvasStage({ label, tone = toneConfigs.default }: { label?: string; tone?: ToneConfig }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || isJsdomRuntime()) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const width = 960;
    const height = 640;
    canvas.width = width;
    canvas.height = height;

    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#00c4cc");
    gradient.addColorStop(0.52, "#8b5cf6");
    gradient.addColorStop(1, "#ff8a5b");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.globalAlpha = 0.22;
    context.strokeStyle = "#ffffff";
    for (let x = 70; x < width; x += 110) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x - 170, height);
      context.stroke();
    }

    context.globalAlpha = 0.9;
    context.fillStyle = "rgba(255,255,255,0.92)";
    context.roundRect(92, 90, 520, 360, 26);
    context.fill();
    context.fillStyle = "rgba(15,23,42,0.9)";
    context.roundRect(132, 134, 260, 24, 12);
    context.fill();
    context.fillStyle = "rgba(15,23,42,0.12)";
    context.roundRect(132, 188, 390, 16, 8);
    context.roundRect(132, 224, 330, 16, 8);
    context.roundRect(132, 282, 420, 96, 20);
    context.fill();

    context.fillStyle = "rgba(255,255,255,0.72)";
    for (let index = 0; index < 9; index += 1) {
      const x = 665 + Math.cos(index) * 82;
      const y = 230 + index * 34;
      context.beginPath();
      context.arc(x, y, 14, 0, Math.PI * 2);
      context.fill();
    }
  }, []);

  return (
    <div className={`relative min-h-[360px] overflow-hidden rounded-[28px] border p-3 backdrop-blur ${tone.stageClass}`}>
      <canvas aria-label={label ?? "Hero canvas stage"} className="h-full min-h-[330px] w-full rounded-[22px] object-cover" ref={canvasRef} />
      <div className={`absolute bottom-6 left-6 right-6 rounded-2xl p-4 text-left ${tone.stageCaptionClass}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${tone.stageLabelClass}`}>Canvas sequence ready</p>
        <p className="mt-1 text-sm font-semibold">{label ?? "Canvas animation interface"}</p>
      </div>
    </div>
  );
}

function ActionRow({ block, preview, tone }: { block: BlockRendererProps["block"]; preview?: boolean; tone: ToneConfig }) {
  const primaryAction = getActionProp(block.props, "primaryAction");
  const secondaryAction = getActionProp(block.props, "secondaryAction");

  if (!primaryAction && !secondaryAction) {
    return null;
  }

  return (
    <div className={motionClass(preview, "mt-8 flex flex-wrap items-center gap-3")} data-premium-motion={motionState(preview)}>
      {primaryAction ? (
        <a className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold ${tone.primaryActionClass}`} href={primaryAction.href}>
          {primaryAction.label}
        </a>
      ) : null}
      {secondaryAction ? (
        <a className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold ${tone.secondaryActionClass}`} href={secondaryAction.href}>
          {secondaryAction.label}
        </a>
      ) : null}
    </div>
  );
}

function BadgeRow({ badges, preview, tone }: { badges: string[]; preview?: boolean; tone: ToneConfig }) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={motionClass(preview, "mt-7 flex flex-wrap gap-2")} data-premium-motion={motionState(preview)}>
      {badges.map((badge) => (
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${tone.badgeClass}`} key={badge}>
          {badge}
        </span>
      ))}
    </div>
  );
}

function MetricRow({ metrics, preview, tone }: { metrics: MetricItem[]; preview?: boolean; tone: ToneConfig }) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className={motionClass(preview, "mt-9 grid gap-3 sm:grid-cols-3")} data-premium-motion={motionState(preview)}>
      {metrics.map((metric) => (
        <div className={`rounded-2xl border p-4 text-left ${tone.heroMetricCardClass}`} key={`${metric.value}-${metric.label}`}>
          <p className="text-2xl font-semibold">{metric.value}</p>
          <p className="mt-1 text-sm font-semibold">{metric.label}</p>
          {metric.description ? <p className="mt-1 text-xs leading-5 opacity-75">{metric.description}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function PremiumImmersiveHeroRenderer({ block, preview }: BlockRendererProps) {
  const title = getStringProp(block.props, "title") ?? "Premium website template";
  const subtitle = getStringProp(block.props, "subtitle");
  const eyebrow = getStringProp(block.props, "eyebrow");
  const image = getImageProp(block.props, "image");
  const badges = getStringArray(block.props, "badges");
  const metrics = getMetricList(block.props, "stats");
  const canvasSequence = isRecord(block.props.canvasSequence) ? block.props.canvasSequence : {};
  const canvasLabel = typeof canvasSequence.fallbackLabel === "string" ? canvasSequence.fallbackLabel : undefined;
  const tone = getToneConfig(block.props);
  const ref = useGsapReveal<HTMLElement>(!preview);

  return (
    <section
      data-premium-motion={motionState(preview)}
      data-premium-tone={getVisualTone(block.props)}
      ref={ref}
      style={{
        ...getSectionStyle(block.style),
        background: tone.heroBackground,
        color: tone.heroColor,
      }}
    >
      <div className={`mx-auto grid min-h-[640px] items-center gap-10 px-6 ${tone.heroGridClass}`} style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="text-left">
          {eyebrow ? (
            <p className={motionClass(preview, `inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${tone.eyebrowClass}`)} data-premium-motion={motionState(preview)}>
              {eyebrow}
            </p>
          ) : null}
          <h1 className={motionClass(preview, `mt-5 text-4xl font-semibold leading-tight tracking-normal sm:text-6xl ${tone.heroTitleClass}`)} data-premium-motion={motionState(preview)}>
            {title}
          </h1>
          {subtitle ? (
            <p className={motionClass(preview, `mt-5 max-w-2xl text-base leading-8 ${tone.heroTextClass}`)} data-premium-motion={motionState(preview)}>
              {subtitle}
            </p>
          ) : null}
          <ActionRow block={block} preview={preview} tone={tone} />
          <BadgeRow badges={badges} preview={preview} tone={tone} />
          <MetricRow metrics={metrics} preview={preview} tone={tone} />
        </div>
        <div className={motionClass(preview, "")} data-premium-motion={motionState(preview)}>
          {image ? (
            <div className={`overflow-hidden rounded-[28px] border p-3 ${tone.stageClass}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={image.alt} className="aspect-[4/3] w-full rounded-[22px] object-cover" src={image.src} />
            </div>
          ) : (
            <HeroCanvasStage label={canvasLabel} tone={tone} />
          )}
        </div>
      </div>
    </section>
  );
}

export function PremiumShowcaseCarouselRenderer({ block, preview }: BlockRendererProps) {
  const items = getFeatureList(block.props, "items");
  const tone = getToneConfig(block.props);
  const swiperRef = useSwiper<HTMLDivElement>(!preview && items.length > 2);

  return (
    <SectionShell block={block} preview={preview}>
      <Intro description={getStringProp(block.props, "description")} eyebrow="Showcase" preview={preview} title={getStringProp(block.props, "title")} tone={tone} />
      <div className={motionClass(preview, "swiper mt-10 overflow-hidden")} data-premium-motion={motionState(preview)} ref={swiperRef}>
        <div className="swiper-wrapper flex gap-4">
          {items.map((item, index) => (
            <article className={`swiper-slide min-w-[280px] flex-1 rounded-3xl border p-6 text-left ${tone.cardClass}`} key={`${item.title}-${index}`}>
              {item.image ? (
                <div className="mb-5 overflow-hidden rounded-2xl border border-white/60 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={item.image.alt} className="h-40 w-full object-cover" src={item.image.src} />
                </div>
              ) : null}
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold ${tone.iconClass}`}>
                {item.icon ?? String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
              {item.meta ? <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.16em] ${tone.accentTextClass}`}>{item.meta}</p> : null}
              {item.description ? <p className="mt-3 text-sm leading-7 opacity-75">{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function PremiumAnimatedMetricsRenderer({ block, preview }: BlockRendererProps) {
  const metrics = getMetricList(block.props, "metrics");
  const tone = getToneConfig(block.props);

  return (
    <SectionShell block={block} preview={preview}>
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <Intro align="left" description={getStringProp(block.props, "description")} eyebrow="Proof" preview={preview} title={getStringProp(block.props, "title")} tone={tone} />
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div className={motionClass(preview, `rounded-3xl border p-6 text-left ${tone.metricCardClass}`)} data-premium-motion={motionState(preview)} key={`${metric.value}-${metric.label}`}>
              <p className={`text-4xl font-semibold tracking-normal ${tone.metricValueClass}`}>
                {metric.value}
              </p>
              <h3 className="mt-3 text-base font-semibold">{metric.label}</h3>
              {metric.description ? <p className="mt-2 text-sm leading-6 opacity-75">{metric.description}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function PremiumFeatureGrid({ block, items, keyName, preview }: BlockRendererProps & { items: FeatureItem[]; keyName: string }) {
  const tone = getToneConfig(block.props);

  return (
    <SectionShell block={block} preview={preview}>
      <Intro description={getStringProp(block.props, "description")} eyebrow={keyName} preview={preview} title={getStringProp(block.props, "title")} tone={tone} />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <article className={motionClass(preview, `rounded-3xl border p-6 text-left ${tone.cardClass}`)} data-premium-motion={motionState(preview)} key={`${item.title}-${index}`}>
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold ${tone.iconClass}`}>
              {item.icon ?? String(index + 1)}
            </div>
            <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
            {item.description ? <p className="mt-3 text-sm leading-7 opacity-75">{item.description}</p> : null}
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

export function PremiumAudienceGridRenderer({ block, preview }: BlockRendererProps) {
  return <PremiumFeatureGrid block={block} items={getFeatureList(block.props, "audiences")} keyName="Audience" preview={preview} />;
}

export function PremiumTimelineJourneyRenderer({ block, preview }: BlockRendererProps) {
  const steps = getFeatureList(block.props, "steps");
  const tone = getToneConfig(block.props);

  return (
    <SectionShell block={block} preview={preview}>
      <Intro description={getStringProp(block.props, "description")} eyebrow="Journey" preview={preview} title={getStringProp(block.props, "title")} tone={tone} />
      <div className="mt-12 grid gap-4 lg:grid-cols-4">
        {steps.map((step, index) => (
          <article className={motionClass(preview, `relative rounded-3xl border p-6 text-left ${tone.cardClass}`)} data-premium-motion={motionState(preview)} key={`${step.title}-${index}`}>
            <p className={`text-sm font-semibold ${tone.accentTextClass}`}>Step {String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
            {step.description ? <p className="mt-3 text-sm leading-7 opacity-75">{step.description}</p> : null}
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

export function PremiumTestimonialCarouselRenderer({ block, preview }: BlockRendererProps) {
  const testimonials = getTestimonials(block.props);
  const tone = getToneConfig(block.props);
  const swiperRef = useSwiper<HTMLDivElement>(!preview && testimonials.length > 2);

  return (
    <SectionShell block={block} preview={preview}>
      <Intro description={getStringProp(block.props, "description")} eyebrow="Stories" preview={preview} title={getStringProp(block.props, "title")} tone={tone} />
      <div className={motionClass(preview, "swiper mt-10 overflow-hidden")} data-premium-motion={motionState(preview)} ref={swiperRef}>
        <div className="swiper-wrapper flex gap-4">
          {testimonials.map((item, index) => (
            <article className={`swiper-slide min-w-[300px] flex-1 rounded-3xl border p-6 text-left ${tone.cardClass}`} key={`${item.author}-${index}`}>
              {item.outcome ? <p className={`text-2xl font-semibold ${tone.accentTextClass}`}>{item.outcome}</p> : null}
              <blockquote className="mt-4 text-base leading-8 opacity-80">&quot;{item.quote}&quot;</blockquote>
              <p className="mt-5 font-semibold">{item.author}</p>
              {item.role ? <p className="mt-1 text-sm opacity-60">{item.role}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
