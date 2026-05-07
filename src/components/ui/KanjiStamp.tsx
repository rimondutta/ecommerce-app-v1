"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KanjiStampProps {
  text: string;
  sub?: string;
  variant?: "ink" | "paper" | "ghost";
  className?: string;
  rotate?: number;
}

const KanjiStamp = ({ 
  text, 
  sub, 
  variant = "ink", 
  className,
  rotate = -12
}: KanjiStampProps) => {
  const variants = {
    ink: "bg-ink text-paper border-ink",
    paper: "bg-paper text-ink border-ink",
    ghost: "bg-transparent text-ink border-ink border-dashed",
  };

  return (
    <motion.div
      initial={{ scale: 2, opacity: 0, rotate: rotate - 20 }}
      whileInView={{ scale: 1, opacity: 1, rotate: rotate }}
      viewport={{ once: true }}
      className={cn(
        "inline-flex flex-col items-center justify-center p-2 border-4",
        variants[variant],
        "relative",
        className
      )}
    >
      <span className="font-jp text-4xl font-black leading-none">{text}</span>
      {sub && (
        <span className="font-bebas text-[10px] tracking-widest mt-1 opacity-60">
          {sub}
        </span>
      )}
      
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none" />
    </motion.div>
  );
};

export default KanjiStamp;
