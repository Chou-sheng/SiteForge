import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPageById, publishPage } from "../../src/lib/db/pageStore";
import { publishStaticSite } from "../../src/lib/publish/staticSitePublisher";

vi.mock("../../src/lib/db/pageStore", () => ({
  getPageById: vi.fn(),
  publishPage: vi.fn(),
}));

vi.mock("../../src/lib/publish/staticSitePublisher", () => ({
  publishStaticSite: vi.fn(),
}));

import { POST } from "../../src/app/api/desktop/publish/route";

const mockedGetPageById = vi.mocked(getPageById);
const mockedPublishPage = vi.mocked(publishPage);
const mockedPublishStaticSite = vi.mocked(publishStaticSite);

function request(
  body: unknown,
  token: string | null = "desktop-token",
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token !== null) {
    headers["x-desktop-token"] = token;
  }

  return new Request("http://localhost/api/desktop/publish", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("desktop publish route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DESKTOP_SESSION_TOKEN = "desktop-token";
    process.env.DESKTOP_PUBLIC_DIR = "D:\\DesktopServer\\public";
  });

  it.each([null, "wrong-token"])(
    "rejects an invalid desktop token",
    async (token) => {
      const response = await POST(
        request({ pageId: "page-1", parentDirectory: "D:\\Sites" }, token),
      );

      expect(response.status).toBe(401);
      expect(mockedGetPageById).not.toHaveBeenCalled();
    },
  );

  it("rejects invalid publish parameters", async () => {
    const response = await POST(
      request({ pageId: " ", parentDirectory: "D:\\Sites" }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 404 for a missing page", async () => {
    mockedGetPageById.mockResolvedValue(null);

    const response = await POST(
      request({ pageId: "missing", parentDirectory: "D:\\Sites" }),
    );

    expect(response.status).toBe(404);
  });

  it("publishes static files before marking the page published", async () => {
    const document = { id: "page-1", title: "Demo" };
    mockedGetPageById.mockResolvedValue({ document } as never);
    mockedPublishStaticSite.mockResolvedValue({
      outputDirectory: "D:\\Sites\\demo",
      indexFile: "D:\\Sites\\demo\\index.html",
      assetCount: 2,
    });
    mockedPublishPage.mockResolvedValue({ id: "page-1" } as never);

    const response = await POST(
      request({ pageId: "page-1", parentDirectory: "D:\\Sites" }),
    );

    expect(response.status).toBe(200);
    expect(mockedPublishStaticSite).toHaveBeenCalledWith(
      expect.objectContaining({
        document,
        parentDirectory: "D:\\Sites",
        publicDirectory: "D:\\DesktopServer\\public",
      }),
    );
    expect(mockedPublishPage).toHaveBeenCalledWith("page-1");
    await expect(response.json()).resolves.toEqual({
      outputDirectory: "D:\\Sites\\demo",
      indexFile: "D:\\Sites\\demo\\index.html",
      assetCount: 2,
    });
  });

  it("does not mark the page published when file generation fails", async () => {
    mockedGetPageById.mockResolvedValue({
      document: { id: "page-1", title: "Demo" },
    } as never);
    mockedPublishStaticSite.mockRejectedValue(new Error("download failed"));

    const response = await POST(
      request({ pageId: "page-1", parentDirectory: "D:\\Sites" }),
    );

    expect(response.status).toBe(500);
    expect(mockedPublishPage).not.toHaveBeenCalled();
  });
});
