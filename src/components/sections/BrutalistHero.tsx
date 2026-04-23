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

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const words = "THE ARCHIVE AW_24".split(" ");

  return (
    <section 
      ref={containerRef} 
      className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center pt-20"
      data-cursor="SCROLL"
    >
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ y: y1, scale }}
      >
        <Image
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"
          alt="Editorial Fashion"
          fill
          className="object-cover opacity-60 mix-blend-luminosity"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      </motion.div>

      {/* Hero Typography */}
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full"
        style={{ opacity }}
      >
        <motion.div 
          className="overflow-hidden mb-4"
          initial={{ opacity: 1 }}
        >
          <motion.span 
            className="block text-[#fff]/60 font-mono text-xs md:text-sm uppercase tracking-[0.5em]"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            A New Horizon
          </motion.span>
        </motion.div>

        <h1 className="font-display font-black text-6xl md:text-[12vw] leading-[0.8] tracking-tighter text-white uppercase mix-blend-difference flex flex-wrap justify-center gap-x-4 md:gap-x-8">
          {words.map((word, i) => (
            <div key={i} className="overflow-hidden">
              <motion.span
                className="inline-block"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ 
                  duration: 1.2, 
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.4 + (i * 0.1) 
                }}
              >
                {word}
              </motion.span>
            </div>
          ))}
        </h1>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="mt-16"
        >
           <Link 
             href="/products" 
             className="relative overflow-hidden group border border-white/30 rounded-full px-8 py-4 flex items-center justify-center backdrop-blur-md hover:border-white transition-colors"
             data-cursor="CLICK"
            >
              <span className="relative z-10 font-mono text-[10px] text-white uppercase tracking-widest font-bold group-hover:text-black transition-colors duration-500 delay-100">
                Explore Collection
              </span>
              <div className="absolute inset-0 bg-white w-full h-full scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
           </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{ opacity }}
      >
        <span className="[writing-mode:vertical-lr] font-mono text-[8px] text-white/50 uppercase tracking-[0.5em] animate-pulse">
            Scroll
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </motion.div>
    </section>
  );
}
