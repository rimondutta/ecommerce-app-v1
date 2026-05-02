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
    <div className="relative w-full py-10 md:py-20 overflow-hidden bg-white text-black border-y border-black">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex items-center gap-10 pr-10"
        >
          {[...items, ...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-10">
              <span className="text-4xl md:text-8xl font-display font-black uppercase tracking-tighter italic">
                {item}
              </span>
              <span className="w-4 h-4 md:w-8 md:h-8 rounded-full bg-emerald-500" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
