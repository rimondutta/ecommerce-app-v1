"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { Heart, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SplitTextAnimation from "@/components/ui/SplitTextAnimation";

interface Product {
  _id?: string;
  id?: string | number;
  title: string;
  price: number;
  slug: string;
  category: string | { name: string; slug: string };
  images: { url: string; alt?: string }[];
  colors?: { name: string; hex?: string; value?: string }[];
  sizes?: string[];
  badge?: string;
}

interface Category { name: string; slug: string; }

export default function ModernProductGrid({ 
  initialProducts = [], 
  categories = [] 
}: { 
  initialProducts?: Product[],
  categories?: Category[]
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const sectionRef = useRef<HTMLElement>(null);

  const normalizedProducts = useMemo(() => {
    return initialProducts.map(p => ({
      id: p._id?.toString() || p.id,
      title: p.title,
      priceNum: p.price,
      category: typeof p.category === 'object' ? p.category.name : (p.category || "Uncategorized"),
      categorySlug: typeof p.category === 'object' ? p.category.slug : "",
      images: p.images?.map((img) => ({ src: img.url, alt: img.alt })) || [],
      colors: p.colors?.map((c) => ({ name: c.name, hex: c.hex || c.value })) || [],
      sizes: p.sizes || [],
      slug: p.slug,
      badge: p.badge
    }));
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return normalizedProducts;
    return normalizedProducts.filter(p => 
      p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      p.categorySlug?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [normalizedProducts, selectedCategory]);

  const displayProducts = filteredProducts.slice(0, visibleCount);

  // GSAP animations for the section header and grid
  useEffect(() => {
    const initGsap = async () => {
      const { gsap, ScrollTrigger } = await import("@/lib/gsap");
      if (!sectionRef.current) return;

      const ctx = gsap.context(() => {
        // Heading reveal
        const heading = sectionRef.current!.querySelector("[data-grid-heading]");
        if (heading) {
          gsap.fromTo(heading, { opacity: 0, y: 80 }, {
            opacity: 1, y: 0, duration: 1.4, ease: "expo.out",
            scrollTrigger: { trigger: heading, start: "top 85%" },
          });
        }

        // Filter bar slide in
        const filters = sectionRef.current!.querySelector("[data-grid-filters]");
        if (filters) {
          gsap.fromTo(filters, { opacity: 0, x: 60 }, {
            opacity: 1, x: 0, duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: filters, start: "top 90%" },
          });
        }

        // Product cards staggered entrance
        const cards = sectionRef.current!.querySelectorAll("[data-product-card]");
        gsap.fromTo(cards, 
          { opacity: 0, y: 100, scale: 0.92 },
          {
            opacity: 1, y: 0, scale: 1,
            stagger: 0.1, duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: cards[0], start: "top 88%" },
          }
        );

        // Image parallax inside each card
        cards.forEach((card) => {
          const img = card.querySelector("[data-card-img]");
          if (img) {
            gsap.to(img, {
              y: -20,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            });
          }
        });

        // Load more button
        const loadMore = sectionRef.current!.querySelector("[data-load-more]");
        if (loadMore) {
          gsap.fromTo(loadMore, { opacity: 0, y: 30 }, {
            opacity: 1, y: 0, duration: 1, ease: "expo.out",
            scrollTrigger: { trigger: loadMore, start: "top 95%" },
          });
        }
      }, sectionRef);

      return () => ctx.revert();
    };

    initGsap();
  }, [displayProducts.length, selectedCategory]);

  return (
    <section ref={sectionRef} className="relative px-4 md:px-16 py-32 md:py-48 max-w-[1800px] mx-auto bg-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="flex flex-col lg:flex-row items-end justify-between mb-24 md:mb-32 gap-12 relative z-10">
        <div data-grid-heading style={{ opacity: 0 }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-black/50">Sys.Inventory</span>
          </div>
          <SplitTextAnimation 
            text="The Archive"
            className="font-display font-black uppercase text-5xl md:text-[7rem] tracking-tighter leading-[0.85] text-black"
          />
        </div>
        
        <div data-grid-filters className="flex flex-row overflow-x-auto gap-2 border border-black/10 p-2 bg-white/50 backdrop-blur-sm w-full lg:w-auto no-scrollbar" style={{ opacity: 0 }}>
           {["all", ...categories.map(c => c.name)].map((cat) => (
             <button
               key={cat}
               onClick={() => { setSelectedCategory(cat.toLowerCase()); setVisibleCount(8); }}
               className={`flex-none text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] px-6 py-3 transition-all relative z-10 whitespace-nowrap ${
                 selectedCategory === cat.toLowerCase() ? "text-white" : "text-black/60 hover:text-black hover:bg-black/5"
               }`}
             >
               {cat}
               {selectedCategory === cat.toLowerCase() && (
                 <motion.div layoutId="activeTab" className="absolute inset-0 bg-black -z-10" />
               )}
             </button>
           ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="py-40 text-center relative z-10">
           <div className="inline-flex items-center justify-center border border-black/10 p-12 bg-white/50 backdrop-blur-sm">
             <span className="font-mono text-sm uppercase tracking-[0.3em] text-black/40">[ No Data Found ]</span>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-24 md:gap-y-32 relative z-10">
          <AnimatePresence>
            {displayProducts.map((product, idx) => {
              const isFavorited = isWishlisted(String(product.id));
              const offsetClass = idx % 2 !== 0 ? "lg:mt-32" : "";
              
              return (
                <motion.div 
                  key={product.id || idx} 
                  className={`group flex flex-col ${offsetClass}`}
                  data-product-card
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="relative aspect-[3/4] bg-[#fafafa] overflow-hidden border border-black/5" data-cursor="VIEW">
                    <Link href={`/products/${product.slug}`} className="absolute inset-0 z-[1]">
                      <div data-card-img className="w-full h-full will-change-transform">
                        <Image
                          src={(product.images[0]?.src && product.images[0].src.length > 1) ? product.images[0].src : "/placeholder.jpg"}
                          alt={product.title}
                          fill
                          className="object-cover opacity-90 group-hover:opacity-100 mix-blend-multiply group-hover:scale-105 transition-all duration-1000 ease-[0.16,1,0.3,1]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                    </Link>
                    
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-black/30 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-black/30 pointer-events-none" />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-500 z-[2] pointer-events-none" />
                    
                    <div className="absolute bottom-6 left-6 z-[3] translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none flex flex-col gap-1">
                      <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white backdrop-blur-md bg-black/40 px-2 py-1 inline-block w-max">
                        ID: {String(product.id).slice(-6)}
                      </span>
                      {product.sizes && product.sizes.length > 0 && (
                        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-black backdrop-blur-md bg-white/80 px-2 py-1 inline-block w-max">
                          SZ: {product.sizes.slice(0,3).join(", ")}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-6 right-6 flex flex-col gap-2 z-[10] translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                      <button 
                        onClick={(e) => { e.preventDefault(); toggleItem(String(product.id)); }}
                        className={`w-10 h-10 flex items-center justify-center border transition-all backdrop-blur-md ${
                           isFavorited ? "bg-black border-black text-white" : "bg-white/80 border-black/10 text-black hover:bg-black hover:border-black hover:text-white"
                        }`}
                        data-cursor="WISHLIST"
                      >
                        <Heart size={16} fill={isFavorited ? "currentColor" : "none"} strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          if (product.colors?.length > 0 || product.sizes?.length > 0) {
                            window.location.href = `/products/${product.slug}`;
                            return;
                          }
                          addItem({ 
                            id: String(product.id), slug: product.slug, title: product.title, 
                            price: product.priceNum, quantity: 1, color: "Default", 
                            size: "Default", image: (product.images[0]?.src && product.images[0].src.length > 1) ? product.images[0].src : "/placeholder.jpg"
                          });
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md border border-black/10 text-black hover:bg-black hover:text-white hover:border-black transition-all"
                        data-cursor="CART"
                      >
                        <Plus size={18} strokeWidth={1.5} />
                      </button>
                    </div>
    
                    {product.badge && (
                      <div className="absolute top-6 left-6 z-[10]">
                         <span className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 border border-white/20">
                           {product.badge}
                         </span>
                      </div>
                    )}
                  </div>
    
                  <div className="mt-6 space-y-4 relative">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-[13px] font-black uppercase tracking-widest text-black leading-tight">
                        <Link href={`/products/${product.slug}`} className="hover:text-black/60 transition-colors">
                          {product.title}
                        </Link>
                      </h3>
                      <span className="text-sm font-mono tracking-tighter text-black bg-white px-2 py-1 border border-black/10">৳{Math.round(product.priceNum).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-black/10 pt-4">
                      <span className="text-[9px] font-mono text-black/50 uppercase tracking-[0.3em]">{product.category}</span>
                      <div className="flex gap-1.5">
                         {product.colors?.slice(0, 3).map((c, i) => (
                           <div key={i} className="w-2.5 h-2.5 rounded-none border border-black/20" style={{ backgroundColor: c.hex }} />
                         ))}
                         {product.colors && product.colors.length > 3 && (
                           <span className="text-[8px] font-mono text-black/40 pl-1">+{product.colors.length - 3}</span>
                         )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {visibleCount < filteredProducts.length && (
        <div data-load-more className="mt-32 flex justify-center relative z-10" style={{ opacity: 0 }}>
          <button
            onClick={() => setVisibleCount(prev => prev + 8)}
            className="group flex items-center gap-4 bg-white border border-black/20 pl-8 pr-2 py-2 hover:border-black transition-colors"
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black">Load More Data</span>
            <div className="w-10 h-10 bg-[#fafafa] flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
              <Plus size={16} strokeWidth={2} />
            </div>
          </button>
        </div>
      )}
    </section>
  );
}
