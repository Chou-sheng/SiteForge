import { Loader2 } from "lucide-react";

type LoadingStateProps = {
  title: string;
  description?: string;
  className?: string;
};

export function LoadingState({ title, description, className }: LoadingStateProps) {
  return (
    <div
      className={[
        "flex min-h-32 flex-col items-center justify-center gap-3 border border-slate-200 bg-white px-4 py-6 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
    >
      <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-slate-500" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description ? <p className="text-xs leading-5 text-slate-500">{description}</p> : null}
      </div>
    </div>
  );
}
