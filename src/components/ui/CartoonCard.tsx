"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CartoonCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  hatchOverlay?: boolean;
  onClick?: () => void;
}

const CartoonCard: React.FC<CartoonCardProps> = ({
  children,
  className,
  hoverable = true,
  hatchOverlay = false,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { 
        translateY: -8, 
        translateX: -8,
        boxShadow: "12px 12px 0px #0A0A0A" 
      } : {}}
      onClick={onClick}
      className={cn(
        "relative bg-paper border-3 border-ink shadow-[6px_6px_0px_#0A0A0A] overflow-hidden",
        hoverable && "cursor-pointer",
        className
      )}
    >
      {hatchOverlay && (
        <div className="absolute inset-0 bg-hatch pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity" />
      )}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};

export default CartoonCard;
