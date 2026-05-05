"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState("");

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Hide default cursor globally
    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest("button, a, input, [data-cursor]");
      const customText = target.closest("[data-cursor-text]")?.getAttribute("data-cursor-text");
      
      setIsHovering(!!isClickable);
      setCursorText(customText || "");
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.body.style.cursor = "auto";
      if (document.head.contains(style)) document.head.removeChild(style);
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isVisible, mouseX, mouseY]);

  if (typeof window === "undefined") return null;

  return (
    <>
      {/* Main Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[10000]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
      />
      
      {/* Outer Ring / Interaction Layer */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center border border-white/20"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: isHovering ? 60 : 30,
          height: isHovering ? 60 : 30,
          borderRadius: isHovering ? "0%" : "50%",
          backgroundColor: isHovering ? "rgba(255, 255, 255, 0.05)" : "transparent",
          rotate: isHovering ? 45 : 0
        }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
      >
        {cursorText && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="label-tiny text-white"
            style={{ fontSize: '6px', transform: isHovering ? 'rotate(-45deg)' : 'none' }}
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </>
  );
}
