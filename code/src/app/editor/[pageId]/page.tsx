import { EditorShell } from "../../../components/editor/EditorShell";

type EditorPageProps = {
  params: Promise<{
    pageId: string;
  }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const { pageId } = await params;

  return <EditorShell pageId={pageId} />;
}
