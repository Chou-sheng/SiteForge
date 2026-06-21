import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "页面工作台",
  description: "模板、模块编辑、智能生成、预览、HTML 导出和发布"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
