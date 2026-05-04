"use client";

import { motion } from "framer-motion";

const items = [
  "FUTURE OF WEAR",
  "ARCHIVAL SYSTEMS",
  "HIGH PERFORMANCE",
  "SUSTAINABLE LUXURY",
  "TECHWEAR ESSENTIALS",
  "MODERN SILHOUETTES"
];

export default function KineticMarquee() {
  return (
    <div className="relative w-full py-12 md:py-24 overflow-hidden bg-black text-white">
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
              <span className={`text-4xl md:text-9xl font-display font-black uppercase tracking-[-0.05em] ${i % 2 === 0 ? 'text-white' : 'text-zinc-800 italic'}`}>
                {item}
              </span>
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-zinc-700" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
