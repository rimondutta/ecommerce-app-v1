"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import {
  X,
  RotateCcw,
  Send,
  Copy,
  Check,
  CheckCircle2,
  Package,
  ShieldCheck,
} from 'lucide-react';
import OrderSummaryCard from './OrderSummaryCard';
import AISuggestions from './AISuggestions';
import { OrderSummaryData } from '@/lib/ai/orderAgent';
import { SuggestedProduct } from '@/lib/ai/suggestions';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  summary?: OrderSummaryData | null;
  suggestions?: SuggestedProduct[];
  orderId?: string | null;
}

interface AIOrderChatProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    _id: string;
    title: string;
    price: number;
    images?: Array<{ url?: string }>;
    hasVariations?: boolean;
  };
}

const STEPS = [
  { key: 'phone', label: 'মোবাইল নম্বর' },
  { key: 'name', label: 'আপনার নাম' },
  { key: 'variation', label: 'ভ্যারিয়েশন' },
  { key: 'quantity', label: 'পরিমাণ' },
  { key: 'address', label: 'ঠিকানা' },
  { key: 'review', label: 'রিভিউ' },
  { key: 'done', label: 'সম্পন্ন' },
];

const STEP_PLACEHOLDERS: Record<string, string> = {
  phone: 'মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)...',
  name: 'আপনার পুরো নাম লিখুন...',
  variation: 'পছন্দের রঙ বা সাইজ লিখুন...',
  quantity: 'পরিমাণ লিখুন (যেমন: ১, ২)...',
  address: 'আপনার ডেলিভারির সম্পূর্ণ ঠিকানা লিখুন...',
  review: 'অর্ডার কনফার্ম করতে লিখুন...',
  done: 'নতুন কিছু জানতে চাইলে লিখুন...',
};

const AssistantAvatar = () => (
  <div className="w-7 h-7 rounded-full bg-white border border-[#EAE3D8] p-0.5 shrink-0 mt-0.5 overflow-hidden shadow-[0_1px_2px_rgba(44,36,22,0.04)]">
    <Image
      src="/images/ai-chatbot.png"
      alt="Assistant"
      width={28}
      height={28}
      className="w-full h-full object-contain"
    />
  </div>
);

async function postOrderAgent(payload: {
  sessionId?: string;
  productId: string;
  message: string;
}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const res = await fetch('/api/ai/order-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const rawText = await res.text();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: Record<string, any> = {};
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        // Gateway/proxy timeout (e.g. 502/504 HTML or plain-text error) — surface clean status instead of SyntaxError
        throw new Error(`HTTP_${res.status}`);
      }
    }
    return { res, data };
  } finally {
    clearTimeout(timer);
  }
}

