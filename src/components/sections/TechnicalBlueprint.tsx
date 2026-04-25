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

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[80vh] bg-[#f0ece5] py-20 md:py-32 px-4 md:px-16 overflow-hidden flex flex-col justify-center"
    >
      <div className="max-w-[1800px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative">
        
        {/* Abstract Philosophy Text */}
        <div className="lg:col-span-8 z-10 relative pointer-events-none mix-blend-difference text-white">
             <motion.h2 
               className="font-display font-black text-6xl md:text-[10vw] uppercase tracking-tighter leading-none pb-4 mb-8"
               style={{ y: y1 }}
             >
                Form<br />
                <span className="italic font-light opacity-80">Follows</span><br />
                Feeling
             </motion.h2>
             
             <motion.p 
               className="font-mono text-sm md:text-xl uppercase tracking-widest leading-relaxed max-w-2xl opacity-80 ml-2 md:ml-12"
               style={{ opacity }}
             >
                We construct garments not as mere coverings, but as architectural extensions of the self. Every thread is considered. Every silhouette is intentional. 
             </motion.p>
        </div>

        {/* Parallax Image Block */}
        <div className="lg:col-span-4 relative h-[70vh] w-full lg:-ml-32 mt-20 lg:mt-0">
           <motion.div 
             className="relative w-full h-full overflow-hidden rounded-[2rem] bg-black"
             style={{ scale }}
           >
              <Image 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" 
                  alt="Philosophy Visual"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover opacity-80 grayscale mix-blend-luminosity"
              />
           </motion.div>
           
           {/* Floating Data Badge */}
           <motion.div 
             className="absolute -bottom-8 -right-8 bg-black text-white p-8 rounded-full w-48 h-48 flex flex-col items-center justify-center text-center shadow-2xl"
             initial={{ rotate: -10, scale: 0 }}
             whileInView={{ rotate: 0, scale: 1 }}
             viewport={{ once: true }}
             transition={{ type: "spring", bounce: 0.5, duration: 1.5, delay: 0.5 }}
           >
               <span className="font-display font-black text-4xl mb-1">FW</span>
               <span className="font-mono text-[8px] uppercase tracking-[0.3em] opacity-60">Flex Wear</span>
           </motion.div>
        </div>

      </div>
    </section>
  );
}
