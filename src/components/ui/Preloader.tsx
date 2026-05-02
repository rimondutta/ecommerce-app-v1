"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedLogo from "@/components/ui/AnimatedLogo";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Prevent scrolling while loading
    document.body.style.overflow = "hidden";

    // Counter animation
    const duration = 2000; // 2 seconds
    const interval = 20;
    const steps = duration / interval;
    const increment = 100 / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= 100) {
        setCount(100);
        clearInterval(timer);
        // Delay slightly after 100% then hide
        setTimeout(() => setVisible(false), 500);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);

    // Fallback safety
    const safety = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(safety);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Brand */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-4"
            >
              <AnimatedLogo size="lg" className="text-white" />
              <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-white/40">
                Archival System Initializing
              </p>
            </motion.div>

            {/* Counter */}
            <div className="flex items-center gap-6">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="w-16 md:w-32 h-px bg-white/30 origin-right"
              />
              <span className="font-display font-black text-7xl md:text-[10rem] text-white leading-none tracking-tighter tabular-nums">
                {count.toString().padStart(3, "0")}
              </span>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="w-16 md:w-32 h-px bg-white/30 origin-left"
              />
            </div>

            {/* Status bar container */}
            <div className="w-48 md:w-80 h-px bg-white/10 relative overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-white" 
                initial={{ width: 0 }}
                animate={{ width: `${count}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-mono text-[8px] uppercase tracking-[0.4em] text-white/30"
            >
              LOADING EXPERIENCE...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
