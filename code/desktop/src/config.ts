import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

const supportedDeepSeekKeys = new Set([
  "DEEPSEEK_API_KEY",
  "DEEPSEEK_MODEL",
  "DEEPSEEK_TIMEOUT_MS",
  "DEEPSEEK_MAX_TOKENS",
]);

export function parseEnvText(text: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

export function selectDeepSeekEnvironment(
  values: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).filter(([key]) => supportedDeepSeekKeys.has(key)),
  );
}

export async function ensureUserConfig(
  configFile: string,
  exampleFile: string,
): Promise<void> {
  await mkdir(dirname(configFile), { recursive: true });

  try {
    await readFile(configFile, "utf8");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
      throw error;
    }

    await copyFile(exampleFile, configFile);
  }
}

export async function readUserConfig(
  configFile: string,
): Promise<Record<string, string>> {
  return parseEnvText(await readFile(configFile, "utf8"));
}
