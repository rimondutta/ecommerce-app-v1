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
    { label: "SHOP", href: "/products" },
    { label: "BLOG", href: "/blogs" },
    { label: "ABOUT", href: "/about" },
    { label: "CONTACT", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-paper-white/80 backdrop-blur-xl border-b border-rule-grey">
      <div className="flex items-center justify-between px-4 sm:px-10 lg:px-[5vw] py-4">

        {/* Mobile — Hamburger */}
        <button
          onClick={openMobileMenu}
          className="md:hidden flex flex-col gap-[5px] p-1"
          aria-label="Open menu"
        >
          <span className="block w-5 h-[1px] bg-ink-black" />
          <span className="block w-5 h-[1px] bg-ink-black" />
          <span className="block w-3 h-[1px] bg-ink-black" />
        </button>

        {/* Logo — Oswald Display */}
        <Link
          href="/"
          className="font-display text-[22px] md:text-[26px] uppercase tracking-[-0.02em] text-ink-black leading-none"
        >
          TOYHOURSE
        </Link>

        {/* Desktop — Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "font-body text-[11px] uppercase tracking-[0.12em] relative group transition-colors duration-200",
                  active ? "text-ink-black" : "text-rule-grey hover:text-ink-black"
                )}
              >
                {link.label}
                {/* Hairline active / hover underline */}
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-0 h-[1px] bg-ink-black transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
                    active ? "w-full" : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            );
          })}
        </div>

        {/* Icons — Search, Account, Wishlist, Cart */}
        <div className="flex items-center gap-4 md:gap-5">
          {/* Search */}
          <button
            onClick={openSearch}
            className="hidden md:flex text-ink-black hover:text-rule-grey transition-colors"
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Account */}
          <Link
            href="/account"
            className="hidden md:flex text-ink-black hover:text-rule-grey transition-colors"
            aria-label="Account"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="hidden md:flex text-ink-black hover:text-rule-grey transition-colors"
            aria-label="Wishlist"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </Link>

          {/* Cart — stamp-red count */}
          <button
            onClick={openCart}
            className="relative text-ink-black hover:text-rule-grey transition-colors"
            aria-label="Cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-stamp-red text-paper-white font-mono text-[9px] font-bold w-4 h-4 flex items-center justify-center leading-none">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}