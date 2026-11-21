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
  initialAvailable?: boolean;
}

export default function OrderWithAIButton({ product, disabled, initialAvailable }: OrderWithAIButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonText, setButtonText] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('ai_order_button_text');
      if (cached) return cached;
    }
    return 'AI দিয়ে অর্ডার করুন';
  });
  const [isAvailable, setIsAvailable] = useState<boolean | null>(() => {
    if (initialAvailable !== undefined) return initialAvailable;
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('ai_order_available');
      if (cached !== null) return cached === 'true';
    }
    return true; // Optimistically show the button so there is 0 latency
  });

  useEffect(() => {
    let isMounted = true;
    fetch('/api/ai/order-agent')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          const avail = Boolean(data?.available);
          setIsAvailable(avail);
          if (data?.buttonText) {
            setButtonText(data.buttonText);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('ai_order_button_text', data.buttonText);
            }
          }
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('ai_order_available', String(avail));
          }
        }
      })
      .catch(() => {
        if (isMounted) setIsAvailable(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialAvailable]);

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
        className="w-full py-3.5 bg-black hover:bg-neutral-900 text-white font-bengali font-bold text-sm rounded-xl flex items-center justify-center gap-2 border border-black hover:border-neutral-800 active:scale-[0.99] transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Sparkles size={16} className="text-white" />
        <span>{buttonText || 'AI দিয়ে অর্ডার করুন'}</span>
      </button>

      <AIOrderChat
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        product={product}
      />
    </>
  );
}

