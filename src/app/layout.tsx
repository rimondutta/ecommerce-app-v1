import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
});

export const metadata: Metadata = {
  title: {
    default: "Flex Wear — Simple. Stylish.",
    template: "%s | Flex Wear"
  },
  description:
    "Redefining casual wear with simple, stylish, and premium garments. Explore the Flex Wear collection.",
  openGraph: {
    title: "Flex Wear — Simple. Stylish.",
    description:
      "Redefining casual wear with simple, stylish, and premium garments. Explore the Flex Wear collection.",
    type: "website",
    locale: "en_US",
    siteName: "Flex Wear",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flex Wear — Simple. Stylish.",
    description: "Redefining casual wear with simple, stylish, and premium garments.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} data-scroll-behavior="smooth">
      <body className="relative min-h-screen flex flex-col font-sans" suppressHydrationWarning>
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
