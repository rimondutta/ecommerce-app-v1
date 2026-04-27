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
        rotate: rotate,
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: cursorType !== "default" ? 1.2 : 1,
      }}
    >
      {/* Tactical Crosshair / Gun Point Design */}
      <div className="relative flex items-center justify-center">
        {/* Center Dot */}
        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        
        {/* Horizontal Lines */}
        <div className="absolute w-[30px] h-[1px] bg-white/60" />
        <div className="absolute w-[2px] h-[2px] bg-white left-[-15px]" />
        <div className="absolute w-[2px] h-[2px] bg-white right-[-15px]" />
        
        {/* Vertical Lines */}
        <div className="absolute w-[1px] h-[30px] bg-white/60" />
        <div className="absolute w-[2px] h-[2px] bg-white top-[-15px]" />
        <div className="absolute w-[2px] h-[2px] bg-white bottom-[-15px]" />

        {/* Outer Ring */}
        <motion.div 
          className="absolute w-10 h-10 border border-white/20 rounded-full"
          animate={{
            scale: cursorType !== "default" ? [1, 1.1, 1] : 1,
            borderWidth: cursorType !== "default" ? "2px" : "1px",
            borderColor: cursorType !== "default" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        />

        {/* Label if needed */}
        {cursorType !== "default" && cursorType !== "pointer" && (
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 30 }}
            className="absolute text-[8px] font-black text-white tracking-[0.3em] uppercase whitespace-nowrap"
          >
            {cursorType}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
