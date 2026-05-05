"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import MagneticElement from "@/components/ui/MagneticElement";

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
  const sectionRef = useRef<HTMLElement>(null);

  const normalizedProducts = useMemo(() => {
    return initialProducts.map(p => ({
      _id: p._id?.toString() || p.id?.toString(),
      title: p.title,
      price: p.price,
      category: typeof p.category === 'object' ? p.category : { name: p.category || "Uncategorized", slug: "" },
      images: p.images || [],
      colors: p.colors || [],
      sizes: p.sizes || [],
      slug: p.slug,
      badge: p.badge
    }));
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return normalizedProducts;
    return normalizedProducts.filter(p => 
      p.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [normalizedProducts, selectedCategory]);

  return (
    <section ref={sectionRef} className="relative px-6 md:px-16 section-padding max-w-[1800px] mx-auto border-t border-white/5 bg-[#0a0a0a]">
      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-20 scanlines" />

      <div className="flex flex-col md:flex-row items-end justify-between mb-24 md:mb-32 gap-12 relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} 
            className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-[1px] bg-[#333]" />
            <span className="label-tiny text-[#555]">Bureau Classification</span>
          </div>
          <h2 className="leading-[0.85]">
            <span className="font-serif text-5xl md:text-8xl text-white block">Digital</span>
            <span className="font-serif italic text-5xl md:text-8xl text-[#555] block">Inventory.</span>
          </h2>
        </motion.div>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="flex flex-row overflow-x-auto gap-4 pb-4 md:pb-0 w-full md:w-auto no-scrollbar border-b border-white/5"
        >
          {["all", ...categories.map(c => c.name)].map((cat) => (
            <button 
                key={cat} 
                onClick={() => { setSelectedCategory(cat.toLowerCase()); setVisibleCount(8); }} 
                className={`flex-none label-tiny px-2 py-3 transition-all relative whitespace-nowrap ${selectedCategory === cat.toLowerCase() ? "text-white" : "text-[#333] hover:text-[#555]"}`}
            >
              {cat}
              {selectedCategory === cat.toLowerCase() && (
                <motion.div layoutId="activeCatUnderline" className="absolute bottom-0 left-0 right-0 h-[1px] bg-white" />
              )}
            </button>
          ))}
        </motion.div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="py-32 text-center relative z-10 border border-white/5">
            <span className="label-tiny text-[#333]">Zero results in current archival slice.</span>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-1 relative z-10">
          <AnimatePresence mode="popLayout">
            {filteredProducts.slice(0, visibleCount).map((product, index) => {
                const isLarge = index % 5 === 0;
                const isMedium = index % 5 === 2 || index % 5 === 4;
                return (
                <motion.div 
                    key={product._id} 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`${isLarge ? 'lg:col-span-8 aspect-[16/10]' : isMedium ? 'lg:col-span-6 aspect-square' : 'lg:col-span-4 aspect-[4/5]'} relative group bg-[#111] overflow-hidden`}
                >
                    <Image 
                        src={product.images[0]?.url || "/placeholder.jpg"} 
                        alt={product.title} 
                        fill 
                        className="object-cover transition-all duration-[1s] ease-[0.16,1,0.3,1] group-hover:scale-105 grayscale group-hover:grayscale-0" 
                        data-cursor="view"
                    />
                    
                    {/* Editorial Overlay */}
                    <div className="absolute inset-0 bg-[#0a0a0a]/40 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    
                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="label-tiny text-white/40" style={{ fontSize: '7px' }}>REF: 00{index + 1}</span>
                                <span className="label-tiny text-white">{typeof product.category === 'object' ? product.category.name : product.category}</span>
                            </div>
                             <MagneticElement strength={0.4}>
                                <Link href={`/products/${product.slug}`} className="w-10 h-10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-500">
                                    <Plus size={16} strokeWidth={1} />
                                </Link>
                            </MagneticElement>
                        </div>
                        
                        <div className="space-y-4">
                            <h3 className="font-serif text-3xl md:text-4xl text-white tracking-tight leading-none">{product.title}</h3>
                            <div className="flex items-center gap-6">
                                <span className="font-serif italic text-white/60 text-lg">৳{Math.round(product.price).toLocaleString()}</span>
                                <div className="h-[1px] flex-grow bg-white/10" />
                                <span className="label-tiny text-white/40 group-hover:text-white transition-colors">Obsidian / Carbon</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Sharp Label */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none opacity-40 group-hover:opacity-0 transition-opacity">
                         <span className="label-tiny text-white" style={{ fontSize: '6px' }}>AV-BUREAU-ARCHIVE</span>
                         <span className="label-tiny text-white" style={{ fontSize: '6px' }}>©2026</span>
                    </div>
                </motion.div>
                );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {visibleCount < filteredProducts.length && (
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-24 flex justify-center relative z-10">
          <button onClick={() => setVisibleCount(prev => prev + 8)} className="btn-pill-secondary">
            Expand Repository
          </button>
        </motion.div>
      )}
    </section>
  );
}
