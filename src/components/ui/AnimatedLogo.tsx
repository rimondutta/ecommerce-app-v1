"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface AnimatedLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function AnimatedLogo({ className = "", size = "md" }: AnimatedLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-5xl md:text-7xl"
  };

  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(textRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.5, ease: "expo.out", delay: 0.5 }
      );
    }
    if (lineRef.current) {
      gsap.fromTo(lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 2, ease: "power4.inOut", delay: 1 }
      );
    }
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!textRef.current) return;

    const originalText = "AVANT GARDE";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    
    gsap.to({}, {
      duration: 1,
      onUpdate: function() {
        const progress = this.progress();
        if (textRef.current) {
          textRef.current.innerText = originalText
            .split("")
            .map((char, index) => {
              if (progress > (index + 1) / originalText.length) return originalText[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");
        }
      }
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span 
        ref={textRef}
        className={`font-serif lowercase tracking-widest leading-none ${sizeClasses[size]} transition-colors duration-700 ${isHovered ? 'text-white' : 'text-white'}`}
      >
        avant garde
      </span>
      <div 
        ref={lineRef}
        className="w-full h-[1px] bg-white/20 mt-2 origin-center"
      />
      {isHovered && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <span className="label-tiny text-[#333] tracking-[0.5em] block" style={{ fontSize: '7px' }}>ARCHIVAL BUREAU</span>
        </motion.div>
      )}
    </div>
  );
}

import { motion } from "framer-motion";
