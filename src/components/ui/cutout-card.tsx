"use client";

import React, { createContext, useContext } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Context for staggered animations if needed
const CutoutCardContext = createContext({ isHovered: false });

export const cutoutCardSurfaceClassName = 
  "relative overflow-hidden rounded-[32px] bg-white dark:bg-zinc-900 border border-line dark:border-zinc-800 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group";

export function CutoutCard({ children, className, ...props }: any) {
  return (
    <div className={cn(cutoutCardSurfaceClassName, className)} {...props}>
      {children}
    </div>
  );
}

export function CutoutCardMedia({ children, className, ...props }: any) {
  return (
    <div className={cn("relative overflow-hidden w-full aspect-square bg-paper dark:bg-zinc-950", className)} {...props}>
      {children}
    </div>
  );
}

export function CutoutCardImage({ src, alt, className, ...props }: any) {
  return (
    <Image
      src={src}
      alt={alt || ""}
      fill
      className={cn("object-cover transition-transform duration-500 group-hover:scale-105", className)}
      sizes="(max-width: 768px) 100vw, 400px"
      {...props}
    />
  );
}

export function CutoutCardOverlay({ className, ...props }: any) {
  return (
    <div 
      className={cn("absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80", className)} 
      {...props} 
    />
  );
}

export function CutoutCardInsetLabel({ children, className, ...props }: any) {
  return (
    <div 
      className={cn("absolute bottom-0 left-0 bg-white dark:bg-zinc-900 px-5 py-3 rounded-tr-[24px] z-10", className)} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CutoutCardPin({ children, className, ...props }: any) {
  return (
    <div 
      className={cn("absolute top-0 right-0 bg-sun text-ink font-bold px-4 py-2 rounded-bl-[20px] z-10 shadow-sm", className)} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CutoutCardContent({ children, className, ...props }: any) {
  return (
    <div className={cn("p-6 flex flex-col justify-between flex-1", className)} {...props}>
      {children}
    </div>
  );
}

export function CutoutCardFooter({ children, className, ...props }: any) {
  return (
    <div className={cn("flex items-center justify-between mt-4 pt-4 border-t border-line dark:border-zinc-800", className)} {...props}>
      {children}
    </div>
  );
}

export function CutoutCardAction({ children, className, ...props }: any) {
  return (
    <div className={cn("absolute bottom-6 right-6 z-20", className)} {...props}>
      {children}
    </div>
  );
}

export function CutoutCorner({ className, size = 30, ...props }: any) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M30 0C13.4315 0 0 13.4315 0 30V0H30Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function useCutoutContentStaggerVariants() {
  return {
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
    },
  };
}
