"use client";

import { useEffect, useRef, type ReactNode } from "react";

import type { BlockRendererProps } from "../types";
import {
  getActionProp,
  getContainerMaxWidth,
  getFeatureList,
  getImageProp,
  getLinkList,
  getMetricList,
  getSectionStyle,
  getStringProp,
  isRecord,
  type FeatureItem,
  type ImageValue,
  type MetricItem,
} from "./renderHelpers";

type SwiperInstance = {
  destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void;
};

type StoryItem = {
  quote: string;
  author: string;
  role?: string;
  outcome?: string;
};

function isJsdomRuntime() {
  return typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("jsdom");
}

function motionClass(preview: boolean | undefined, className: string) {
  return [preview ? "" : "travel-premium-motion", className].filter(Boolean).join(" ");
}

function motionState(preview: boolean | undefined) {
  return preview ? "static" : "animated";
}

function getStringArray(props: Record<string, unknown>, key: string) {
  const value = props[key];

  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function getStories(props: Record<string, unknown>) {
  const value = props.testimonials;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): StoryItem[] => {
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

function useTravelReveal<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!enabled || !element || typeof window === "undefined" || isJsdomRuntime()) {
      return;
    }

    const scope: HTMLElement = element;
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
          ".travel-premium-motion",
          { opacity: 0, y: 34, rotateX: 4 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: element,
              start: "top 78%",
            },
          },
        );
      }, scope);
    }

    run();

    return () => {
      active = false;
      context?.revert();
    };
  }, [enabled]);

  return ref;
}

function useTravelSwiper<T extends HTMLElement>(enabled: boolean, autoplay = false) {
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
        autoplay: autoplay ? { delay: 2800, disableOnInteraction: false } : false,
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
  }, [autoplay, enabled]);

  return ref;
}

