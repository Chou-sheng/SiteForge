import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createDesktopPaths } from "../../desktop/src/paths";

describe("desktop paths", () => {
  it("uses packaged resources and keeps user-writable state below userData", () => {
    const paths = createDesktopPaths(
      "C:\\Program\\resources",
      "C:\\Users\\Test\\AppData\\Roaming\\SiteForge",
      true,
      "C:\\Program",
    );

    expect(paths.serverRoot).toBe(join("C:\\Program\\resources", "server"));
    expect(paths.serverEntry).toBe(join(paths.serverRoot, "server.js"));
    expect(paths.publicDirectory).toBe(join(paths.serverRoot, "public"));
    expect(paths.dataDirectory).toBe(
      "C:\\Users\\Test\\AppData\\Roaming\\SiteForge",
    );
    expect(paths.configFile).toBe(join(paths.dataDirectory, "config", "config.env"));
    expect(paths.exampleConfigFile).toBe(join("C:\\Program", "config.example.env"));
    expect(paths.logFile).toBe(join(paths.dataDirectory, "logs", "app.log"));
  });

  it("uses project build paths in development", () => {
    const paths = createDesktopPaths("unused", "D:\\UserData", false, "unused");

    expect(paths.serverRoot).toBe(join(process.cwd(), ".next", "standalone"));
    expect(paths.exampleConfigFile).toBe(join(process.cwd(), "config.example.env"));
  });
});
