export {};

declare global {
  interface Window {
    desktopApi?: {
      publishSite(
        pageId: string,
      ): Promise<
        | { canceled: true }
        | { canceled: false; outputDirectory: string }
      >;
      getAppInfo(): Promise<{
        version: string;
        userDataDirectory: string;
      }>;
      openUserDataDirectory(): Promise<void>;
    };
  }
}
