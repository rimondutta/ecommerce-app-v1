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
    { title: "NEW ARRIVALS", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop", subtitle: "Limited Edition" },
    { title: "ESSENTIALS", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop", subtitle: "Core Collection" },
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
        // 1. Initial State
        gsap.set(headerRef.current, { yPercent: 0, opacity: 1, visibility: "visible" });
        
        // 2. Entrance Animation
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
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`absolute left-0 w-full z-[500] border-b text-black transition-all duration-500 ease-[0.16,1,0.3,1] ${
          isScrolled 
          ? "bg-white/95 backdrop-blur-xl border-black/10 h-[80px]" 
          : "bg-white border-transparent h-[100px]"
        } top-0`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-16 h-full flex items-center justify-between">
          
          {/* Logo Section */}
          <div ref={logoRef} className="flex items-center gap-4 will-change-transform">
            <button
              className="lg:hidden p-2 -ml-2 hover:scale-110 transition-transform"
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
          <nav ref={navRef} className="hidden lg:flex items-center gap-10 h-full" aria-label="Main navigation">
            {navLinks.map((link, idx) => (
              <MagneticElement key={link.label} strength={0.1}>
                <div
                  className="relative h-full flex items-center will-change-transform"
                  onMouseEnter={() => handleMouseEnter(link.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={link.href}
                    className="group flex flex-col items-center justify-center overflow-hidden h-12"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60 group-hover:text-black transition-all duration-300 relative inline-block">
                      {link.label}
                    </span>
                    <div className="w-0 group-hover:w-full h-px bg-black transition-all duration-500 ease-[0.16,1,0.3,1]" />
                  </Link>
                </div>
              </MagneticElement>
            ))}
          </nav>

          {/* Action Icons */}
          <div ref={actionsRef} className="flex items-center gap-4 md:gap-8">
            <MagneticElement strength={0.2}>
              <button
                onClick={() => { closeCart(); isSearchOpen ? closeSearch() : openSearch(); }}
                className="p-2 hover:bg-black/5 rounded-none transition-colors"
              >
                {isSearchOpen ? <X size={20} /> : <Search size={20} strokeWidth={2} />}
              </button>
            </MagneticElement>

            <Link
              href="/account"
              className="p-2 hover:bg-black/5 rounded-none transition-colors hidden sm:block"
            >
              <User size={20} strokeWidth={2} />
            </Link>

            <button
              className="p-2 hover:bg-black/5 rounded-none transition-colors relative hidden sm:block"
            >
              <Heart size={20} strokeWidth={2} fill={wishlistCount > 0 ? "black" : "none"} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-black text-white text-[8px] font-black flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <MagneticElement strength={0.2}>
              <button
                onClick={() => { closeSearch(); isCartOpen ? closeCart() : openCart(); }}
                className="p-2 hover:bg-black/5 rounded-none transition-colors relative"
              >
                <ShoppingBag size={20} strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-black text-white text-[8px] font-black flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </MagneticElement>
          </div>
        </div>
      </header>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {activeMenu === "Shop" && (
          <motion.div 
            className={`fixed ${isScrolled ? 'top-[80px]' : 'top-[140px]'} left-0 w-full bg-white text-black border-b border-black/10 shadow-2xl z-[90] overflow-hidden`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => handleMouseEnter("Shop")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                 style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                 
            <div className="max-w-[1800px] mx-auto px-16 py-16 grid grid-cols-12 gap-16 relative z-10">
                <div className="col-span-4 grid grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <h4 className="font-mono font-black text-[9px] uppercase tracking-[0.3em] text-black/40 mb-6">Explore</h4>
                      <ul className="space-y-4">
                        {["New Arrivals", "Best Sellers", "Sale Collection"].map((l, i) => (
                          <li key={l}>
                            <Link href="/products" className="group flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-black/60 hover:text-black transition-all">
                              {l}
                              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-8">
                      <h4 className="font-mono font-black text-[9px] uppercase tracking-[0.3em] text-black/40 mb-6">Collections</h4>
                      <ul className="space-y-4">
                        {categories.slice(0, 5).map((cat) => (
                          <li key={cat.slug}>
                            <Link href={`/products?category=${cat.name}`} className="group flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-black/60 hover:text-black transition-all">
                              {cat.name}
                              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                </div>
                
                <div className="col-span-8 grid grid-cols-2 gap-8 h-[400px]">
                  {shopMegaMenu.featured.map((item, idx) => (
                    <Link 
                      key={idx} 
                      href="/products" 
                      className="relative group overflow-hidden bg-black border border-black/10"
                    >
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s] ease-[0.16,1,0.3,1]" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                          <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-white/50 mb-2">{item.subtitle}</span>
                          <h3 className="text-white font-display font-black text-3xl uppercase tracking-tighter leading-none">{item.title}</h3>
                      </div>
                      
                      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/30" />
                      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/30" />
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
