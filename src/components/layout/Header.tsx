"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, User, Heart, ShoppingBag, Menu, ArrowRight } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import MobileMenu from "./MobileMenu";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Contact Us", href: "/contact" },
  { label: "Blog", href: "/blogs" },
];

interface Category {
  name: string;
  slug: string;
}

const shopMegaMenu = {
  featured: [
    { title: "THE COLLECTION AW24", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop", subtitle: "Limited Edition" },
    { title: "ESSENTIALS", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop", subtitle: "Core Collection" },
  ],
};

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { isOpen: isCartOpen, openCart, closeCart, count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isOpen: isSearchOpen, openSearch, closeSearch } = useSearch();
  const [isScrolled, setIsScrolled] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`w-full transition-all duration-700 bg-white/95 backdrop-blur-xl border-b border-black/10 shadow-sm text-black relative z-[100]`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 h-[100px] flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2 hover:scale-110 transition-transform"
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile menu"
              data-cursor="MENU"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-20">
              <Link href="/" className="font-mono font-black text-2xl tracking-tighter group flex items-center gap-2" data-cursor="HOME">
                  <span className="text-black/40">[</span>
                  <span className="group-hover:italic transition-all uppercase tracking-widest">Flex_Wear</span>
                  <span className="text-black/40">]</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-12 h-full" aria-label="Main navigation">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => handleMouseEnter(link.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={link.href}
                    className="text-[10px] font-black uppercase tracking-[0.3em] opacity-100 hover:opacity-100 transition-all py-8"
                    data-cursor="CLICK"
                  >
                    {link.label}
                  </Link>

                  {/* ANIMATED UNDERLINE */}
                  <div className={`absolute bottom-6 left-0 h-[2px] bg-black transition-all duration-300 ${activeMenu === link.label ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
                </div>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-6">
               <button
                onClick={() => {
                  closeCart();
                  if (isSearchOpen) {
                    closeSearch();
                  } else {
                    openSearch();
                  }
                }}
                className="p-2 hover:scale-110 active:scale-95 transition-all"
                aria-label="Search"
                data-cursor="SEARCH"
              >
                <Search size={22} strokeWidth={2.5} />
              </button>
              
              <Link
                href="/account"
                className="p-2 hover:scale-110 active:scale-95 transition-all hidden sm:flex"
                aria-label="Account"
                data-cursor="LOGIN"
              >
                <User size={22} strokeWidth={2.5} />
              </Link>

              <button
                className="p-2 hover:scale-110 active:scale-95 transition-all relative hidden sm:flex"
                aria-label={`Wishlist: ${wishlistCount} items`}
                data-cursor="WISHLIST"
              >
                <Heart size={22} strokeWidth={2.5} fill={wishlistCount > 0 ? "black" : "none"} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

               <button
                onClick={() => {
                  closeSearch();
                  if (isCartOpen) {
                    closeCart();
                  } else {
                    openCart();
                  }
                }}
                className="group p-2 hover:scale-110 active:scale-95 transition-all relative"
                aria-label={`Cart: ${cartCount} items`}
                data-cursor="CART"
              >
                <ShoppingBag size={22} strokeWidth={2.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
      </motion.header>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {activeMenu === "Shop" && (
          <motion.div 
            className="fixed top-[100px] left-0 w-full bg-[#f0ece5] text-black border-b-[2px] border-black p-12 shadow-2xl xl:px-32 pointer-events-auto z-[90]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => handleMouseEnter("Shop")}
            onMouseLeave={handleMouseLeave}
          >
            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                 style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                 
            <div className="max-w-[1800px] mx-auto grid grid-cols-12 gap-12 h-[500px] relative z-10">
                <div className="col-span-4 grid grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="flex items-center gap-2 pb-4 border-b border-black">
                         <div className="w-1.5 h-1.5 bg-black" />
                         <h4 className="font-mono font-black text-[10px] uppercase tracking-widest text-black">Navigation</h4>
                      </div>
                      <ul className="space-y-4">
                        {["New Arrivals", "Best Sellers", "Sale Collection"].map((l, i) => (
                          <motion.li key={l} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                            <Link href="/products" className="group flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-black/60 hover:text-black transition-all py-2 border-b border-black/5">
                              {l}
                              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-8">
                      <div className="flex items-center gap-2 pb-4 border-b border-black">
                         <div className="w-1.5 h-1.5 bg-black" />
                         <h4 className="font-mono font-black text-[10px] uppercase tracking-widest text-black">Collections</h4>
                      </div>
                      <ul className="space-y-4">
                        {categories.slice(0, 5).map((cat, i) => (
                          <motion.li key={cat.slug} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                            <Link href={`/products?category=${cat.name}`} className="group flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-black/60 hover:text-black transition-all py-2 border-b border-black/5">
                              {cat.name}
                              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                </div>
                
                <div className="col-span-8 grid grid-cols-2 gap-8 h-full">
                  {shopMegaMenu.featured.map((item, idx) => (
                    <Link 
                      key={idx} 
                      href="/products" 
                      className="relative group overflow-hidden border-2 border-black bg-black"
                      data-cursor="VIEW"
                    >
                      <motion.img 
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s] ease-out" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all flex flex-col justify-end p-10 space-y-2">
                          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-white/80 border-b border-white/20 w-max pb-1 mb-2">{item.subtitle}</span>
                          <h3 className="text-white font-display font-black text-4xl uppercase tracking-tighter leading-none">{item.title}</h3>
                      </div>
                      
                      {/* Corner Accents */}
                      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/50" />
                      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/50" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
