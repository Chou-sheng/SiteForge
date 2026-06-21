"use client";

import { useEffect, useRef, type ReactNode } from "react";

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

type EducationLayout =
  | "admissions-canvas"
  | "impact-split"
  | "editorial-catalog"
  | "mentor-rail"
  | "wall-of-outcomes"
  | string;

function isJsdomRuntime() {
  return typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("jsdom");
}

function motionClass(preview: boolean | undefined, className: string) {
  return [preview ? "" : "education-premium-motion", className].filter(Boolean).join(" ");
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

function useEducationReveal<T extends HTMLElement>(enabled = true) {
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
          ".education-premium-motion",
          { opacity: 0, y: 26, scale: 0.985 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.72,
            ease: "power3.out",
            stagger: 0.07,
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

function useEducationSwiper<T extends HTMLElement>(enabled: boolean) {
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
        spaceBetween: 16,
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

function getEducationBackground(background: BlockRendererProps["block"]["style"]["background"]) {
  if (background === "primary") {
    return "radial-gradient(circle at 8% 10%, rgba(20,184,166,0.32), transparent 32%), linear-gradient(135deg, #08111f 0%, #102a43 46%, #0f3d3a 100%)";
  }

  if (background === "gradient") {
    return "radial-gradient(circle at 16% 10%, rgba(251,146,60,0.18), transparent 30%), radial-gradient(circle at 86% 18%, rgba(20,184,166,0.2), transparent 32%), linear-gradient(135deg, #fff7ed 0%, #f7fffb 52%, #eef6ff 100%)";
  }

  if (background === "muted") {
    return "linear-gradient(180deg, #f8fafc 0%, #eefdf7 100%)";
  }

  return "linear-gradient(180deg, #ffffff 0%, #fffdf8 100%)";
}

function EducationShell({
  block,
  children,
  preview,
  layout,
}: BlockRendererProps & { children: ReactNode; layout?: EducationLayout }) {
  const ref = useEducationReveal<HTMLElement>(!preview);

  return (
    <section
      data-education-layout={layout}
      data-education-motion={motionState(preview)}
      ref={ref}
      style={{
        ...getSectionStyle(block.style),
        background: getEducationBackground(block.style.background),
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
    <div className={motionClass(preview, align === "left" ? "text-left" : "mx-auto max-w-3xl text-center")} data-education-motion={motionState(preview)}>
      {eyebrow ? (
        <p className="inline-flex rounded-md border border-orange-200 bg-white/80 px-3 py-1 text-sm font-semibold text-orange-700 shadow-sm">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-4xl">
          {title}
        </h2>
      ) : null}
      {description ? <p className="mt-4 text-base leading-8 text-slate-600">{description}</p> : null}
    </div>
  );
}

function ActionRow({ block, preview }: { block: BlockRendererProps["block"]; preview?: boolean }) {
  const primaryAction = getActionProp(block.props, "primaryAction");
  const secondaryAction = getActionProp(block.props, "secondaryAction");

  if (!primaryAction && !secondaryAction) {
    return null;
  }

  return (
    <div className={motionClass(preview, "mt-8 flex flex-wrap items-center gap-3")} data-education-motion={motionState(preview)}>
      {primaryAction ? (
        <a className="inline-flex min-h-12 items-center justify-center rounded-md bg-slate-950 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-900/10" href={primaryAction.href}>
          {primaryAction.label}
        </a>
      ) : null}
      {secondaryAction ? (
        <a className="inline-flex min-h-12 items-center justify-center rounded-md border border-emerald-200 bg-white px-6 text-sm font-semibold text-emerald-800 shadow-sm" href={secondaryAction.href}>
          {secondaryAction.label}
        </a>
      ) : null}
    </div>
  );
}

function LearningCanvasStage({ label, preview }: { label?: string; preview?: boolean }) {
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
    const width = 900;
    const height = 580;
    canvas.width = width;
    canvas.height = height;
    let frame = 0;
    let raf = 0;

    function draw() {
      const context = canvasContext;
      const time = frame / 60;
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#fff7ed");
      gradient.addColorStop(0.5, "#ecfeff");
      gradient.addColorStop(1, "#f5f3ff");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.globalAlpha = 0.55;
      context.strokeStyle = "#14b8a6";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(90, 410);
      for (let index = 0; index < 5; index += 1) {
        const x = 130 + index * 145;
        const y = 360 - Math.sin(time + index * 0.72) * 42 - index * 28;
        context.lineTo(x, y);
      }
      context.stroke();

      const cards = [
        ["测评", 96, 130, "#fb923c"],
        ["训练", 330, 88, "#14b8a6"],
        ["反馈", 555, 140, "#8b5cf6"],
      ] as const;

      context.globalAlpha = 1;
      for (const [title, x, y, color] of cards) {
        context.fillStyle = "rgba(255,255,255,0.88)";
        context.shadowColor = "rgba(15,23,42,0.14)";
        context.shadowBlur = 28;
        context.roundRect(x, y, 210, 120, 14);
        context.fill();
        context.shadowBlur = 0;
        context.fillStyle = color;
        context.roundRect(x + 24, y + 24, 46, 46, 10);
        context.fill();
        context.fillStyle = "#0f172a";
        context.font = "700 24px sans-serif";
        context.fillText(title, x + 88, y + 55);
        context.fillStyle = "rgba(15,23,42,0.22)";
        context.roundRect(x + 88, y + 76, 86, 12, 6);
        context.fill();
      }

      for (let index = 0; index < 8; index += 1) {
        const x = 705 + Math.cos(time + index) * 54;
        const y = 292 + Math.sin(time * 0.8 + index * 1.3) * 84;
        context.fillStyle = index % 2 === 0 ? "rgba(20,184,166,0.64)" : "rgba(251,146,60,0.64)";
        context.beginPath();
        context.arc(x, y, 8 + (index % 3) * 3, 0, Math.PI * 2);
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
    <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/80 bg-white/50 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur">
      <canvas aria-label={label ?? "学习路径 Canvas 动画"} className="h-full min-h-[330px] w-full rounded-md object-cover" ref={canvasRef} />
      <div className="absolute bottom-6 left-6 right-6 rounded-lg bg-white/92 p-4 text-left shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">Canvas learning path</p>
        <p className="mt-1 text-sm font-semibold text-slate-950">{label ?? "学习路径动画接口"}</p>
      </div>
    </div>
  );
}

function LearningImageStage({ image, label, preview }: { image: ImageValue; label?: string; preview?: boolean }) {
  return (
    <div
      className={motionClass(preview, "relative overflow-hidden rounded-[28px] border border-white/70 bg-white p-3 shadow-[0_26px_70px_rgba(15,23,42,0.14)]")}
      data-education-motion={motionState(preview)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={image.alt} className="aspect-[4/3] w-full rounded-[22px] object-cover" src={image.src} />
      <div className="absolute inset-x-8 bottom-8 rounded-2xl border border-white/70 bg-white/88 p-4 text-left shadow-[0_18px_48px_rgba(15,23,42,0.16)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">Learning path live</p>
        <strong className="mt-1 block text-base text-slate-950">{label ?? "课程任务、导师反馈与作品成长路径"}</strong>
      </div>
    </div>
  );
}

function BadgeRow({ badges, preview }: { badges: string[]; preview?: boolean }) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={motionClass(preview, "mt-7 flex flex-wrap gap-2")} data-education-motion={motionState(preview)}>
      {badges.map((badge) => (
        <span className="rounded-md border border-orange-100 bg-white/82 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm" key={badge}>
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
        <article className={motionClass(preview, "rounded-lg border border-orange-100 bg-white p-5 text-left shadow-[0_16px_40px_rgba(249,115,22,0.1)]")} data-education-motion={motionState(preview)} key={`${metric.value}-${metric.label}`}>
          <p className="text-4xl font-semibold tracking-normal text-transparent [background:linear-gradient(90deg,#f97316,#14b8a6,#8b5cf6)] bg-clip-text">{metric.value}</p>
          <h3 className="mt-3 text-base font-semibold text-slate-950">{metric.label}</h3>
          {metric.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{metric.description}</p> : null}
        </article>
      ))}
    </div>
  );
}

function FeatureCard({ item, index, preview }: { item: FeatureItem; index: number; preview?: boolean }) {
  return (
    <article className={motionClass(preview, "rounded-lg border border-slate-200 bg-white p-6 text-left shadow-[0_16px_42px_rgba(15,23,42,0.08)]")} data-education-motion={motionState(preview)}>
      {item.image ? (
        <div className="mb-5 overflow-hidden rounded-md bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={item.image.alt} className="h-36 w-full object-cover" src={item.image.src} />
        </div>
      ) : null}
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-orange-100 to-emerald-100 text-sm font-semibold text-emerald-700">
        {item.icon ?? String(index + 1).padStart(2, "0")}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
      {item.meta ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">{item.meta}</p> : null}
      {item.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p> : null}
    </article>
  );
}

function ImpactSplitMetrics({ block, metrics, preview }: { block: BlockRendererProps["block"]; metrics: MetricItem[]; preview?: boolean }) {
  return (
    <EducationShell block={block} layout="impact-split" preview={preview}>
      <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className={motionClass(preview, "text-left")} data-education-motion={motionState(preview)}>
          <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
            Learning proof
          </p>
          <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl">
            {getStringProp(block.props, "title")}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-200">
            {getStringProp(block.props, "description")}
          </p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-5 text-sm leading-7 text-cyan-50">
            招生页面先回答“学完能得到什么”，再解释课程安排。这个区块用结果数据承接首屏承诺。
          </div>
        </div>
        <div className="grid gap-4">
          {metrics.map((metric, index) => (
            <article
              className={motionClass(preview, "grid gap-4 rounded-[22px] border border-white/10 bg-white p-5 shadow-[0_18px_48px_rgba(2,6,23,0.2)] sm:grid-cols-[150px_1fr] sm:items-center")}
              data-education-motion={motionState(preview)}
              key={`${metric.value}-${metric.label}`}
            >
              <div className="flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-normal text-teal-700">{metric.value}</span>
                <span className="pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">0{index + 1}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">{metric.label}</h3>
                {metric.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{metric.description}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </EducationShell>
  );
}

function EditorialCourseCatalog({ block, items, preview }: { block: BlockRendererProps["block"]; items: FeatureItem[]; preview?: boolean }) {
  const [featured, ...restItems] = items;

  return (
    <EducationShell block={block} layout="editorial-catalog" preview={preview}>
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <article className={motionClass(preview, "overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]")} data-education-motion={motionState(preview)}>
          {featured?.image ? (
            <div className="relative h-72 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={featured.image.alt} className="h-full w-full object-cover opacity-80" src={featured.image.src} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            </div>
          ) : null}
          <div className="p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">{featured?.meta ?? "Featured track"}</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-normal">{featured?.title ?? "重点课程方向"}</h3>
            {featured?.description ? <p className="mt-4 text-sm leading-7 text-slate-200">{featured.description}</p> : null}
          </div>
        </article>
        <div>
          <Intro align="left" description={getStringProp(block.props, "description")} eyebrow="Course catalog" preview={preview} title={getStringProp(block.props, "title")} />
          <div className="mt-8 divide-y divide-slate-200 rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            {restItems.map((item, index) => (
              <article className={motionClass(preview, "grid gap-4 p-5 sm:grid-cols-[116px_1fr]")} data-education-motion={motionState(preview)} key={`${item.title}-${index}`}>
                <div className="overflow-hidden rounded-2xl bg-teal-50">
                  {item.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img alt={item.image.alt} className="h-24 w-full object-cover" src={item.image.src} />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center text-sm font-semibold text-teal-700">
                      {item.icon ?? String(index + 2).padStart(2, "0")}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                    {item.meta ? <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">{item.meta}</span> : null}
                  </div>
                  {item.description ? <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </EducationShell>
  );
}

function MentorRailTimeline({ block, steps, preview }: { block: BlockRendererProps["block"]; steps: FeatureItem[]; preview?: boolean }) {
  return (
    <EducationShell block={block} layout="mentor-rail" preview={preview}>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className={motionClass(preview, "rounded-[28px] border border-orange-100 bg-white/88 p-7 text-left shadow-[0_24px_70px_rgba(15,23,42,0.1)]")} data-education-motion={motionState(preview)}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">Mentor rail</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-4xl">
            {getStringProp(block.props, "title")}
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">{getStringProp(block.props, "description")}</p>
          <div className="mt-8 grid gap-3">
            {["入学测评", "每周任务", "导师批注"].map((item) => (
              <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" key={item}>
                <span>{item}</span>
                <span className="text-teal-200">已排期</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute left-5 top-3 hidden h-[calc(100%-24px)] w-px bg-gradient-to-b from-orange-300 via-teal-300 to-violet-300 sm:block" />
          <div className="grid gap-5">
            {steps.map((step, index) => (
              <article className={motionClass(preview, "relative rounded-[24px] border border-white/70 bg-white p-6 pl-8 text-left shadow-[0_16px_42px_rgba(15,23,42,0.08)] sm:ml-10")} data-education-motion={motionState(preview)} key={`${step.title}-${index}`}>
                <span className="absolute -left-10 top-7 hidden h-10 w-10 items-center justify-center rounded-full border border-white bg-gradient-to-br from-orange-400 to-teal-500 text-sm font-semibold text-white shadow-lg sm:flex">
                  {index + 1}
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Stage {String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">{step.title}</h3>
                {step.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </EducationShell>
  );
}

function OutcomeWallStories({ block, stories, preview }: { block: BlockRendererProps["block"]; stories: StoryItem[]; preview?: boolean }) {
  return (
    <EducationShell block={block} layout="wall-of-outcomes" preview={preview}>
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div className={motionClass(preview, "text-left")} data-education-motion={motionState(preview)}>
          <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
            Outcome wall
          </p>
          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl">
            {getStringProp(block.props, "title")}
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-200">{getStringProp(block.props, "description")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {stories.map((story, index) => (
            <article
              className={motionClass(
                preview,
                [
                  "rounded-[24px] border p-6 text-left shadow-[0_18px_48px_rgba(2,6,23,0.18)]",
                  index === 0 ? "md:row-span-2 bg-white text-slate-950 border-white" : "border-white/10 bg-white/10 text-white",
                  index === 1 ? "md:translate-y-8" : "",
                  index === 2 ? "md:-translate-y-4" : "",
                ].join(" "),
              )}
              data-education-motion={motionState(preview)}
              key={`${story.author}-${index}`}
            >
              {story.outcome ? <p className={index === 0 ? "text-4xl font-semibold text-teal-700" : "text-3xl font-semibold text-orange-200"}>{story.outcome}</p> : null}
              <blockquote className={index === 0 ? "mt-5 text-base leading-8 text-slate-700" : "mt-5 text-base leading-8 text-slate-100"}>&quot;{story.quote}&quot;</blockquote>
              <p className="mt-6 font-semibold">{story.author}</p>
              {story.role ? <p className={index === 0 ? "mt-1 text-sm text-slate-500" : "mt-1 text-sm text-slate-300"}>{story.role}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </EducationShell>
  );
}

export function EducationLearningHeroRenderer({ block, preview }: BlockRendererProps) {
  const title = getStringProp(block.props, "title") ?? "把学习路径讲清楚";
  const subtitle = getStringProp(block.props, "subtitle");
  const eyebrow = getStringProp(block.props, "eyebrow");
  const image = getImageProp(block.props, "image");
  const badges = getStringArray(block.props, "badges");
  const stats = getMetricList(block.props, "stats");
  const canvasSequence = isRecord(block.props.canvasSequence) ? block.props.canvasSequence : {};
  const canvasLabel = typeof canvasSequence.fallbackLabel === "string" ? canvasSequence.fallbackLabel : undefined;
  const ref = useEducationReveal<HTMLElement>(!preview);

  return (
    <section
      data-education-layout="admissions-canvas"
      data-education-motion={motionState(preview)}
      ref={ref}
      style={{
        ...getSectionStyle(block.style),
        background:
          "radial-gradient(circle at 12% 20%, rgba(251,146,60,0.26), transparent 30%), radial-gradient(circle at 84% 14%, rgba(20,184,166,0.24), transparent 34%), linear-gradient(135deg, #fff8ec 0%, #f2fff8 46%, #f7f0ff 100%)",
        color: "#172033",
      }}
    >
      <div className="mx-auto grid min-h-[640px] items-center gap-10 px-6 lg:grid-cols-[1.02fr_0.98fr]" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="text-left">
          {eyebrow ? <p className={motionClass(preview, "inline-flex rounded-md border border-orange-200 bg-white/82 px-3 py-1 text-sm font-semibold text-orange-700")}>{eyebrow}</p> : null}
          <h1 className={motionClass(preview, "mt-5 text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl")}>{title}</h1>
          {subtitle ? <p className={motionClass(preview, "mt-5 max-w-2xl text-base leading-8 text-slate-600")}>{subtitle}</p> : null}
          <ActionRow block={block} preview={preview} />
          <BadgeRow badges={badges} preview={preview} />
          {stats.length > 0 ? <div className="mt-9"><MetricCards metrics={stats} preview={preview} /></div> : null}
        </div>
        <div className={motionClass(preview, "")} data-education-motion={motionState(preview)}>
          {image ? <LearningImageStage image={image} label={canvasLabel} preview={preview} /> : <LearningCanvasStage label={canvasLabel} preview={preview} />}
        </div>
      </div>
    </section>
  );
}

export function EducationLearningMetricsRenderer({ block, preview }: BlockRendererProps) {
  const metrics = getMetricList(block.props, "metrics");

  if (block.variant === "impact-split") {
    return <ImpactSplitMetrics block={block} metrics={metrics} preview={preview} />;
  }

  return (
    <EducationShell block={block} layout={block.variant} preview={preview}>
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
        <Intro align="left" description={getStringProp(block.props, "description")} eyebrow="Learning proof" preview={preview} title={getStringProp(block.props, "title")} />
        <MetricCards metrics={metrics} preview={preview} />
      </div>
    </EducationShell>
  );
}

export function EducationCourseTrackCarouselRenderer({ block, preview }: BlockRendererProps) {
  const items = getFeatureList(block.props, "items");
  const swiperRef = useEducationSwiper<HTMLDivElement>(!preview && items.length > 2);

  if (block.variant === "editorial-catalog") {
    return <EditorialCourseCatalog block={block} items={items} preview={preview} />;
  }

  return (
    <EducationShell block={block} layout={block.variant} preview={preview}>
      <Intro description={getStringProp(block.props, "description")} eyebrow="Course tracks" preview={preview} title={getStringProp(block.props, "title")} />
      <div className={motionClass(preview, "swiper mt-10 overflow-hidden")} data-education-motion={motionState(preview)} ref={swiperRef}>
        <div className="swiper-wrapper flex gap-4">
          {items.map((item, index) => (
            <div className="swiper-slide min-w-[286px] flex-1" key={`${item.title}-${index}`}>
              <FeatureCard item={item} index={index} preview={preview} />
            </div>
          ))}
        </div>
      </div>
    </EducationShell>
  );
}

export function EducationLearningPathTimelineRenderer({ block, preview }: BlockRendererProps) {
  const steps = getFeatureList(block.props, "steps");

  if (block.variant === "mentor-rail") {
    return <MentorRailTimeline block={block} preview={preview} steps={steps} />;
  }

  return (
    <EducationShell block={block} layout={block.variant} preview={preview}>
      <Intro description={getStringProp(block.props, "description")} eyebrow="Learning journey" preview={preview} title={getStringProp(block.props, "title")} />
      <div className="mt-12 grid gap-4 lg:grid-cols-4">
        {steps.map((step, index) => (
          <article className={motionClass(preview, "relative rounded-lg border border-orange-100 bg-white p-6 text-left shadow-[0_14px_38px_rgba(249,115,22,0.1)]")} data-education-motion={motionState(preview)} key={`${step.title}-${index}`}>
            <p className="text-sm font-semibold text-orange-600">阶段 {String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-4 text-lg font-semibold text-slate-950">{step.title}</h3>
            {step.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p> : null}
          </article>
        ))}
      </div>
    </EducationShell>
  );
}

export function EducationStudentStoryCarouselRenderer({ block, preview }: BlockRendererProps) {
  const stories = getStories(block.props);
  const swiperRef = useEducationSwiper<HTMLDivElement>(!preview && stories.length > 2);

  if (block.variant === "wall-of-outcomes") {
    return <OutcomeWallStories block={block} preview={preview} stories={stories} />;
  }

  return (
    <EducationShell block={block} layout={block.variant} preview={preview}>
      <Intro description={getStringProp(block.props, "description")} eyebrow="Student stories" preview={preview} title={getStringProp(block.props, "title")} />
      <div className={motionClass(preview, "swiper mt-10 overflow-hidden")} data-education-motion={motionState(preview)} ref={swiperRef}>
        <div className="swiper-wrapper flex gap-4">
          {stories.map((story, index) => (
            <article className="swiper-slide min-w-[300px] flex-1 rounded-lg border border-slate-200 bg-white p-6 text-left shadow-[0_16px_42px_rgba(15,23,42,0.08)]" key={`${story.author}-${index}`}>
              {story.outcome ? <p className="text-2xl font-semibold text-orange-600">{story.outcome}</p> : null}
              <blockquote className="mt-4 text-base leading-8 text-slate-700">&quot;{story.quote}&quot;</blockquote>
              <p className="mt-5 font-semibold text-slate-950">{story.author}</p>
              {story.role ? <p className="mt-1 text-sm text-slate-500">{story.role}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </EducationShell>
  );
}
