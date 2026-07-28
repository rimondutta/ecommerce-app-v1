import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import SearchProvider from "@/components/providers/SearchProvider";
import GlobalUI from "@/components/layout/GlobalUI";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { ToastProvider } from "@/components/playshelf/Toast";

const bigShoulders = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-big-shoulders",
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "700"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: {
    default: "Toy Hourse — Toys They'll Actually Play With Twice",
    template: "%s | Toy Hourse",
  },
  description:
    "Beautifully curated toys for curious kids aged 0–10. Safety-tested, parent-approved, endlessly fun.",
  openGraph: {
    title: "Toy Hourse — Toys They'll Actually Play With Twice",
    description: "Beautifully curated toys for curious kids. Safety-tested, parent-approved.",
    type: "website",
    locale: "en_US",
    siteName: "Toy Hourse",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toy Hourse — Toys They'll Actually Play With Twice",
    description: "Beautifully curated toys for curious kids.",
  },
};

// Preconnect to Google Fonts to eliminate render-blocking font fetches
export const links = [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${bigShoulders.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="relative min-h-screen flex flex-col bg-paper-white text-ink-black font-body selection:bg-ink-black selection:text-paper-white"
      >
        <NextAuthProvider>
          <WishlistProvider>
            <CartProvider>
              <SearchProvider>
                <ToastProvider>
                  {children}
                  <GlobalUI />
                </ToastProvider>
              </SearchProvider>
            </CartProvider>
          </WishlistProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
