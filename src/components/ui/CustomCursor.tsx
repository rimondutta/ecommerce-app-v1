"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const CustomCursor = () => {
  const [isPointer, setIsPointer] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName === "BUTTON" ||
        target.tagName === "A"
      );
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] hidden md:flex items-center justify-center"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      {/* Outer Ring */}
      <motion.div 
        className="absolute inset-0 border-2 border-ink"
        animate={{ 
          scale: isPointer ? 1.5 : 1,
          rotate: isPointer ? 90 : 0 
        }}
      />
      
      {/* Inner Dot */}
      <motion.div 
        className="w-1.5 h-1.5 bg-ink"
        animate={{ scale: isPointer ? 0.5 : 1 }}
      />

      {/* Crosshair lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-2 bg-ink" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-2 bg-ink" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-[2px] bg-ink" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-[2px] bg-ink" />
    </motion.div>
  );
};

export default CustomCursor;
