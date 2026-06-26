import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";

export type DeepSeekConfig = {
  apiKey: string;
  model: string;
};

export type DeepSeekConfigStatus = {
  configured: boolean;
  model: string | null;
  configPath: string;
  mode: "desktop" | "development";
};

const deepSeekConfigKeys = ["DEEPSEEK_API_KEY", "DEEPSEEK_MODEL"] as const;

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function parseEnvText(text: string): Record<string, string> {
  const values: Record<string, string> = {};

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
      values[key] = value;
    }
  }

  return values;
}

function quoteEnvValue(value: string) {
  const normalized = value.replace(/[\r\n]/g, "").trim();

  return /[\s#"'=]/.test(normalized)
    ? JSON.stringify(normalized)
    : normalized;
}

function mergeEnvText(text: string, values: Record<(typeof deepSeekConfigKeys)[number], string>) {
  const remainingKeys = new Set<string>(deepSeekConfigKeys);
  const lines = text ? text.split(/\r?\n/) : [];
  const mergedLines = lines.map((rawLine) => {
    const trimmedLine = rawLine.trim();
    const separatorIndex = trimmedLine.indexOf("=");

    if (!trimmedLine || trimmedLine.startsWith("#") || separatorIndex <= 0) {
      return rawLine;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();

    if (!deepSeekConfigKeys.includes(key as (typeof deepSeekConfigKeys)[number])) {
      return rawLine;
    }

    remainingKeys.delete(key);
    return `${key}=${quoteEnvValue(values[key as (typeof deepSeekConfigKeys)[number]])}`;
  });
  const additions = [...remainingKeys].map((key) => (
    `${key}=${quoteEnvValue(values[key as (typeof deepSeekConfigKeys)[number]])}`
  ));
  const nextLines = [...mergedLines.filter((line, index) => line || index < mergedLines.length - 1), ...additions];

  return `${nextLines.join("\n")}\n`;
}

function getConfigPath() {
  const desktopDataDirectory = process.env.DESKTOP_APP_DATA_DIR;

  return desktopDataDirectory
    ? {
        path: join(desktopDataDirectory, "config", "config.env"),
        mode: "desktop" as const,
      }
    : {
        path: join(process.cwd(), ".env.local"),
        mode: "development" as const,
      };
}

async function readConfigFile(configPath: string) {
  try {
    return await readFile(configPath, "utf8");
  } catch (error) {
    if (isMissingFileError(error)) {
      return "";
    }

    throw error;
  }
}

export async function getDeepSeekConfigStatus(): Promise<DeepSeekConfigStatus> {
  const configPath = getConfigPath();
  const configText = await readConfigFile(configPath.path);
  const values = {
    ...process.env,
    ...parseEnvText(configText),
  };
  const apiKey = typeof values.DEEPSEEK_API_KEY === "string" ? values.DEEPSEEK_API_KEY.trim() : "";
  const model = typeof values.DEEPSEEK_MODEL === "string" ? values.DEEPSEEK_MODEL.trim() : "";

  return {
    configured: Boolean(apiKey && model),
    model: model || null,
    configPath: configPath.path,
    mode: configPath.mode,
  };
}

export async function readDeepSeekConfig(): Promise<DeepSeekConfig | null> {
  const configPath = getConfigPath();
  const configText = await readConfigFile(configPath.path);
  const values = {
    ...process.env,
    ...parseEnvText(configText),
  };
  const apiKey = typeof values.DEEPSEEK_API_KEY === "string" ? values.DEEPSEEK_API_KEY.trim() : "";
  const model = typeof values.DEEPSEEK_MODEL === "string" ? values.DEEPSEEK_MODEL.trim() : "";

  return apiKey && model ? { apiKey, model } : null;
}

export async function writeDeepSeekConfig(config: DeepSeekConfig): Promise<DeepSeekConfigStatus> {
  const configPath = getConfigPath();
  const currentText = await readConfigFile(configPath.path);
  const nextText = mergeEnvText(currentText, {
    DEEPSEEK_API_KEY: config.apiKey,
    DEEPSEEK_MODEL: config.model,
  });

  await mkdir(dirname(configPath.path), { recursive: true });
  await writeFile(configPath.path, nextText, "utf8");

  return getDeepSeekConfigStatus();
}
