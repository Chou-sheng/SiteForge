import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Copy, FilePlus2, Home, LayoutDashboard, LibraryBig, PencilLine, Sparkles, Trash2 } from "lucide-react";

import { createBlankPage, deletePage, duplicatePage, listPages, renamePage } from "../../lib/db/pageStore";
import type { PageRecord } from "../../types/page";

export const dynamic = "force-dynamic";

function statusLabel(status: PageRecord["status"]) {
  return status === "PUBLISHED" ? "已发布" : "草稿";
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(new Date(value));
}

async function createBlankPageAction() {
  "use server";

  const record = await createBlankPage();

  revalidatePath("/dashboard");
  redirect(`/editor/${record.id}`);
}

async function renamePageAction(formData: FormData) {
  "use server";

  const pageId = String(formData.get("pageId") ?? "");
  const title = String(formData.get("title") ?? "");

  await renamePage(pageId, title);
  revalidatePath("/dashboard");
}

async function duplicatePageAction(formData: FormData) {
  "use server";

  const pageId = String(formData.get("pageId") ?? "");
  const record = await duplicatePage(pageId);

  revalidatePath("/dashboard");
  redirect(`/editor/${record.id}`);
}

async function deletePageAction(formData: FormData) {
  "use server";

  const pageId = String(formData.get("pageId") ?? "");
  await deletePage(pageId);
  revalidatePath("/dashboard");
}

export default async function DashboardPage() {
  const pages = await listPages();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(0,196,204,0.22),transparent_30%),radial-gradient(circle_at_82%_4%,rgba(139,92,246,0.18),transparent_26%),radial-gradient(circle_at_78%_62%,rgba(249,115,22,0.16),transparent_28%),linear-gradient(135deg,#f7f8ff_0%,#ecfeff_38%,#fff7ed_72%,#f5f3ff_100%)] text-slate-950">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white bg-white/82 p-6 shadow-[0_18px_44px_rgba(16,24,40,0.08)] backdrop-blur">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">页面管理</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              页面名称、类型、状态和更新时间。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700"
              href="/"
            >
              <Home aria-hidden="true" className="h-4 w-4" />
              返回首页
            </Link>
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700"
              href="/templates"
            >
              <LibraryBig aria-hidden="true" className="h-4 w-4" />
              模板中心
            </Link>
            <form action={createBlankPageAction}>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-full border border-transparent bg-gradient-to-r from-cyan-500 via-violet-600 to-pink-500 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:brightness-105"
                type="submit"
              >
                <FilePlus2 aria-hidden="true" className="h-4 w-4" />
                新建页面
              </button>
            </form>
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700"
              href="/templates?mode=ai"
            >
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              智能创建页面
            </Link>
          </div>
        </header>

        <section className="overflow-hidden rounded-[24px] border border-white bg-white/85 shadow-[0_18px_44px_rgba(16,24,40,0.08)] backdrop-blur">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <LayoutDashboard aria-hidden="true" className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold">页面列表</h2>
          </div>

          {pages.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-semibold">暂无页面</p>
              <p className="mt-2 text-sm text-slate-500">可新建空白页面，或从模板中心选择模板。</p>
            </div>
          ) : (
            <div className="grid gap-3 p-4">
              {pages.map((page) => (
                <article
                  className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 md:grid-cols-[minmax(0,1fr)_auto]"
                  key={page.id}
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold">{page.document.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span>类型：{page.document.siteMeta.industry}</span>
                      <span>状态：{statusLabel(page.status)}</span>
                      <span>更新时间：{formatUpdatedAt(page.updatedAt)}</span>
                    </div>
                    <form action={renamePageAction} className="mt-3 flex max-w-xl flex-wrap items-center gap-2">
                      <input name="pageId" type="hidden" value={page.id} />
                      <label className="sr-only" htmlFor={`rename-page-${page.id}`}>
                        页面名称
                      </label>
                      <input
                        className="h-9 min-w-[220px] flex-1 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                        defaultValue={page.document.title}
                        id={`rename-page-${page.id}`}
                        name="title"
                        type="text"
                      />
                      <button
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700"
                        type="submit"
                      >
                        <PencilLine aria-hidden="true" className="h-4 w-4" />
                        重命名
                      </button>
                    </form>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      className="inline-flex h-9 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                      href={`/editor/${page.id}`}
                    >
                      继续编辑
                    </Link>
                    <form action={duplicatePageAction}>
                      <input name="pageId" type="hidden" value={page.id} />
                      <button
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700"
                        type="submit"
                      >
                        <Copy aria-hidden="true" className="h-4 w-4" />
                        复制页面
                      </button>
                    </form>
                    <form action={deletePageAction}>
                      <input name="pageId" type="hidden" value={page.id} />
                      <button
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-50"
                        type="submit"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        删除页面
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
