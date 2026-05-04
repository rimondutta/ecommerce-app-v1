"use client";

import dynamic from "next/dynamic";
import Preloader from "@/components/ui/Preloader";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { useSearch } from "@/components/providers/SearchProvider";


// Dynamically import heavy UI components to improve initial load performance
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), { ssr: false });
const QuickLookDrawer = dynamic(() => import("@/components/ui/QuickLookDrawer"), { ssr: false });
const SearchDrawer = dynamic(() => import("@/components/ui/SearchDrawer"), { ssr: false });
const MobileMenu = dynamic(() => import("@/components/layout/MobileMenu"), { ssr: false });

export default function GlobalUI() {
  const { isOpen: isSearchOpen, closeSearch } = useSearch();

  return (
    <>
      <CartDrawer />
      <QuickLookDrawer />
      <SearchDrawer isOpen={isSearchOpen} onClose={closeSearch} />
      <MobileMenu />
      <ScrollToTop />
    </>
  );
}
