import { createHash, randomUUID } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { extname, isAbsolute, join, relative, resolve } from "node:path";

import type { EnterprisePageDocument } from "../../types/page";
import {
  exportPageToHtml,
  type StaticSiteRuntimeAssets,
} from "../export/exportHtml";
import { createSlug } from "../utils/slug";

const reservedWindowsNames = new Set([
  "CON", "PRN", "AUX", "NUL",
  "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
  "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
]);

const readableChinesePhrases: Array<[string, string]> = [
  ["产品", "chan-pin"],
  ["官网", "guan-wang"],
  ["企业", "qi-ye"],
  ["网站", "wang-zhan"],
  ["教育", "jiao-yu"],
  ["平台", "ping-tai"],
  ["科技", "ke-ji"],
  ["服务", "fu-wu"],
  ["品牌", "pin-pai"],
];

const mimeExtensions: Record<string, string> = {
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
};

const extensionMimeTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const imagePropertyNames = new Set(["src", "avatar", "imageUrl", "poster"]);
const cssUrlPattern = /url\(\s*(?:(['"])(.*?)\1|([^'"()\s][^)]*?))\s*\)/gi;

type PublishStaticSiteOptions = {
  document: EnterprisePageDocument;
  parentDirectory: string;
  publicDirectory: string;
  fetchImpl?: typeof fetch;
  maxRemoteImageBytes?: number;
  remoteImageTimeoutMs?: number;
};

type ExportStandaloneHtmlOptions = {
  document: EnterprisePageDocument;
  publicDirectory: string;
  runtime?: StaticSiteRuntimeAssets;
};

type LocalizedAsset = {
  source: string;
  filename: string;
  mimeType: string;
  bytes?: Buffer;
  localFile?: string;
};

async function pathExists(path: string) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function hashSource(source: string) {
  return createHash("sha256").update(source).digest("hex").slice(0, 20);
}

function extensionFromMime(mimeType: string) {
  return mimeExtensions[mimeType.split(";")[0].trim().toLowerCase()] ?? ".img";
}

function isAssetUrl(value: string) {
  return value.startsWith("/") || /^https?:\/\//i.test(value);
}

function collectDocumentAssetReferences(document: EnterprisePageDocument) {
  const references = new Set<string>();

  function visit(value: unknown, propertyName?: string) {
    if (typeof value === "string") {
      if (propertyName && imagePropertyNames.has(propertyName) && isAssetUrl(value)) {
        references.add(value);
      }
      for (const match of value.matchAll(cssUrlPattern)) {
        const source = (match[2] ?? match[3] ?? "").trim();
        if (isAssetUrl(source)) {
          references.add(source);
        }
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => visit(entry));
      return;
    }
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([key, entry]) => visit(entry, key));
    }
  }

  visit(document);
  return [...references];
}

function rewriteDocumentAssets(
  document: EnterprisePageDocument,
  replacements: Map<string, string>,
) {
  function visit(value: unknown): unknown {
    if (typeof value === "string") {
      let rewritten = value;
      for (const [source, replacement] of replacements) {
        rewritten = rewritten.split(source).join(replacement);
      }
      return rewritten;
    }
    if (Array.isArray(value)) {
      return value.map(visit);
    }
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [key, visit(entry)]),
      );
    }
    return value;
  }

  return visit(structuredClone(document)) as EnterprisePageDocument;
}

function safeLocalAssetPath(publicDirectory: string, source: string) {
  const parsed = new URL(source, "http://desktop.local");
  const decodedPath = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
  const absolutePath = resolve(publicDirectory, decodedPath);
  const relativePath = relative(resolve(publicDirectory), absolutePath);

  if (!relativePath || relativePath.startsWith("..") || isAbsolute(relativePath)) {
    throw new Error(`静态资源路径越界：${source}`);
  }
  return absolutePath;
}