function TravelShell({ block, children, preview }: BlockRendererProps & { children: ReactNode }) {
  const ref = useTravelReveal<HTMLElement>(!preview);

  return (
    <section
      data-travel-motion={motionState(preview)}
      ref={ref}
      style={{
        ...getSectionStyle(block.style),
        background:
          block.style.background === "primary"
            ? "linear-gradient(135deg, #062f2f 0%, #0f766e 52%, #f97316 140%)"
            : "radial-gradient(circle at 15% 12%, rgba(20,184,166,0.16), transparent 30%), radial-gradient(circle at 86% 18%, rgba(249,115,22,0.14), transparent 28%), linear-gradient(180deg, #f7fffb 0%, #fff7ed 100%)",
        color: block.style.background === "primary" ? "#ffffff" : "#10201d",
      }}
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
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
  preview?: boolean;
}) {
  return (
    <div className={motionClass(preview, align === "left" ? "text-left" : "mx-auto max-w-3xl text-center")} data-travel-motion={motionState(preview)}>
      {eyebrow ? (
        <p className="inline-flex rounded-md border border-teal-200 bg-white/82 px-3 py-1 text-sm font-semibold text-teal-800 shadow-sm">
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

function ActionRow({ block, preview }: { block: BlockRendererProps["block"]; preview?: boolean }) {
  const primaryAction = getActionProp(block.props, "primaryAction") ?? getActionProp(block.props, "action");
  const secondaryAction = getActionProp(block.props, "secondaryAction");

  if (!primaryAction && !secondaryAction) {
    return null;
  }

  return (
    <div className={motionClass(preview, "mt-8 flex flex-wrap items-center gap-3")} data-travel-motion={motionState(preview)}>
      {primaryAction ? (
        <a className="inline-flex min-h-12 items-center justify-center rounded-md bg-teal-700 px-6 text-sm font-semibold text-white shadow-lg shadow-teal-700/18" href={primaryAction.href}>
          {primaryAction.label}
        </a>
      ) : null}
      {secondaryAction ? (
        <a className="inline-flex min-h-12 items-center justify-center rounded-md border border-orange-200 bg-white px-6 text-sm font-semibold text-orange-700 shadow-sm" href={secondaryAction.href}>
          {secondaryAction.label}
        </a>
      ) : null}
    </div>
  );
}

function DestinationCanvasStage({ label, preview }: { label?: string; preview?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || typeof window === "undefined" || isJsdomRuntime()) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const canvasContext = context;
    const width = 920;
    const height = 580;
    canvas.width = width;
    canvas.height = height;
    let frame = 0;
    let raf = 0;

    function draw() {
      const time = frame / 60;
      const context = canvasContext;
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#ecfeff");
      gradient.addColorStop(0.52, "#f0fdf4");
      gradient.addColorStop(1, "#ffedd5");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.globalAlpha = 0.72;
      context.fillStyle = "#0f766e";
      context.beginPath();
      context.ellipse(235, 330, 180, 92, -0.38, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#f97316";
      context.beginPath();
      context.ellipse(635, 250, 210, 110, 0.28, 0, Math.PI * 2);
      context.fill();

      context.globalAlpha = 0.86;
      context.strokeStyle = "#ffffff";
      context.lineWidth = 6;
      context.setLineDash([18, 16]);
      context.beginPath();
      context.moveTo(120, 390);
      context.bezierCurveTo(270, 220 + Math.sin(time) * 24, 470, 430, 725, 190 + Math.cos(time) * 22);
      context.stroke();
      context.setLineDash([]);

      const points = [
        [126, 390, "抵达"],
        [378, 272, "山海"],
        [714, 190, "度假"],
      ] as const;

      context.globalAlpha = 1;
      for (const [x, y, title] of points) {
        context.fillStyle = "rgba(255,255,255,0.9)";
        context.shadowColor = "rgba(15,23,42,0.15)";
        context.shadowBlur = 24;
        context.beginPath();
        context.arc(x, y, 34, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
        context.fillStyle = "#0f766e";
        context.font = "700 18px sans-serif";
        context.fillText(title, x - 18, y + 7);
      }

      for (let index = 0; index < 18; index += 1) {
        const x = 180 + index * 38;
        const y = 500 + Math.sin(time + index * 0.65) * 16;
        context.fillStyle = index % 2 === 0 ? "rgba(20,184,166,0.5)" : "rgba(249,115,22,0.48)";
        context.beginPath();
        context.arc(x, y, 5 + (index % 4), 0, Math.PI * 2);
        context.fill();
      }

      frame += 1;
      if (!preview) {
        raf = window.requestAnimationFrame(draw);
      }
    }

    draw();

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [preview]);

  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/80 bg-white/50 p-3 shadow-[0_24px_70px_rgba(15,118,110,0.16)] backdrop-blur">
      <canvas aria-label={label ?? "目的地路线 Canvas 动画"} className="h-full min-h-[330px] w-full rounded-md object-cover" ref={canvasRef} />
      <div className="absolute bottom-6 left-6 right-6 rounded-lg bg-white/92 p-4 text-left shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Destination canvas</p>
        <p className="mt-1 text-sm font-semibold text-slate-950">{label ?? "山海路线动态舞台"}</p>
      </div>
    </div>
  );
}

function DestinationImageStage({ image, label, preview }: { image: ImageValue; label?: string; preview?: boolean }) {
  return (
    <div
      className={motionClass(preview, "relative overflow-hidden rounded-[28px] border border-white/70 bg-white p-3 shadow-[0_26px_70px_rgba(15,118,110,0.16)]")}
      data-travel-motion={motionState(preview)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={image.alt} className="aspect-[4/3] w-full rounded-[22px] object-cover" src={image.src} />
      <div className="absolute inset-x-8 bottom-8 rounded-2xl border border-white/70 bg-white/88 p-4 text-left shadow-[0_18px_48px_rgba(15,23,42,0.16)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Destination route live</p>
        <strong className="mt-1 block text-base text-slate-950">{label ?? "山海路线、住宿与体验动态舞台"}</strong>
      </div>
    </div>
  );
}

function BadgeRow({ badges, preview }: { badges: string[]; preview?: boolean }) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={motionClass(preview, "mt-7 flex flex-wrap gap-2")} data-travel-motion={motionState(preview)}>
      {badges.map((badge) => (
        <span className="rounded-md border border-teal-100 bg-white/82 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm" key={badge}>
          {badge}
        </span>
      ))}
    </div>
  );
}

function MetricCards({ metrics, preview }: { metrics: MetricItem[]; preview?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <article className={motionClass(preview, "rounded-lg border border-teal-100 bg-white p-5 text-left shadow-[0_16px_40px_rgba(15,118,110,0.12)]")} data-travel-motion={motionState(preview)} key={`${metric.value}-${metric.label}`}>
          <p className="text-4xl font-semibold tracking-normal text-transparent [background:linear-gradient(90deg,#0f766e,#14b8a6,#f97316)] bg-clip-text">{metric.value}</p>
          <h3 className="mt-3 text-base font-semibold text-slate-950">{metric.label}</h3>
          {metric.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{metric.description}</p> : null}
        </article>
      ))}
    </div>
  );
}

