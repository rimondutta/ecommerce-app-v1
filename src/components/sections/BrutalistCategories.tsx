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

      <div className="grid grid-cols-12 gap-8 md:gap-12 lg:gap-16 relative">
        {categories.map((cat, idx) => (
          <motion.div
            key={idx}
            className={`${cat.colSpan} ${cat.height} relative group overflow-hidden rounded-[2rem] bg-black`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href={`/products?category=${cat.title}`} className="block w-full h-full" data-cursor="VIEW">
              <motion.div
                className="relative w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                />
              </motion.div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-10 md:p-16 lg:p-20">
                <span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.4em] mb-2">Category_{idx + 1}</span>
                <h3 className="font-display font-black text-4xl md:text-5xl text-white uppercase tracking-tighter pb-2 leading-none">
                  {cat.title}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