async function downloadRemoteImage(
  initialUrl: string,
  fetchImpl: typeof fetch,
  maxBytes: number,
  timeoutMs: number,
) {
  let currentUrl = initialUrl;

  for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {
    const response = await fetchImpl(currentUrl, {
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      if (redirectCount === 3) {
        throw new Error(`网络图片重定向次数过多：${initialUrl}`);
      }
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }
    if (!response.ok) {
      throw new Error(`网络图片下载失败：${response.status} ${initialUrl}`);
    }
    const mimeType = (response.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (!mimeType.startsWith("image/")) {
      throw new Error(`网络资源不是图片：${initialUrl}`);
    }
    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      throw new Error(`网络图片超过大小限制：${initialUrl}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > maxBytes) {
      throw new Error(`网络图片超过大小限制：${initialUrl}`);
    }
    return { bytes, mimeType };
  }

  throw new Error(`网络图片下载失败：${initialUrl}`);
}

async function localizeAsset(
  source: string,
  publicDirectory: string,
  fetchImpl: typeof fetch,
  maxRemoteImageBytes: number,
  remoteImageTimeoutMs: number,
): Promise<LocalizedAsset> {
  if (/^https?:\/\//i.test(source)) {
    const downloaded = await downloadRemoteImage(
      source,
      fetchImpl,
      maxRemoteImageBytes,
      remoteImageTimeoutMs,
    );
    return {
      source,
      filename: `${hashSource(source)}${extensionFromMime(downloaded.mimeType)}`,
      mimeType: downloaded.mimeType,
      bytes: downloaded.bytes,
    };
  }

  const localFile = safeLocalAssetPath(publicDirectory, source);
  const fileStats = await stat(localFile);
  if (!fileStats.isFile()) {
    throw new Error(`静态资源不是文件：${source}`);
  }
  const extension = extname(localFile).toLowerCase() || ".img";
  return {
    source,
    filename: `${hashSource(source)}${extension}`,
    mimeType: extensionMimeTypes[extension] ?? "application/octet-stream",
    localFile,
  };
}

export async function readStaticSiteRuntime(publicDirectory: string) {
  const runtimeDirectory = join(publicDirectory, "static-runtime");
  const [script, styles] = await Promise.all([
    readFile(join(runtimeDirectory, "renderer.js"), "utf8"),
    readFile(join(runtimeDirectory, "style.css"), "utf8"),
  ]);
  return { script, styles };
}

export async function exportStandaloneHtml({
  document,
  publicDirectory,
  runtime,
}: ExportStandaloneHtmlOptions) {
  const runtimeAssets = runtime ?? (await readStaticSiteRuntime(publicDirectory));
  const replacements = new Map<string, string>();

  for (const source of collectDocumentAssetReferences(document)) {
    if (!source.startsWith("/")) {
      continue;
    }
    const localFile = safeLocalAssetPath(publicDirectory, source);
    const bytes = await readFile(localFile);
    const extension = extname(localFile).toLowerCase();
    const mimeType = extensionMimeTypes[extension] ?? "application/octet-stream";
    replacements.set(source, `data:${mimeType};base64,${bytes.toString("base64")}`);
  }

  return exportPageToHtml(rewriteDocumentAssets(document, replacements), {
    runtimeMode: "inline",
    runtime: runtimeAssets,
  });
}

export function createSafeSiteDirectoryName(titleOrSlug: string, stableId: string) {
  let readableTitle = titleOrSlug;
  for (const [phrase, replacement] of readableChinesePhrases) {
    readableTitle = readableTitle.split(phrase).join(`-${replacement}-`);
  }
  let candidate = createSlug(readableTitle).slice(0, 80).replace(/-+$/g, "");
  if (!candidate || candidate === "page" || reservedWindowsNames.has(candidate.toUpperCase())) {
    candidate = createSlug(stableId).slice(0, 80).replace(/-+$/g, "");
  }
  if (!candidate || reservedWindowsNames.has(candidate.toUpperCase())) {
    candidate = `site-${hashSource(stableId).slice(0, 10)}`;
  }
  return candidate;
}

export async function publishStaticSite({
  document,
  parentDirectory,
  publicDirectory,
  fetchImpl = fetch,
  maxRemoteImageBytes = 10 * 1024 * 1024,
  remoteImageTimeoutMs = 15_000,
}: PublishStaticSiteOptions) {
  const directoryName = createSafeSiteDirectoryName(
    document.slug ?? document.title,
    document.id,
  );
  const outputDirectory = join(parentDirectory, directoryName);
  const stagingDirectory = join(parentDirectory, `.${directoryName}.tmp-${randomUUID()}`);
  const backupDirectory = join(parentDirectory, `.${directoryName}.backup-${randomUUID()}`);
  const assetsDirectory = join(stagingDirectory, "assets");
  let existingMoved = false;
  let newInstalled = false;

  await mkdir(parentDirectory, { recursive: true });
  await rm(stagingDirectory, { recursive: true, force: true });
  await rm(backupDirectory, { recursive: true, force: true });

  try {
    await mkdir(assetsDirectory, { recursive: true });
    const runtime = await readStaticSiteRuntime(publicDirectory);
    const references = collectDocumentAssetReferences(document);
    const localizedAssets = new Map<string, LocalizedAsset>();

    for (const source of references) {
      localizedAssets.set(
        source,
        await localizeAsset(
          source,
          publicDirectory,
          fetchImpl,
          maxRemoteImageBytes,
          remoteImageTimeoutMs,
        ),
      );
    }

    const replacements = new Map<string, string>();
    for (const asset of localizedAssets.values()) {
      const destination = join(assetsDirectory, asset.filename);
      if (asset.localFile) {
        await copyFile(asset.localFile, destination);
      } else if (asset.bytes) {
        await writeFile(destination, asset.bytes);
      }
      replacements.set(asset.source, `./assets/${asset.filename}`);
    }

    await Promise.all([
      writeFile(join(assetsDirectory, "renderer.js"), runtime.script, "utf8"),
      writeFile(join(assetsDirectory, "style.css"), runtime.styles, "utf8"),
    ]);
    const localizedDocument = rewriteDocumentAssets(document, replacements);
    const html = exportPageToHtml(localizedDocument, {
      runtimeMode: "external",
      scriptPath: "./assets/renderer.js",
      stylePath: "./assets/style.css",
    });
    const stagingIndexFile = join(stagingDirectory, "index.html");
    await writeFile(stagingIndexFile, html, "utf8");
    await readFile(stagingIndexFile, "utf8");

    if (await pathExists(outputDirectory)) {
      await rename(outputDirectory, backupDirectory);
      existingMoved = true;
    }
    await rename(stagingDirectory, outputDirectory);
    newInstalled = true;
    if (existingMoved) {
      await rm(backupDirectory, { recursive: true, force: true });
      existingMoved = false;
    }

    return {
      outputDirectory,
      indexFile: join(outputDirectory, "index.html"),
      assetCount: localizedAssets.size,
    };
  } catch (error) {
    await rm(stagingDirectory, { recursive: true, force: true });
    if (newInstalled) {
      await rm(outputDirectory, { recursive: true, force: true });
    }
    if (existingMoved && (await pathExists(backupDirectory))) {
      await rename(backupDirectory, outputDirectory);
    } else {
      await rm(backupDirectory, { recursive: true, force: true });
    }
    throw error;
  }
}
