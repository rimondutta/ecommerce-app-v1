"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import AIOrderChat from './AIOrderChat';

interface OrderWithAIButtonProps {
  product: {
    _id: string;
    title: string;
    price: number;
    inventory?: number;
    images?: Array<{ url?: string }>;
    hasVariations?: boolean;
  };
  disabled?: boolean;
}

export default function OrderWithAIButton({ product, disabled }: OrderWithAIButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/ai/order-agent')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setIsAvailable(Boolean(data?.available));
        }
      })
      .catch(() => {
        if (isMounted) setIsAvailable(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Hide button if AI feature is disabled or not configured
  if (isAvailable === false || isAvailable === null) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        type="button"
        className="w-full py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white font-bengali font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
      >
        <Sparkles size={18} className="text-emerald-300 animate-pulse" />
        <span>AI দিয়ে অর্ডার করুন</span>
      </button>

      <AIOrderChat
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        product={product}
      />
    </>
  );
}

