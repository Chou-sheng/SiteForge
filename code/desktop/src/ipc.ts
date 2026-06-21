export type PublishResponse = {
  outputDirectory: string;
  indexFile: string;
  assetCount: number;
};

export function validatePageId(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("页面 ID 无效");
  }

  return value.trim();
}

export function assertTrustedSender(senderUrl: string, appOrigin: string): void {
  let senderOrigin: string;

  try {
    senderOrigin = new URL(senderUrl).origin;
  } catch {
    throw new Error("不受信任的桌面调用来源");
  }

  if (senderOrigin !== appOrigin) {
    throw new Error("不受信任的桌面调用来源");
  }
}

export function parsePublishResponse(value: unknown): PublishResponse {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("发布响应无效");
  }

  const response = value as Partial<PublishResponse>;
  if (
    typeof response.outputDirectory !== "string" ||
    !response.outputDirectory ||
    typeof response.indexFile !== "string" ||
    !response.indexFile ||
    typeof response.assetCount !== "number" ||
    !Number.isInteger(response.assetCount) ||
    response.assetCount < 0
  ) {
    throw new Error("发布响应无效");
  }

  return {
    outputDirectory: response.outputDirectory,
    indexFile: response.indexFile,
    assetCount: response.assetCount,
  };
}
