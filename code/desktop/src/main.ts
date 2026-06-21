import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  shell,
  type IpcMainInvokeEvent,
} from "electron";

import {
  ensureUserConfig,
  readUserConfig,
  selectDeepSeekEnvironment,
} from "./config";
import {
  assertTrustedSender,
  parsePublishResponse,
  validatePageId,
} from "./ipc";
import { createDesktopPaths, type DesktopPaths } from "./paths";
import { startNextServer, type RunningNextServer } from "./server";

const displayName = "站点工坊 SiteForge";
const userDataDirectoryName = "SiteForge";

app.setName(displayName);
app.setPath("userData", join(app.getPath("appData"), userDataDirectoryName));

let mainWindow: BrowserWindow | null = null;
let runningServer: RunningNextServer | null = null;
let desktopPaths: DesktopPaths | null = null;
let stopping = false;

async function writeLog(message: string) {
  if (!desktopPaths) {
    return;
  }

  await mkdir(dirname(desktopPaths.logFile), { recursive: true });
  await appendFile(
    desktopPaths.logFile,
    "[" + new Date().toISOString() + "] " + message + "\n",
    "utf8",
  );
}

function assertEventOrigin(event: IpcMainInvokeEvent) {
  if (!runningServer) {
    throw new Error("本地服务尚未启动");
  }

  const senderUrl = event.senderFrame?.url ?? event.sender.getURL();
  assertTrustedSender(senderUrl, runningServer.origin);
}

function registerIpcHandlers() {
  ipcMain.handle("desktop:get-app-info", async (event) => {
    assertEventOrigin(event);
    return {
      version: app.getVersion(),
      userDataDirectory: app.getPath("userData"),
    };
  });

  ipcMain.handle("desktop:open-user-data", async (event) => {
    assertEventOrigin(event);
    const errorMessage = await shell.openPath(app.getPath("userData"));
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  });

  ipcMain.handle("desktop:publish-site", async (event, rawPageId) => {
    assertEventOrigin(event);
    if (!runningServer || !desktopPaths) {
      throw new Error("桌面服务尚未准备完成");
    }

    const pageId = validatePageId(rawPageId);
    const ownerWindow = BrowserWindow.fromWebContents(event.sender);
    const dialogOptions = {
      title: "选择静态站点发布位置",
      buttonLabel: "发布到这里",
      properties: ["openDirectory", "createDirectory"] as Array<
        "openDirectory" | "createDirectory"
      >,
    };
    const selection = ownerWindow
      ? await dialog.showOpenDialog(ownerWindow, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions);

    if (selection.canceled || selection.filePaths.length === 0) {
      return { canceled: true as const };
    }

    const response = await fetch(
      runningServer.origin + "/api/desktop/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-desktop-token": runningServer.token,
        },
        body: JSON.stringify({
          pageId,
          parentDirectory: selection.filePaths[0],
        }),
      },
    );

    const body = (await response.json()) as unknown;
    if (!response.ok) {
      const message =
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "string"
          ? body.error
          : "静态站点发布失败";
      throw new Error(message);
    }

    const result = parsePublishResponse(body);
    const openError = await shell.openPath(result.outputDirectory);
    if (openError) {
      await writeLog("Published site but failed to open directory: " + openError);
    }

    return {
      canceled: false as const,
      outputDirectory: result.outputDirectory,
    };
  });
}

function createMainWindow(origin: string) {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1180,
    minHeight: 720,
    show: false,
    backgroundColor: "#f7f8ff",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once("ready-to-show", () => window.show());
  window.on("closed", () => {
    if (mainWindow === window) {
      mainWindow = null;
    }
  });

  window.webContents.on("will-navigate", (event, url) => {
    try {
      assertTrustedSender(url, origin);
    } catch {
      event.preventDefault();
      if (url.startsWith("http://") || url.startsWith("https://")) {
        void shell.openExternal(url);
      }
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  void window.loadURL(origin);
  return window;
}

async function initializeDesktopApp() {
  desktopPaths = createDesktopPaths(
    process.resourcesPath,
    app.getPath("userData"),
    app.isPackaged,
    dirname(process.execPath),
  );
  await ensureUserConfig(
    desktopPaths.configFile,
    desktopPaths.exampleConfigFile,
  );
  const deepSeekEnvironment = selectDeepSeekEnvironment(
    await readUserConfig(desktopPaths.configFile),
  );

  runningServer = await startNextServer({
    serverEntry: desktopPaths.serverEntry,
    serverRoot: desktopPaths.serverRoot,
    publicDirectory: desktopPaths.publicDirectory,
    dataDirectory: desktopPaths.dataDirectory,
    logFile: desktopPaths.logFile,
    deepSeekEnvironment,
  });

  registerIpcHandlers();
  mainWindow = createMainWindow(runningServer.origin);
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  app.whenReady().then(initializeDesktopApp).catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    await writeLog("Desktop startup failed: " + message).catch(() => undefined);
    dialog.showErrorBox(
      `${displayName} 启动失败`,
      message + "\n\n日志目录：" + app.getPath("userData"),
    );
    app.quit();
  });
}

app.on("activate", () => {
  if (!mainWindow && runningServer) {
    mainWindow = createMainWindow(runningServer.origin);
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", (event) => {
  if (!runningServer || stopping) {
    return;
  }

  event.preventDefault();
  stopping = true;
  const server = runningServer;
  runningServer = null;
  void server.stop().finally(() => app.quit());
});
