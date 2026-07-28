"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "none";
}

/**
 * Reusable whileInView reveal wrapper using the catalog easing.
 * Respects prefers-reduced-motion: falls back to opacity-only crossfade.
 */
export default function AnimatedReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: AnimatedRevealProps) {
  const reduced = useReducedMotion();

  const hidden =
    reduced
      ? { opacity: 0 }
      : direction === "up"
      ? { opacity: 0, y: 32 }
      : direction === "left"
      ? { opacity: 0, x: 32 }
      : { opacity: 0 };

  const visible =
    reduced ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 };

  return (
    <motion.div
      initial={hidden}
      whileInView={visible}
      viewport={{ once: true, margin: "-5%" }}
      transition={{
        duration: reduced ? 0.15 : 0.8,
        delay: reduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
