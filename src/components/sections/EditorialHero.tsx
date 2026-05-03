"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";

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
      className="relative h-screen w-full bg-gradient-to-b from-[#bfe2ff] to-[#ffffff] overflow-hidden perspective-1000 flex items-center justify-center border-x border-[#bfe2ff]"
    >
      {/* Top Left Dots */}
      <div className="absolute top-12 left-12 flex gap-1.5 z-20">
        <div className="w-2.5 h-2.5 rounded-full bg-[#00d084]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#8ed1fc]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff8a65]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#f78da7]" />
      </div>

      {/* Bottom Left Icons */}
      <div className="absolute bottom-12 left-12 flex gap-3 text-lg z-20">
        <span>🏀</span>
        <span>🎉</span>
        <span>🌲</span>
        <span>🎁</span>
        <span>🏓</span>
      </div>

      {/* Bottom Right Wave */}
      <div className="absolute bottom-12 right-12 z-20 opacity-40">
        <svg width="100" height="20" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10" stroke="#f78da7" strokeWidth="1.5" fill="none" />
          <path d="M0 10 Q 12.5 20, 25 10 T 50 10 T 75 10 T 100 10" stroke="#00d084" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Massive Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-[22vw] font-black text-white leading-none tracking-tight whitespace-nowrap"
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
              stroke="#1f2937" 
              strokeWidth="2" 
              strokeDasharray="6 6" 
              fill="none" 
            />
            {/* Arrow head */}
            <path d="M 695 195 L 705 200 L 695 205 Z" fill="#1f2937" />
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
          
          {/* Star Circle */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.5 }}
            className="absolute ml-[150px] mt-[-50px] w-24 h-24 rounded-full border border-dashed border-zinc-800 bg-[#fef08a]/30 backdrop-blur-sm flex items-center justify-center shadow-lg"
          >
            {/* Glowing Star */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-orange-400 blur-xl opacity-50 rounded-full" />
              <span className="text-4xl drop-shadow-md relative z-10">⭐</span>
            </div>
          </motion.div>

          {/* Typography block */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="absolute ml-[220px] mt-[100px] flex flex-col items-start gap-4"
          >
            <h2 className="text-zinc-800 font-light text-xl tracking-wide uppercase leading-tight">
              Style that<br />defines you
            </h2>
            <div className="w-16 h-[1px] bg-zinc-800 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-zinc-800 rotate-45 origin-right" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-zinc-800 -rotate-45 origin-right" />
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
