"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";

export default function EditorialHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  
  const moveX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const moveY = useTransform(springY, [-0.5, 0.5], [-30, 30]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center border-b border-white/5"
    >
      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-20 scanlines" />

      {/* Massive Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
            <h1 className="font-serif text-[35vw] md:text-[30vw] text-white/[0.02] leading-none tracking-tighter whitespace-nowrap">
                AVANT
            </h1>
        </motion.div>
      </div>

      {/* Editorial Grid Lines */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute left-[8%] top-0 h-full w-[1px] bg-white/5" />
        <div className="absolute right-[8%] top-0 h-full w-[1px] bg-white/5" />
        <div className="absolute top-[12%] left-0 w-full h-[1px] bg-white/5" />
        <div className="absolute bottom-[12%] left-0 w-full h-[1px] bg-white/5" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-[1800px] mx-auto px-6 md:px-16 w-full mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left — Typography */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="lg:col-span-6 space-y-12"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-[1px] bg-[#333]" />
                <span className="label-tiny text-[#555]">Archival System v.01</span>
              </div>
            </div>
            
            <h2 className="leading-[0.8] tracking-[-0.04em]">
              <span className="font-serif text-6xl md:text-9xl text-white block">Sculpted in</span>
              <span className="font-serif italic text-6xl md:text-9xl text-[#555] block">Obsidian.</span>
            </h2>

            <p className="label-tiny leading-[2] text-[#8e9192] max-w-sm">
                A study in brutalist form. High-integrity textiles met with surgical precision. Stripped of the superficial, leaving only the essential.
            </p>

            <div className="flex items-center gap-8 pt-6">
              <Link href="/products" className="btn-pill-primary group">
                Enter Archive
              </Link>
              <Link href="/shop" className="label-tiny text-[#333] hover:text-white transition-colors border-b border-white/10 pb-1">
                Philosophy —&gt;
              </Link>
            </div>
          </motion.div>

          {/* Right — Editorial Image */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative"
          >
            <motion.div 
              style={{ x: moveX, y: moveY }}
              className="relative aspect-[3/4] lg:aspect-[4/5] overflow-hidden group border border-white/5"
            >
              <img 
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
                alt="AVANT GARDE Editorial"
                className="w-full h-full object-cover grayscale brightness-75 contrast-125 transition-all duration-[1s] ease-[0.16,1,0.3,1] group-hover:grayscale-0 group-hover:scale-110"
              />
              
              {/* Technical Overlay */}
              <div className="absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md border border-white/5">
                <span className="label-tiny text-[#555]" style={{ fontSize: '7px' }}>BUREAU / ARCHIVE-001</span>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between mix-blend-difference">
                <span className="label-tiny text-white/40">Look 01 / Obsidian Shell</span>
                <span className="label-tiny text-white/40">© 2026 AVANT</span>
              </div>
            </motion.div>

            {/* Floating Detail Image - Hidden on Mobile */}
            <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="hidden lg:block absolute -right-12 -bottom-12 w-48 h-64 bg-[#111] border border-white/10 p-1 z-20"
            >
                <div className="relative w-full h-full overflow-hidden">
                    <img 
                        src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop"
                        alt="Detail"
                        className="w-full h-full object-cover grayscale opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="label-tiny text-white/20 rotate-90" style={{ fontSize: '6px' }}>MACRO_DETAIL</span>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Side Info */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 vertical-text hidden md:block">
        <span className="label-tiny text-[#333] tracking-[0.5em]">AVANT GARDE — ARCHIVAL BUREAU</span>
      </div>

      <div className="absolute right-8 top-1/2 -translate-y-1/2 vertical-text hidden md:block">
        <span className="label-tiny text-[#333] tracking-[0.5em]">23.8103° N, 90.4125° E</span>
      </div>

      <style jsx>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
      `}</style>
    </section>
  );
}
