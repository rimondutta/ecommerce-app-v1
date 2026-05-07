"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { useUIStore } from "@/store/uiStore";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "SHOP", sub: "ショップ", href: "/products" },
  { label: "DROPS", sub: "新作", href: "/products?badge=New" },
  { label: "ABOUT", sub: "物語", href: "/about" },
];

const CartoonNavbar = () => {
  const { openMobileMenu } = useUIStore();
  const { isOpen: isCartOpen, openCart, closeCart, count: cartCount } = useCart();
  const { isOpen: isSearchOpen, openSearch, closeSearch } = useSearch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-[999] transition-all duration-300 transform",
        !isVisible ? "-translate-y-full" : "translate-y-0"
      )}
    >
      {/* Ticker / Top Bar */}
      <div className="bg-ink text-paper h-8 flex items-center overflow-hidden border-b-2 border-ink">
        <div className="flex animate-marquee whitespace-nowrap gap-12 font-bebas text-lg tracking-widest uppercase">
          {[...Array(6)].map((_, i) => (
            <span key={i}>
              ★ FREE SHIPPING ON ALL ORDERS OVER ৳1,000 ★ NEW COLLECTION OUT NOW ★ JOIN THE CLUB ★
            </span>
          ))}
        </div>
      </div>

      {/* Main Nav */}
      <div 
        className={cn(
          "w-full h-16 md:h-20 bg-paper border-b-4 border-ink flex items-center justify-between px-6 md:px-12 transition-all",
          isScrolled ? "h-14 md:h-16" : "h-16 md:h-20"
        )}
      >
        {/* Left: Mobile Menu & Links */}
        <div className="flex items-center gap-8">
          <button 
            className="lg:hidden p-2 hover:bg-surface border-3 border-ink cartoon-shadow-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            onClick={openMobileMenu}
          >
            <Menu size={24} />
          </button>
          
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.label} 
                href={link.href}
                className="group flex flex-col items-center"
              >
                <span className="font-bebas text-2xl tracking-wide group-hover:text-secondary transition-colors leading-none">
                  {link.label}
                </span>
                <span className="font-jp text-[10px] font-bold tracking-widest text-muted group-hover:text-ink transition-colors leading-none">
                  {link.sub}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 group text-center">
          <div className="flex flex-col items-center">
            <h1 className="font-bangers text-3xl md:text-5xl text-ink leading-none group-hover:scale-110 transition-transform">
              INK<span className="text-secondary">&</span>THREAD
            </h1>
            <span className="font-jp text-[10px] md:text-xs font-black tracking-[0.2em] text-ink/40 group-hover:text-ink transition-colors uppercase">
              インクと糸 — VOLUME 01
            </span>
          </div>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-6">
          <button 
             onClick={() => {
               closeCart();
               isSearchOpen ? closeSearch() : openSearch();
             }}
             className="p-2 md:p-3 hover:bg-surface border-3 border-ink cartoon-shadow-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
          
          <Link 
            href="/account"
            className="hidden sm:block p-2 md:p-3 hover:bg-surface border-3 border-ink cartoon-shadow-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <User size={20} />
          </Link>

          <button 
            onClick={() => {
              closeSearch();
              isCartOpen ? closeCart() : openCart();
            }}
            className="relative p-2 md:p-3 bg-ink text-paper border-3 border-ink cartoon-shadow-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-paper text-ink border-3 border-ink font-bebas text-lg px-1.5 min-w-[24px] h-6 flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default CartoonNavbar;
