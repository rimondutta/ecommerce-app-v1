"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PerspectiveCard from "../ui/PerspectiveCard";

interface Category {
  name: string;
  slug: string;
  count?: number;
}

const placeholderImages = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c028c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
];

export default function EditorialCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

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
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-white overflow-hidden relative">
      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
            }
          }}
          className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24 relative z-20"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[1px] bg-zinc-300" />
              <span className="text-zinc-500 font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase">The Archive</span>
            </div>
            <h2 className="font-display font-black text-5xl md:text-8xl text-zinc-900 tracking-[-0.05em] leading-[0.85]">
              Shop By<br/>
              <span className="text-zinc-400 italic">Category.</span>
            </h2>
          </div>

          <div className="max-w-md md:text-right flex flex-col md:items-end gap-8">
            <p className="text-[11px] uppercase tracking-[0.2em] leading-relaxed text-zinc-500 max-w-[280px]">
              Discover our carefully curated selections designed for versatile styling and daily functionality.
            </p>
            <Link
              href="/products"
              className="group relative inline-flex items-center gap-4 bg-black text-white px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl overflow-hidden"
            >
              <span className="relative z-10">Browse Catalog</span>
              <div className="absolute inset-0 bg-zinc-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.slice(0, 4).map((cat, index) => (
            <motion.div 
              key={cat.slug} 
              variants={{
                hidden: { opacity: 0, y: 100 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
                }
              }}
              className="group relative"
            >
              <Link
                href={`/products?category=${cat.name}`}
                className="relative h-[450px] md:h-[650px] overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] bg-zinc-100 block shadow-soft-xl group-hover:shadow-soft-2xl transition-all duration-700"
              >
                <div className="absolute inset-0 transition-transform duration-[2s] ease-[0.16,1,0.3,1] group-hover:scale-110">
                  <Image 
                    src={placeholderImages[index % placeholderImages.length]} 
                    alt={cat.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
              
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                   <motion.div 
                     initial={{ y: 20, opacity: 0 }}
                     whileInView={{ y: 0, opacity: 1 }}
                     transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                     className="space-y-4 translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1]"
                   >
                      <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] block">Volume 0{index + 1}</span>
                      <h3 className="font-display font-black text-4xl md:text-6xl text-white tracking-tighter leading-none group-hover:italic transition-all duration-700">
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                          <ArrowRight size={24} />
                        </div>
                        <span className="text-white/40 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">Explore Collection</span>
                      </div>
                   </motion.div>
                </div>

                {/* Technical Overlay */}
                <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                   <span className="text-white/40 text-[9px] font-mono uppercase tracking-widest">FW-2026-CAT-0{index + 1}</span>
                </div>

                {/* Noise Layer */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-overlay" />
              </Link>
            </motion.div>
          ))}

          {categories.length < 4 && Array.from({ length: 4 - categories.length }).map((_, i) => (
            <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-3xl flex items-center justify-center h-[450px] md:h-[550px]">
              <span className="text-sm text-zinc-400 font-medium">Coming Soon</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
