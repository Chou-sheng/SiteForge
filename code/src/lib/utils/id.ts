export function createId(prefix: string) {
  const normalizedPrefix = prefix.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  const safePrefix = normalizedPrefix.replace(/^-+|-+$/g, "") || "id";
  const randomUUID = globalThis.crypto?.randomUUID;

  if (typeof randomUUID === "function") {
    return `${safePrefix}-${randomUUID.call(globalThis.crypto)}`;
  }

  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);

  return `${safePrefix}-${timestamp}-${random}`;
}