function TravelFeatureCard({ item, index, preview, compact = false }: { item: FeatureItem; index: number; preview?: boolean; compact?: boolean }) {
  return (
    <article className={motionClass(preview, `${compact ? "p-5" : "p-6"} rounded-lg border border-teal-100 bg-white text-left shadow-[0_16px_42px_rgba(15,23,42,0.08)]`)} data-travel-motion={motionState(preview)}>
      {item.image ? (
        <div className="mb-5 overflow-hidden rounded-md bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={item.image.alt} className={`${compact ? "h-32" : "h-36"} w-full object-cover`} src={item.image.src} />
        </div>
      ) : null}
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-teal-100 to-orange-100 text-sm font-semibold text-teal-800">
        {item.icon ?? String(index + 1).padStart(2, "0")}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
      {item.meta ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">{item.meta}</p> : null}
      {item.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p> : null}
    </article>
  );
}

export function TravelDestinationHeroRenderer({ block, preview }: BlockRendererProps) {
  const title = getStringProp(block.props, "title") ?? "把目的地的风景、动线和预订理由一次讲清楚";
  const subtitle = getStringProp(block.props, "subtitle");
  const eyebrow = getStringProp(block.props, "eyebrow");
  const image = getImageProp(block.props, "image");
  const badges = getStringArray(block.props, "badges");
  const stats = getMetricList(block.props, "stats");
  const canvasSequence = isRecord(block.props.canvasSequence) ? block.props.canvasSequence : {};
  const canvasLabel = typeof canvasSequence.fallbackLabel === "string" ? canvasSequence.fallbackLabel : undefined;
  const ref = useTravelReveal<HTMLElement>(!preview);

  return (
    <section
      data-travel-motion={motionState(preview)}
      ref={ref}
      style={{
        ...getSectionStyle(block.style),
        background:
          "radial-gradient(circle at 14% 18%, rgba(20,184,166,0.24), transparent 30%), radial-gradient(circle at 80% 10%, rgba(249,115,22,0.18), transparent 30%), linear-gradient(135deg, #ecfeff 0%, #f7fee7 48%, #fff7ed 100%)",
        color: "#10201d",
      }}
    >
      <div className="mx-auto grid min-h-[640px] items-center gap-10 px-6 lg:grid-cols-[0.96fr_1.04fr]" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="text-left">
          {eyebrow ? <p className={motionClass(preview, "inline-flex rounded-md border border-teal-200 bg-white/82 px-3 py-1 text-sm font-semibold text-teal-800")}>{eyebrow}</p> : null}
          <h1 className={motionClass(preview, "mt-5 text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl")}>{title}</h1>
          {subtitle ? <p className={motionClass(preview, "mt-5 max-w-2xl text-base leading-8 text-slate-600")}>{subtitle}</p> : null}
          <ActionRow block={block} preview={preview} />
          <BadgeRow badges={badges} preview={preview} />
          {stats.length > 0 ? <div className="mt-9"><MetricCards metrics={stats} preview={preview} /></div> : null}
        </div>
        <div className={motionClass(preview, "")} data-travel-motion={motionState(preview)}>
          {image ? <DestinationImageStage image={image} label={canvasLabel} preview={preview} /> : <DestinationCanvasStage label={canvasLabel} preview={preview} />}
        </div>
      </div>
    </section>
  );
}

export function TravelRouteHighlightsRenderer({ block, preview }: BlockRendererProps) {
  const items = getFeatureList(block.props, "items");

  return (
    <TravelShell block={block} preview={preview}>
      <div className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-end">
        <Intro align="left" description={getStringProp(block.props, "description")} eyebrow="Route highlights" preview={preview} title={getStringProp(block.props, "title")} />
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, index) => (
            <TravelFeatureCard item={item} index={index} key={`${item.title}-${index}`} preview={preview} />
          ))}
        </div>
      </div>
    </TravelShell>
  );
}

