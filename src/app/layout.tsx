import type { Metadata } from "next";
import { Bangers, Comic_Neue, Bebas_Neue, Permanent_Marker, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import SearchProvider from "@/components/providers/SearchProvider";
import GlobalUI from "@/components/layout/GlobalUI";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { CartoonToastProvider } from "@/components/ui/CartoonToast";

const bangers = Bangers({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bangers",
  weight: "400",
});

const comicNeue = Comic_Neue({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-comic",
  weight: ["400", "700"],
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas",
  weight: "400",
});

const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-marker",
  weight: "400",
});

const ibmPlex = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "INK & THREAD — Wear the Attitude",
    template: "%s | INK & THREAD",
  },
  description:
    "Bold. Graphic. Fearless. High-fashion streetwear for the comic-obsessed generation.",
  openGraph: {
    title: "INK & THREAD — Wear the Attitude",
    description: "High-fashion streetwear for the comic-obsessed generation.",
    type: "website",
    locale: "en_US",
    siteName: "INK & THREAD",
  },
  twitter: {
    card: "summary_large_image",
    title: "INK & THREAD — Wear the Attitude",
    description: "Bold. Graphic. Fearless streetwear.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bangers.variable} ${comicNeue.variable} ${bebasNeue.variable} ${permanentMarker.variable} ${ibmPlex.variable}`}
    >
      <body 
        suppressHydrationWarning
        className="relative min-h-screen flex flex-col bg-paper text-ink font-comic selection:bg-ink selection:text-paper"
      >
        <NextAuthProvider>
          <WishlistProvider>
            <CartProvider>
              <SearchProvider>
                <CartoonToastProvider>
                  {children}
                  <GlobalUI />
                </CartoonToastProvider>
              </SearchProvider>
            </CartProvider>
          </WishlistProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
