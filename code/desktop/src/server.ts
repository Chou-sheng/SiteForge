import { spawn, type ChildProcess } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname } from "node:path";
import { randomBytes } from "node:crypto";

type ServerEnvironmentOptions = {
  baseEnvironment: NodeJS.ProcessEnv;
  port: number;
  token: string;
  dataDirectory: string;
  publicDirectory: string;
  deepSeekEnvironment: Record<string, string>;
};

export type StartNextServerOptions = {
  serverEntry: string;
  serverRoot: string;
  publicDirectory: string;
  dataDirectory: string;
  logFile: string;
  deepSeekEnvironment: Record<string, string>;
  startupTimeoutMs?: number;
};

export type RunningNextServer = {
  origin: string;
  token: string;
  stop(): Promise<void>;
};

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function createServerEnvironment({
  baseEnvironment,
  port,
  token,
  dataDirectory,
  publicDirectory,
  deepSeekEnvironment,
}: ServerEnvironmentOptions): NodeJS.ProcessEnv {
  return {
    ...baseEnvironment,
    ...deepSeekEnvironment,
    ELECTRON_RUN_AS_NODE: "1",
    HOSTNAME: "127.0.0.1",
    PORT: String(port),
    DESKTOP_SESSION_TOKEN: token,
    DESKTOP_APP_DATA_DIR: dataDirectory,
    DESKTOP_PUBLIC_DIR: publicDirectory,
  };
}

export function findAvailableLoopbackPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("无法分配本地端口"));
        return;
      }

      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve(port);
        }
      });
    });
  });
}

async function waitForHealth(
  origin: string,
  child: ChildProcess,
  timeoutMs: number,
) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`本地服务提前退出，代码：${child.exitCode}`);
    }

    try {
      const response = await fetch(`${origin}/api/health`, {
        signal: AbortSignal.timeout(1_500),
      });
      if (response.ok) {
        const body = (await response.json()) as { ok?: unknown };
        if (body.ok === true) {
          return;
        }
      }
    } catch {
      // The server is still starting.
    }

    await delay(150);
  }

  throw new Error("本地服务启动超时");
}

async function stopChild(child: ChildProcess) {
  if (child.exitCode !== null) {
    return;
  }

  child.kill();
  const gracefulDeadline = Date.now() + 5_000;

  while (child.exitCode === null && Date.now() < gracefulDeadline) {
    await delay(100);
  }

  if (child.exitCode === null) {
    child.kill("SIGKILL");
  }
}

export async function startNextServer({
  serverEntry,
  serverRoot,
  publicDirectory,
  dataDirectory,
  logFile,
  deepSeekEnvironment,
  startupTimeoutMs = 30_000,
}: StartNextServerOptions): Promise<RunningNextServer> {
  const port = await findAvailableLoopbackPort();
  const token = randomBytes(32).toString("hex");
  const origin = `http://127.0.0.1:${port}`;
  const environment = createServerEnvironment({
    baseEnvironment: process.env,
    port,
    token,
    dataDirectory,
    publicDirectory,
    deepSeekEnvironment,
  });

  await mkdir(dirname(logFile), { recursive: true });
  const logStream = createWriteStream(logFile, { flags: "a" });
  logStream.write(`\n[${new Date().toISOString()}] Starting local server at ${origin}\n`);

  const child = spawn(process.execPath, [serverEntry], {
    cwd: serverRoot,
    env: environment,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout?.pipe(logStream, { end: false });
  child.stderr?.pipe(logStream, { end: false });

  try {
    await waitForHealth(origin, child, startupTimeoutMs);
  } catch (error) {
    await stopChild(child);
    logStream.end();
    throw error;
  }

  return {
    origin,
    token,
    async stop() {
      await stopChild(child);
      logStream.end();
    },
  };
}
