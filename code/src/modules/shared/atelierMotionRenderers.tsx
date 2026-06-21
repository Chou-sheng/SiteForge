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

type AtelierLayout =
  | "split-plate-stage"
  | "offset-archive"
  | "material-mosaic"
  | "pinned-sequence"
  | "metric-ledger"
  | "immersive-inquiry"
  | "studio-index"
  | string;

function isJsdomRuntime() {
  return typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("jsdom");
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function motionClass(preview: boolean | undefined, className: string) {
  return [preview ? "" : "atelier-motion", className].filter(Boolean).join(" ");
}

function motionState(preview: boolean | undefined) {
  return preview ? "static" : "animated";
}

function scrollState(preview: boolean | undefined) {
  return preview ? "static" : "scrub";
}

function sceneStateClass(index: number) {
  return index === 0 ? "is-active" : "is-after";
}

function getStringArray(props: Record<string, unknown>, key: string) {
  const value = props[key];

  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function useAtelierReveal<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!enabled || !element || typeof window === "undefined" || isJsdomRuntime() || prefersReducedMotion()) {
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
          ".atelier-motion",
          { opacity: 0, y: 30, clipPath: "inset(0 0 18% 0)" },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0 0 0% 0)",
            duration: 0.82,
            ease: "power3.out",
            stagger: 0.075,
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

function useAtelierScrollScenes<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const scope = element;
    const scenes = Array.from(scope.querySelectorAll<HTMLElement>("[data-atelier-scene]"));
    const panels = Array.from(scope.querySelectorAll<HTMLElement>("[data-atelier-panel]"));

    function setActiveScene(activeIndex: number) {
      scope.dataset.atelierActive = String(activeIndex);
      scenes.forEach((scene, index) => {
        scene.classList.toggle("is-active", index === activeIndex);
        scene.classList.toggle("is-before", index < activeIndex);
        scene.classList.toggle("is-after", index > activeIndex);
      });
      panels.forEach((panel) => {
        const isActive = panel.dataset.atelierPanel === String(activeIndex);
        panel.classList.toggle("is-active", isActive);
        panel.setAttribute("aria-hidden", String(!isActive));
      });
    }

    setActiveScene(0);

    if (
      !enabled ||
      scenes.length === 0 ||
      typeof window === "undefined" ||
      isJsdomRuntime() ||
      prefersReducedMotion()
    ) {
      return;
    }

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
        scenes.forEach((scene, index) => {
          scrollTriggerModule.ScrollTrigger.create({
            trigger: scene,
            start: "top 68%",
            end: "bottom 36%",
            onEnter: () => setActiveScene(index),
            onEnterBack: () => setActiveScene(index),
          });
        });
        scrollTriggerModule.ScrollTrigger.create({
          trigger: scope,
          start: "top bottom",
          end: "bottom top",
          onLeave: () => setActiveScene(scenes.length - 1),
          onLeaveBack: () => setActiveScene(0),
        });
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

function getAtelierBackground(background: BlockRendererProps["block"]["style"]["background"]) {
  if (background === "primary") {
    return "radial-gradient(circle at 14% 18%, rgba(213,31,63,0.2), transparent 28%), linear-gradient(135deg, #111214 0%, #292b2a 56%, #090a0b 100%)";
  }

  if (background === "gradient") {
    return "radial-gradient(circle at 18% 16%, rgba(213,31,63,0.2), transparent 30%), radial-gradient(circle at 82% 18%, rgba(160,166,158,0.28), transparent 26%), linear-gradient(135deg, #f6f8f2 0%, #d9ded6 52%, #f7f8f4 100%)";
  }

  if (background === "muted") {
    return "linear-gradient(180deg, #eef1eb 0%, #f8faf4 100%)";
  }

  return "linear-gradient(180deg, #fbfcf8 0%, #f1f4ee 100%)";
}

function AtelierShell({
  block,
  children,
  preview,
  layout,
}: BlockRendererProps & { children: ReactNode; layout?: AtelierLayout }) {
  const ref = useAtelierReveal<HTMLElement>(!preview);
  const isDark = block.style.background === "primary";

  return (
    <section
      data-atelier-layout={layout}
      data-atelier-motion={motionState(preview)}
      ref={ref}
      style={{
        ...getSectionStyle(block.style),
        background: getAtelierBackground(block.style.background),
        color: isDark ? "#f8faf4" : "#111214",
      }}
    >
      <div className="mx-auto px-5 sm:px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        {children}
      </div>
    </section>
  );
}

function AtelierScrollShell({
  block,
  children,
  preview,
  layout,
}: BlockRendererProps & { children: ReactNode; layout?: AtelierLayout }) {
  const ref = useAtelierScrollScenes<HTMLElement>(!preview);
  const isDark = block.style.background === "primary";

  return (
    <section
      data-atelier-layout={layout}
      data-atelier-motion={motionState(preview)}
      data-atelier-scroll={scrollState(preview)}
      ref={ref}
      style={{
        ...getSectionStyle(block.style),
        background: getAtelierBackground(block.style.background),
        color: isDark ? "#f8faf4" : "#111214",
      }}
    >
      <div className="mx-auto px-5 sm:px-6" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        {children}
      </div>
    </section>
  );
}

function Intro({
  eyebrow,
  title,
  description,
  align = "left",
  inverted = false,
  preview,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
  inverted?: boolean;
  preview?: boolean;
}) {
  return (
    <div
      className={motionClass(
        preview,
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left",
      )}
      data-atelier-motion={motionState(preview)}
    >
      {eyebrow ? (
        <p className={inverted ? "text-xs font-semibold uppercase tracking-[0.18em] text-rose-200" : "text-xs font-semibold uppercase tracking-[0.18em] text-rose-700"}>
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className={inverted ? "mt-4 text-3xl font-semibold leading-tight tracking-normal text-white sm:text-5xl" : "mt-4 text-3xl font-semibold leading-tight tracking-normal text-[#111214] sm:text-5xl"}>
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className={inverted ? "mt-4 max-w-2xl text-base leading-8 text-zinc-300" : "mt-4 max-w-2xl text-base leading-8 text-zinc-600"}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ActionRow({ block, preview, inverted = false }: { block: BlockRendererProps["block"]; preview?: boolean; inverted?: boolean }) {
  const primaryAction = getActionProp(block.props, "primaryAction") ?? getActionProp(block.props, "action");
  const secondaryAction = getActionProp(block.props, "secondaryAction");

  if (!primaryAction && !secondaryAction) {
    return null;
  }

  return (
    <div className={motionClass(preview, "mt-8 flex flex-wrap items-center gap-3")} data-atelier-motion={motionState(preview)}>
      {primaryAction ? (
        <a className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d51f3f] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(213,31,63,0.24)] transition active:translate-y-px" href={primaryAction.href}>
          {primaryAction.label}
        </a>
      ) : null}
      {secondaryAction ? (
        <a className={inverted ? "inline-flex min-h-12 items-center justify-center rounded-full border border-white/[0.18] bg-white/[0.08] px-6 text-sm font-semibold text-white backdrop-blur transition active:translate-y-px" : "inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-950 shadow-sm transition active:translate-y-px"} href={secondaryAction.href}>
          {secondaryAction.label}
        </a>
      ) : null}
    </div>
  );
}

function BlueprintLayer({ label }: { label?: string }) {
  return (
    <div aria-label={label ?? "Atelier plan layer"} className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_0_18%,rgba(255,255,255,0.48)_18.4%,transparent_19.2%_36%,rgba(255,255,255,0.34)_36.4%,transparent_37.2%_100%)]" />
      <div className="absolute left-[7%] top-[9%] h-[27%] w-[34%] border border-zinc-950/35" />
      <div className="absolute right-[7%] top-[8%] h-[35%] w-[24%] border border-zinc-950/35 bg-[#d51f3f]/45" />
      <div className="absolute bottom-[10%] left-[40%] h-[18%] w-[27%] border border-zinc-950/35" />
      <div className="absolute left-[13%] top-[60%] h-[1px] w-[58%] -rotate-[11deg] bg-zinc-950/25" />
      <div className="absolute left-[56%] top-[8%] h-[76%] w-1 bg-[#d51f3f]/75" />
      <div className="absolute bottom-5 right-5 max-w-[260px] rounded-[10px] border border-white/[0.56] bg-white/[0.84] p-4 text-left text-[#111214] shadow-[0_18px_48px_rgba(17,18,20,0.18)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Scroll states</p>
        <strong className="mt-1 block text-sm leading-6">{label ?? "Spatial layers respond through section scroll"}</strong>
      </div>
    </div>
  );
}

function ImagePlate({ image, label, preview }: { image?: ImageValue; label?: string; preview?: boolean }) {
  return (
    <div
      className={motionClass(
        preview,
        "relative min-h-[410px] w-full overflow-hidden rounded-[10px] border border-white/70 bg-zinc-200 shadow-[0_30px_80px_rgba(17,18,20,0.18)]",
      )}
      data-atelier-motion={motionState(preview)}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={image.alt} className="absolute inset-0 h-full w-full object-cover" src={image.src} />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#d9ded6,#f8faf4_48%,#a0a69e)]" />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,18,20,0.08),rgba(17,18,20,0.34))]" />
      <BlueprintLayer label={label} />
    </div>
  );
}

function BadgeRow({ badges, preview }: { badges: string[]; preview?: boolean }) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={motionClass(preview, "mt-7 flex flex-wrap gap-2")} data-atelier-motion={motionState(preview)}>
      {badges.map((badge) => (
        <span className="rounded-full border border-zinc-300 bg-white/[0.72] px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm" key={badge}>
          {badge}
        </span>
      ))}
    </div>
  );
}

