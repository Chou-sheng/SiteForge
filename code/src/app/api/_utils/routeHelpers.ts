import { NextResponse } from "next/server";

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new SyntaxError("Invalid JSON");
  }
}

export function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function isMissingPageError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("页面不存在");
}

export function isDuplicatePageError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("页面已存在");
}

export function isMismatchedPageIdError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("页面 ID 不一致");
}
