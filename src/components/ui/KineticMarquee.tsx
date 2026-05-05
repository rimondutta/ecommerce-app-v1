"use client";

import { motion } from "framer-motion";

const items = [
  "WEAR THE SILENCE",
  "BRUTALIST MINIMALISM",
  "STRIPPED OF EXCESS",
  "STRUCTURE & INTENT",
  "MODERN ASCETIC",
  "AVANT GARDE"
];

export default function KineticMarquee() {
  return (
    <div className="relative w-full py-12 md:py-24 overflow-hidden bg-[#0a0a0a] text-white border-y border-white/5">
      <div className="flex whitespace-nowrap overflow-hidden">
        <motion.div
          animate={{ x: [0, -1035] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex items-center gap-16 pr-16"
        >
          {[...items, ...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-16">
              <span className={`text-4xl md:text-9xl tracking-[-0.02em] ${i % 2 === 0 ? 'font-serif text-white/[0.06]' : 'font-serif italic text-white/[0.03]'}`}>
                {item}
              </span>
              <div className="w-1 h-1 bg-white/10" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
