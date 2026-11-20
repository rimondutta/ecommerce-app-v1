"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const IconMap = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const styleMap = {
    success: "bg-[#FDFAF5] text-[#2C2416] border border-[#EDE4D8] shadow-[0_12px_32px_rgba(16,185,129,0.14),0_4px_16px_rgba(245,166,35,0.07)] ring-1 ring-emerald-500/10",
    error: "bg-[#FDFAF5] text-[#2C2416] border border-[#EDE4D8] shadow-[0_12px_32px_rgba(239,68,68,0.15)] ring-1 ring-red-500/10",
    info: "bg-[#FDFAF5] text-[#2C2416] border border-[#EDE4D8] shadow-[0_12px_32px_rgba(84,40,216,0.15)] ring-1 ring-[#5428D8]/10",
  };

  const iconColorMap = {
    success: "text-emerald-600 bg-emerald-50",
    error: "text-red-500 bg-red-50",
    info: "text-[#5428D8] bg-[#5428D8]/10",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — top right for clear visibility */}
      <div className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[100000] flex flex-col gap-2.5 pointer-events-none items-end max-w-[calc(100vw-2.5rem)]">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = IconMap[toast.type || "success"];
            return (
              <m.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className={cn(
                  "pointer-events-auto px-4 py-3.5 rounded-2xl flex items-center gap-3 shadow-xl backdrop-blur-md max-w-sm sm:max-w-md",
                  styleMap[toast.type || "success"]
                )}
              >
                <div className={cn("w-8 h-8 rounded-xl shrink-0 flex items-center justify-center", iconColorMap[toast.type || "success"])}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-xs sm:text-[13px] font-bold text-[#2C2416] leading-snug break-words">
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                  aria-label="Close notification"
                >
                  <X size={15} />
                </button>
              </m.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
