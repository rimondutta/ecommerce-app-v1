"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Use framer-motion spring for ultra-smooth trailing movement
  const cursorX = useSpring(mouseX, { damping: 30, stiffness: 300, mass: 0.5 });
  const cursorY = useSpring(mouseY, { damping: 30, stiffness: 300, mass: 0.5 });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Force hide default cursor immediately
    document.body.classList.add("cursor-none");

    const updateMousePosition = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    document.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check nearest interactive element or explicit cursor request
      const cursorTarget = target.closest('[data-cursor], a, button, input, select, textarea');
      
      if (cursorTarget) {
        setIsHovered(true);
        const text = cursorTarget.getAttribute("data-cursor");
        if (text) {
          setCursorText(text);
        } else {
          setCursorText("");
        }
      } else {
        setIsHovered(false);
        setCursorText("");
      }
    };

    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
      document.body.classList.remove("cursor-none");
    };
  }, [mouseX, mouseY, isVisible]);

  // Avoid hydration mismatch by waiting until mounted or simply let it run
  if (!mounted) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `*, *::before, *::after { cursor: none !important; }`}} />
      <motion.div
        className="fixed top-0 left-0 z-[99999] pointer-events-none mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
      >
        {/* Core / Bubble State */}
        <motion.div
          animate={{
            width: isHovered ? (cursorText ? 80 : 40) : 10,
            height: isHovered ? (cursorText ? 80 : 40) : 10,
            backgroundColor: "#ffffff",
            x: "-50%",
            y: "-50%",
            borderRadius: "9999px",
            scale: isHovered && !cursorText ? 1.5 : 1, // small pop on hover if no text
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.4)]"
        >
          <AnimatePresence>
            {isHovered && cursorText && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-[9px] text-[#000000] font-black uppercase tracking-[0.2em] whitespace-nowrap"
              >
                {cursorText}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Outer Ring */}
        <motion.div
          animate={{
            width: isHovered ? 0 : 36,
            height: isHovered ? 0 : 36,
            x: "-50%",
            y: "-50%",
            opacity: isHovered ? 0 : 0.6,
            border: "1px solid white",
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute rounded-full"
        />
      </motion.div>
    </>
  );
}
