"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import SplitTextAnimation from "@/components/ui/SplitTextAnimation";

export default function TechnicalBlueprint() {
  const containerRef = useRef<HTMLElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100vh] bg-black py-24 md:py-32 px-6 md:px-16 overflow-hidden flex flex-col justify-center rounded-[3.5rem] mt-24 mx-4 md:mx-10"
    >
      {/* 3D Technical Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Floating 3D Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -40, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 5 + i, 
              repeat: Infinity, 
              delay: i * 0.5,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%` 
            }}
          />
        ))}
      </div>

      <div className="max-w-[1800px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center relative z-10">
        
        {/* Philosophy Text */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="z-20 relative text-white order-2 lg:order-1"
        >
             <motion.div variants={itemVariants} className="lg:block will-change-transform mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-[1px] bg-zinc-500" />
                  <span className="text-zinc-500 font-semibold text-xs tracking-wider uppercase">Core DNA</span>
                </div>
                <h2 className="font-display font-bold text-5xl md:text-7xl tracking-tighter leading-[0.9] mb-8">
                  Engineered for<br/>
                  <span className="text-zinc-400 italic">Human Motion.</span>
                </h2>
             </motion.div>
             
             <motion.div variants={itemVariants} className="relative">
                <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-lg mb-12 font-medium">
                  Our process begins at the molecular level. We develop custom proprietary fabrics that respond dynamically to your body's temperature and kinetic energy.
                </p>
                
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { label: "Fabric Tech", value: "Kinetic-X" },
                    { label: "Durability", value: "Grade A+" },
                    { label: "Sustainability", value: "100% Recycled" },
                    { label: "Weight", value: "Ultralight" }
                  ].map((stat, i) => (
                    <div key={i} className="border-l border-zinc-800 pl-6 py-2">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-lg font-bold text-white tracking-tight">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
        </motion.div>

        {/* 3D-Like Parallax Image Block */}
        <div ref={imageRef} className="relative h-[60vh] md:h-[80vh] w-full rounded-[3rem] overflow-hidden shadow-2xl order-1 lg:order-2 border border-zinc-800">
           <motion.div 
             className="absolute inset-0 w-full h-[120%] -top-[10%] will-change-transform"
             style={{ 
               y: imageY,
               scale: imageScale,
               opacity: imageOpacity
             }}
           >
              <Image 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" 
                  alt="Philosophy Visual"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover grayscale brightness-90 contrast-110"
              />
              <div className="absolute inset-0 bg-zinc-950/30 mix-blend-overlay" />
           </motion.div>
           
           {/* Technical Overlays */}
           <div className="absolute inset-0 pointer-events-none border-[20px] border-zinc-950/20 backdrop-blur-[2px]" />
           <div className="absolute top-10 left-10 p-4 rounded-2xl bg-zinc-950/40 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
             System Scan: Active
           </div>
           <div className="absolute bottom-10 right-10 p-4 rounded-2xl bg-zinc-950/40 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
             Coord: 23.8103° N, 90.4125° E
           </div>
        </div>

      </div>
    </section>
  );
}
