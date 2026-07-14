"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import {
  IconSearch,
  IconShoppingCart,
  IconUser,
  IconHeart,
  IconMenu2
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

export default function TopNavbar() {
  const { openCart, count: cartCount } = useCart();
  const { openSearch } = useSearch();
  const { openMobileMenu } = useUIStore();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { title: "NEW IN", href: "/products?badge=New" },
    { title: "CONTACT US", href: "/contact" },
    { title: "SHOP", href: "/shop" },
    { title: "SHOP BY AGE", href: "/#age" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-neutral-300 shadow-sm">
      {/* ─── Top Offer Bar ─── */}
      <div className="w-full bg-neutral-950 text-white py-2 px-4 text-center select-none">
        <p className="text-[10px] md:text-xs font-medium tracking-widest uppercase flex items-center justify-center gap-1.5">
          <span>✨ Free delivery on all orders over ৳3,000!</span>
          <Link href="/shop" className="underline font-semibold hover:text-neutral-200 transition-colors">
            Shop Now
          </Link>
        </p>
      </div>

      {/* ─── Mobile Layout: Menu | Logo | Cart ─── */}
      <div className="md:hidden flex items-center justify-between h-16 border-b border-neutral-100 px-4">
        <button
          onClick={openMobileMenu}
          className="text-black p-1 active:scale-95 transition-transform"
          aria-label="Menu"
        >
          <IconMenu2 className="h-6 w-6" stroke={2} />
        </button>

        <Link href="/" className="flex items-center group">
          <Image
            src="/logo/toyhourse-logo.png"
            alt="Toy Hourse"
            width={300}
            height={100}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        <button
          onClick={openCart}
          className="text-black relative p-1 active:scale-95 transition-transform"
          aria-label="Cart"
        >
          <IconShoppingCart className="h-6 w-6" stroke={2} />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-black text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── Desktop Layout ─── */}
      <div className="hidden md:block max-w-[1440px] mx-auto px-4 md:px-12">
        {/* Top Row: Search | Logo | Icons */}
        <div className="flex items-center justify-between h-20 border-b border-neutral-100">

          {/* Left: Search Bar */}
          <div className="flex-1 flex items-center justify-start">
            <div className="relative w-full max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconSearch className="h-5 w-5 text-black" stroke={2} />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={openSearch}
                className="w-full bg-neutral-50 border border-neutral-300 text-black placeholder:text-neutral-500 text-sm rounded-md pl-10 pr-4 py-2.5 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Center: Logo */}
          <div className="flex-1 flex items-center justify-center">
            <Link href="/" className="flex items-center flex-col gap-1 group">
              <Image
                src="/logo/toyhourse-logo.png"
                alt="Toy Hourse"
                width={200}
                height={100}
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Right: Icons */}
          <div className="flex-1 flex items-center justify-end gap-6">
            <Link
              href="/wishlist"
              className="text-black transition-transform hover:scale-105"
              aria-label="Wishlist"
            >
              <IconHeart className="h-6 w-6" stroke={2} />
            </Link>
            <Link
              href="/account"
              className="text-black transition-transform hover:scale-105"
              aria-label="Account"
            >
              <IconUser className="h-6 w-6" stroke={2} />
            </Link>
            <button
              onClick={openCart}
              className="text-black relative transition-transform hover:scale-105"
              aria-label="Cart"
            >
              <IconShoppingCart className="h-6 w-6" stroke={2} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation Links */}
        <div className="flex items-center justify-center h-14 gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.title}
                href={link.href}
                className={cn(
                  "font-sans text-[13px] tracking-widest uppercase text-black transition-all relative py-1",
                  isActive
                    ? "font-bold border-b-2 border-black"
                    : "font-medium opacity-90 hover:opacity-100 hover:font-bold"
                )}
              >
                {link.title}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}