"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const images = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c028c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop"
];

export default function ShopGram() {
  return (
    <section className="relative py-32 bg-[#f0ece5] overflow-hidden border-t border-black/10">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-[1900px] mx-auto px-4 md:px-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-2 h-2 bg-black animate-pulse" />
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-black/60">SYS_NETWORK // Feed</span>
            </div>
            <h2 className="font-display font-black text-5xl md:text-[9rem] uppercase tracking-tighter leading-[0.8] text-black">
              Network <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>Data</span>
            </h2>
          </motion.div>

          <motion.a 
            href="#" 
            className="group flex items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-[0.3em] bg-black text-white px-8 py-4 hover:bg-black/80 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            data-cursor="CLICK"
          >
            @flexwear_sys
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </motion.a>
        </div>

        <div className="flex gap-4 md:gap-8 overflow-visible pb-10">
          {images.map((src, i) => {
            return (
              <motion.a
                href="#"
                key={i}
                className="relative flex-none w-[70vw] md:w-[25vw] aspect-[3/4] overflow-hidden border border-black/20 bg-black group"
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                data-cursor="VIEW"
              >
                {/* Image */}
                <motion.img
                  src={src}
                  alt={`Network Data ${i}`}
                  className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-700"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                
                {/* Overlay Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                   style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                   
                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/50" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/50" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/50" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/50" />
                
                {/* ID Label */}
                <div className="absolute bottom-6 left-6 font-mono text-[8px] tracking-[0.3em] text-white/70 uppercase">
                  ID_{i.toString().padStart(3, '0')}
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
