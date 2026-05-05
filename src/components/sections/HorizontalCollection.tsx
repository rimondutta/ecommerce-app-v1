"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const products = [
  {
    id: 1,
    name: "ARCHIVAL SHELL 01",
    category: "Outerwear",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop",
    price: "৳45,000"
  },
  {
    id: 2,
    name: "NEURAL TEXTILE",
    category: "Base Layer",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    price: "৳28,000"
  },
  {
    id: 3,
    name: "CYBER CARGO",
    category: "Bottoms",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1000&auto=format&fit=crop",
    price: "৳32,000"
  },
  {
    id: 4,
    name: "VOID RUNNER",
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
    price: "৳19,000"
  }
];

export default function HorizontalCollection() {
  return (
    <section className="py-24 md:py-40 bg-[#0a0a0a] overflow-hidden border-y border-white/5">
      <div className="max-w-[1800px] mx-auto px-6 md:px-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 md:mb-32">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-[1px] bg-[#333]" />
              <span className="label-tiny text-[#555]">Bureau Select</span>
            </div>
            <h2 className="leading-[0.85]">
              <span className="font-serif text-5xl md:text-8xl text-white block">Seasonal</span>
              <span className="font-serif italic text-5xl md:text-8xl text-[#555] block">Archive.</span>
            </h2>
          </div>
          <p className="label-tiny leading-[2] text-[#8e9192] max-w-sm">
            Architecturally inspired silhouettes crafted from proprietary textiles. Engineered for the modern nomadic state.
          </p>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Main Hero Product */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:row-span-2 group relative aspect-[4/5] md:aspect-auto md:h-full min-h-[600px] bg-[#111] overflow-hidden"
          >
            <Image
              src={products[0].image}
              alt={products[0].name}
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[1s] ease-[0.16,1,0.3,1] group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-10 md:p-16">
               <span className="label-tiny text-[#555] mb-4">{products[0].category}</span>
               <div className="flex justify-between items-end">
                  <h3 className="font-serif text-white text-4xl md:text-6xl tracking-tight">{products[0].name}</h3>
                  <p className="font-serif italic text-white text-xl md:text-2xl">{products[0].price}</p>
               </div>
            </div>
          </motion.div>

          {/* Supporting Products */}
          {products.slice(1).map((product, idx) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="group flex flex-col gap-6 cursor-pointer bg-[#111] p-0"
            >
              <div className="relative aspect-[4/5] bg-[#111] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              
              <div className="flex justify-between items-start px-8 pb-8">
                <div>
                  <p className="label-tiny text-[#555] mb-2">{product.category}</p>
                  <h3 className="font-serif text-white text-xl tracking-tight group-hover:text-[#8e9192] transition-colors">{product.name}</h3>
                </div>
                <p className="font-serif text-white text-lg">{product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 flex justify-center">
            <Link href="/products" className="btn-pill-primary">Observe Full Archive</Link>
        </div>
      </div>
    </section>
  );
}
