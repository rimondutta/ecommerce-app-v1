"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const products = [
  {
    id: 1,
    name: "AERO SHELL 01",
    category: "Outerwear",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop",
    price: "$450"
  },
  {
    id: 2,
    name: "NEURAL KNIT",
    category: "Base Layer",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    price: "$280"
  },
  {
    id: 3,
    name: "CYBER CARGO",
    category: "Bottoms",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1000&auto=format&fit=crop",
    price: "$320"
  },
  {
    id: 4,
    name: "VOID RUNNER",
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
    price: "$190"
  },
  {
    id: 5,
    name: "THERMAL VEST",
    category: "Techwear",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop",
    price: "$220"
  }
];

export default function HorizontalCollection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);

  return (
    <section ref={targetRef} className="relative h-[150vh] md:h-[250vh] bg-zinc-50">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        
        <div className="px-6 md:px-16 mb-12 md:mb-16 relative z-10 max-w-[1800px] mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-zinc-500 font-semibold text-xs tracking-wider uppercase block mb-3">Limited Edition</span>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-zinc-900 tracking-tight">
                Featured Drop
              </h2>
            </div>
            <p className="text-zinc-500 text-sm md:text-base max-w-sm leading-relaxed">
              Discover our latest capsule collection. Architecturally inspired silhouettes crafted from premium materials.
            </p>
          </div>
        </div>
        
        <div className="pl-6 md:pl-16 relative z-10 w-full overflow-x-auto md:overflow-visible no-scrollbar">
          <motion.div 
            style={{ x: typeof window !== 'undefined' && window.innerWidth > 768 ? x : 0 }} 
            className="flex gap-6 md:gap-8 w-max pr-16"
          >
            {products.map((product, idx) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] as any }}
                viewport={{ once: true, margin: "-100px" }}
                className="group w-[75vw] md:w-[400px] flex flex-col gap-5 cursor-pointer"
              >
                <div className="relative aspect-[4/5] bg-zinc-100 rounded-3xl overflow-hidden shadow-soft-sm group-hover:shadow-soft-xl transition-all duration-500">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105"
                    sizes="(max-width: 768px) 75vw, 400px"
                  />
                </div>
                
                <div className="flex flex-col gap-1 px-2">
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{product.category}</p>
                  <div className="flex justify-between items-center gap-4">
                    <h3 className="text-zinc-900 text-lg font-bold tracking-tight">{product.name}</h3>
                    <p className="text-zinc-900 font-medium">{product.price}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
