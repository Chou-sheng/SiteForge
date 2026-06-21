import Link from "next/link";
import { ArrowRight, LayoutDashboard, LibraryBig } from "lucide-react";

const entryLinks = [
  {
    href: "/dashboard",
    title: "页面管理",
    description: "查看页面、草稿和发布状态。",
    icon: LayoutDashboard
  },
  {
    href: "/templates",
    title: "模板中心",
    description: "搜索、筛选和预览整页模板。",
    icon: LibraryBig
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_16%_16%,rgba(0,196,204,0.22),transparent_30%),radial-gradient(circle_at_84%_10%,rgba(255,91,138,0.18),transparent_28%),linear-gradient(135deg,#f4fffe,#fff7fb_48%,#f6f0ff)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-6xl">
            页面工作台
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            提供模板、模块编辑、智能生成、预览、HTML 导出和发布。
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {entryLinks.map((entry) => {
            const Icon = entry.icon;

            return (
              <Link
                key={entry.href}
                href={entry.href}
                className="group rounded-[24px] border border-white bg-white/85 p-6 shadow-[0_18px_44px_rgba(16,24,40,0.09)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(16,24,40,0.14)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-600"
                  />
                </div>
                <h2 className="mt-6 text-xl font-semibold text-slate-950">{entry.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{entry.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
