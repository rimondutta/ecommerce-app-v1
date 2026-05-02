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
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-75%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-zinc-950 overflow-clip">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://res.cloudinary.com/dcb9v7q9s/image/upload/v1707577544/noise_vvym8y.png')]" />
        
        <div className="px-10 mb-10 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="font-display font-black text-4xl md:text-7xl text-white uppercase tracking-tighter"
          >
            Featured<br/>Drop.
          </motion.h2>
        </div>
        
        <motion.div style={{ x }} className="flex gap-8 px-10 relative z-10">
          {products.map((product, idx) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative flex-shrink-0 w-[85vw] md:w-[450px] aspect-[4/5] bg-zinc-900 rounded-3xl overflow-hidden cursor-pointer shadow-2xl"
              data-cursor-text="View"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                sizes="(max-width: 768px) 85vw, 450px"
              />
              {/* Permanent subtle gradient for readability + hover intensification */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <p className="text-white/60 text-[10px] md:text-xs font-mono uppercase tracking-[0.4em] mb-3">{product.category}</p>
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-2 tracking-tight">{product.name}</h3>
                <div className="flex items-center gap-4">
                  <p className="text-white font-mono text-lg">{product.price}</p>
                  <span className="w-8 h-[1px] bg-white/30" />
                  <span className="text-white/40 text-[10px] uppercase tracking-widest group-hover:text-white transition-colors">Details</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none select-none">
          <h2 className="text-[30vw] font-black text-white/[0.02] leading-none uppercase italic">
            ARCHIVE
          </h2>
        </div>
      </div>
    </section>
  );
}
