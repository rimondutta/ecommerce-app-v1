"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import SplitTextAnimation from "@/components/ui/SplitTextAnimation";

export default function TechnicalBlueprint() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen bg-[#0a0a0a] section-padding px-6 md:px-16 overflow-hidden flex flex-col justify-center border-y border-white/5"
    >
      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-20 scanlines" />

      <div className="max-w-[1800px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center relative z-10">
        
        {/* Philosophy Text */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="z-20 relative order-2 lg:order-1"
        >
             <div className="mb-12">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-[1px] bg-[#333]" />
                  <span className="label-tiny text-[#555]">System Architecture</span>
                </div>
                 <h2 className="leading-[0.9] mb-16 space-y-4">
                  <SplitTextAnimation 
                    text="Engineered For" 
                    className="font-serif text-5xl md:text-8xl text-white block" 
                    delay={0.2}
                  />
                  <SplitTextAnimation 
                    text="Human Motion." 
                    className="font-serif italic text-5xl md:text-8xl text-[#555] block" 
                    delay={0.4}
                  />
                </h2>


                <div className="grid grid-cols-2 gap-10 md:gap-16 mt-20">
                  {[
                    { label: "Stability", value: "98.4%", desc: "Metric System 01" },
                    { label: "Comfort", value: "Optimal", desc: "Thermal Regulation" }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="border-l border-white/5 pl-8 group"
                    >
                      <span className="label-tiny text-[#333] group-hover:text-white transition-colors">{stat.label}</span>
                      <div className="font-serif text-3xl text-white my-2">{stat.value}</div>
                      <p className="label-tiny text-[#555]" style={{ fontSize: '7px' }}>{stat.desc}</p>
                    </motion.div>
                  ))}
                </div>
             </div>
             
             <div className="relative space-y-12">
                <p className="text-[#8e9192] text-lg font-light leading-relaxed max-w-lg">
                  The process begins at the molecular level. Custom proprietary textiles that respond dynamically to kinetic energy and environmental shifts.
                </p>
                
                <div className="grid grid-cols-2 gap-10">
                  {[
                    { label: "Fabrication", value: "Archival-K" },
                    { label: "Durability", value: "Grade Alpha" },
                    { label: "Integrity", value: "100% Sourced" },
                    { label: "Weight", value: "Ultralight" }
                  ].map((stat, i) => (
                    <div key={i} className="border-l border-white/5 pl-8 py-2">
                      <p className="label-tiny text-[#333] mb-2">{stat.label}</p>
                      <p className="font-serif text-xl text-white tracking-tight">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
        </motion.div>

        {/* Editorial Image Block */}
        <div className="relative h-[60vh] md:h-[90vh] w-full overflow-hidden border border-white/5 order-1 lg:order-2">
           <motion.div 
             className="absolute inset-0 w-full h-[120%] -top-[10%]"
             style={{ 
               y: imageY,
               scale: imageScale
             }}
           >
              <Image 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" 
                  alt="Philosophy Visual"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover grayscale brightness-75 contrast-125 transition-all duration-1000 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-[#0a0a0a]/20" />
           </motion.div>
           
           {/* Technical Overlays */}
           <div className="absolute top-10 left-10 p-4 bg-[#111]/40 backdrop-blur-md border border-white/5 text-[8px] font-mono text-[#555] uppercase tracking-widest">
             Bureau Scan: Active
           </div>
           <div className="absolute bottom-10 right-10 p-4 bg-[#111]/40 backdrop-blur-md border border-white/5 text-[8px] font-mono text-[#555] uppercase tracking-widest">
             ID: AV-BUREAU-01
           </div>
        </div>

      </div>
    </section>
  );
}
