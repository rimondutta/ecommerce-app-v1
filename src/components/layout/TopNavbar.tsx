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
    <nav className="absolute top-0 z-50 w-full bg-transparent px-4 sm:px-10 lg:px-[5vw] pt-6 pb-4">
      <div className="flex items-center justify-between">
        
        {/* Left — Nav links */}
        <div className="hidden md:flex items-center gap-6 w-1/3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-body text-sm font-medium text-white hover:text-white/80 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Center — Logo (Playfair Display) */}
        <div className="flex justify-start md:justify-center w-full md:w-1/3">
          <Link
            href="/"
            className="font-display text-3xl md:text-4xl text-white tracking-tight"
          >
            Toyhourse
          </Link>
        </div>

        {/* Right — Search & Icons */}
        <div className="flex items-center justify-end gap-3 w-1/3">
          {/* Search Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 w-64 shadow-sm cursor-text border border-white/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-sm text-gray-500 font-body">Search Product...</span>
          </div>
          
          {/* Mobile Search Icon */}
          <button
            onClick={openSearch}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white/30 transition-colors"
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Cart Icon (Glassmorphic Circle) */}
          <button
            onClick={openCart}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white/30 transition-colors"
            aria-label="Cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-stamp-red text-white font-mono text-[9px] font-bold w-4 h-4 flex items-center justify-center leading-none rounded-full">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* Account Icon (Glassmorphic Circle) */}
          <Link
            href="/account"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white/30 transition-colors"
            aria-label="Account"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}