function MetricLedger({ metrics, preview }: { metrics: MetricItem[]; preview?: boolean }) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className="mt-9 grid gap-px overflow-hidden rounded-[10px] border border-zinc-300 bg-zinc-300 sm:grid-cols-3">
      {metrics.map((metric) => (
        <article className={motionClass(preview, "bg-white/[0.88] p-5 text-left")} data-atelier-motion={motionState(preview)} key={`${metric.value}-${metric.label}`}>
          <p className="text-4xl font-semibold tracking-normal text-[#111214]">{metric.value}</p>
          <h3 className="mt-3 text-sm font-semibold text-zinc-950">{metric.label}</h3>
          {metric.description ? <p className="mt-2 text-xs leading-5 text-zinc-600">{metric.description}</p> : null}
        </article>
      ))}
    </div>
  );
}

function FeaturePlate({ item, index, preview, dark = false }: { item: FeatureItem; index: number; preview?: boolean; dark?: boolean }) {
  return (
    <article
      className={motionClass(
        preview,
        dark
          ? "border-b border-white/[0.12] py-5 text-left text-white"
          : "border-b border-zinc-300 py-5 text-left text-[#111214]",
      )}
      data-atelier-motion={motionState(preview)}
    >
      <div className="grid gap-4 sm:grid-cols-[86px_1fr] sm:items-start">
        <span className={dark ? "text-sm font-semibold text-rose-200" : "text-sm font-semibold text-rose-700"}>
          {item.icon ?? String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            {item.meta ? <span className={dark ? "text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400" : "text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500"}>{item.meta}</span> : null}
          </div>
          {item.description ? <p className={dark ? "mt-3 text-sm leading-7 text-zinc-300" : "mt-3 text-sm leading-7 text-zinc-600"}>{item.description}</p> : null}
        </div>
      </div>
    </article>
  );
}

export function AtelierHeroRenderer({ block, preview }: BlockRendererProps) {
  const title = getStringProp(block.props, "title") ?? "为空间品牌建立可感知的高级官网";
  const subtitle = getStringProp(block.props, "subtitle");
  const eyebrow = getStringProp(block.props, "eyebrow");
  const image = getImageProp(block.props, "image");
  const links = getLinkList(block.props, "links");
  const badges = getStringArray(block.props, "badges");
  const stats = getMetricList(block.props, "stats");
  const canvasSequence = isRecord(block.props.canvasSequence) ? block.props.canvasSequence : {};
  const canvasLabel = typeof canvasSequence.fallbackLabel === "string" ? canvasSequence.fallbackLabel : undefined;
  const ref = useAtelierReveal<HTMLElement>(!preview);

  return (
    <section
      data-atelier-layout="split-plate-stage"
      data-atelier-motion={motionState(preview)}
      ref={ref}
      style={{
        ...getSectionStyle(block.style),
        background: getAtelierBackground("gradient"),
        color: "#111214",
      }}
    >
      <div className="mx-auto grid min-h-[100dvh] gap-8 px-5 py-5 sm:px-6 lg:grid-cols-[0.82fr_1.18fr]" style={{ maxWidth: getContainerMaxWidth(block.style) }}>
        <div className="flex flex-col justify-between gap-10 pb-8 pt-2">
          <nav className={motionClass(preview, "flex items-center justify-between gap-4 text-sm font-semibold")} data-atelier-motion={motionState(preview)}>
            <span className="text-xl font-semibold tracking-normal">矩域 Atelier</span>
            {links.length > 0 ? (
              <div className="hidden items-center gap-5 text-zinc-600 lg:flex">
                {links.map((link) => (
                  <a className="transition hover:text-[#d51f3f]" href={link.href} key={`${link.label}-${link.href}`}>
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </nav>

          <div className="text-left">
            {eyebrow ? <p className={motionClass(preview, "text-xs font-semibold uppercase tracking-[0.18em] text-rose-700")}>{eyebrow}</p> : null}
            <h1 className={motionClass(preview, "mt-5 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-normal text-[#111214] sm:text-7xl")} data-atelier-motion={motionState(preview)}>
              {title}
            </h1>
            {subtitle ? <p className={motionClass(preview, "mt-6 max-w-xl text-base leading-8 text-zinc-600")} data-atelier-motion={motionState(preview)}>{subtitle}</p> : null}
            <ActionRow block={block} preview={preview} />
            <BadgeRow badges={badges} preview={preview} />
            <MetricLedger metrics={stats} preview={preview} />
          </div>
        </div>
        <div className="flex items-center">
          <ImagePlate image={image} label={canvasLabel} preview={preview} />
        </div>
      </div>
    </section>
  );
}

export function AtelierProjectIndexRenderer({ block, preview }: BlockRendererProps) {
  const items = getFeatureList(block.props, "items");

  return (
    <AtelierScrollShell block={block} layout={block.variant} preview={preview}>
      <div className="relative">
        {!preview ? (
          <div
            className="hidden motion-reduce:lg:hidden lg:sticky lg:top-16 lg:z-10 lg:grid lg:grid-cols-[0.68fr_1.32fr] lg:items-start lg:gap-10"
            data-atelier-project-stage
          >
            <div>
              <Intro description={getStringProp(block.props, "description")} eyebrow="Project index" preview={preview} title={getStringProp(block.props, "title")} />
              <div className={motionClass(preview, "mt-8 border-y border-zinc-300 py-4 text-left text-sm font-semibold text-zinc-600")} data-atelier-motion={motionState(preview)}>
                <span className="text-[#111214]">{String(items.length).padStart(2, "0")}</span> scroll-linked project states
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr] lg:items-stretch">
              <div className="relative min-h-[440px] overflow-hidden rounded-[10px] border border-zinc-300 bg-zinc-200 shadow-[0_24px_70px_rgba(17,18,20,0.12)]">
                {items.map((item, index) => (
                  <div
                    aria-hidden={index !== 0}
                    className={[
                      "atelier-panel absolute inset-0 opacity-0 scale-[1.03] transition-[opacity,transform] duration-700 ease-out [&.is-active]:opacity-100 [&.is-active]:scale-100",
                      index === 0 ? "is-active" : "",
                    ].join(" ")}
                    data-atelier-panel={String(index)}
                    key={`${item.title}-panel-${index}`}
                  >
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={item.image.alt} className="h-full w-full object-cover" src={item.image.src} />
                    ) : (
                      <div className="h-full w-full bg-[linear-gradient(135deg,#d9ded6,#f8faf4_48%,#a0a69e)]" />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(17,18,20,0.2))]" />
                  </div>
                ))}
              </div>
              <div className="relative min-h-[440px] overflow-hidden border-y border-zinc-300 bg-white/[0.34]">
                {items.map((item, index) => (
                  <article
                    aria-hidden={index !== 0}
                    className={[
                      "atelier-panel absolute inset-0 flex translate-y-6 flex-col justify-between p-7 text-left opacity-0 transition-[opacity,transform] duration-500 ease-out",
                      "[&.is-active]:translate-y-0 [&.is-active]:opacity-100",
                      index === 0 ? "is-active" : "",
                    ].join(" ")}
                    data-atelier-panel={String(index)}
                    data-atelier-project-detail={String(index)}
                    key={`${item.title}-detail-${index}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      {item.meta ?? "Project archive"}
                    </p>
                    <div>
                      <h3 className="max-w-sm text-3xl font-semibold leading-tight text-[#111214]">{item.title}</h3>
                      {item.description ? <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-600">{item.description}</p> : null}
                    </div>
                    <div className="flex items-end justify-between border-t border-zinc-300 pt-5">
                      <span className="text-xs font-semibold text-zinc-500">项目档案</span>
                      <strong className="text-4xl font-semibold leading-none text-rose-700">{item.icon ?? String(index + 1).padStart(2, "0")}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className={preview ? "grid gap-5" : "mt-8 grid gap-5 lg:mt-0"}>
          {items.map((item, index) => (
            <article
              className={[
                "atelier-scene border-l-4 border-zinc-300 bg-white/[0.72] p-5 text-left shadow-sm opacity-55 translate-y-6 transition-[opacity,transform,border-color,background-color,box-shadow] duration-500 ease-out",
                "[&.is-active]:translate-y-0 [&.is-active]:border-rose-700 [&.is-active]:bg-white [&.is-active]:opacity-100 [&.is-active]:shadow-[0_24px_70px_rgba(17,18,20,0.12)] [&.is-before]:opacity-35",
                preview
                  ? "min-h-[190px]"
                  : "min-h-[190px] lg:invisible lg:min-h-[320px] lg:pointer-events-none lg:opacity-0 motion-reduce:lg:visible motion-reduce:lg:min-h-[190px] motion-reduce:lg:pointer-events-auto motion-reduce:lg:opacity-100",
                sceneStateClass(index),
              ].join(" ")}
              data-atelier-project-trigger={String(index)}
              data-atelier-scene={String(index)}
              key={`${item.title}-${index}`}
            >
              {item.image ? (
                <div className="mb-5 overflow-hidden rounded-[10px] border border-zinc-300 lg:hidden motion-reduce:lg:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={item.image.alt} className="aspect-[16/10] w-full object-cover" src={item.image.src} />
                </div>
              ) : null}
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{item.meta ?? `Archive ${String(index + 1).padStart(2, "0")}`}</p>
              <h3 className="mt-4 text-2xl font-semibold leading-tight text-[#111214]">{item.title}</h3>
              {item.description ? <p className="mt-4 text-sm leading-7 text-zinc-600">{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </AtelierScrollShell>
  );
}

export function AtelierMaterialStudyRenderer({ block, preview }: BlockRendererProps) {
  const items = getFeatureList(block.props, "items");
  const image = getImageProp(block.props, "image") ?? items.find((item) => item.image)?.image;

  return (
    <AtelierScrollShell block={block} layout={block.variant} preview={preview}>
      <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="relative min-h-[480px] overflow-hidden rounded-[10px] border border-zinc-300 bg-zinc-200 shadow-[0_24px_70px_rgba(17,18,20,0.12)] [clip-path:polygon(0_0,100%_7%,100%_100%,0_93%)]">
            {items.length > 0 ? (
              items.map((item, index) => {
                const panelImage = item.image ?? image;

                return (
                  <div
                    className={[
                      "atelier-panel absolute inset-0 opacity-0 scale-[1.04] transition-[opacity,transform] duration-700 ease-out [&.is-active]:opacity-100 [&.is-active]:scale-100",
                      index === 0 ? "is-active" : "",
                    ].join(" ")}
                    data-atelier-panel={String(index)}
                    key={`${item.title}-material-panel-${index}`}
                  >
                    {panelImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={panelImage.alt} className="h-full w-full object-cover" src={panelImage.src} />
                    ) : (
                      <div className="h-full w-full bg-[linear-gradient(135deg,#d9ded6,#f8faf4_48%,#a0a69e)]" />
                    )}
                  </div>
                );
              })
            ) : image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={image.alt} className="absolute inset-0 h-full w-full object-cover" src={image.src} />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(17,18,20,0.36))]" />
            <div className="absolute inset-x-8 bottom-8 grid grid-cols-3 gap-2">
              {items.slice(0, 3).map((item, index) => (
                <div className="border border-white/60 bg-white/70 p-3 text-left text-xs font-semibold text-[#111214] backdrop-blur" key={`${item.title}-swatch-${index}`}>
                  {item.icon ?? String(index + 1).padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <Intro description={getStringProp(block.props, "description")} eyebrow="Material study" preview={preview} title={getStringProp(block.props, "title")} />
          <div className="mt-8 grid gap-4">
            {items.map((item, index) => (
              <article
                className={[
                  "atelier-scene min-h-[180px] border border-zinc-300 bg-white/[0.62] p-5 text-left opacity-55 transition-[opacity,transform,border-color,background-color] duration-500 ease-out",
                  "[&.is-active]:border-rose-700 [&.is-active]:bg-white [&.is-active]:opacity-100 [&.is-active]:translate-x-0 [&.is-after]:translate-x-5 [&.is-before]:opacity-35",
                  sceneStateClass(index),
                ].join(" ")}
                data-atelier-scene={String(index)}
                key={`${item.title}-${index}`}
              >
                <div className="grid gap-4 sm:grid-cols-[86px_1fr] sm:items-start">
                  <span className="text-sm font-semibold text-rose-700">{item.icon ?? String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-[#111214]">{item.title}</h3>
                    {item.meta ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{item.meta}</p> : null}
                    {item.description ? <p className="mt-3 text-sm leading-7 text-zinc-600">{item.description}</p> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </AtelierScrollShell>
  );
}

export function AtelierProcessLoomRenderer({ block, preview }: BlockRendererProps) {
  const steps = getFeatureList(block.props, "steps");

  return (
    <AtelierScrollShell block={block} layout={block.variant} preview={preview}>
      <div className="grid gap-10 lg:grid-cols-[0.74fr_1.26fr]">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Intro description={getStringProp(block.props, "description")} eyebrow="Process loom" preview={preview} title={getStringProp(block.props, "title")} />
          <div className="relative mt-8 min-h-[190px] overflow-hidden border border-zinc-300 bg-white/[0.72] p-5 text-left shadow-[0_18px_48px_rgba(17,18,20,0.08)]">
            {steps.map((step, index) => (
              <div
                className={[
                  "atelier-panel absolute inset-5 opacity-0 translate-y-5 transition-[opacity,transform] duration-500 ease-out [&.is-active]:opacity-100 [&.is-active]:translate-y-0",
                  index === 0 ? "is-active" : "",
                ].join(" ")}
                data-atelier-panel={String(index)}
                key={`${step.title}-phase-${index}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">{step.meta ?? "Active phase"}</p>
                <strong className="mt-4 block text-4xl font-semibold text-[#111214]">{String(index + 1).padStart(2, "0")}</strong>
                <p className="mt-4 text-sm leading-6 text-zinc-600">{step.title}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute left-7 top-0 hidden h-full w-px bg-gradient-to-b from-zinc-400 via-rose-600 to-zinc-300 sm:block" />
          <div className="grid gap-5">
            {steps.map((step, index) => (
              <article
                className={[
                  "atelier-scene relative min-h-[200px] border border-zinc-300 bg-white/[0.7] p-6 text-left opacity-55 shadow-[0_18px_48px_rgba(17,18,20,0.08)] transition-[opacity,transform,border-color,background-color] duration-500 ease-out sm:ml-14",
                  index % 2 === 1 ? "lg:translate-x-8" : "",
                  "[&.is-active]:border-rose-700 [&.is-active]:bg-white [&.is-active]:opacity-100 [&.is-active]:translate-x-0 [&.is-before]:opacity-35 [&.is-after]:translate-y-5",
                  sceneStateClass(index),
                ].join(" ")}
                data-atelier-scene={String(index)}
                key={`${step.title}-${index}`}
              >
                <span className="absolute -left-14 top-6 hidden h-14 w-14 items-center justify-center rounded-full border border-zinc-300 bg-[#111214] text-sm font-semibold text-white shadow-lg sm:flex">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">{step.meta ?? "Studio phase"}</p>
                <h3 className="mt-4 text-2xl font-semibold text-[#111214]">{step.title}</h3>
                {step.description ? <p className="mt-3 text-sm leading-7 text-zinc-600">{step.description}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </AtelierScrollShell>
  );
}

export function AtelierSpatialProofRenderer({ block, preview }: BlockRendererProps) {
  const metrics = getMetricList(block.props, "metrics");
  const items = getFeatureList(block.props, "items");

  return (
    <AtelierScrollShell block={block} layout={block.variant} preview={preview}>
      <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Intro description={getStringProp(block.props, "description")} eyebrow="Spatial proof" inverted preview={preview} title={getStringProp(block.props, "title")} />
          <div className="relative mt-8 min-h-[150px] overflow-hidden border border-white/[0.14] bg-white/[0.08] p-5 text-left">
            {metrics.map((metric, index) => (
              <div
                className={[
                  "atelier-panel absolute inset-5 opacity-0 translate-y-4 transition-[opacity,transform] duration-500 ease-out [&.is-active]:opacity-100 [&.is-active]:translate-y-0",
                  index === 0 ? "is-active" : "",
                ].join(" ")}
                data-atelier-panel={String(index)}
                key={`${metric.value}-proof-panel-${index}`}
              >
                <p className="text-4xl font-semibold tracking-normal text-white">{metric.value}</p>
                <p className="mt-3 text-sm font-semibold text-rose-200">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-px overflow-hidden rounded-[10px] border border-white/[0.14] bg-white/[0.14]">
          {metrics.map((metric, index) => (
            <article
              className={[
                "atelier-scene grid min-h-[170px] gap-4 bg-white/[0.86] p-5 text-left text-[#111214] opacity-60 transition-[opacity,transform,background-color] duration-500 ease-out sm:grid-cols-[150px_1fr] sm:items-center",
                "[&.is-active]:bg-white [&.is-active]:opacity-100 [&.is-active]:translate-x-0 [&.is-after]:translate-x-5 [&.is-before]:opacity-35",
                sceneStateClass(index),
              ].join(" ")}
              data-atelier-scene={String(index)}
              key={`${metric.value}-${metric.label}`}
            >
              <p className="text-5xl font-semibold tracking-normal">{metric.value}</p>
              <div>
                <h3 className="text-lg font-semibold">{metric.label}</h3>
                {metric.description ? <p className="mt-2 text-sm leading-6 text-zinc-600">{metric.description}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
      {items.length > 0 ? (
        <div className="mt-10 grid gap-6 border-t border-white/[0.12] pt-8 lg:grid-cols-3">
          {items.map((item, index) => (
            <FeaturePlate dark item={item} index={index} key={`${item.title}-${index}`} preview={preview} />
          ))}
        </div>
      ) : null}
    </AtelierScrollShell>
  );
}

export function AtelierInquiryRenderer({ block, preview }: BlockRendererProps) {
  const items = getFeatureList(block.props, "items");
  const image = getImageProp(block.props, "image");

  return (
    <AtelierShell block={block} layout={block.variant} preview={preview}>
      <div className="grid overflow-hidden rounded-[10px] border border-zinc-300 bg-white shadow-[0_26px_78px_rgba(17,18,20,0.12)] lg:grid-cols-[0.98fr_1.02fr]">
        {image ? (
          <div className="relative min-h-[360px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={image.alt} className="absolute inset-0 h-full w-full object-cover" src={image.src} />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,18,20,0.04),rgba(17,18,20,0.36))]" />
          </div>
        ) : null}
        <div className="p-6 text-left sm:p-8">
          <Intro description={getStringProp(block.props, "description")} eyebrow="Inquiry" preview={preview} title={getStringProp(block.props, "title")} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {items.map((item, index) => (
              <div className={motionClass(preview, "rounded-[10px] border border-zinc-300 bg-zinc-50 p-4")} data-atelier-motion={motionState(preview)} key={`${item.title}-${index}`}>
                <p className="text-xs font-semibold text-rose-700">{item.icon ?? String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-base font-semibold text-[#111214]">{item.title}</h3>
                {item.description ? <p className="mt-2 text-sm leading-6 text-zinc-600">{item.description}</p> : null}
              </div>
            ))}
          </div>
          <ActionRow block={block} preview={preview} />
        </div>
      </div>
    </AtelierShell>
  );
}

export function AtelierFooterRenderer({ block, preview }: BlockRendererProps) {
  const links = getLinkList(block.props, "links");
  const companyName = getStringProp(block.props, "companyName") ?? "空间工作室";
  const copyright = getStringProp(block.props, "copyright");

  return (
    <AtelierShell block={block} layout={block.variant} preview={preview}>
      <footer className={motionClass(preview, "grid gap-6 text-left text-white md:grid-cols-[1fr_auto] md:items-end")} data-atelier-motion={motionState(preview)}>
        <div>
          <p className="text-3xl font-semibold">{companyName}</p>
          {copyright ? <p className="mt-3 text-sm text-zinc-400">{copyright}</p> : null}
        </div>
        {links.length > 0 ? (
          <nav className="flex flex-wrap gap-4 text-sm font-semibold text-zinc-300">
            {links.map((link) => (
              <a className="transition hover:text-rose-200" href={link.href} key={`${link.label}-${link.href}`}>
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
      </footer>
    </AtelierShell>
  );
}
