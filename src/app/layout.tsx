import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import SearchProvider from "@/components/providers/SearchProvider";
import GlobalUI from "@/components/layout/GlobalUI";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import LenisProvider from "@/components/providers/LenisProvider";
import Preloader from "@/components/ui/Preloader";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "AVANT GARDE — Wear the Silence",
    template: "%s | AVANT GARDE"
  },
  description:
    "Brutalist minimalism for the modern ascetic. Stripped of excess, leaving only structure and intent.",
  openGraph: {
    title: "AVANT GARDE — Wear the Silence",
    description:
      "Brutalist minimalism for the modern ascetic. Stripped of excess, leaving only structure and intent.",
    type: "website",
    locale: "en_US",
    siteName: "AVANT GARDE",
  },
  twitter: {
    card: "summary_large_image",
    title: "AVANT GARDE — Wear the Silence",
    description: "Brutalist minimalism for the modern ascetic.",
  },
};

import GlobalBackgroundWrapper from "@/components/3d/GlobalBackgroundWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`} data-scroll-behavior="smooth">
      <body className="relative min-h-screen flex flex-col font-sans bg-[#0a0a0a] text-[#e5e2e1]" suppressHydrationWarning>
        <GlobalBackgroundWrapper />
        <div className="noise-overlay" />
        <div className="scanline" />
        <Preloader />
        <LenisProvider>
          <CustomCursor />
          <NextAuthProvider>
            <WishlistProvider>
              <CartProvider>
                <SearchProvider>
                  {children}
                  <GlobalUI />
                </SearchProvider>
              </CartProvider>
            </WishlistProvider>
          </NextAuthProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
