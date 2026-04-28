"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

interface SplitTextAnimationProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
  style?: React.CSSProperties;
}

export default function SplitTextAnimation({
  text,
  className = "",
  delay = 0.2,
  stagger = 0.05,
  duration = 1,
  once = true,
  style = {},
}: SplitTextAnimationProps) {
  const textRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(textRef, { once });

  useEffect(() => {
    if (!textRef.current || !isInView) return;

    // Use dynamic import to avoid SSR issues with GSAP and split-type
    const initAnimation = async () => {
      const { gsap } = await import("gsap");
      const SplitType = (await import("split-type")).default;
      
      if (textRef.current) {
        const split = new SplitType(textRef.current, { types: "chars,words" });
        
        gsap.set(split.chars, { y: "110%", opacity: 0 });
        
        gsap.to(split.chars, {
          y: 0,
          opacity: 1,
          stagger: stagger,
          duration: duration,
          ease: "expo.out",
          delay: delay,
        });
      }
    };

    initAnimation();
  }, [text, isInView, delay, stagger, duration]);

  return (
    <h1 
      ref={textRef} 
      className={className} 
      style={{ ...style, visibility: isInView ? "visible" : "hidden" }}
    >
      {text}
    </h1>
  );
}
