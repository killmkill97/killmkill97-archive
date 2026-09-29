import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "killmkill97 — 개인 아카이브",
  description: "내가 만든 거랑 생각난 거 올리는 곳.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
      <script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" />
    </html>
  );
}
