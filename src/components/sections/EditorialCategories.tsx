"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import SplitTextAnimation from "@/components/ui/SplitTextAnimation";
import MagneticElement from "@/components/ui/MagneticElement";

interface Category { name: string; slug: string; count?: number; }

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
      } catch (err) { console.error("Failed to fetch categories", err); }
    };
    fetchCategories();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-[#0a0a0a] overflow-hidden relative">
      <div className="max-w-[1800px] mx-auto px-6 md:px-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24 relative z-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[1px] bg-[#333]" />
              <span className="label-tiny text-[#8e9192]">The Archive</span>
            </div>
            <h2 className="leading-[0.85] space-y-4">
              <SplitTextAnimation 
                text="Shop By" 
                className="heading-mixed text-white block" 
                delay={0.2}
              />
              <SplitTextAnimation 
                text="Category." 
                className="heading-mixed-italic text-[#8e9192] block" 
                delay={0.4}
              />
            </h2>
          </div>
          <div className="max-w-md md:text-right flex flex-col md:items-end gap-8">
            <p className="label-tiny leading-[2] text-[#8e9192] max-w-[280px]">Discover our carefully curated selections designed for versatile styling.</p>
            <MagneticElement strength={0.3}>
              <Link href="/products" className="btn-pill-primary">Browse Catalog</Link>
            </MagneticElement>
          </div>
        </div>


        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-50px" }} 
          variants={{ 
            hidden: { opacity: 0 }, 
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } } 
          }} 
          className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[400px] md:auto-rows-[600px]"
        >
          {categories.slice(0, 4).map((cat, index) => {
            // Creative Brutalist Grid Mapping
            const colSpan = [
              "md:col-span-8", // First item is wide
              "md:col-span-4", // Second is narrow
              "md:col-span-5", // Third is medium
              "md:col-span-7", // Fourth is wide
            ][index % 4];

            return (
              <motion.div 
                key={cat.slug} 
                variants={{ 
                  hidden: { opacity: 0, scale: 0.95, y: 50 }, 
                  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } } 
                }} 
                className={`group relative overflow-hidden bg-[#111] ${colSpan}`}
              >
                <Link href={`/products?category=${cat.name}`} className="block h-full w-full relative">
                  <div className="absolute inset-0 transition-transform duration-[2.5s] ease-[0.16,1,0.3,1] group-hover:scale-105">
                    <Image 
                      src={placeholderImages[index % placeholderImages.length]} 
                      alt={cat.name} 
                      fill 
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[1s]" 
                    />
                  </div>
                  
                  {/* Glassmorphism technical overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-1000" />
                  
                  {/* Technical Coordinates & Branding */}
                  <div className="absolute top-8 left-8 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-y-4 group-hover:translate-y-0">
                    <span className="label-tiny text-white/40" style={{ fontSize: '7px' }}>SEGMENT_ID: 0{index + 1}</span>
                    <span className="label-tiny text-white/20" style={{ fontSize: '6px' }}>AV_BUREAU_ARCHIVE</span>
                  </div>

                  <div className="absolute inset-0 p-10 md:p-16 flex flex-col justify-end">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-[1px] bg-white/20 group-hover:w-16 transition-all duration-700" />
                        <span className="label-tiny text-white/40" style={{ fontSize: '8px' }}>VOL_0{index + 1}</span>
                      </div>
                      
                      <h3 className="font-serif text-5xl md:text-7xl text-white tracking-tighter leading-none glitch-hover">
                        {cat.name}
                      </h3>
                      
                      <div className="flex items-center gap-8 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-200 translate-x-[-20px] group-hover:translate-x-0">
                        <span className="label-tiny text-white/60" style={{ fontSize: '9px' }}>VIEW_ARCHIVE</span>
                        <ArrowRight size={20} className="text-white" strokeWidth={1} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
