"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function EditorialHero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textX = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const words = "ARCHIVAL. TECHNICAL. FUTURE.".split(" ");

  return (
    <section 
      ref={containerRef} 
      className="relative h-[110vh] w-full overflow-hidden bg-black flex items-center justify-center"
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
          className="object-cover opacity-70 grayscale contrast-125"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-px h-64 bg-gradient-to-b from-white/20 to-transparent" />
        <div className="absolute bottom-1/4 right-10 w-px h-64 bg-gradient-to-t from-white/20 to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5" />
      </div>

      {/* Hero Typography */}
      <motion.div 
        className="relative z-10 flex flex-col items-center md:items-start md:text-left px-6 md:px-24 w-full max-w-[1800px] mx-auto"
        style={{ opacity }}
      >
        <motion.div 
          className="overflow-hidden mb-6"
          initial={{ opacity: 1 }}
        >
          <motion.div 
            className="flex items-center gap-4 text-[#fff]/40 font-mono text-[10px] md:text-xs uppercase tracking-[0.6em]"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="w-12 h-px bg-white/20" />
            ESTABLISHED MMXXVI // ARCHIVE 01
          </motion.div>
        </motion.div>

        <h1 className="font-display font-black text-[14vw] md:text-[10vw] leading-[0.85] tracking-tighter text-white uppercase flex flex-col items-center md:items-start">
          {words.map((word, i) => (
            <div key={i} className="overflow-hidden h-[1.1em] flex">
              <motion.span
                className={`inline-block ${i === 1 ? 'italic text-white/30 ml-[2vw] md:ml-[4vw]' : ''}`}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ 
                  duration: 1.5, 
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.2 + (i * 0.15) 
                }}
                style={{ x: i % 2 === 0 ? 0 : textX }}
              >
                {word}
              </motion.span>
            </div>
          ))}
        </h1>

        <motion.p 
          className="mt-12 text-white/60 text-[10px] md:text-sm font-mono uppercase tracking-[0.2em] max-w-xs md:max-w-md leading-loose"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          High-performance garments engineered for the modern inhabitant. Merging technical utility with brutalist silhouettes.
        </motion.p>

        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
           className="mt-16 flex flex-col md:flex-row gap-6 items-center"
        >
           <Link 
             href="/products" 
             className="relative overflow-hidden group bg-white px-12 py-5 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
             data-cursor="CLICK"
            >
              <span className="relative z-10 font-black text-[11px] text-black uppercase tracking-[0.2em]">
                Explore Archive
              </span>
              <div className="absolute inset-0 bg-black w-full h-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
              <span className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-black text-[11px] text-white uppercase tracking-[0.2em]">
                Explore Archive
              </span>
           </Link>

           <Link 
             href="/lookbook" 
             className="text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center gap-4 group"
           >
              VIEW LOOKBOOK
              <span className="w-8 h-px bg-white/20 group-hover:w-12 group-hover:bg-white transition-all" />
           </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-12 right-12 flex items-center gap-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ opacity }}
      >
        <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.4em]">
            System Status: Operational
        </span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <div className="w-1 h-1 bg-white/20 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
