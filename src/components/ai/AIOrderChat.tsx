"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  RotateCcw,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
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
  { key: 'phone', label: 'ফোন' },
  { key: 'name', label: 'নাম' },
  { key: 'variation', label: 'ভ্যারিয়েশন' },
  { key: 'quantity', label: 'পরিমাণ' },
  { key: 'address', label: 'ঠিকানা' },
  { key: 'review', label: 'রিভিউ' },
  { key: 'done', label: 'সম্পন্ন' },
];

export default function AIOrderChat({ isOpen, onClose, product }: AIOrderChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('phone');
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [currentSummary, setCurrentSummary] = useState<OrderSummaryData | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [completedSuggestions, setCompletedSuggestions] = useState<SuggestedProduct[]>([]);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Initial greeting call when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0 && !sessionId) {
      initSession();
    }
  }, [isOpen]);

  const initSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/order-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          message: '',
        }),
      });

      const data = await res.json();
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
        if (data.summary) setCurrentSummary(data.summary);
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
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/order-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          productId: product._id,
          message: text,
        }),
      });

      const data = await res.json();
      if (!res.ok && data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.reply || data.error || 'একটি সমস্যা দেখা দিয়েছে। আবার লিখুন।',
          },
        ]);
        return;
      }

      if (data.sessionId) setSessionId(data.sessionId);
      if (data.step) setCurrentStep(data.step);
      if (data.quickReplies) setQuickReplies(data.quickReplies);
      if (data.summary) setCurrentSummary(data.summary);

      if (data.orderId) {
        setCompletedOrderId(data.orderId);
      }
      if (data.suggestions) {
        setCompletedSuggestions(data.suggestions);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          summary: data.summary,
          orderId: data.orderId,
          suggestions: data.suggestions,
        },
      ]);
    } catch (err) {
      console.error('[AIOrderChat] send error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'দুঃখিত, ইন্টারনেট বা সার্ভারে সংযোগ পেতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setSessionId(null);
    setCurrentSummary(null);
    setCompletedOrderId(null);
    setCompletedSuggestions([]);
    setCurrentStep('phone');
    setQuickReplies([]);
    initSession();
  };

  const handleCopyOrderId = () => {
    if (!completedOrderId) return;
    navigator.clipboard.writeText(`#${completedOrderId.slice(-8).toUpperCase()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepProgressIndex = () => {
    const idx = STEPS.findIndex((s) => s.key === currentStep);
    return idx >= 0 ? idx : 0;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end font-bengali">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer / Bottom Sheet */}
          <motion.div
            initial={{ x: '100%', y: 0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: '100%', y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative z-10 w-full sm:max-w-md md:max-w-lg bg-white h-full flex flex-col shadow-2xl border-l border-gray-200"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-300">
                  <Sparkles size={18} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 leading-tight">
                    <span>AI অর্ডার অ্যাসিস্ট্যান্ট</span>
                    <span className="text-[10px] bg-emerald-400 text-black px-1.5 py-0.2 rounded-full font-bold">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-200 truncate max-w-[220px]">
                    {product.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleRestart}
                  title="নতুন করে শুরু করুন"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={onClose}
                  title="বন্ধ করুন"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Step Progress Bar */}
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center justify-between min-w-[340px] text-[11px]">
                {STEPS.map((s, index) => {
                  const activeIdx = getStepProgressIndex();
                  const isDone = index < activeIdx || currentStep === 'done';
                  const isCurrent = index === activeIdx && currentStep !== 'done';
                  return (
                    <div key={s.key} className="flex items-center gap-1">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-purple-600 text-white animate-pulse'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isDone ? '✓' : index + 1}
                      </span>
                      <span
                        className={`font-medium ${
                          isCurrent
                            ? 'text-purple-700 font-bold'
                            : isDone
                            ? 'text-emerald-700 font-semibold'
                            : 'text-gray-400'
                        }`}
                      >
                        {s.label}
                      </span>
                      {index < STEPS.length - 1 && (
                        <span className="text-gray-300 mx-0.5">›</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/60 custom-scrollbar">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Bot size={15} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                        isAssistant
                          ? 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs whitespace-pre-line'
                          : 'bg-emerald-800 text-white rounded-tr-xs'
                      }`}
                    >
                      {msg.content}

                      {/* Review Summary Card */}
                      {msg.summary && (
                        <div className="mt-3">
                          <OrderSummaryCard
                            summary={msg.summary}
                            isConfirmed={Boolean(msg.orderId)}
                          />
                        </div>
                      )}

                      {/* Order Done Info */}
                      {msg.orderId && (
                        <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-800">অর্ডার নম্বর:</span>
                            <div className="flex items-center gap-1.5">
                              <code className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                                #{msg.orderId.slice(-8).toUpperCase()}
                              </code>
                              <button
                                onClick={handleCopyOrderId}
                                className="text-emerald-700 hover:text-emerald-900"
                                title="কপি করুন"
                              >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-emerald-700">
                            পণ্যটি দ্রুত প্রস্তুত করা হচ্ছে। ডেলিভারিম্যান আপনার দেওয়া ঠিকানায় পৌঁছে নগদ অর্থ গ্রহণ করবেন।
                          </p>
                        </div>
                      )}

                      {/* Suggested Products at Done Step */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <AISuggestions initialSuggestions={msg.suggestions} compact />
                        </div>
                      )}
                    </div>

                    {!isAssistant && (
                      <div className="w-7 h-7 rounded-full bg-gray-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2.5 items-center">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot size={15} />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-1.5 shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Chips */}
            {quickReplies.length > 0 && !loading && (
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                {quickReplies.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0 active:scale-95"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-gray-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    currentStep === 'done'
                      ? 'নতুন কিছু জিজ্ঞাসা করতে পারেন...'
                      : 'আপনার উত্তর এখানে লিখুন (যেমন: নাম, ফোন, ঠিকানা)...'
                  }
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2.5 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-40 transition-colors shrink-0 shadow-sm"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

