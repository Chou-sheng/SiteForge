import Link from "next/link";
import { notFound } from "next/navigation";

import { PageRenderer } from "../../../components/page-renderer/PageRenderer";
import { getPageById } from "../../../lib/db/pageStore";

type PreviewPageProps = {
  params: Promise<{
    pageId: string;
  }>;
};

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { pageId } = await params;
  const record = await getPageById(pageId);

  if (!record) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4 text-sm">
        <span className="font-medium">预览：{record.document.title}</span>
        <Link className="font-medium text-slate-600 hover:text-slate-950" href={`/editor/${record.id}`}>
          返回编辑
        </Link>
      </header>
      <PageRenderer document={record.document} mode="view" />
    </main>
  );
}
