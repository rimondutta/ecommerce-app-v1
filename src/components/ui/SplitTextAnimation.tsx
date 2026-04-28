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

    const initAnimation = async () => {
      const { gsap } = await import("@/lib/gsap");
      const SplitType = (await import("split-type")).default;
      
      const split = new SplitType(textRef.current, { types: "chars" });
      const charsList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>[]{}/?+*#%@!$";

      gsap.set(split.chars, { 
        opacity: 0, 
        y: 20,
        filter: "blur(10px)"
      });
      
      split.chars.forEach((char, i) => {
        const originalText = char.innerText;
        const timeline = gsap.timeline({ delay: delay + (i * stagger) });

        timeline.to(char, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "expo.out"
        });

        // The scramble effect
        timeline.to(char, {
          duration: duration,
          onUpdate: function() {
            const progress = this.progress();
            if (progress < 1) {
              char.innerText = charsList[Math.floor(Math.random() * charsList.length)];
            } else {
              char.innerText = originalText;
            }
          },
          ease: "none"
        }, "-=0.6");
      });
    };

    initAnimation();
  }, [text, isInView, delay, stagger, duration]);

  return (
    <div 
      ref={textRef} 
      className={`select-none ${className}`} 
      style={{ ...style, visibility: isInView ? "visible" : "hidden" }}
    >
      {text}
    </div>
  );
}
