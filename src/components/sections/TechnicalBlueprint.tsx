"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function TechnicalBlueprint() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] bg-[#f0ece5] py-20 md:py-32 px-4 md:px-16 overflow-hidden flex flex-col justify-center"
    >
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
           style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '100px 100px' }} />

      {/* Technical Measurement Lines */}
      <div className="absolute top-10 left-10 right-10 h-px bg-black/10 hidden md:block">
        <span className="absolute -top-4 right-0 font-mono text-[8px] text-black/40">W: 100% / AXIS_X</span>
      </div>
      <div className="absolute top-10 bottom-10 left-10 w-px bg-black/10 hidden md:block">
        <span className="absolute bottom-0 -left-6 transform -rotate-90 origin-bottom-left font-mono text-[8px] text-black/40 whitespace-nowrap">H: 100vh / AXIS_Y</span>
      </div>

      <div className="max-w-[1800px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        
        {/* Abstract Philosophy Text */}
        <div className="lg:col-span-7 z-20 relative pointer-events-none text-black">
             <motion.div style={{ y: y1 }} className="lg:block">
               <h2 className="font-display font-black text-5xl md:text-[11vw] uppercase tracking-tighter leading-[0.85] pb-4 mb-4">
                  <span className="block" style={{ WebkitTextStroke: '1px rgba(0,0,0,0.3)', color: 'transparent' }}>Form</span>
                  <span className="block italic font-light text-black">Follows</span>
                  <span className="block" style={{ WebkitTextStroke: '2px rgba(0,0,0,1)', color: 'transparent' }}>Feeling</span>
               </h2>
             </motion.div>
             
             <motion.div 
               className="relative border-l border-black/20 pl-6 ml-2 md:ml-12"
               style={{ opacity }}
             >
                <div className="absolute -left-[3px] top-0 w-1.5 h-1.5 bg-black" />
                <p className="font-mono text-sm md:text-lg uppercase tracking-widest leading-relaxed max-w-xl opacity-90">
                  We construct garments not as mere coverings, but as architectural extensions of the self. Every thread is considered. Every silhouette is intentional. 
                </p>
                <div className="mt-8 flex gap-4 font-mono text-[10px] text-black/50 tracking-widest">
                  <span>[ SPEC_01 ]</span>
                  <span>[ PRECISION ]</span>
                  <span>[ UTILITY ]</span>
                </div>
             </motion.div>
        </div>

        {/* Parallax Image Block */}
        <div className="lg:col-span-5 relative h-[70vh] w-full mt-20 lg:mt-0 group cursor-crosshair">
           {/* Decorative frame */}
           <motion.div className="absolute inset-0 border border-black/10 -m-4 pointer-events-none hidden md:block" style={{ y: y2 }} />
           
           <motion.div 
             className="relative w-full h-full overflow-hidden bg-black"
             style={{ scale }}
           >
              <Image 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" 
                  alt="Philosophy Visual"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover opacity-60 grayscale mix-blend-luminosity group-hover:opacity-100 group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-1000 group-hover:scale-110"
              />
              
              {/* Technical crosshairs on image */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="w-full h-[1px] bg-white/30 absolute top-1/2" />
                <div className="w-[1px] h-full bg-white/30 absolute left-1/2" />
                <div className="w-16 h-16 border border-white/50 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-1 h-1 bg-white" />
                </div>
              </div>
           </motion.div>
           
           {/* Rotating Data Badge */}
           <motion.div 
             className="absolute -bottom-12 -left-12 md:-left-24 bg-black text-white p-2 w-40 h-40 md:w-56 md:h-56 flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(0,0,0,0.2)] border border-white/10 z-30"
             initial={{ scale: 0 }}
             whileInView={{ scale: 1 }}
             viewport={{ once: true }}
             transition={{ type: "spring", bounce: 0.5, duration: 1.5 }}
           >
               <motion.div 
                  className="absolute inset-2 border border-dashed border-white/20"
                  style={{ rotate }}
               />
               <div className="relative z-10 flex flex-col items-center">
                 <span className="font-display font-black text-4xl md:text-6xl mb-0 leading-none">FW</span>
                 <span className="font-mono text-[8px] md:text-[10px] uppercase tracking-[0.3em] opacity-60 mt-2 text-center">
                   Engineered<br/>For Motion
                 </span>
               </div>
               
               {/* Circular Text (simplified with absolute positioning) */}
               <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite] opacity-30">
                 <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                 <text fontSize="8.5" fontFamily="monospace" letterSpacing="0.2em">
                   <textPath href="#circlePath" startOffset="0%">
                     • ARCHIVAL TECHNICAL GEAR • ADVANCED SILHOUETTES
                   </textPath>
                 </text>
               </svg>
           </motion.div>
        </div>

      </div>
    </section>
  );
}
