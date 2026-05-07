"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CartoonButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const CartoonButton: React.FC<CartoonButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  icon,
  className,
  ...props
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-bebas tracking-wider uppercase border-3 border-ink transition-none outline-none";
  
  const variants = {
    primary: "bg-ink text-paper shadow-[4px_4px_0px_#0A0A0A]",
    secondary: "bg-paper text-ink shadow-[4px_4px_0px_#0A0A0A]",
    outline: "bg-transparent text-ink border-3 border-ink shadow-[4px_4px_0px_#0A0A0A]",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-lg",
    md: "px-6 py-2.5 text-xl",
    lg: "px-8 py-3.5 text-2xl",
    xl: "px-10 py-4.5 text-3xl",
  };

  return (
    <motion.button
      whileHover={{ 
        translateY: -4, 
        translateX: -4,
        boxShadow: "8px 8px 0px #0A0A0A" 
      }}
      whileTap={{ 
        translateY: 2, 
        translateX: 2,
        boxShadow: "2px 2px 0px #0A0A0A" 
      }}
      className={cn(baseStyles, variants[variant], sizes[size], "impact-burst", className)}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon && <span className="text-xl">{icon}</span>}
      </span>
    </motion.button>
  );
};

export default CartoonButton;
