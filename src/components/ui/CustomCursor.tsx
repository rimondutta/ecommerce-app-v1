"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState("default");
  const [isVisible, setIsVisible] = useState(false);
  
  const mouseX = useSpring(0, { stiffness: 800, damping: 50, mass: 0.1 });
  const mouseY = useSpring(0, { stiffness: 800, damping: 50, mass: 0.1 });
  const rotate = useSpring(0, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      const target = e.target as HTMLElement;
      const cursorData = target.closest('[data-cursor]') as HTMLElement;
      
      if (cursorData) {
        setCursorType(cursorData.getAttribute('data-cursor') || "default");
        rotate.set(45);
      } else if (target.closest('a') || target.closest('button')) {
        setCursorType("pointer");
        rotate.set(90);
      } else {
        setCursorType("default");
        rotate.set(0);
      }
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseDown = () => rotate.set(180);
    const onMouseUp = () => rotate.set(0);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [mouseX, mouseY, rotate]);

  if (typeof window === "undefined") return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden lg:flex items-center justify-center mix-blend-difference"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Tactical Gun Point / Reticle Design */}
      <div className="relative flex items-center justify-center">
        {/* Precise Crosshair */}
        <div className="absolute w-[20px] h-[1px] bg-white" />
        <div className="absolute w-[1px] h-[20px] bg-white" />
        
        {/* Tactical Brackets */}
        <motion.div 
          className="absolute w-8 h-8 flex items-center justify-center"
          animate={{
            rotate: cursorType !== "default" ? 45 : 0,
            scale: cursorType !== "default" ? 1.5 : 1,
          }}
        >
          {/* Top Left */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white" />
          {/* Top Right */}
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white" />
          {/* Bottom Left */}
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white" />
          {/* Bottom Right */}
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white" />
        </motion.div>

        {/* Outer Pulsing Ring */}
        <motion.div 
          className="absolute w-12 h-12 border border-white/10 rounded-full"
          animate={{
            scale: cursorType !== "default" ? [1, 1.2, 1] : 1,
            opacity: cursorType !== "default" ? 0.8 : 0.2,
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />

        {/* Center Precision Dot */}
        <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]" />

        {/* Label */}
        {cursorType !== "default" && cursorType !== "pointer" && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 30 }}
            className="absolute left-full ml-4 flex flex-col items-start"
          >
            <div className="bg-white text-black px-2 py-0.5 text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
              {cursorType}
            </div>
            <div className="w-full h-[1px] bg-white/50 mt-1" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
