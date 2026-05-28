import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SelfMoney - Quản lý tài chính cá nhân thông minh",
  description: "SelfMoney là nền tảng quản lý tài chính cá nhân tối giản, thông minh, giúp bạn tự động theo dõi chi tiêu, lập kế hoạch ngân sách và phân tích xu hướng dòng tiền một cách dễ dàng và bảo mật.",
  keywords: ["quản lý tài chính", "quản lý chi tiêu", "quản lý tiền bạc", "ví cá nhân", "tiết kiệm", "ngân sách", "selfmoney"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
