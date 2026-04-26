import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 會議記錄小幫手 – 逐字稿與重點摘要",
  description: "上傳會議錄音或錄影檔案，AI 自動生成逐字稿、待辦項目與重點摘要",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
