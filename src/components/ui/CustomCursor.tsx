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
      {/* Minimalist Editorial Cursor */}
      <div className="relative flex items-center justify-center">
        {/* Main Cursor Ring */}
        <motion.div 
          className="w-4 h-4 border-2 border-white rounded-full"
          animate={{
            scale: cursorType !== "default" ? 2.5 : 1,
            borderWidth: cursorType !== "default" ? "1px" : "2px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        
        {/* Center Point */}
        <motion.div 
          className="absolute w-1 h-1 bg-white rounded-full"
          animate={{
            scale: cursorType !== "default" ? 0 : 1,
          }}
        />

        {/* Editorial Label */}
        {cursorType !== "default" && cursorType !== "pointer" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 30 }}
            className="absolute top-full flex flex-col items-center"
          >
            <div className="text-white text-[10px] font-bold uppercase tracking-[0.3em] whitespace-nowrap">
              {cursorType}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
