import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import Toast from "@/components/common/Toast";
import ChatWidget from "@/components/GuestChat/ChatWidget";
import CartProviderWrapper from "@/components/providers/CartProviderWrapper";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import SiteHeaderConditional from "@/components/SiteHeader/SiteHeaderConditional";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NCafe · 커피 한 잔에 담은 따뜻한 이야기",
  description:
    "스페셜티 원두로 정성껏 내린 커피와 신선한 브런치. NCafe에서 당신만의 특별한 시간을 보내세요.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`}>
        <Toast />
        <SiteSettingsProvider>
          <CartProviderWrapper>
            <SiteHeaderConditional />
            {children}
            <ChatWidget />
          </CartProviderWrapper>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
