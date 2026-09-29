import type { Metadata } from "next";
import { MathJaxLoader } from "@/components/mathjax-loader";
import "./globals.css";

export const metadata: Metadata = {
  title: "killmkill97의 개인 사이트",
  description: "killmkill97의 개인 창작물과 생각을 모아두는 곳.",
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
      <body className="antialiased">
        <MathJaxLoader />
        {children}
      </body>
    </html>
  );
}
