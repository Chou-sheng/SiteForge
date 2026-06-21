"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Eye, Search, Sparkles, Wand2, X } from "lucide-react";
import Link from "next/link";

import { PageRenderer } from "../../components/page-renderer/PageRenderer";
import { enterpriseTemplates, type EnterpriseTemplate } from "../../lib/templates/enterpriseTemplates";
import type { EnterprisePageDocument, PageRecord } from "../../types/page";

function createPageId(templateId: string) {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `page-${templateId}-${randomPart}`;
}

function cloneTemplateDocument(template: EnterprisePageDocument, templateId: string): EnterprisePageDocument {
  const timestamp = new Date().toISOString();
  const pageId = createPageId(templateId);

  return {
    ...structuredClone(template),
    id: pageId,
    slug: undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
    blocks: template.blocks.map((block, index) => ({
      ...structuredClone(block),
      id: `${pageId}-block-${index + 1}`,
    })),
  };
}

type OfficialSitePreviewConfig = {
  logo: string;
  nav: string[];
  action: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  metrics: Array<{ value: string; label: string }>;
  chips: string[];
  theme: "ai" | "education" | "travel" | "atelier";
};

const officialSitePreviewConfigs: Record<string, OfficialSitePreviewConfig> = {
  "ai-product": {
    logo: "灵澜智能",
    nav: ["AI 能力", "应用场景", "安全合规"],
    action: "预约演示",
    eyebrow: "Enterprise AI Platform",
    title: "把企业知识、流程和客户服务交给可控 AI 工作台",
    subtitle: "私有知识库、多模型编排、权限审计和业务系统连接已经准备就绪。",
    metrics: [
      { value: "30天", label: "首批场景上线" },
      { value: "12+", label: "系统连接" },
      { value: "100%", label: "权限留痕" },
    ],
    chips: ["私有知识库", "多模型编排", "安全审计", "演示预约"],
    theme: "ai",
  },
  education: {
    logo: "启明学堂",
    nav: ["课程方向", "学习路径", "学员成果"],
    action: "预约顾问",
    eyebrow: "Career Education",
    title: "把学习路径、导师反馈和作品成果讲清楚",
    subtitle: "项目制课程、阶段任务、导师陪跑和作品集沉淀构成完整招生页面。",
    metrics: [
      { value: "8周", label: "训练周期" },
      { value: "1对1", label: "导师答疑" },
      { value: "4件", label: "作品成果" },
    ],
    chips: ["课程路径", "导师反馈", "作品成果", "报名咨询"],
    theme: "education",
  },
  travel: {
    logo: "澜屿度假",
    nav: ["路线亮点", "住宿体验", "预订咨询"],
    action: "提交需求",
    eyebrow: "Destination Resort",
    title: "把山海风景、行程动线和预订理由一次讲清楚",
    subtitle: "抵达、住宿、在地体验和顾问预订组成已经上线的目的地官网。",
    metrics: [
      { value: "4天", label: "经典周期" },
      { value: "12+", label: "在地活动" },
      { value: "30分", label: "顾问响应" },
    ],
    chips: ["山海路线", "住宿体验", "在地活动", "预订咨询"],
    theme: "travel",
  },
  atelier: {
    logo: "矩域 Atelier",
    nav: ["项目", "材质", "流程"],
    action: "空间咨询",
    eyebrow: "Spatial Design Atelier",
    title: "让空间项目先被感受，再被理解",
    subtitle: "平面动线、材质秩序和项目档案构成冷调建筑空间官网。",
    metrics: [
      { value: "42", label: "落地空间" },
      { value: "8周", label: "概念深化" },
      { value: "3层", label: "空间叙事" },
    ],
    chips: ["项目索引", "材质研究", "流程轨道", "空间咨询"],
    theme: "atelier",
  },
};

const previewThemeClasses = {
  ai: {
    shell: "bg-[#070816] text-white",
    glowA: "bg-cyan-400/28",
    glowB: "bg-violet-500/32",
    button: "bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-white",
    card: "border-white/12 bg-white/10 text-white",
    muted: "text-slate-300",
    accent: "text-cyan-200",
    stage: "from-[#111827] via-[#1d1b44] to-[#0e7490]",
  },
  education: {
    shell: "bg-[#fffaf2] text-slate-950",
    glowA: "bg-orange-300/34",
    glowB: "bg-emerald-300/32",
    button: "bg-slate-950 text-white",
    card: "border-orange-100 bg-white/86 text-slate-950",
    muted: "text-slate-600",
    accent: "text-orange-700",
    stage: "from-orange-50 via-emerald-50 to-violet-50",
  },
  travel: {
    shell: "bg-[#f7fffb] text-slate-950",
    glowA: "bg-teal-300/34",
    glowB: "bg-orange-300/30",
    button: "bg-teal-700 text-white",
    card: "border-teal-100 bg-white/86 text-slate-950",
    muted: "text-slate-600",
    accent: "text-teal-700",
    stage: "from-cyan-50 via-emerald-50 to-orange-100",
  },
  atelier: {
    shell: "bg-[#f5f7f1] text-[#111214]",
    glowA: "bg-rose-700/18",
    glowB: "bg-zinc-500/24",
    button: "bg-[#d51f3f] text-white",
    card: "border-zinc-300 bg-white/86 text-[#111214]",
    muted: "text-zinc-600",
    accent: "text-rose-700",
    stage: "from-zinc-200 via-[#f8faf4] to-zinc-500",
  },
} as const;

