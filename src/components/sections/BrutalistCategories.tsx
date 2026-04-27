"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    title: "Outerwear",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-12 md:col-span-8",
    height: "h-[60vh]",
    speed: 1.1
  },
  {
    title: "Essentials",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-12 md:col-span-4",
    height: "h-[45vh] md:mt-32",
    speed: 0.9
  },
  {
    title: "Accessories",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-12 md:col-span-5",
    height: "h-[50vh] md:-mt-10",
    speed: 1.2
  },
  {
    title: "Footwear",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-12 md:col-span-7",
    height: "h-[70vh]",
    speed: 0.8
  }
];

export default function BentoCategories() {
  return (
    <section className="relative py-32 px-4 md:px-16 max-w-[1800px] mx-auto bg-[#f0ece5]">
      <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-10">
        <h2 className="font-display font-black text-6xl md:text-8xl uppercase tracking-tighter leading-[0.9]">
          Explore <br/><span className="italic text-black/60">Silhouettes</span>
        </h2>
        <p className="max-w-md font-mono text-xs uppercase tracking-widest leading-relaxed text-black/70">
           Curated selections defining the contemporary wardrobe. Pieces selected for architectural form and enduring utility.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 md:gap-12 relative">
        {categories.map((cat, idx) => (
          <motion.div
            key={idx}
            className={`${cat.colSpan} ${cat.height} min-h-[350px] relative group overflow-hidden rounded-[1.5rem] bg-black`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href={`/products?category=${cat.title.toLowerCase()}`} className="block w-full h-full" data-cursor="VIEW">
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-70 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105"
              />
              
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent">
                <div className="overflow-hidden">
                  <motion.p 
                    className="font-mono text-[9px] text-white/50 uppercase tracking-[0.4em] mb-3"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Archive_{idx.toString().padStart(2, '0')}
                  </motion.p>
                </div>
                <div className="overflow-hidden">
                  <motion.h3 
                    className="font-display font-black text-4xl md:text-6xl text-white uppercase tracking-tighter leading-none"
                    initial={{ y: 50 }}
                    whileInView={{ y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {cat.title}
                  </motion.h3>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
