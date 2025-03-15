import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "アプリアイデア発想ツール",
  description: "ネガティブレビューからアプリのアイデアを発想するツール",
  authors: [{ name: "Aha Studio", url: "https://aha.studio" }],
  creator: "Aha Studio",
  publisher: "Aha Studio",
  keywords: ["アプリ開発", "アイデア発想", "レビュー分析", "ユーザーフィードバック"],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <div className="flex-grow">
          {children}
        </div>
        <footer className="py-4 text-center text-sm text-gray-500 border-t">
          Created by <a href="https://aha.studio" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800 transition-colors">Aha Studio</a> with ❤️
        </footer>
      </body>
    </html>
  );
}
