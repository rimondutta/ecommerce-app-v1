"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, User, Heart, ShoppingBag, Menu, ArrowRight, X } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import MagneticElement from "@/components/ui/MagneticElement";
import AnimatedLogo from "@/components/ui/AnimatedLogo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Stories", href: "/blogs" },
  { label: "Contact", href: "/contact" },
];

interface Category {
  name: string;
  slug: string;
}

const shopMegaMenu = {
  featured: [
    { title: "New Arrivals", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop", subtitle: "Limited Edition" },
    { title: "Essentials", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop", subtitle: "Core Collection" },
  ],
};

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { openMobileMenu } = useUIStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const { isOpen: isCartOpen, openCart, closeCart, count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isOpen: isSearchOpen, openSearch, closeSearch } = useSearch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [topOffset, setTopOffset] = useState(40);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (menu: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/store/categories");
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();

    // GSAP Entrance
    const initGsap = async () => {
      const { gsap } = await import("@/lib/gsap");
      if (!headerRef.current) return;

      const ctx = gsap.context(() => {
        gsap.set(headerRef.current, { yPercent: 0, opacity: 1, visibility: "visible" });
        gsap.from(headerRef.current, { 
          yPercent: -100,
          duration: 1.2, 
          ease: "expo.out",
          clearProps: "all"
        });
        
        gsap.from([logoRef.current, navRef.current, actionsRef.current],
          { opacity: 0, y: -20, duration: 0.8, stagger: 0.1, ease: "expo.out", delay: 0.2 }
        );
      });

      return () => ctx.revert();
    };

    initGsap();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
      setTopOffset(Math.max(0, 40 - scrollY));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed left-1/2 -translate-x-1/2 z-[500] transition-all duration-700 ease-[0.16,1,0.3,1] ${
          isScrolled 
          ? "bg-white/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 h-[72px] rounded-full top-6 w-[90%] md:w-[80%] max-w-[1200px] px-8 text-zinc-900" 
          : "bg-transparent h-[100px] w-full px-6 md:px-12 top-0 text-white"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 h-full flex items-center justify-between">
          
          {/* Logo Section */}
          <div ref={logoRef} className="flex items-center gap-4 will-change-transform">
            <button
              className="lg:hidden p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-colors"
              onClick={openMobileMenu}
              aria-label="Open mobile menu"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="group flex items-center">
              <AnimatedLogo size="md" />
            </Link>
          </div>

          {/* Navigation */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-8 h-full" aria-label="Main navigation">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative h-full flex items-center will-change-transform"
                onMouseEnter={() => handleMouseEnter(link.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={link.href}
                  className="group flex flex-col items-center justify-center overflow-hidden h-12 px-3"
                >
                  <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors duration-300 relative inline-block">
                    {link.label}
                  </span>
                  <div className="w-0 group-hover:w-full h-0.5 bg-zinc-900 rounded-full transition-all duration-300 ease-out mt-1 opacity-0 group-hover:opacity-100" />
                </Link>
              </div>
            ))}
          </nav>

          {/* Action Icons */}
          <div ref={actionsRef} className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => { closeCart(); isSearchOpen ? closeSearch() : openSearch(); }}
              className="p-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
            >
              {isSearchOpen ? <X size={20} /> : <Search size={20} strokeWidth={2} />}
            </button>

            <Link
              href="/account"
              className="p-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors hidden sm:block"
            >
              <User size={20} strokeWidth={2} />
            </Link>

            <button
              className="p-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors relative hidden sm:block"
            >
              <Heart size={20} strokeWidth={2} className={wishlistCount > 0 ? "fill-zinc-900 text-zinc-900" : ""} />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-zinc-900 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { closeSearch(); isCartOpen ? closeCart() : openCart(); }}
              className="p-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors relative"
            >
              <ShoppingBag size={20} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-zinc-900 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {activeMenu === "Shop" && (
          <motion.div 
            className={`fixed left-0 w-full bg-white/95 backdrop-blur-xl text-zinc-900 border-b border-zinc-200/50 shadow-soft-xl z-[90] overflow-hidden`}
            style={{ top: `${isScrolled ? topOffset + 72 : topOffset + 88}px` }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onMouseEnter={() => handleMouseEnter("Shop")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1800px] mx-auto px-16 py-12 grid grid-cols-12 gap-16 relative z-10">
                <div className="col-span-4 grid grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wider mb-4">Explore</h4>
                      <ul className="space-y-3">
                        {["New Arrivals", "Best Sellers", "Sale Collection"].map((l, i) => (
                          <li key={l}>
                            <Link href="/products" className="group flex items-center justify-between text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                              {l}
                              <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wider mb-4">Collections</h4>
                      <ul className="space-y-3">
                        {categories.slice(0, 5).map((cat) => (
                          <li key={cat.slug}>
                            <Link href={`/products?category=${cat.name}`} className="group flex items-center justify-between text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                              {cat.name}
                              <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                </div>
                
                <div className="col-span-8 grid grid-cols-2 gap-6 h-[320px]">
                  {shopMegaMenu.featured.map((item, idx) => (
                    <Link 
                      key={idx} 
                      href="/products" 
                      className="relative group overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200/50"
                    >
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-8">
                          <span className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">{item.subtitle}</span>
                          <h3 className="text-white font-display font-bold text-2xl tracking-tight leading-none">{item.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
