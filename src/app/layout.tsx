import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeetLink - 이벤트 참여자 LinkedIn 교환",
  description: "네트워킹 이벤트에서 LinkedIn을 쉽게 교환하고, 놓친 연락처를 찾아보세요.",
  keywords: ["networking", "linkedin", "event", "meetlink", "네트워킹", "이벤트"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} antialiased bg-white min-h-screen`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
