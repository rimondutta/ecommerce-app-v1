'use client';

import { useChat } from '@ai-sdk/react';
import { isTextUIPart } from 'ai';
import { useState, useRef, useEffect } from 'react';
import {
  X,
  Loader2,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  PhoneCall,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { m, AnimatePresence } from 'framer-motion';

const BotIcon = ({ className }: { className?: string }) => (
  <Image
    src="/images/ai-chatbot.png"
    alt="AI Bot"
    width={48}
    height={48}
    className={className}
  />
);

interface ChatToolInvocation {
  toolCallId: string;
  args: { query?: string };
}

interface ChatbotConfig {
  botName: string;
  welcomeMessage: string;
  placeholder: string;
  quickPrompts: string[];
  supportPhone: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  deliveryTime: string;
  returnPolicy: string;
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  badgeText: string;
}

const DEFAULT_CONFIG: ChatbotConfig = {
  botName: 'Toy Hourse AI',
  welcomeMessage:
    'হ্যালো! Toy Hourse এ আপনাকে স্বাগতম। আপনার বাচ্চার জন্য সেরা খেলনা খুঁজতে বা যেকোনো তথ্যের জন্য আমাকে জিজ্ঞেস করতে পারেন।',
  placeholder: 'খেলনা খুঁজুন বা প্রশ্ন লিখুন...',
  quickPrompts: [
    '🚗 জনপ্রিয় খেলনা দেখাও',
    '🧸 ১-৩ বছরের খেলনা কি আছে?',
    '🚚 ডেলিভারি চার্জ ও সময় কত?',
    '💳 ক্যাশ অন ডেলিভারি আছে?',
  ],
  supportPhone: '',
  deliveryInsideDhaka: 70,
  deliveryOutsideDhaka: 130,
  deliveryTime: 'ঢাকা সিটির ভেতরে ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ২-৩ দিন',
  returnPolicy: '৭ দিনের সহজ রিটার্ন ও রিপ্লেসমেন্ট পলিসি',
  primaryColor: '#7C3AED',
  position: 'bottom-right',
  badgeText: 'Chat with AI 🤖',
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isChatbotEnabled, setIsChatbotEnabled] = useState<boolean | null>(null);
  const [config, setConfig] = useState<ChatbotConfig>(DEFAULT_CONFIG);

  const { messages, sendMessage, status, setMessages } = useChat();
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    fetch('/api/chat')
      .then((r) => r.json())
      .then((data) => {
        setIsChatbotEnabled(data.enabled !== false);
        if (data.chatbot) {
          setConfig((prev) => ({
            ...prev,
            ...data.chatbot,
            quickPrompts:
              Array.isArray(data.chatbot.quickPrompts) && data.chatbot.quickPrompts.length > 0
                ? data.chatbot.quickPrompts
                : prev.quickPrompts,
          }));
        }
      })
      .catch(() => setIsChatbotEnabled(true));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const handleQuickPromptClick = (prompt: string) => {
    if (isLoading) return;
    sendMessage({ text: prompt });
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Hide completely if disabled in admin dashboard
  if (isChatbotEnabled === false) return null;

  const isLeft = config.position === 'bottom-left';
  const primaryBg = config.primaryColor || '#7C3AED';

  return (
    <>
      {/* Floating Launcher Button */}
      <AnimatePresence>
        {!isOpen && (
          <div
            className={`fixed bottom-4 ${
              isLeft ? 'left-4 sm:bottom-6 sm:left-6' : 'right-4 sm:bottom-6 sm:right-6'
            } z-50 flex items-center gap-2.5 ${isLeft ? 'flex-row' : 'flex-row'}`}
          >
            {/* Launcher Badge Pill - hidden on tiny mobile, visible on sm */}
            <m.button
              type="button"
              onClick={() => setIsOpen(true)}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2 }}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 text-slate-800 text-xs font-bold shadow-lg hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="group-hover:text-purple-700 transition-colors">
                {config.badgeText || 'Chat with AI 🤖'}
              </span>
            </m.button>

            {/* Main Circular Trigger */}
            <m.button
              type="button"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 rounded-full focus:outline-none transition-transform cursor-pointer flex items-center justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]"
              aria-label="Open AI Chat"
            >
              <BotIcon className="w-16 h-16 object-contain" />

              {/* Online indicator dot */}
              <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white" />
              </span>
            </m.button>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className={`fixed inset-0 sm:inset-auto sm:bottom-6 ${
              isLeft ? 'sm:left-6' : 'sm:right-6'
            } z-50 sm:w-[420px] sm:h-[600px] sm:max-h-[85vh] flex flex-col bg-white sm:rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-slate-200/90 overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <BotIcon className="w-9 h-9 object-contain" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    <span>{config.botName || 'Toy Hourse AI'}</span>
                    <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                      Online
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300 font-medium leading-none mt-1">
                    তাৎক্ষণিক উত্তর • সহায়ক AI
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearChat}
                    title="নতুন আলাপ শুরু করুন"
                    className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    aria-label="Restart chat"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="চ্যাটবক্স বন্ধ করুন"
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {/* Welcome Card & Quick Prompts when no messages */}
              {messages.length === 0 && (
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 via-indigo-50/40 to-slate-50 border border-purple-100/80 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: primaryBg }}
                      >
                        <Sparkles size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {config.botName || 'Toy Hourse AI'} এ স্বাগতম!
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-bengali">
                      {config.welcomeMessage ||
                        'হ্যালো! Toy Hourse এ আপনাকে স্বাগতম। আপনার বাচ্চার জন্য সেরা খেলনা খুঁজতে বা যেকোনো তথ্যের জন্য আমাকে জিজ্ঞেস করতে পারেন।'}
                    </p>

                    {/* Features Strip */}
                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-purple-100/60 text-[10px] text-slate-600 font-medium text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <ShoppingBag size={12} className="text-purple-600" />
                        <span>লাইভ স্টক চেক</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Clock size={12} className="text-purple-600" />
                        <span>দ্রুত ডেলিভারি</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <ShieldCheck size={12} className="text-purple-600" />
                        <span>সহজ রিটার্ন</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Suggestions Chips */}
                  {config.quickPrompts && config.quickPrompts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                        সচরাচর জিজ্ঞাসিত প্রশ্ন:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {config.quickPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleQuickPromptClick(prompt)}
                            disabled={isLoading}
                            className="text-left text-xs bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200 hover:border-purple-300 px-3 py-1.5 rounded-full transition-all shadow-xs hover:shadow-xs cursor-pointer font-medium disabled:opacity-50"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {config.supportPhone && (
                    <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
                      <PhoneCall size={12} className="text-emerald-600" />
                      <span>
                        সরাসরি হেল্পলাইন:{' '}
                        <a
                          href={`tel:${config.supportPhone}`}
                          className="font-bold text-slate-700 hover:underline"
                        >
                          {config.supportPhone}
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Message List */}
              {messages.map((m) => {
                const mAny = m as unknown as {
                  content?: string;
                  toolInvocations?: ChatToolInvocation[];
                };
                const textContent: string = m.parts
                  ? m.parts
                      .filter(isTextUIPart)
                      .map((p) => p.text)
                      .join('')
                  : mAny.content || '';

                const isUser = m.role === 'user';

                return (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="shrink-0 mt-0.5">
                        <BotIcon className="w-7 h-7 object-contain" />
                      </div>
                    )}

                    <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end max-w-[85%]' : 'w-full'}`}>
                      {/* Tool Calls Rendering */}
                      {mAny.toolInvocations && mAny.toolInvocations.length > 0 && (
                        <div className="flex flex-col gap-1.5 w-full">
                          {mAny.toolInvocations.map((tool: ChatToolInvocation) => (
                            <div
                              key={tool.toolCallId}
                              className="bg-purple-50/80 border border-purple-200/80 text-purple-700 text-xs px-3 py-1.5 rounded-xl inline-flex items-center gap-2 animate-pulse"
                            >
                              <Loader2 size={12} className="animate-spin text-purple-600" />
                              <span>ক্যাটালগ অনুসন্ধান হচ্ছে: &ldquo;{tool.args.query}&rdquo;...</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Text Bubble */}
                      {textContent && (
                        <div
                          className={`text-xs sm:text-sm leading-relaxed ${
                            isUser
                              ? 'text-white px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-sm'
                              : 'bg-white text-slate-800 px-4 py-3 rounded-2xl rounded-tl-xs border border-slate-200/90 shadow-xs w-full'
                          }`}
                          style={isUser ? { backgroundColor: primaryBg } : undefined}
                        >
                          <div
                            className={`prose prose-sm max-w-none break-words [&>p]:last:mb-0 [&>p]:first:mt-0 ${
                              isUser ? 'prose-invert text-white' : 'prose-slate text-slate-800'
                            }`}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({ href, children }) => (
                                  <a
                                    href={href}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 my-0.5 rounded-md font-bold text-xs no-underline transition-all ${
                                      isUser
                                        ? 'bg-white/20 text-white underline'
                                        : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-xs'
                                    }`}
                                  >
                                    <span>{children}</span>
                                    <span className="text-[10px]">↗</span>
                                  </a>
                                ),
                              }}
                            >
                              {textContent}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing / Loading indicator */}
              {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <div className="flex gap-2.5 justify-start w-full">
                <div className="shrink-0 mt-0.5">
                    <BotIcon className="w-7 h-7 object-contain" />
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5 h-10">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-purple-500/30 focus-within:border-purple-500 transition-all shadow-xs"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder={config.placeholder || 'খেলনা খুঁজুন বা প্রশ্ন লিখুন...'}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none py-1.5"
                />

                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  style={input.trim() && !isLoading ? { backgroundColor: primaryBg } : undefined}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    input.trim() && !isLoading
                      ? 'text-white shadow-sm hover:opacity-90 active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                </button>
              </form>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 pt-2">
                <span>AI ত্রুটি করতে পারে • তথ্য যাচাই করে নিন</span>
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="hover:text-slate-600 transition-colors"
                >
                  রিসেট চ্যাট
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
