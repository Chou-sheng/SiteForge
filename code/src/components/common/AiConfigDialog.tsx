"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Loader2, Settings2, XCircle } from "lucide-react";

type ConfigStatus = {
  configured: boolean;
  model: string | null;
  mode: "desktop" | "development";
};

type SaveResult = {
  configured: boolean;
  model: string | null;
  mode: "desktop" | "development";
  restartHint: string;
};

type RequestState =
  | { type: "idle"; message: string | null }
  | { type: "loading"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json() as { error?: unknown };

    return typeof body.error === "string" && body.error.trim()
      ? body.error
      : fallback;
  } catch {
    return fallback;
  }
}

export function AiConfigDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ConfigStatus | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [requestState, setRequestState] = useState<RequestState>({
    type: "idle",
    message: null,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const controller = new AbortController();

    setRequestState({ type: "loading", message: "正在读取当前配置..." });
    fetch("/api/ai/config", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await readErrorMessage(response, "读取配置失败"));
        }

        return response.json() as Promise<ConfigStatus>;
      })
      .then((nextStatus) => {
        setStatus(nextStatus);
        setModel(nextStatus.model ?? "deepseek-v4-flash");
        setRequestState({ type: "idle", message: null });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        const message = error instanceof Error ? error.message : "读取配置失败";
        setRequestState({ type: "error", message });
      });

    return () => controller.abort();
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedApiKey = apiKey.trim();
    const trimmedModel = model.trim();

    if (!trimmedModel) {
      setRequestState({ type: "error", message: "请填写模型名称" });
      return;
    }

    if (!trimmedApiKey && !status?.configured) {
      setRequestState({ type: "error", message: "请填写 API Key" });
      return;
    }

    setRequestState({ type: "loading", message: "正在校验 API Key 和模型，请稍候..." });

    try {
      const response = await fetch("/api/ai/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: trimmedApiKey || undefined,
          model: trimmedModel,
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "校验失败，配置未保存"));
      }

      const result = await response.json() as SaveResult;

      setApiKey("");
      setStatus({
        configured: result.configured,
        model: result.model,
        mode: result.mode,
      });
      setRequestState({ type: "success", message: result.restartHint });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "校验失败，配置未保存";
      setRequestState({ type: "error", message });
    }
  }

  const isBusy = requestState.type === "loading";
  const keyHelp = status?.configured
    ? "留空将沿用已保存的 API Key。"
    : "保存前会真实调用一次 DeepSeek 校验。";

  return (
    <>
      <button
        className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 shadow-[0_12px_30px_rgba(16,24,40,0.08)] transition hover:border-violet-200 hover:text-violet-700 active:translate-y-px"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Settings2 aria-hidden="true" className="h-4 w-4" />
        AI 配置
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-8 backdrop-blur-sm">
          <div
            aria-modal="true"
            className="w-full max-w-lg rounded-[24px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20">
                  <KeyRound aria-hidden="true" className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950">AI 配置</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  填写 DeepSeek API Key 和模型名称，校验通过后保存。
                </p>
              </div>
              <button
                aria-label="关闭"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-slate-300 hover:text-slate-900 active:translate-y-px"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <XCircle aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="deepseek-api-key">
                  API Key
                </label>
                <input
                  autoComplete="off"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                  disabled={isBusy}
                  id="deepseek-api-key"
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={status?.configured ? "已保存，可留空" : "sk-..."}
                  type="password"
                  value={apiKey}
                />
                <p className="text-xs leading-5 text-slate-500">{keyHelp}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="deepseek-model">
                  模型名称
                </label>
                <input
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                  disabled={isBusy}
                  id="deepseek-model"
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="deepseek-v4-flash"
                  type="text"
                  value={model}
                />
              </div>

              {requestState.message ? (
                <div
                  className={[
                    "flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm leading-6",
                    requestState.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : requestState.type === "error"
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : "border-slate-200 bg-slate-50 text-slate-700",
                  ].join(" ")}
                  role={requestState.type === "error" ? "alert" : "status"}
                >
                  {requestState.type === "success" ? (
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : requestState.type === "loading" ? (
                    <Loader2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
                  ) : null}
                  <span>{requestState.message}</span>
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-950 active:translate-y-px"
                  disabled={isBusy}
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  取消
                </button>
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800 active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-400"
                  disabled={isBusy}
                  type="submit"
                >
                  {isBusy ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
                  {isBusy ? "正在校验" : "校验并保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
