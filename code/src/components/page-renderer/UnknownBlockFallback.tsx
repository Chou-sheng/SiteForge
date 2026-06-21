type UnknownBlockFallbackProps = {
  type: string;
};

export function UnknownBlockFallback({ type }: UnknownBlockFallbackProps) {
  return (
    <section className="border border-dashed border-amber-300 bg-amber-50 px-6 py-4 text-sm text-amber-900">
      未知模块：{type}
    </section>
  );
}
