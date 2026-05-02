"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { Heart, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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

export default function EditorialProductGrid({ 
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
        const heading = sectionRef.current!.querySelector("[data-grid-heading]");
        if (heading) {
          gsap.fromTo(heading, { opacity: 0, y: 30 }, {
            opacity: 1, y: 0, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: heading, start: "top 85%" },
          });
        }

        const filters = sectionRef.current!.querySelector("[data-grid-filters]");
        if (filters) {
          gsap.fromTo(filters, { opacity: 0, y: 20 }, {
            opacity: 1, y: 0, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: filters, start: "top 90%" },
          });
        }

        const cards = sectionRef.current!.querySelectorAll("[data-product-card]");
        gsap.fromTo(cards, 
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            stagger: 0.1, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: cards[0], start: "top 88%" },
          }
        );

        const loadMore = sectionRef.current!.querySelector("[data-load-more]");
        if (loadMore) {
          gsap.fromTo(loadMore, { opacity: 0, y: 20 }, {
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: loadMore, start: "top 95%" },
          });
        }
      }, sectionRef);

      return () => ctx.revert();
    };

    initGsap();
  }, [displayProducts.length, selectedCategory]);

  return (
    <section ref={sectionRef} className="relative px-6 md:px-16 py-24 md:py-32 max-w-7xl mx-auto bg-white rounded-[2.5rem]">
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 relative z-10">
        <div data-grid-heading style={{ opacity: 0 }}>
          <span className="text-zinc-500 font-semibold text-xs tracking-wider uppercase mb-3 block">Shop Collection</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-zinc-900 tracking-tight">
            Latest Arrivals
          </h2>
        </div>
        
        <div data-grid-filters className="flex flex-row overflow-x-auto gap-2 p-1.5 bg-zinc-100/80 backdrop-blur-md rounded-full w-full md:w-auto no-scrollbar" style={{ opacity: 0 }}>
           {["all", ...categories.map(c => c.name)].map((cat) => (
             <button
               key={cat}
               onClick={() => { setSelectedCategory(cat.toLowerCase()); setVisibleCount(8); }}
               className={`flex-none text-sm font-medium px-5 py-2.5 rounded-full transition-all relative z-10 whitespace-nowrap ${
                 selectedCategory === cat.toLowerCase() ? "text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
               }`}
             >
               {cat}
               {selectedCategory === cat.toLowerCase() && (
                 <motion.div layoutId="activeCategory" className="absolute inset-0 bg-white rounded-full -z-10" />
               )}
             </button>
           ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="py-32 text-center relative z-10">
           <div className="inline-flex flex-col items-center justify-center p-12 bg-zinc-50 rounded-3xl border border-zinc-100">
             <span className="text-zinc-400 font-medium">No products found in this category.</span>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 relative z-10">
          <AnimatePresence>
            {displayProducts.map((product, idx) => {
              const isFavorited = isWishlisted(String(product.id));
              
              return (
                <motion.div 
                  key={product.id || idx} 
                  className="group flex flex-col"
                  data-product-card
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative aspect-[4/5] bg-zinc-100 rounded-3xl overflow-hidden mb-5">
                    <Link href={`/products/${product.slug}`} className="absolute inset-0 z-[1]">
                      <div className="w-full h-full">
                        <Image
                          src={(product.images[0]?.src && product.images[0].src.length > 1) ? product.images[0].src : "/placeholder.jpg"}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                    </Link>
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-[2] pointer-events-none" />

                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[10] translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={(e) => { e.preventDefault(); toggleItem(String(product.id)); }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-sm ${
                           isFavorited ? "bg-red-500 text-white" : "bg-white/90 text-zinc-600 hover:text-zinc-900 hover:scale-105"
                        }`}
                      >
                        <Heart size={16} fill={isFavorited ? "currentColor" : "none"} strokeWidth={isFavorited ? 0 : 2} />
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-[10] translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
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
                        className="w-full py-3 px-4 rounded-2xl bg-white/90 backdrop-blur-md text-zinc-900 font-semibold text-sm shadow-sm flex items-center justify-center gap-2 hover:bg-white transition-colors"
                      >
                        <ShoppingBag size={16} />
                        Quick Add
                      </button>
                    </div>
    
                    {product.badge && (
                      <div className="absolute top-4 left-4 z-[10]">
                         <span className="bg-white/90 backdrop-blur-md text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                           {product.badge}
                         </span>
                      </div>
                    )}
                  </div>
    
                  <div className="flex flex-col gap-1 px-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-base font-semibold text-zinc-900 leading-tight">
                        <Link href={`/products/${product.slug}`} className="hover:text-zinc-600 transition-colors line-clamp-1">
                          {product.title}
                        </Link>
                      </h3>
                      <span className="text-base font-semibold text-zinc-900">৳{Math.round(product.priceNum).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-zinc-500 capitalize">{product.category}</span>
                      <div className="flex gap-1">
                         {product.colors?.slice(0, 3).map((c, i) => (
                           <div key={i} className="w-3 h-3 rounded-full border border-zinc-200" style={{ backgroundColor: c.hex }} />
                         ))}
                         {product.colors && product.colors.length > 3 && (
                           <span className="text-xs text-zinc-400 pl-1">+{product.colors.length - 3}</span>
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
        <div data-load-more className="mt-20 flex justify-center relative z-10" style={{ opacity: 0 }}>
          <button
            onClick={() => setVisibleCount(prev => prev + 8)}
            className="flex items-center gap-2 bg-white border border-zinc-200 px-8 py-3.5 rounded-full hover:border-zinc-300 hover:shadow-sm transition-all text-zinc-900 font-semibold text-sm"
          >
            Load More
            <Plus size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
