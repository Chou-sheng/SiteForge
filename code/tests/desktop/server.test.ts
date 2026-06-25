import { createServer } from "node:net";

import { describe, expect, it } from "vitest";

import {
  createServerEnvironment,
  findAvailableLoopbackPort,
} from "../../desktop/src/server";

describe("desktop Next.js server", () => {
  it("creates an isolated loopback-only environment", () => {
    const environment = createServerEnvironment({
      baseEnvironment: { NODE_ENV: "test", PATH: "test-path" },
      port: 43125,
      token: "session-token",
      dataDirectory: "D:\\UserData",
      publicDirectory: "D:\\Server\\public",
      deepSeekEnvironment: { DEEPSEEK_MODEL: "model-name" },
    });

    expect(environment).toMatchObject({
      PATH: "test-path",
      ELECTRON_RUN_AS_NODE: "1",
      HOSTNAME: "127.0.0.1",
      PORT: "43125",
      DESKTOP_SESSION_TOKEN: "session-token",
      DESKTOP_APP_DATA_DIR: "D:\\UserData",
      DESKTOP_PUBLIC_DIR: "D:\\Server\\public",
      DEEPSEEK_MODEL: "model-name",
    });
  });

  it("returns a port that can be bound on loopback", async () => {
    const port = await findAvailableLoopbackPort();
    const server = createServer();

    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(port, "127.0.0.1", resolve);
    });

    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });

    expect(port).toBeGreaterThan(0);
  });
});
