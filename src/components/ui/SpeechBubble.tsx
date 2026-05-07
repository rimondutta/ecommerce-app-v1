"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SpeechBubbleProps {
  children: React.ReactNode;
  position?: "left" | "right";
  className?: string;
  bg?: string;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  children,
  position = "left",
  className,
  bg = "bg-paper",
}) => {
  return (
    <div className={cn("relative inline-block", className)}>
      <div className={cn(
        "relative z-10 px-4 py-2 border-3 border-ink shadow-[4px_4px_0px_#0A0A0A] font-comic font-bold italic",
        bg
      )}>
        {children}
      </div>
      
      {/* SVG Tail */}
      <svg
        className={cn(
          "absolute top-full -mt-[3px] w-6 h-4 fill-current text-ink",
          position === "left" ? "left-4" : "right-4"
        )}
        viewBox="0 0 20 12"
      >
        <path d="M0 0 L10 12 L20 0 Z" />
      </svg>
      {/* Tail Inner (to match background) */}
      <svg
        className={cn(
          "absolute top-full -mt-[6px] w-5 h-3 fill-current",
          bg.includes("bg-paper") ? "text-paper" : "text-surface",
          position === "left" ? "left-[18px]" : "right-[18px]"
        )}
        viewBox="0 0 20 12"
      >
        <path d="M0 0 L10 12 L20 0 Z" />
      </svg>
    </div>
  );
};

export default SpeechBubble;
