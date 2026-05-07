"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartoonCounterProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

const CartoonCounter = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 99, 
  className 
}: CartoonCounterProps) => {
  const increment = () => value < max && onChange(value + 1);
  const decrement = () => value > min && onChange(value - 1);

  return (
    <div className={cn("flex items-center bg-white border-3 border-ink cartoon-shadow-sm inline-flex", className)}>
      <button
        onClick={decrement}
        disabled={value <= min}
        className="w-12 h-12 flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-30 border-r-3 border-ink"
      >
        <Minus size={20} />
      </button>
      
      <div className="w-16 h-12 flex items-center justify-center font-bebas text-3xl">
        {value}
      </div>
      
      <button
        onClick={increment}
        disabled={value >= max}
        className="w-12 h-12 flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-30 border-l-3 border-ink"
      >
        <Plus size={20} />
      </button>
    </div>
  );
};

export default CartoonCounter;
