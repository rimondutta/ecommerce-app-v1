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
  const pathRef = useRef<SVGPathElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-5xl"
  };

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

  useEffect(() => {
    // Initial entrance: Path drawing
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: "power3.inOut",
        delay: 0.5
      });
    }

    // Initial entrance: Text reveal
    if (textRef.current) {
      gsap.fromTo(textRef.current, 
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 1, ease: "expo.out", delay: 1 }
      );
    }
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!textRef.current) return;

    const originalText = "FLEX_WEAR";
    const duration = 0.5;
    const iterations = 10;
    
    let iteration = 0;
    const interval = setInterval(() => {
      textRef.current!.innerText = originalText
        .split("")
        .map((char, index) => {
          if (index < iteration) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      
      if (iteration >= originalText.length) {
        clearInterval(interval);
      }
      
      iteration += originalText.length / iterations;
    }, 50);

    // Glitch effect on SVG
    if (pathRef.current) {
      gsap.to(pathRef.current, {
        x: () => (Math.random() - 0.5) * 4,
        y: () => (Math.random() - 0.5) * 4,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: "none",
        onComplete: () => gsap.set(pathRef.current, { x: 0, y: 0 })
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative inline-flex items-center gap-3 cursor-none select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative">
        <svg 
          width={size === "lg" ? "60" : "40"} 
          height={size === "lg" ? "60" : "40"} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-500 ease-out group-hover:rotate-90"
        >
          {/* Background square */}
          <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="2" strokeOpacity="0.1" />
          
          {/* Animated Path */}
          <path 
            ref={pathRef}
            d="M20 20H80V80H20V20ZM10 10V40M10 60V90M90 10V40M90 60V90M10 10H40M60 10H90M10 90H40M60 90H90"
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="square"
          />
          
          {/* Inner details */}
          <rect x="45" y="45" width="10" height="10" fill="currentColor" className={isHovered ? "animate-pulse" : ""} />
        </svg>

        {/* Decorative scanline on logo */}
        <div className="absolute inset-0 bg-white/10 h-px top-1/2 -translate-y-1/2 animate-scanline-logo opacity-20 pointer-events-none" />
      </div>

      <span 
        ref={textRef}
        className={`font-display font-black uppercase tracking-tighter leading-none ${sizeClasses[size]} ${isHovered ? "text-black" : "text-black/80"}`}
      >
        FLEX_WEAR
      </span>

      {/* Terminal cursor style blinker */}
      <div className={`w-1.5 h-[1.2em] bg-black transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0 animate-pulse"}`} />
    </div>
  );
}
