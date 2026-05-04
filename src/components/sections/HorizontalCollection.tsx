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
  return (
    <section className="py-24 md:py-32 bg-zinc-50 overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 md:px-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
          <div className="max-w-2xl">
            <span className="text-zinc-500 font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase block mb-4">Seasonal Launch</span>
            <h2 className="font-display font-black text-5xl md:text-8xl text-zinc-900 tracking-tighter leading-[0.85]">
              Featured<br/>
              <span className="text-zinc-400">Drop.</span>
            </h2>
          </div>
          <p className="text-zinc-500 text-base md:text-xl max-w-sm leading-relaxed font-medium">
            Architecturally inspired silhouettes crafted from proprietary tech-fabrics. Engineered for the modern nomad.
          </p>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {/* Main Hero Product */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:row-span-2 group relative aspect-[4/5] md:aspect-auto md:h-full min-h-[500px] bg-zinc-100 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-soft cursor-pointer"
          >
            <Image
              src={products[0].image}
              alt={products[0].name}
              fill
              className="object-cover transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
               <span className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">{products[0].category}</span>
               <div className="flex justify-between items-end">
                  <h3 className="text-white text-3xl md:text-5xl font-black tracking-tighter">{products[0].name}</h3>
                  <p className="text-white text-xl md:text-2xl font-light">{products[0].price}</p>
               </div>
            </div>
          </motion.div>

          {/* Supporting Products */}
          {products.slice(1).map((product, idx) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] as any }}
              viewport={{ once: true }}
              className="group flex flex-col gap-6 cursor-pointer"
            >
              <div className="relative aspect-[4/5] bg-zinc-100 rounded-[2rem] overflow-hidden shadow-soft-sm group-hover:shadow-soft-xl transition-all duration-500">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              
              <div className="flex justify-between items-start px-2">
                <div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{product.category}</p>
                  <h3 className="text-zinc-900 text-xl font-black tracking-tight">{product.name}</h3>
                </div>
                <p className="text-zinc-900 font-bold text-lg">{product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
