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

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Ecomus — Modern Fashion Store",
    template: "%s | Ecomus"
  },
  description:
    "Discover the latest fashion trends at Ecomus. Shop clothing, accessories, bags, sunglasses and more with free shipping on orders over $120.",
  openGraph: {
    title: "Ecomus — Modern Fashion Store",
    description:
      "Discover the latest fashion trends at Ecomus. Shop clothing, accessories, bags, sunglasses and more.",
    type: "website",
    locale: "en_US",
    siteName: "Ecomus",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ecomus — Modern Fashion Store",
    description: "Discover the latest fashion trends at Ecomus.",
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
