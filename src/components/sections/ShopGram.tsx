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
    <section className="relative py-40 bg-[#f0ece5] overflow-hidden">
      <div className="max-w-[1900px] mx-auto px-4 md:px-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <motion.h2 
            className="font-display font-black text-6xl md:text-8xl uppercase tracking-tighter leading-[0.8] text-black"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8 }}
          >
            Social <br />
            <span className="italic opacity-60 font-light">Cinema</span>
          </motion.h2>

          <motion.a 
            href="#" 
            className="group flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-[0.3em] pb-2 border-b border-black"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            data-cursor="CLICK"
          >
            @flexwear_official
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
          </motion.a>
        </div>

        <div className="flex gap-4 md:gap-8 overflow-visible">
          {images.map((src, i) => {
            return (
              <motion.a
                href="#"
                key={i}
                className="relative flex-none w-[60vw] md:w-[25vw] aspect-[3/4] overflow-hidden rounded-3xl"
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                data-cursor="VIEW"
              >
                <motion.img
                  src={src}
                  alt={`Social ${i}`}
                  className="w-full h-full object-cover grayscale opacity-80 hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