function getTemplateChips(template: EnterpriseTemplate) {
  return officialSitePreviewConfigs[template.id]?.chips ?? template.document.siteMeta.keywords.slice(0, 4);
}

function OfficialSiteCardPreview({ template }: { template: EnterpriseTemplate }) {
  const config = officialSitePreviewConfigs[template.id] ?? officialSitePreviewConfigs["ai-product"];
  const classes = previewThemeClasses[config.theme];

  return (
    <div
      aria-label={`${template.name}已发布官网首屏预览`}
      className={`relative h-full overflow-hidden ${classes.shell}`}
      data-testid="official-site-card-preview"
      role="img"
    >
      <div className={`absolute -left-16 -top-20 h-56 w-56 rounded-full blur-3xl ${classes.glowA}`} />
      <div className={`absolute right-0 top-2 h-48 w-48 rounded-full blur-3xl ${classes.glowB}`} />

      <div className="relative mx-auto flex h-full w-full max-w-[880px] flex-col px-5 py-4">
        <nav className="flex items-center justify-between gap-4 text-[11px] font-semibold">
          <span className="text-base font-black tracking-normal">{config.logo}</span>
          <div className={`hidden items-center gap-4 md:flex ${classes.muted}`}>
            {config.nav.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <span className={`rounded-md px-3 py-1.5 shadow-sm ${classes.button}`}>{config.action}</span>
        </nav>

        <div className="grid flex-1 items-center gap-5 py-4 md:grid-cols-[0.95fr_1.05fr]">
          <div className="min-w-0">
            <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${classes.accent}`}>{config.eyebrow}</p>
            <h3 className="mt-3 max-w-[360px] text-2xl font-black leading-tight tracking-normal">{config.title}</h3>
            <p className={`mt-3 max-w-[360px] text-xs leading-5 ${classes.muted}`}>{config.subtitle}</p>
            <div className="mt-4 grid max-w-[390px] grid-cols-3 gap-2">
              {config.metrics.map((metric) => (
                <div className={`rounded-md border p-2 shadow-sm ${classes.card}`} key={`${metric.value}-${metric.label}`}>
                  <p className="text-lg font-black leading-none">{metric.value}</p>
                  <p className={`mt-1 text-[10px] font-semibold ${classes.muted}`}>{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`relative min-h-[172px] overflow-hidden rounded-lg border shadow-2xl ${classes.card}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${classes.stage}`} />
            <div className="absolute left-5 top-5 h-24 w-36 rounded-md border border-white/70 bg-white/80 shadow-xl">
              <div className="h-8 rounded-t-md bg-slate-950/85" />
              <div className="grid gap-2 p-3">
                <span className="h-2 w-20 rounded-full bg-slate-900/70" />
                <span className="h-2 w-28 rounded-full bg-slate-400/50" />
                <span className="h-2 w-16 rounded-full bg-slate-400/40" />
              </div>
            </div>
            <div className="absolute bottom-5 right-5 grid w-40 gap-2 rounded-md border border-white/70 bg-white/82 p-3 shadow-xl">
              <div className="flex gap-2">
                <span className="h-6 flex-1 rounded-md bg-cyan-400" />
                <span className="h-6 flex-1 rounded-md bg-violet-500" />
                <span className="h-6 flex-1 rounded-md bg-orange-400" />
              </div>
              <span className="h-2 w-28 rounded-full bg-slate-900/70" />
              <span className="h-2 w-20 rounded-full bg-slate-400/50" />
            </div>
            <div className="absolute inset-x-8 bottom-8 h-px bg-white/70" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeType, setActiveType] = useState("全部");
  const [status, setStatus] = useState<string | null>(null);
  const previewTemplate = enterpriseTemplates.find((item) => item.id === previewTemplateId) ?? null;
  const templateTypes = ["全部", ...enterpriseTemplates.map((template) => template.pageType)];
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredTemplates = enterpriseTemplates.filter((template) => {
    const matchesType = activeType === "全部" || template.pageType === activeType;
    const haystack = `${template.name} ${template.description} ${template.pageType} ${template.document.siteMeta.keywords.join(" ")}`.toLowerCase();
    const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);

    return matchesType && matchesSearch;
  });

  async function handleUseTemplate(templateId: string) {
    const template = enterpriseTemplates.find((item) => item.id === templateId);

    if (!template) {
      setStatus("模板不存在，请刷新后重试");
      return;
    }

    setCreatingTemplateId(templateId);
    setStatus(null);

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cloneTemplateDocument(template.document, template.id)),
      });

      if (!response.ok) {
        throw new Error("创建失败");
      }

      const record = (await response.json()) as PageRecord;
      router.push(`/editor/${record.id}`);
    } catch {
      setStatus("页面创建失败，请稍后重试");
    } finally {
      setCreatingTemplateId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8ff] text-slate-950">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="overflow-hidden rounded-[28px] border border-white/70 bg-[radial-gradient(circle_at_12%_18%,rgba(0,196,204,0.2),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(255,91,138,0.18),transparent_28%),linear-gradient(135deg,#f4fffe,#fff7fb_48%,#f6f0ff)] px-5 py-5 shadow-[0_24px_70px_rgba(16,24,40,0.10)] sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white"
              href="/dashboard"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              返回控制台
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              智能页面生成
            </div>
          </div>

          <div className="mt-10 max-w-3xl">
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-normal sm:text-6xl">模板中心</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              提供模板搜索、类型筛选、整页预览和页面创建。
            </p>
          </div>

          <div className="mt-8 grid gap-3 rounded-[22px] border border-white/80 bg-white/82 p-3 shadow-xl shadow-violet-200/20 backdrop-blur md:grid-cols-[1fr_auto]">
            <label className="flex min-h-12 items-center gap-3 rounded-2xl bg-slate-50 px-4 text-sm text-slate-500">
              <Search aria-hidden="true" className="h-4 w-4 text-slate-400" />
              <input
                aria-label="搜索模板"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="搜索模板名称、类型或关键词"
                value={searchTerm}
              />
            </label>
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-pink-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20" type="button">
              <Wand2 aria-hidden="true" className="h-4 w-4" />
              开始创作
            </button>
          </div>
        </header>

        {status ? (
          <p className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{status}</p>
        ) : null}

        {previewTemplate ? (
          <section className="overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_20px_55px_rgba(16,24,40,0.10)]" data-testid="template-preview">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">模板预览</p>
                <h2 className="mt-1 text-lg font-semibold">{previewTemplate.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-violet-600 to-pink-500 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={creatingTemplateId !== null}
                  onClick={() => handleUseTemplate(previewTemplate.id)}
                  type="button"
                >
                  <Check aria-hidden="true" className="h-4 w-4" />
                  {creatingTemplateId === previewTemplate.id ? "正在创建" : "用这个模板开始编辑"}
                </button>
                <button
                  aria-label="关闭模板预览"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                  onClick={() => setPreviewTemplateId(null)}
                  type="button"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto bg-slate-100/80 p-4">
              <PageRenderer
                className="mx-auto max-w-[1120px] overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm"
                document={previewTemplate.document}
                mode="editor"
              />
            </div>
          </section>
        ) : null}

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {templateTypes.map((type) => (
                <button
                  className={[
                    "h-10 rounded-full border px-4 text-sm font-semibold transition",
                    activeType === type
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-white bg-white text-slate-600 shadow-sm hover:border-violet-200 hover:text-violet-700",
                  ].join(" ")}
                  key={type}
                  onClick={() => setActiveType(type)}
                  type="button"
                >
                  {type}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500">{filteredTemplates.length} 个精选模板</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {filteredTemplates.map((template) => (
            <article className="group overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_18px_44px_rgba(16,24,40,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(16,24,40,0.14)]" key={template.id}>
              <div className="relative h-64 overflow-hidden bg-slate-100">
                <OfficialSiteCardPreview template={template} />
              </div>
              <div className="flex min-h-64 flex-col p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{template.pageType}</span>
                  <span className="text-xs font-medium text-slate-500">{template.document.blocks.length} 个区块</span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-normal">{template.name}</h2>
                <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{template.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {getTemplateChips(template).map((label) => (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600" key={label}>
                      {label}
                    </span>
                  ))}
                </div>
              <button
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                disabled={creatingTemplateId !== null}
                onClick={() => {
                  setStatus(null);
                  setPreviewTemplateId(template.id);
                }}
                type="button"
              >
                <Eye aria-hidden="true" className="h-4 w-4" />
                预览模板
              </button>
              </div>
            </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
