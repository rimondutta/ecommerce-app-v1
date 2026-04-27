"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState("default");
  const [isVisible, setIsVisible] = useState(true); // Default to true
  
  const mouseX = useSpring(0, { stiffness: 1000, damping: 50, mass: 0.1 });
  const mouseY = useSpring(0, { stiffness: 1000, damping: 50, mass: 0.1 });

  useEffect(() => {
    // Initial position
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
      
      const target = e.target as HTMLElement;
      const cursorData = target.closest('[data-cursor]') as HTMLElement;
      
      if (cursorData) {
        setCursorType(cursorData.getAttribute('data-cursor') || "default");
      } else if (target.closest('a') || target.closest('button')) {
        setCursorType("pointer");
      } else {
        setCursorType("default");
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (typeof window === "undefined") return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] hidden lg:flex items-center justify-center mix-blend-difference"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ opacity: { duration: 0.2 } }}
    >
      {/* Tactical Gun Point / Reticle Design */}
      <div className="relative flex items-center justify-center">
        {/* Precise Crosshair */}
        <div className="absolute w-[24px] h-[1px] bg-white" />
        <div className="absolute w-[1px] h-[24px] bg-white" />
        
        {/* Tactical Brackets */}
        <motion.div 
          className="absolute w-8 h-8 flex items-center justify-center"
          animate={{
            rotate: cursorType !== "default" ? 45 : 0,
            scale: cursorType !== "default" ? 1.5 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Top Left */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
          {/* Top Right */}
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
          {/* Bottom Left */}
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
          {/* Bottom Right */}
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />
        </motion.div>

        {/* Outer Pulsing Ring */}
        <motion.div 
          className="absolute w-12 h-12 border border-white/20 rounded-full"
          animate={{
            scale: cursorType !== "default" ? [1, 1.2, 1] : 1,
            opacity: cursorType !== "default" ? 0.8 : 0.2,
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />

        {/* Center Precision Dot */}
        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />

        {/* HUD Label Readout */}
        {cursorType !== "default" && cursorType !== "pointer" && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 35 }}
            className="absolute left-full ml-4 flex flex-col items-start"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white animate-pulse" />
              <div className="bg-white text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {cursorType}
              </div>
            </div>
            <div className="w-full h-[1px] bg-white/50 mt-1" />
            <div className="text-[6px] text-white/40 uppercase tracking-tighter mt-1">SYS_ACTIVE_MOD: AIM_V2</div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