export function TravelExperienceMarqueeRenderer({ block, preview }: BlockRendererProps) {
  const items = getFeatureList(block.props, "items");
  const swiperRef = useTravelSwiper<HTMLDivElement>(!preview && items.length > 2, true);

  return (
    <TravelShell block={block} preview={preview}>
      <Intro description={getStringProp(block.props, "description")} eyebrow="Experiences" preview={preview} title={getStringProp(block.props, "title")} />
      <div className={motionClass(preview, "swiper mt-10 overflow-hidden")} data-travel-motion={motionState(preview)} ref={swiperRef}>
        <div className="swiper-wrapper flex gap-4">
          {items.map((item, index) => (
            <div className="swiper-slide min-w-[286px] flex-1" key={`${item.title}-${index}`}>
              <TravelFeatureCard compact item={item} index={index} preview={preview} />
            </div>
          ))}
        </div>
      </div>
    </TravelShell>
  );
}

export function TravelStayShowcaseRenderer({ block, preview }: BlockRendererProps) {
  const items = getFeatureList(block.props, "items");
  const swiperRef = useTravelSwiper<HTMLDivElement>(!preview && items.length > 2);

  return (
    <TravelShell block={block} preview={preview}>
      <Intro description={getStringProp(block.props, "description")} eyebrow="Stays" preview={preview} title={getStringProp(block.props, "title")} />
      <div className={motionClass(preview, "swiper mt-10 overflow-hidden")} data-travel-motion={motionState(preview)} ref={swiperRef}>
        <div className="swiper-wrapper flex gap-5">
          {items.map((item, index) => (
            <article className="swiper-slide min-w-[310px] flex-1 overflow-hidden rounded-lg border border-teal-100 bg-white text-left shadow-[0_18px_48px_rgba(15,23,42,0.1)]" key={`${item.title}-${index}`}>
              {item.image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={item.image.alt} className="h-40 w-full object-cover" src={item.image.src} />
                </>
              ) : (
                <div className="h-36 bg-gradient-to-br from-teal-200 via-emerald-100 to-orange-100" />
              )}
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">{item.meta ?? "Stay"}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">{item.title}</h3>
                {item.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </TravelShell>
  );
}

export function TravelSeasonalTimelineRenderer({ block, preview }: BlockRendererProps) {
  const steps = getFeatureList(block.props, "steps");

  return (
    <TravelShell block={block} preview={preview}>
      <Intro description={getStringProp(block.props, "description")} eyebrow="Seasonal plan" preview={preview} title={getStringProp(block.props, "title")} />
      <div className="mt-12 grid gap-4 lg:grid-cols-4">
        {steps.map((step, index) => (
          <article className={motionClass(preview, "relative rounded-lg border border-teal-100 bg-white p-6 text-left shadow-[0_14px_38px_rgba(15,118,110,0.1)]")} data-travel-motion={motionState(preview)} key={`${step.title}-${index}`}>
            <p className="text-sm font-semibold text-teal-700">季节 {String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-4 text-lg font-semibold text-slate-950">{step.title}</h3>
            {step.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p> : null}
          </article>
        ))}
      </div>
    </TravelShell>
  );
}

export function TravelLocalGuideGridRenderer({ block, preview }: BlockRendererProps) {
  const items = getFeatureList(block.props, "items");

  return (
    <TravelShell block={block} preview={preview}>
      <Intro description={getStringProp(block.props, "description")} eyebrow="Local guide" preview={preview} title={getStringProp(block.props, "title")} />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <TravelFeatureCard item={item} index={index} key={`${item.title}-${index}`} preview={preview} />
        ))}
      </div>
    </TravelShell>
  );
}

export function TravelGuestMapStoriesRenderer({ block, preview }: BlockRendererProps) {
  const stories = getStories(block.props);
  const swiperRef = useTravelSwiper<HTMLDivElement>(!preview && stories.length > 2);

  return (
    <TravelShell block={block} preview={preview}>
      <Intro description={getStringProp(block.props, "description")} eyebrow="Guest map" preview={preview} title={getStringProp(block.props, "title")} />
      <div className={motionClass(preview, "swiper mt-10 overflow-hidden")} data-travel-motion={motionState(preview)} ref={swiperRef}>
        <div className="swiper-wrapper flex gap-4">
          {stories.map((story, index) => (
            <article className="swiper-slide min-w-[300px] flex-1 rounded-lg border border-teal-100 bg-white p-6 text-left shadow-[0_16px_42px_rgba(15,23,42,0.08)]" key={`${story.author}-${index}`}>
              {story.outcome ? <p className="text-2xl font-semibold text-teal-700">{story.outcome}</p> : null}
              <blockquote className="mt-4 text-base leading-8 text-slate-700">&quot;{story.quote}&quot;</blockquote>
              <p className="mt-5 font-semibold text-slate-950">{story.author}</p>
              {story.role ? <p className="mt-1 text-sm text-slate-500">{story.role}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </TravelShell>
  );
}

export function TravelBookingRibbonRenderer({ block, preview }: BlockRendererProps) {
  const items = getFeatureList(block.props, "items");

  return (
    <TravelShell block={block} preview={preview}>
      <div className="grid gap-8 rounded-lg border border-white/50 bg-white/70 p-6 shadow-[0_20px_56px_rgba(15,118,110,0.14)] backdrop-blur lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <div>
          <Intro align="left" description={getStringProp(block.props, "description")} eyebrow="Booking" preview={preview} title={getStringProp(block.props, "title")} />
          <ActionRow block={block} preview={preview} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <TravelFeatureCard compact item={item} index={index} key={`${item.title}-${index}`} preview={preview} />
          ))}
        </div>
      </div>
    </TravelShell>
  );
}

export function TravelFooterRenderer({ block, preview }: BlockRendererProps) {
  const links = getLinkList(block.props, "links");
  const companyName = getStringProp(block.props, "companyName") ?? "文旅品牌";
  const copyright = getStringProp(block.props, "copyright");

  return (
    <TravelShell block={block} preview={preview}>
      <footer className={motionClass(preview, "flex flex-col gap-5 text-center")} data-travel-motion={motionState(preview)}>
        <p className="text-2xl font-semibold text-white">{companyName}</p>
        {links.length > 0 ? (
          <nav className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-white/80">
            {links.map((link) => (
              <a href={link.href} key={`${link.label}-${link.href}`}>
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
        {copyright ? <p className="text-sm text-white/62">{copyright}</p> : null}
      </footer>
    </TravelShell>
  );
}
