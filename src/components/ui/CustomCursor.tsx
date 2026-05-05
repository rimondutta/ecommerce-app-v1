"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState("");

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide default cursor globally
    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    const initGsap = async () => {
      const { gsap } = await import("@/lib/gsap");
      
      const moveCursor = (e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        
        if (!isVisible) setIsVisible(true);

        // Calculate velocity for stretching
        const velocityX = e.movementX;
        const velocityY = e.movementY;
        const velocity = Math.sqrt(velocityX ** 2 + velocityY ** 2);
        const angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
        
        const stretch = Math.min(velocity / 50, 1.2);
        
        if (cursorRef.current) {
          gsap.to(cursorRef.current, {
            scaleX: 1 + stretch,
            scaleY: 1 - stretch * 0.3,
            rotation: angle,
            duration: 0.1,
            ease: "power2.out"
          });
        }
      };

      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const clickable = target.closest("button, a, input, [data-cursor]");
        const viewable = target.closest("[data-cursor='view']");
        const customText = target.closest("[data-cursor-text]")?.getAttribute("data-cursor-text");
        
        setIsHovering(!!clickable);
        
        if (viewable) {
          setCursorText("VIEW");
        } else {
          setCursorText(customText || "");
        }
      };

      window.addEventListener("mousemove", moveCursor);
      window.addEventListener("mouseover", handleMouseOver);

      return () => {
        window.removeEventListener("mousemove", moveCursor);
        window.removeEventListener("mouseover", handleMouseOver);
      };
    };

    const cleanupGsap = initGsap();

    return () => {
      document.body.style.cursor = "auto";
      if (document.head.contains(style)) document.head.removeChild(style);
      cleanupGsap.then(cleanup => cleanup?.());
    };
  }, [isVisible, mouseX, mouseY]);

  if (typeof window === "undefined") return null;

  return (
    <>
      {/* Main Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1 h-1 bg-white rounded-full pointer-events-none z-[10000] mix-blend-difference"
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
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center border border-white/20 origin-center"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: isHovering ? 80 : 40,
          height: isHovering ? 80 : 40,
          borderRadius: isHovering ? "0%" : "50%",
          backgroundColor: isHovering ? "rgba(255, 255, 255, 0.05)" : "transparent",
          rotate: isHovering ? 45 : 0,
          borderWidth: isHovering ? "1px" : "1px",
          borderColor: isHovering ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.1)"
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.5 }}
      >
        <AnimatePresence>
          {cursorText && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="label-tiny text-white"
              style={{ fontSize: '7px', transform: 'rotate(-45deg)', letterSpacing: '0.2em' }}
            >
              {cursorText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

