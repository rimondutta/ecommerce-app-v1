"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import { Plus } from "lucide-react";

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
    <section ref={sectionRef} className="relative px-6 md:px-16 py-24 md:py-32 max-w-7xl mx-auto bg-white rounded-[2.5rem]">
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
        >
          <span className="text-zinc-500 font-semibold text-xs tracking-wider uppercase mb-3 block">Shop Collection</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-zinc-900 tracking-tight">
            Latest Arrivals
          </h2>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-row overflow-x-auto gap-2 p-1.5 bg-zinc-100/80 backdrop-blur-md rounded-full w-full md:w-auto no-scrollbar"
        >
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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 relative z-10"
        >
          <AnimatePresence mode="popLayout">
            {displayProducts.map((product, idx) => (
              <motion.div key={product._id || idx} variants={itemVariants} layout>
                <ProductCard product={product} index={idx} />
              </motion.div>
            ))}
          </AnimatePresence>
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
