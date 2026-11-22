"use client";

import React from "react";
import { X } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

interface HeroVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HeroVideoModal({ isOpen, onClose }: HeroVideoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-video w-full">
              <video
                src="/video/hero-bg.mp4"
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
