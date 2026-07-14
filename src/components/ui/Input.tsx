"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-3 w-full">
      {label && (
        <label className="block font-bebas text-2xl tracking-widest text-ink uppercase">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={cn(
            "w-full bg-paper border-3 p-5 font-comic font-bold text-xl italic cartoon-shadow-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 outline-none transition-all placeholder:text-ink/20",
            error ? "border-ink bg-white" : "border-ink",
            className
          )}
          {...props}
        />
        {/* Decorative corner */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-ink opacity-20 pointer-events-none" />
      </div>
      {error && (
        <p className="font-bangers text-xl text-ink uppercase tracking-tight animate-ink-reveal">
          !! {error} !!
        </p>
      )}
    </div>
  );
}
