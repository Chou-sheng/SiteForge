const DEFAULT_DEEPSEEK_TIMEOUT_MS = 12_000;
const DEFAULT_DEEPSEEK_MAX_TOKENS = 8_192;

function getDeepSeekTimeoutMs() {
  const configuredTimeout = Number(process.env.DEEPSEEK_TIMEOUT_MS);

  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_DEEPSEEK_TIMEOUT_MS;
}

export async function requestDeepSeekCompletion(apiKey: string, body: unknown): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getDeepSeekTimeoutMs());
  const configuredMaxTokens = Number(process.env.DEEPSEEK_MAX_TOKENS);
  const maxTokens =
    Number.isFinite(configuredMaxTokens) && configuredMaxTokens > 0
      ? configuredMaxTokens
      : DEFAULT_DEEPSEEK_MAX_TOKENS;

  try {
    return await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        max_tokens: maxTokens,
        ...(
          typeof body === "object" && body !== null && !Array.isArray(body)
            ? body
            : { input: body }
        ),
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
