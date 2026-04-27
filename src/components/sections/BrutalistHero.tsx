"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function EditorialHero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textX = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const words = "ARCHIVAL. TECHNICAL. FUTURE.".split(" ");

  return (
    <section 
      ref={containerRef} 
      className="relative h-[100vh] md:h-[110vh] w-full overflow-hidden bg-black flex items-center justify-center pb-20 md:pb-0"
      data-cursor="SCROLL"
    >
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ y: y1, scale }}
      >
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop"
          alt="Editorial Fashion"
          fill
          className="object-cover opacity-60 grayscale contrast-125 mix-blend-luminosity"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black" />
      </motion.div>

      {/* Modern Technical Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Interactive HUD Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0 hidden md:block"
        animate={{ x: mousePosition.x * -1, y: mousePosition.y * -1 }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        <div className="absolute top-[20%] left-[10%] text-[8px] font-mono text-white/30 uppercase tracking-widest border border-white/10 p-2 backdrop-blur-sm">
          COORD: 40.7128° N, 74.0060° W
        </div>
        <div className="absolute bottom-[30%] right-[15%] text-[8px] font-mono text-white/30 uppercase tracking-widest border border-white/10 p-2 backdrop-blur-sm">
          TEMP: 14°C // COND: OPTIMAL
        </div>
        <div className="absolute top-[40%] right-[8%] flex flex-col gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-px bg-white/20 ${i % 2 === 0 ? 'w-8' : 'w-4'}`} />
          ))}
        </div>
      </motion.div>

      {/* Decorative Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[5%] w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute top-0 right-[5%] w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>

      {/* Hero Typography */}
      <motion.div 
        className="relative z-10 flex flex-col items-center md:items-start md:text-left px-6 md:px-24 w-full max-w-[1800px] mx-auto"
        style={{ opacity }}
      >
        <motion.div 
          className="overflow-hidden mb-8"
          initial={{ opacity: 1 }}
        >
          <motion.div 
            className="flex items-center gap-4 text-white/50 font-mono text-[10px] md:text-xs uppercase tracking-[0.6em] bg-white/5 px-4 py-2 border border-white/10 rounded-full backdrop-blur-md"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            ESTABLISHED MMXXVI // ARCHIVE 01
          </motion.div>
        </motion.div>

        <h1 className="font-display font-black text-[15vw] md:text-[11vw] leading-[0.8] tracking-tighter text-white uppercase flex flex-col items-center md:items-start relative">
          {words.map((word, i) => (
            <div key={i} className="overflow-hidden h-[1.1em] flex relative">
              <motion.span
                className={`inline-block ${
                  i === 1 
                    ? 'italic text-transparent ml-[2vw] md:ml-[4vw]' 
                    : ''
                }`}
                style={i === 1 ? { WebkitTextStroke: '2px rgba(255,255,255,0.4)', x: textX } : { x: 0 }}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ 
                  duration: 1.2, 
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.1 + (i * 0.1) 
                }}
              >
                {word}
              </motion.span>
            </div>
          ))}
        </h1>

        <motion.p 
          className="mt-10 text-white/60 text-[11px] md:text-sm font-mono uppercase tracking-[0.2em] max-w-xs md:max-w-md leading-relaxed border-l border-white/20 pl-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          High-performance garments engineered for the modern inhabitant. Merging technical utility with brutalist silhouettes.
        </motion.p>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
           className="mt-16 flex flex-col md:flex-row gap-8 items-center"
        >
           <Link 
             href="/products" 
             className="relative overflow-hidden group bg-transparent border border-white/30 px-14 py-6 flex items-center justify-center transition-all hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 rounded-sm backdrop-blur-sm"
             data-cursor="CLICK"
            >
              <span className="relative z-10 font-black text-[11px] text-white uppercase tracking-[0.3em] group-hover:mix-blend-difference transition-all duration-300">
                Explore Archive
              </span>
              <div className="absolute inset-0 bg-white w-full h-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
           </Link>

           <Link 
             href="/lookbook" 
             className="text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center gap-4 group"
           >
              <div className="w-8 h-px bg-white/20 group-hover:w-16 group-hover:bg-white transition-all duration-500" />
              VIEW LOOKBOOK
           </Link>
        </motion.div>
      </motion.div>

      {/* Advanced Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex flex-col items-end gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ opacity }}
      >
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-4 py-2 border border-white/10 rounded-full">
          <span className="font-mono text-[9px] text-white/50 uppercase tracking-[0.4em]">
              SYS: OPERATIONAL
          </span>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
          </div>
        </div>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent mr-6 animate-bounce" />
      </motion.div>
    </section>
  );
}
