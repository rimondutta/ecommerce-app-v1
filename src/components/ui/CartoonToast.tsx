"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import KanjiStamp from "@/components/ui/KanjiStamp";

interface Toast {
  id: number;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useCartoonToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function CartoonToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const kanjiMap = {
    success: "良", // Good/Success
    error: "否",   // No/Failure
    info: "知",    // Knowledge/Info
  };

  const styleMap = {
    success: "bg-ink text-paper border-ink",
    error: "bg-paper text-ink border-4 border-ink",
    info: "bg-paper text-ink border-4 border-ink",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-12 right-6 md:right-12 z-[10000] flex flex-col gap-6 pointer-events-none items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
              exit={{ x: 100, opacity: 0, scale: 0.8, rotate: -5 }}
              className={cn(
                "pointer-events-auto cartoon-shadow px-8 py-5 flex items-center gap-6 relative overflow-hidden",
                styleMap[toast.type || "success"]
              )}
            >
              <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none" />
              
              <div className="relative z-10 flex items-center gap-6">
                <KanjiStamp 
                  text={kanjiMap[toast.type || "success"]} 
                  variant={toast.type === "success" ? "paper" : "ink"}
                  className="scale-75"
                  rotate={0}
                />
                <div className="flex flex-col">
                  <span className="font-jp text-[10px] font-black tracking-widest opacity-40 leading-none mb-1">
                    SYSTEM NOTIFICATION
                  </span>
                  <span className="font-bebas text-3xl tracking-wider uppercase leading-none">
                    {toast.message}
                  </span>
                </div>
              </div>
              
              {/* Anime decorative elements */}
              <div className="absolute -top-2 -right-2 text-2xl opacity-20">★</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
