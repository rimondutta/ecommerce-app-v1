"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

  const displayProducts = filteredProducts.slice(0, visibleCount);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  return (
    <section ref={sectionRef} className="relative px-4 md:px-16 py-16 md:py-32 max-w-7xl mx-auto bg-white md:rounded-[2.5rem]">
      <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-12 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-[1px] bg-zinc-300" />
            <span className="text-zinc-500 font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase">The Selection</span>
          </div>
          <h2 className="font-display font-black text-5xl md:text-7xl text-zinc-900 tracking-tighter leading-[0.9]">
            Latest<br/>
            <span className="text-zinc-400 italic">Curations.</span>
          </h2>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
          className="flex flex-row overflow-x-auto gap-2 p-1.5 bg-zinc-50 border border-zinc-100 backdrop-blur-md rounded-full w-full md:w-auto no-scrollbar shadow-soft-sm"
        >
            {["all", ...categories.map(c => c.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat.toLowerCase()); setVisibleCount(8); }}
                className={`flex-none text-[10px] md:text-xs font-black uppercase tracking-widest px-6 md:px-8 py-3 md:py-4 rounded-full transition-all relative z-10 whitespace-nowrap ${
                  selectedCategory === cat.toLowerCase() ? "text-white" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {cat}
                {selectedCategory === cat.toLowerCase() && (
                  <motion.div layoutId="activeCategory" className="absolute inset-0 bg-black rounded-full -z-10" />
                )}
              </button>
            ))}
        </motion.div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="py-32 text-center relative z-10">
           <div className="inline-flex flex-col items-center justify-center p-12 bg-zinc-50 rounded-3xl border border-zinc-100">
             <span className="text-zinc-400 font-medium">No products found in this category.</span>
           </div>
        </div>
      ) : (
        <motion.div 
          layout
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-12"
        >
          {filteredProducts.slice(0, visibleCount).map((product, index) => {
            const isLarge = index % 5 === 0;
            const isMedium = index % 5 === 2 || index % 5 === 4;
            
            return (
              <motion.div
                key={product._id}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
                  }
                }}
                className={`
                  ${isLarge ? 'lg:col-span-8 lg:aspect-[16/10]' : isMedium ? 'lg:col-span-6 lg:aspect-square' : 'lg:col-span-4 lg:aspect-[4/5]'}
                  relative group
                `}
              >
                <div className="w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-zinc-100 relative border border-zinc-100 shadow-soft-sm group-hover:shadow-soft-xl transition-all duration-700">
                  <Image
                    src={product.images[0]?.url || "/placeholder.jpg"}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="absolute inset-0 p-10 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                    <div className="flex justify-between items-start">
                      <span className="bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/30">
                        {typeof product.category === 'object' ? product.category.name : product.category}
                      </span>
                      <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform">
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-display font-black text-3xl md:text-4xl text-white tracking-tighter leading-none">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-display font-black text-white">${product.price}</span>
                        <div className="h-[1px] flex-grow bg-white/20" />
                        <Link 
                          href={`/products/${product.slug}`}
                          className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:italic"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {visibleCount < filteredProducts.length && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 flex justify-center relative z-10"
        >
          <button
            onClick={() => setVisibleCount(prev => prev + 8)}
            className="flex items-center gap-2 bg-white border border-zinc-200 px-8 py-3.5 rounded-full hover:border-zinc-300 hover:shadow-sm transition-all text-zinc-900 font-semibold text-sm group"
          >
            Load More
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </motion.div>
      )}
    </section>
  );
}
