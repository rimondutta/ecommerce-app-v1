"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";

const HeroShape = dynamic(() => import("@/components/3d/HeroShape"), { ssr: false });

export default function EditorialHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for 3D parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  
  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);

  // Use state to track if we're on the client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates from -0.5 to 0.5
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
      className="relative h-screen w-full bg-white overflow-hidden perspective-1000 flex items-center justify-center border-x border-zinc-100"
    >
      {/* Top Left Dots - Monochrome - Hidden on Mobile */}
      <div className="hidden md:flex absolute top-12 left-12 gap-1.5 z-20">
        <div className="w-2.5 h-2.5 rounded-full bg-black" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-100" />
      </div>

      {/* Bottom Left Icons - Grayscale - Hidden on Mobile */}
      <div className="hidden md:flex absolute bottom-12 left-12 gap-3 text-lg z-20 opacity-30 grayscale">
        <span>🏀</span>
        <span>🎉</span>
        <span>🌲</span>
        <span>🎁</span>
        <span>🏓</span>
      </div>

      {/* Bottom Right Wave - Monochrome - Hidden on Mobile */}
      <div className="hidden md:flex absolute bottom-12 right-12 z-20 opacity-40">
        <svg width="100" height="20" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M0 10 Q 12.5 20, 25 10 T 50 10 T 75 10 T 100 10" stroke="#888" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Massive Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-[25vw] md:text-[22vw] font-black text-zinc-50 leading-none tracking-tight whitespace-nowrap"
        >
          FLEXWEAR
        </motion.h1>
      </div>

      {/* Central 3D Scene */}
      <motion.div
        style={{ 
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="relative z-10 w-full max-w-4xl h-[600px] flex items-center justify-center"
      >
        {/* Curved Dotted Line (Back layer) */}
        <div className="absolute inset-0 pointer-events-none" style={{ transform: "translateZ(-50px)" }}>
          <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0">
            <path 
              d="M 100 450 Q 400 250 700 200" 
              stroke="#000" 
              strokeWidth="2" 
              strokeDasharray="6 6" 
              fill="none" 
            />
            {/* Arrow head */}
            <path d="M 695 195 L 705 200 L 695 205 Z" fill="#000" />
          </svg>
        </div>

        {/* Real 3D Hero Shape (Middle layer) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: "translateZ(0px)" }}
        >
          <HeroShape />
        </motion.div>

        {/* Foreground Elements (Front layer) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateZ(80px)" }}>
          
          {/* Sophisticated Badge */}
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15, delay: 0.5 }}
            className="absolute ml-[180px] mt-[-80px] w-28 h-28 rounded-full border border-zinc-200 bg-white/40 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl border-white/20"
          >
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400 mb-1">New</span>
            <span className="text-xl font-display font-black text-black">2026</span>
            <span className="text-[8px] font-bold tracking-[0.1em] uppercase text-zinc-500 mt-1">Core DNA</span>
          </motion.div>

          {/* Typography block */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any, delay: 0.6 }}
            className="absolute bottom-12 md:bottom-auto md:ml-[260px] md:mt-[120px] flex flex-col items-center md:items-start gap-6"
          >
            <h2 className="text-black font-display font-black text-4xl md:text-6xl tracking-[-0.04em] leading-[0.9] text-center md:text-left">
              BEYOND<br />
              <span className="text-zinc-400 italic">UTILITY.</span>
            </h2>
            
            <div className="pointer-events-auto flex flex-col md:flex-row items-center gap-6">
              <Link href="/shop" className="group relative inline-flex items-center justify-center px-10 py-5 bg-black text-white rounded-full text-xs font-bold tracking-[0.2em] uppercase overflow-hidden shadow-2xl transition-transform hover:scale-105 active:scale-95">
                <span className="relative z-10">Shop Now</span>
                <div className="absolute inset-0 bg-zinc-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
              </Link>
              
              <div className="hidden md:flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-50 transition-colors">
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">The Story</span>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>

  );
}
