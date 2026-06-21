import { describe, expect, it } from "vitest";

import { GET } from "../../src/app/api/health/route";

describe("desktop health route", () => {
  it("returns a minimal healthy response without configuration", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
