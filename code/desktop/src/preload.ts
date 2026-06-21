import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("desktopApi", {
  publishSite(pageId: string) {
    return ipcRenderer.invoke("desktop:publish-site", pageId);
  },
  getAppInfo() {
    return ipcRenderer.invoke("desktop:get-app-info");
  },
  openUserDataDirectory() {
    return ipcRenderer.invoke("desktop:open-user-data");
  },
});
