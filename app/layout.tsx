import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "USACO Lab · 铜组升银组",
  description: "用 3D 可视化理解算法，练习官方铜组常规赛真题。",
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
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
