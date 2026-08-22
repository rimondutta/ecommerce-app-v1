import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import SearchProvider from "@/components/providers/SearchProvider";
import GlobalUI from "@/components/layout/GlobalUI";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { ToastProvider } from "@/components/playshelf/Toast";
import FacebookPixel from "@/components/FacebookPixel";

const bigShoulders = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-big-shoulders",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://toyhourse.com'),
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
    url: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://toyhourse.com',
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
        className="relative min-h-screen flex flex-col bg-[#0A0A0F] text-ink-black font-body selection:bg-violet-600 selection:text-white overflow-x-hidden"
      >
        {/* ── Ambient glow blobs — appear on every page ── */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full bg-violet-700/12 blur-[160px] -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-rose-700/10 blur-[140px] translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-violet-900/8 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        </div>
        <NextAuthProvider>
          <WishlistProvider>
            <CartProvider>
              <SearchProvider>
                <ToastProvider>
                  {children}
                  <GlobalUI />
                  <FacebookPixel />
                </ToastProvider>
              </SearchProvider>
            </CartProvider>
          </WishlistProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
