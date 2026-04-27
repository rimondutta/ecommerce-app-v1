"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState("default");
  const [isVisible, setIsVisible] = useState(false);
  
  const mouseX = useSpring(0, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 50 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
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

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [mouseX, mouseY]);

  const variants = {
    default: {
      width: 12,
      height: 12,
      backgroundColor: "rgba(0, 0, 0, 1)",
      borderRadius: "100%",
    },
    pointer: {
      width: 40,
      height: 40,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(0,0,0,1)",
      borderRadius: "100%",
    },
    VIEW: {
      width: 100,
      height: 100,
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      borderRadius: "100%",
      content: "'VIEW'",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "10px",
      fontWeight: "900",
      letterSpacing: "0.2em"
    },
    SCROLL: {
      width: 80,
      height: 80,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      border: "1px solid rgba(255,255,255,0.5)",
      borderRadius: "100%",
      content: "'SCROLL'",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "8px",
      fontWeight: "900",
      letterSpacing: "0.2em"
    },
    CLICK: {
      width: 60,
      height: 60,
      backgroundColor: "rgba(0, 0, 0, 1)",
      borderRadius: "100%",
      scale: 0.8,
    }
  };

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
      initial={false}
      animate={{
        ...variants[cursorType as keyof typeof variants] || variants.default,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 40,
        mass: 0.5,
      }}
    >
      {(cursorType === "VIEW" || cursorType === "SCROLL") && (
        <motion.span 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="font-black"
        >
          {cursorType}
        </motion.span>
      )}
    </motion.div>
  );
}
