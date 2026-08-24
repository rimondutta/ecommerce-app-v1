"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

export default function TopNavbar() {
  const { openCart, count: cartCount } = useCart();
  const { openSearch } = useSearch();
  const { openMobileMenu } = useUIStore();
  const pathname = usePathname();

  // Prevent hydration mismatch by deferring the cart count render
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const navLinks = [
    { label: "Shop", href: "/products" },
    { label: "Bestsellers", href: "/bestsellers" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl bg-[#D5AEFD]/80 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-[#D5AEFD]/95">
      <div className="flex items-center justify-between">
        
        {/* Left — Nav links */}
        <div className="hidden md:flex items-center gap-2 w-1/3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-body text-sm font-medium text-black/80 hover:text-black px-4 py-2 rounded-full hover:bg-black/5 transition-all duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Center — Logo (Playfair Display) */}
        <div className="flex justify-start md:justify-center w-full md:w-1/3">
          <Link
            href="/"
            className="font-display text-2xl md:text-3xl text-black tracking-tight hover:opacity-80 transition-opacity"
          >
            Toyhourse
          </Link>
        </div>

        {/* Right — Search & Icons */}
        <div className="flex items-center justify-end gap-2 w-1/3">
          {/* Search Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-black/5 hover:bg-black/10 backdrop-blur-md rounded-full px-4 py-2 w-56 cursor-text border border-black/5 transition-colors duration-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/60">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-sm text-black/60 font-body">Search...</span>
          </div>
          
          {/* Mobile Search Icon */}
          <button
            onClick={openSearch}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-black/5 text-black hover:bg-black/10 transition-all duration-300"
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Cart Icon (Glassmorphic Circle) */}
          <button
            onClick={openCart}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-black/5 text-black hover:bg-black/10 transition-all duration-300"
            aria-label="Cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#043224] text-white font-body text-[10px] font-bold w-4 h-4 flex items-center justify-center leading-none rounded-full shadow-sm">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* Account Icon (hidden on mobile - accessible via mobile menu) */}
          <Link
            href="/account"
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-black/5 text-black hover:bg-black/10 transition-all duration-300"
            aria-label="Account"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </Link>

          {/* Hamburger — Mobile Only */}
          <button
            onClick={openMobileMenu}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-black/5 text-black hover:bg-black/10 transition-all duration-300"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}