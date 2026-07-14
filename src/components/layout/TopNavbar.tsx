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

  const navLinks = [
    { title: "HOME", href: "/" },
    { title: "SHOP", href: "/products" },
    { title: "BLOG", href: "/blogs" },
    { title: "ABOUT", href: "/about" },
    { title: "CONTACT", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-[0_10px_33px_rgba(0,0,0,0.1)] transition-all">
      {/* ─── Desktop & Mobile Layout Container ─── */}
      <div className="flex items-center justify-between px-4 sm:px-10 lg:px-40 py-4 md:py-[35px]">
        
        {/* Mobile Left: Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={openMobileMenu}
            className="text-black p-1 active:scale-95 transition-transform"
            aria-label="Menu"
          >
            <IconMenu2 className="h-6 w-6" stroke={2} />
          </button>
        </div>

        {/* Desktop Left: Logo + Links */}
        <div className="hidden md:flex items-center gap-10 lg:gap-[60px]">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/logo/toyhourse-logo.png"
              alt="Logo"
              width={160}
              height={50}
              className="h-8 lg:h-9 w-auto object-contain"
              priority
            />
          </Link>
          
          {/* Links */}
          <div className="flex items-center gap-6 lg:gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.title}
                  href={link.href}
                  className={cn(
                    "font-sans text-[14px] font-semibold text-[#1b1b1b] relative group"
                  )}
                >
                  {link.title}
                  <span
                    className={cn(
                      "absolute left-0 -bottom-1 h-[2px] bg-[#1b1b1b] transition-[width] duration-300 ease-out",
                      isActive ? "w-[60%]" : "w-0 group-hover:w-[60%] group-hover:delay-100"
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Center: Logo */}
        <div className="md:hidden flex flex-1 items-center justify-center">
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo/toyhourse-logo.png"
              alt="Logo"
              width={120}
              height={40}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop Right & Mobile Right: Icons */}
        <div className="flex items-center justify-end gap-4 md:gap-[35px]">
          {/* Desktop Only Icons */}
          <button
            onClick={openSearch}
            className="hidden md:flex items-center justify-center text-black hover:opacity-70 transition-opacity"
            aria-label="Search"
          >
            <IconSearch size={22} stroke={2} />
          </button>
          
          <Link
            href="/account"
            className="hidden md:flex items-center justify-center text-black hover:opacity-70 transition-opacity"
            aria-label="Account"
          >
            <IconUser size={22} stroke={2} />
          </Link>

          {/* Cart Icon (Desktop & Mobile) */}
          <button
            onClick={openCart}
            className="text-black relative flex items-center justify-center hover:opacity-70 transition-opacity"
            aria-label="Cart"
          >
            <IconShoppingCart size={22} stroke={2} />
            <span className={cn(
              "absolute -top-1.5 -right-1.5 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center transition-transform",
              cartCount > 0 ? "scale-100 bg-[#1976d2]" : "scale-0 bg-transparent"
            )}>
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          </button>

          {/* Desktop Only Icons */}
          <Link
            href="/wishlist"
            className="hidden md:flex items-center justify-center text-black hover:opacity-70 transition-opacity"
            aria-label="Wishlist"
          >
            <IconHeart size={22} stroke={2} />
          </Link>
        </div>

      </div>
    </nav>
  );
}