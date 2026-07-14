import type { Metadata } from "next";
import { Anek_Bangla } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import SearchProvider from "@/components/providers/SearchProvider";
import GlobalUI from "@/components/layout/GlobalUI";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { ToastProvider } from "@/components/playshelf/Toast";

const anekBangla = Anek_Bangla({
  subsets: ["latin", "bengali"],
  display: "swap",
  variable: "--font-anek",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
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
      className={`${anekBangla.variable}`}
    >
      <body 
        suppressHydrationWarning
        className="relative min-h-screen flex flex-col bg-paper text-ink font-body selection:bg-sun selection:text-ink"
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
