"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const duration = 2000;
    const interval = 20;
    const steps = duration / interval;
    const increment = 100 / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= 100) {
        setCount(100);
        clearInterval(timer);
        setTimeout(() => setVisible(false), 500);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);

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
          className="fixed inset-0 z-[99999] bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Scanlines effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-20 scanlines" />

          <div className="relative z-10 flex flex-col items-center gap-12">
            {/* Brand */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <h2 className="font-serif text-3xl md:text-5xl text-white tracking-widest lowercase">avant garde</h2>
              <span className="label-tiny text-[#333] tracking-[0.5em] block ml-2">ARCHIVAL SYSTEM 01</span>
            </motion.div>

            {/* Counter */}
            <div className="flex flex-col items-center gap-8">
              <span className="font-serif italic text-7xl md:text-[12rem] text-white/[0.05] leading-none tracking-tighter tabular-nums absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
                {count.toString().padStart(3, "0")}
              </span>
              
              <div className="flex items-center gap-6 relative z-10">
                 <span className="label-tiny text-white tabular-nums tracking-widest">{count}%</span>
              </div>

              {/* Status bar container */}
              <div className="w-48 md:w-80 h-[1px] bg-white/5 relative overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-white" 
                  initial={{ width: 0 }}
                  animate={{ width: `${count}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="label-tiny text-[#333] tracking-[0.4em]"
              style={{ fontSize: '7px' }}
            >
              INITIALIZING EXPERIENCE...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
