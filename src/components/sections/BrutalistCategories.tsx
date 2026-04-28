"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import SplitTextAnimation from "@/components/ui/SplitTextAnimation";

const categories = [
  {
    title: "Outerwear",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-12 md:col-span-8",
    height: "h-[40vh] md:h-[60vh]",
    speed: 1.1
  },
  {
    title: "Essentials",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-12 md:col-span-4",
    height: "h-[35vh] md:h-[45vh] md:mt-32",
    speed: 0.9
  },
  {
    title: "Accessories",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-12 md:col-span-5",
    height: "h-[35vh] md:h-[50vh] md:-mt-10",
    speed: 1.2
  },
  {
    title: "Footwear",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-12 md:col-span-7",
    height: "h-[40vh] md:h-[70vh]",
    speed: 0.8
  }
];

export default function BentoCategories() {
  return (
    <section className="relative pt-40 pb-32 px-4 md:px-16 max-w-[1800px] mx-auto bg-[#f0ece5] overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-10 relative z-10">
        <div className="relative">
          <div className="absolute -left-8 top-4 w-4 h-4 border-t-2 border-l-2 border-black/20" />
          <SplitTextAnimation 
            text="Explore"
            className="font-display font-black text-6xl md:text-8xl uppercase tracking-tighter leading-[0.9] text-black mb-2"
          />
          <SplitTextAnimation 
            text="Silhouettes"
            className="font-display font-black text-6xl md:text-8xl uppercase tracking-tighter leading-[0.9] italic text-black/40"
            delay={0.4}
          />
        </div>
        <p className="max-w-md font-mono text-[10px] md:text-xs uppercase tracking-widest leading-relaxed text-black/60 border-l-2 border-black/10 pl-6">
           Curated selections defining the contemporary wardrobe. Pieces selected for architectural form and enduring utility.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 md:gap-10 relative z-10">
        {categories.map((cat, idx) => (
          <motion.div
            key={idx}
            className={`${cat.colSpan} ${cat.height} min-h-[350px] relative group overflow-hidden bg-black`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href={`/products?category=${cat.title.toLowerCase()}`} className="block w-full h-full relative" data-cursor="VIEW">
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-60 group-hover:opacity-90 transition-all duration-1000 group-hover:scale-105 mix-blend-luminosity group-hover:mix-blend-normal"
              />
              
              {/* Technical Corner Brackets */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/30 transition-all duration-500 group-hover:border-white group-hover:w-8 group-hover:h-8" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/30 transition-all duration-500 group-hover:border-white group-hover:w-8 group-hover:h-8" />
              
              <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end">
                <div className="relative z-10 bg-black/20 backdrop-blur-md border border-white/10 p-6 md:p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]">
                  <div className="overflow-hidden flex items-center justify-between mb-4">
                    <motion.p 
                      className="font-mono text-[9px] text-white/70 uppercase tracking-[0.4em] flex items-center gap-3"
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="w-1.5 h-1.5 bg-white rounded-full group-hover:animate-pulse" />
                      Archive_{idx.toString().padStart(2, '0')}
                    </motion.p>
                    <div className="w-8 h-px bg-white/30 group-hover:w-16 transition-all duration-500" />
                  </div>
                  
                  <div className="overflow-hidden relative">
                    <motion.h3 
                      className="font-display font-black text-4xl md:text-6xl text-white uppercase tracking-tighter leading-none group-hover:text-transparent transition-colors duration-500"
                      style={{ WebkitTextStroke: '1px white' }}
                      initial={{ y: 50 }}
                      whileInView={{ y: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {cat.title}
                    </motion.h3>
                    {/* Solid text overlay that fades in */}
                    <h3 className="font-display font-black text-4xl md:text-6xl text-white uppercase tracking-tighter leading-none absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {cat.title}
                    </h3>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