export default function AIOrderChat({ isOpen, onClose, product }: AIOrderChatProps) {
  const initialGreeting = `আসসালামু আলাইকুম! 😊 Toy Hourse-এ স্বাগতম।\n\nঅর্ডারটি সম্পন্ন করতে নিচে আপনার মোবাইল নম্বরটি দিন (যেমন: 017XXXXXXXX)।`;
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: initialGreeting },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('phone');
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgCounterRef = useRef(2);
  const initializedRef = useRef(false);

  const nextId = () => {
    msgCounterRef.current += 1;
    return `msg-${msgCounterRef.current}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Focus input when opened & support Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const initSession = React.useCallback(async () => {
    try {
      const { res, data } = await postOrderAgent({
        productId: product._id,
        message: '',
      });

      if (data.reply) {
        setSessionId(data.sessionId);
        setCurrentStep(data.step || 'phone');
        setQuickReplies(data.quickReplies || []);
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: data.reply,
            summary: data.summary,
          },
        ]);
      } else if (!res.ok) {
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: data.error || 'দুঃখিত, কানেকশনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
          },
        ]);
      }
    } catch (err) {
      console.error('[AIOrderChat] init error:', err);
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'দুঃখিত, কানেকশনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [product._id]);

  // Initialize backend session when opened for the first time
  useEffect(() => {
    if (isOpen && !initializedRef.current && !sessionId) {
      initializedRef.current = true;
      void initSession();
    }
  }, [isOpen, sessionId, initSession]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    const userMsgId = nextId();
    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', content: text }]);
    setLoading(true);

    try {
      const { res, data } = await postOrderAgent({
        sessionId: sessionId || undefined,
        productId: product._id,
        message: text,
      });

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            content: data.reply || data.error || 'একটি সমস্যা দেখা দিয়েছে। আবার লিখুন।',
          },
        ]);
        return;
      }

      if (data.sessionId) setSessionId(data.sessionId);
      if (data.step) setCurrentStep(data.step);
      if (data.quickReplies) setQuickReplies(data.quickReplies);
      if (data.orderId) setCompletedOrderId(data.orderId);

      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          content: data.reply || 'দুঃখিত, উত্তর পাওয়া যায়নি। অনুগ্রহ করে আবার লিখুন।',
          summary: data.summary,
          orderId: data.orderId,
          suggestions: data.suggestions,
        },
      ]);
    } catch (err) {
      console.error('[AIOrderChat] send error:', err);
      const isTimeout =
        (err instanceof Error && (err.name === 'AbortError' || err.message === 'HTTP_504'));
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          content: isTimeout
            ? 'সার্ভার থেকে উত্তর আসতে একটু বেশি সময় লাগছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'দুঃখিত, ইন্টারনেট বা সার্ভারে সংযোগ পেতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    const instantGreeting = `আসসালামু আলাইকুম! 😊 নতুন করে শুরু করছি।\n\nঅর্ডারটি সম্পন্ন করতে আপনার মোবাইল নম্বরটি দিন (যেমন: 017XXXXXXXX)।`;
    setMessages([{ id: 'welcome-reset', role: 'assistant', content: instantGreeting }]);
    setSessionId(null);
    setCompletedOrderId(null);
    setCurrentStep('phone');
    setQuickReplies([]);
    initSession();
  };

  const handleCopyOrderId = (orderIdToCopy?: string | null) => {
    const targetId = orderIdToCopy || completedOrderId;
    if (!targetId) return;
    navigator.clipboard.writeText(`#${targetId.slice(-8).toUpperCase()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeIdx = Math.max(
    0,
    STEPS.findIndex((s) => s.key === currentStep)
  );
  const progressPercent =
    currentStep === 'done'
      ? 100
      : Math.round(((activeIdx + 1) / STEPS.length) * 100);
  const currentStepInfo = STEPS[activeIdx] || STEPS[0];
  const productThumb = product.images?.[0]?.url;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex justify-end font-bengali"
          role="dialog"
          aria-modal="true"
          aria-label="অর্ডার অ্যাসিস্ট্যান্ট"
        >
          {/* Soft Warm Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2C2416]/30 backdrop-blur-[2px]"
          />

          {/* Clean Floating Drawer Sheet */}
          <m.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative z-10 w-full sm:w-[420px] sm:m-3 sm:h-[calc(100%-24px)] sm:rounded-[24px] bg-white h-full flex flex-col shadow-[0_24px_60px_-15px_rgba(44,36,22,0.22)] border border-[#EDE6DC] overflow-hidden"
          >
            {/* ─── Header ─── */}
            <header className="px-4 py-3.5 bg-white border-b border-[#F0EAE1] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-9 h-9 rounded-full bg-[#F3F0FE] p-1 ring-1 ring-[#E4DCFC] shrink-0">
                  <Image
                    src="/images/ai-chatbot.png"
                    alt="Toy Hourse Assistant"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14.5px] font-bold text-[#2C2416] leading-tight truncate">
                      অর্ডার অ্যাসিস্ট্যান্ট
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/70 shrink-0">
                      সক্রিয়
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#7A6E62] mt-0.5 truncate">
                    {currentStep === 'done'
                      ? 'অর্ডার সম্পন্ন হয়েছে'
                      : `ধাপ ${activeIdx + 1}/${STEPS.length} · ${currentStepInfo.label}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleRestart}
                  title="নতুন করে শুরু করুন"
                  aria-label="নতুন করে শুরু করুন"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A6E62] hover:text-[#2C2416] hover:bg-[#F5F1EB] transition-colors cursor-pointer"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  title="বন্ধ করুন"
                  aria-label="বন্ধ করুন"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A6E62] hover:text-[#2C2416] hover:bg-[#F5F1EB] transition-colors cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>
            </header>

            {/* ─── Compact Product Context Strip + Hairline Progress ─── */}
            <div className="bg-[#FAF8F5] border-b border-[#F0EAE1] shrink-0">
              <div className="px-4 py-2 flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border border-[#EAE3D8] shrink-0 flex items-center justify-center">
                  {productThumb ? (
                    <Image
                      src={productThumb}
                      alt={product.title}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    <Package size={14} className="text-[#9A8F83]" />
                  )}
                </div>
                <p className="text-xs font-medium text-[#2C2416] truncate flex-1">
                  {product.title}
                </p>
                <span className="text-xs font-bold text-[#5428D8] bg-[#F3F0FE] px-2 py-0.5 rounded-md shrink-0">
                  ৳{product.price.toLocaleString()}
                </span>
              </div>

              {/* Smooth 2px Progress Hairline */}
              <div className="h-[2px] w-full bg-[#EFEAE2] overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-out rounded-r-full ${
                    currentStep === 'done'
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-[#5428D8] to-[#7C3AED]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* ─── Conversation Stream ─── */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#FAF8F5]/75 custom-scrollbar">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <m.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && <AssistantAvatar />}

                    <div
                      className={
                        isAssistant
                          ? 'max-w-[85%] rounded-[20px] rounded-tl-[6px] px-4 py-3 text-[13.5px] sm:text-[14px] leading-[1.65] bg-white text-[#2C2416] border border-[#EDE7DD] shadow-[0_1px_2px_rgba(44,36,22,0.04)] whitespace-pre-line'
                          : 'max-w-[82%] rounded-[20px] rounded-br-[6px] px-4 py-2.5 text-[13.5px] sm:text-[14px] leading-[1.6] bg-[#5428D8] text-white shadow-[0_2px_10px_rgba(84,40,216,0.18)] whitespace-pre-line'
                      }
                    >
                      {msg.content}

                      {/* Order Review Summary Card */}
                      {msg.summary && (
                        <div className="mt-3">
                          <OrderSummaryCard
                            summary={msg.summary}
                            isConfirmed={Boolean(msg.orderId)}
                          />
                        </div>
                      )}

                      {/* Order Confirmation Card */}
                      {msg.orderId && (
                        <div className="mt-3 p-3.5 bg-emerald-50/75 rounded-2xl border border-emerald-200/80 text-emerald-950 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                              অর্ডার নম্বর
                            </span>
                            <div className="flex items-center gap-1.5">
                              <code className="text-xs font-mono font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                                #{msg.orderId.slice(-8).toUpperCase()}
                              </code>
                              <button
                                type="button"
                                onClick={() => handleCopyOrderId(msg.orderId)}
                                className="p-1 rounded-md text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                                title="অর্ডার নম্বর কপি করুন"
                              >
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-emerald-800/90 leading-relaxed">
                            পণ্যটি দ্রুত প্রস্তুত করা হচ্ছে। ডেলিভারিম্যান আপনার ঠিকানায় পৌঁছে নগদ অর্থ গ্রহণ করবেন।
                          </p>
                        </div>
                      )}

                      {/* Compact Related Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#EFEAE2]">
                          <AISuggestions initialSuggestions={msg.suggestions} compact />
                        </div>
                      )}
                    </div>
                  </m.div>
                );
              })}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex gap-2.5 items-center">
                  <AssistantAvatar />
                  <div className="bg-white border border-[#EDE7DD] rounded-[20px] rounded-tl-[6px] px-4 py-3 flex items-center gap-1.5 shadow-[0_1px_2px_rgba(44,36,22,0.04)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5428D8]/60 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5428D8]/60 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5428D8]/60 animate-bounce" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ─── Quick Reply Chips ─── */}
            {quickReplies.length > 0 && !loading && (
              <div className="px-4 py-2 bg-white border-t border-[#F3EFE8] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                {quickReplies.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#F3F0FE] text-[#4C23C7] border border-[#E3DBFC] hover:bg-[#5428D8] hover:text-white hover:border-[#5428D8] transition-all shrink-0 active:scale-95 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* ─── Unified Modern Pill Composer ─── */}
            <div className="px-3.5 pt-2.5 pb-3 bg-white border-t border-[#F0EAE1] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-[#F5F2EC] border border-[#E6DFD5] rounded-full pl-4 pr-1.5 py-1.5 transition-all focus-within:bg-white focus-within:border-[#5428D8]/45 focus-within:ring-4 focus-within:ring-[#5428D8]/10"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    STEP_PLACEHOLDERS[currentStep] || 'আপনার উত্তর এখানে লিখুন...'
                  }
                  disabled={loading}
                  className="flex-1 bg-transparent text-[13.5px] sm:text-sm text-[#2C2416] placeholder:text-[#9A8F83] border-0 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 py-1 min-w-0"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-full bg-[#5428D8] text-white hover:bg-[#461EC0] disabled:bg-[#E5DFD5] disabled:text-[#A3988C] disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer"
                  aria-label="পাঠান"
                >
                  <Send size={15} className="-translate-x-[0.5px]" />
                </button>
              </form>

              <p className="flex items-center justify-center gap-1.5 text-[10.5px] text-[#9A8F83] mt-2">
                <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                <span>ক্যাশ অন ডেলিভারি · নিরাপদ ও সহজ অর্ডার</span>
              </p>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
