"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import SplitTextAnimation from "@/components/ui/SplitTextAnimation";

const showcaseItems = [
  { id: 1, title: "SHELL_01", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600" },
  { id: 2, title: "CARGO_X", img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=600" },
  { id: 3, title: "VOID_BOOT", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600" },
  { id: 4, title: "NEURAL_V", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600" },
  { id: 5, title: "VEST_09", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600" },
  { id: 6, title: "DATA_GLOVE", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600" },
];

export default function DraggableShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <section className="section-padding bg-[#0a0a0a] overflow-hidden border-t border-white/5">
      <div className="max-w-[1800px] mx-auto px-6 md:px-16 mb-20">
        <div className="flex flex-col gap-4">
            <span className="label-tiny text-[#555]">Interactive Lab</span>
            <h2 className="font-serif text-5xl md:text-8xl text-white tracking-tighter">
                Explore the <span className="italic text-[#555]">Fringe.</span>
            </h2>
        </div>
      </div>

      <div className="relative h-[600px] w-full overflow-hidden cursor-grab active:cursor-grabbing">
        <motion.div 
          drag="x"
          dragConstraints={{ left: -1500, right: 0 }}
          className="flex gap-8 px-12 md:px-32 absolute left-0"
        >
          {showcaseItems.map((item, idx) => (
            <motion.div 
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="relative min-w-[300px] md:min-w-[450px] aspect-[4/5] bg-[#111] group overflow-hidden border border-white/5"
            >
              <Image 
                src={item.img} 
                alt={item.title} 
                fill 
                className="object-cover grayscale brightness-50 group-hover:brightness-100 group-hover:grayscale-0 transition-all duration-1000"
              />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <span className="label-tiny text-white/20" style={{ fontSize: '7px' }}>AV_DATA_REF_{item.id}</span>
                <div className="overflow-hidden">
                    <h3 className="font-serif text-4xl text-white translate-y-full group-hover:translate-y-0 transition-transform duration-700">
                        {item.title}
                    </h3>
                </div>
              </div>

              {/* Holographic Line Effect */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
              <div className="absolute inset-y-0 right-0 w-[1px] bg-white/20 scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top delay-100" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-16 mt-12 flex justify-between items-center text-white/20">
        <span className="label-tiny" style={{ fontSize: '8px' }}>[ DRAG TO DISCOVER ]</span>
        <span className="label-tiny" style={{ fontSize: '8px' }}>ARCHIVE_V.04</span>
      </div>
    </section>
  );
}
