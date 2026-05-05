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

const navLinks = [
  { label: "Collections", href: "/products" },
  { label: "Editorial", href: "/blogs" },
  { label: "Archive", href: "/shop" },
  { label: "About", href: "/contact" },
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
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
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

    initGsap();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed left-0 w-full z-[9999] px-6 md:px-16 text-[#e5e2e1] ${
          isVisible ? "header-visible" : "header-hidden"
        } ${
          isScrolled 
            ? "top-0 bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-white/5 h-[68px]" 
            : "top-[40px] bg-transparent h-[80px]"
        }`}
      >
        <div className="max-w-[1800px] mx-auto h-full flex items-center justify-between">
          
          {/* Logo Section */}
          <div ref={logoRef} className="flex items-center gap-4 md:gap-8">
            <button
              className="lg:hidden p-2 -ml-2 text-[#8e9192] hover:text-white transition-colors"
              onClick={openMobileMenu}
              aria-label="Open mobile menu"
            >
              <Menu size={20} strokeWidth={1} />
            </button>
            <Link href="/" className="flex items-center group">
              <MagneticElement strength={0.2}>
                <span className="font-serif text-2xl md:text-3xl tracking-[-0.04em] text-white font-normal relative">
                  AVANT
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-700 group-hover:w-full" />
                </span>
              </MagneticElement>
            </Link>
          </div>

          {/* Navigation — Label Tiny Style */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-12 h-full" aria-label="Main navigation">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative h-full flex items-center"
                onMouseEnter={() => handleMouseEnter(link.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={link.href}
                  className="group flex items-center h-10 px-1"
                >
                  <MagneticElement strength={0.15}>
                    <span className="label-tiny text-[#8e9192] group-hover:text-white transition-colors duration-300">
                      {link.label}
                    </span>
                  </MagneticElement>
                </Link>
              </div>
            ))}
          </nav>

          {/* Action Icons — 1px Stroke */}
          <div ref={actionsRef} className="flex items-center gap-1 md:gap-3">
            <MagneticElement strength={0.3}>
              <button
                onClick={() => { closeCart(); isSearchOpen ? closeSearch() : openSearch(); }}
                className="p-2.5 text-[#8e9192] hover:text-white transition-colors duration-300"
              >
                {isSearchOpen ? <X size={20} strokeWidth={1} /> : <Search size={20} strokeWidth={1} />}
              </button>
            </MagneticElement>

            <MagneticElement strength={0.3} className="hidden sm:block">
              <Link
                href="/account"
                className="p-2.5 text-[#8e9192] hover:text-white transition-colors duration-300"
              >
                <User size={20} strokeWidth={1} />
              </Link>
            </MagneticElement>

            <MagneticElement strength={0.3} className="hidden sm:block">
              <button
                className="p-2.5 text-[#8e9192] hover:text-white transition-colors duration-300 relative"
              >
                <Heart size={20} strokeWidth={1} className={wishlistCount > 0 ? "fill-white text-white" : ""} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-white text-[#0a0a0a] rounded-full text-[8px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </MagneticElement>

            <MagneticElement strength={0.3}>
              <button
                onClick={() => { closeSearch(); isCartOpen ? closeCart() : openCart(); }}
                className="p-2.5 text-[#8e9192] hover:text-white transition-colors duration-300 relative"
              >
                <ShoppingBag size={20} strokeWidth={1} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-white text-[#0a0a0a] rounded-full text-[8px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </MagneticElement>
          </div>
        </div>
      </header>

      {/* Mega Menu Dropdown — Dark Surface */}
      <AnimatePresence>
        {activeMenu === "Collections" && (
          <motion.div 
            className="fixed left-0 w-full bg-[#111111]/98 backdrop-blur-xl text-[#e5e2e1] z-[90] overflow-hidden border-b border-white/5"
            style={{ top: isScrolled ? "68px" : "108px" }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onMouseEnter={() => handleMouseEnter("Collections")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1800px] mx-auto px-16 py-12 grid grid-cols-12 gap-16 relative z-10">
                <div className="col-span-4 grid grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <h4 className="label-tiny text-[#8e9192] mb-4">Explore</h4>
                      <ul className="space-y-4">
                        {["New Arrivals", "Best Sellers", "Sale Collection"].map((l) => (
                          <li key={l}>
                            <Link href="/products" className="group flex items-center justify-between text-sm font-light text-[#c4c7c8] hover:text-white transition-colors">
                              {l}
                              <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-6">
                      <h4 className="label-tiny text-[#8e9192] mb-4">Collections</h4>
                      <ul className="space-y-4">
                        {categories.slice(0, 5).map((cat) => (
                          <li key={cat.slug}>
                            <Link href={`/products?category=${cat.name}`} className="group flex items-center justify-between text-sm font-light text-[#c4c7c8] hover:text-white transition-colors">
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
                      className="relative group overflow-hidden bg-[#1a1a1a]"
                    >
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105 grayscale group-hover:grayscale-0" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8">
                          <span className="label-tiny text-white/60 mb-2">{item.subtitle}</span>
                          <h3 className="text-white font-serif text-2xl tracking-tight leading-none">{item.title}</h3>
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
