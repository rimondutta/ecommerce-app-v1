"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MagneticElement from "@/components/ui/MagneticElement";

// Internal component for scattering to keep random values stable
const ScatteredWord = ({ word, progress }: { word: string; progress: any }) => {
  // Generate stable random values for each character
  const chars = word.split("");
  
  return (
    <span className="inline-block whitespace-nowrap mr-[0.2em]">
      {chars.map((char, i) => {
        // Use a deterministic-ish approach or just accept that it's client-only
        const randomX = (Math.sin(i * 123.456) * 400);
        const randomY = (Math.cos(i * 456.789) * 400);
        const randomZ = (Math.sin(i * 789.012) * 500);
        const randomRotate = (Math.cos(i * 12.34) * 360);
        
        const x = useTransform(progress, [0, 0.5], [0, randomX]);
        const y = useTransform(progress, [0, 0.5], [0, randomY]);
        const z = useTransform(progress, [0, 0.5], [0, randomZ]);
        const rotate = useTransform(progress, [0, 0.5], [0, randomRotate]);
        const charOpacity = useTransform(progress, [0, 0.4], [1, 0]);

        return (
          <motion.span
            key={i}
            style={{ x, y, z, rotate, opacity: charOpacity, display: "inline-block" }}
            className="will-change-transform"
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
};

export default function EditorialHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  // Mouse tracking for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

  // Use state to track if we're on the client to avoid hydration mismatch
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
    

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <section
      ref={containerRef}
      className="relative h-[200vh] w-full bg-zinc-950 perspective-1000"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <motion.div
          ref={imageRef}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full will-change-transform bg-zinc-900"
          style={{ y, opacity: heroOpacity }}
        >
          <Image
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop"
            alt="Premium Fashion"
            fill
            className="object-cover object-center scale-110"
            sizes="100vw"
            priority
          />
          {/* Deep modern gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/20 to-zinc-950/80" />
        </motion.div>

        {/* Floating 3D Glass Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
             animate={{ 
               y: [0, -30, 0],
               rotate: [0, 10, 0],
               x: [0, 20, 0]
             }}
             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl"
             style={{ x: useTransform(springX, [-0.5, 0.5], [40, -40]), y: useTransform(springY, [-0.5, 0.5], [40, -40]) }}
          />
          <motion.div 
             animate={{ 
               y: [0, 40, 0],
               rotate: [0, -15, 0],
               x: [0, -30, 0]
             }}
             transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
             className="absolute bottom-[15%] right-[5%] w-96 h-96 rounded-[4rem] rotate-12 bg-zinc-400/5 backdrop-blur-2xl border border-white/5 shadow-2xl"
             style={{ x: useTransform(springX, [-0.5, 0.5], [-60, 60]), y: useTransform(springY, [-0.5, 0.5], [-60, 60]) }}
          />
        </div>

        {/* Hero Typography */}
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            rotateX,
            rotateY,
            transformStyle: "preserve-3d"
          }}
          className="relative z-10 flex flex-col items-center text-center px-6 md:px-24 w-full max-w-6xl mx-auto will-change-transform mt-20"
        >
          <div className="mb-10" style={{ transform: "translateZ(50px)" }}>
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-bold uppercase tracking-[0.2em]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Collection 2026
            </div>
          </div>

          <h1 
            className="font-display font-bold text-6xl md:text-8xl lg:text-[10vw] leading-[0.95] tracking-tighter text-white mb-8 flex flex-wrap justify-center overflow-visible"
            style={{ transform: "translateZ(100px)" }}
          >
            {mounted ? "FUTURE OF WEAR.".split(" ").map((word, i) => (
              <ScatteredWord key={i} word={word} progress={scrollYProgress} />
            )) : "FUTURE OF WEAR."}
          </h1>

          <div 
            className="text-white/70 text-base md:text-xl font-medium max-w-2xl leading-relaxed mb-12 flex flex-wrap justify-center"
            style={{ transform: "translateZ(60px)" }}
          >
            {mounted ? "Architectural silhouettes meets high-performance textiles.".split(" ").map((word, i) => (
              <ScatteredWord key={i} word={word} progress={scrollYProgress} />
            )) : "Architectural silhouettes meets high-performance textiles."}
          </div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 items-center" 
            style={{ 
              transform: "translateZ(80px)",
              opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]),
              pointerEvents: useTransform(scrollYProgress, [0, 0.2], ["auto", "none"])
            }}
          >
            <MagneticElement strength={0.15}>
              <Link
                href="/products"
                className="bg-white text-zinc-950 hover:scale-105 px-12 py-5 rounded-full font-bold text-sm transition-all shadow-[0_20px_50px_rgba(255,255,255,0.2)] active:scale-95"
              >
                Explore Drops
              </Link>
            </MagneticElement>

            <MagneticElement strength={0.15}>
              <Link
                href="/lookbook"
                className="bg-transparent backdrop-blur-md text-white border border-white/30 hover:bg-white/10 px-12 py-5 rounded-full font-bold text-sm transition-all"
              >
                View Film
              </Link>
            </MagneticElement>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
