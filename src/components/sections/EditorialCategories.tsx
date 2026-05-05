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


        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((cat, index) => (
            <motion.div key={cat.slug} variants={{ hidden: { opacity: 0, y: 100 }, visible: { opacity: 1, y: 0, transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } } }} className="group relative">
              <Link href={`/products?category=${cat.name}`} className="relative h-[450px] md:h-[650px] overflow-hidden bg-[#111] block">
                <div className="absolute inset-0 transition-transform duration-[2s] ease-[0.16,1,0.3,1] group-hover:scale-110">
                  <Image src={placeholderImages[index % placeholderImages.length]} alt={cat.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[600ms]" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="space-y-4 translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1]">
                    <span className="label-tiny text-white/40 block" style={{ fontSize: '8px' }}>Volume 0{index + 1}</span>
                    <h3 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-none">{cat.name}</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full"><ArrowRight size={16} strokeWidth={1} /></div>
                      <span className="label-tiny text-white/40 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100" style={{ fontSize: '8px' }}>Explore</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <span className="label-tiny text-white/20" style={{ fontSize: '8px' }}>AV-26-0{index + 1}</span>
                </div>
              </Link>
            </motion.div>
          ))}

          {categories.length < 4 && Array.from({ length: 4 - categories.length }).map((_, i) => (
            <div key={i} className="bg-[#111] flex items-center justify-center h-[450px] md:h-[650px]">
              <span className="label-tiny text-[#333]">Coming Soon</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
