import { join } from "node:path";

export type DesktopPaths = {
  serverRoot: string;
  serverEntry: string;
  publicDirectory: string;
  dataDirectory: string;
  configFile: string;
  exampleConfigFile: string;
  logFile: string;
};

export function createDesktopPaths(
  resourcesPath: string,
  userDataPath: string,
  isPackaged: boolean,
  executableDirectory: string,
): DesktopPaths {
  const serverRoot = isPackaged
    ? join(resourcesPath, "server")
    : join(process.cwd(), ".next", "standalone");

  return {
    serverRoot,
    serverEntry: join(serverRoot, "server.js"),
    publicDirectory: join(serverRoot, "public"),
    dataDirectory: userDataPath,
    configFile: join(userDataPath, "config", "config.env"),
    exampleConfigFile: isPackaged
      ? join(executableDirectory, "config.example.env")
      : join(process.cwd(), "config.example.env"),
    logFile: join(userDataPath, "logs", "app.log"),
  };
}
