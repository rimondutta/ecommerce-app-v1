"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Key,
  ShieldCheck,
  Server,
  HelpCircle,
  Bot,
  MessageSquare,
  Palette,
  Plus,
  Trash2,
  Phone,
  Truck,
  RotateCcw,
  Eye,
} from "lucide-react";

export interface ChatbotConfigForm {
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
  position: "bottom-right" | "bottom-left";
  badgeText: string;
}

interface AiSettingsForm {
  isChatbotEnabled: boolean;
  isOrderAgentEnabled: boolean;
  isSuggestionsEnabled: boolean;
  activeProvider: "gemini" | "openrouter" | "custom";
  fallbackProvider: "gemini" | "openrouter" | "custom" | "none";
  gemini: {
    apiKey: string;
    model: string;
    hasEnvFallback?: boolean;
  };
  openrouter: {
    apiKey: string;
    model: string;
    hasEnvFallback?: boolean;
  };
  custom: {
    apiKey: string;
    model: string;
    baseUrl: string;
    headers: string;
    temperature: number;
    maxTokens: number;
  };
  storeName: string;
  systemPromptExtra: string;
  chatbot: ChatbotConfigForm;
}

export default function AiSettingsPage() {
  const [config, setConfig] = useState<AiSettingsForm>({
    isChatbotEnabled: true,
    isOrderAgentEnabled: false,
    isSuggestionsEnabled: false,
    activeProvider: "gemini",
    fallbackProvider: "none",
    gemini: {
      apiKey: "",
      model: "gemini-2.0-flash",
    },
    openrouter: {
      apiKey: "",
      model: "meta-llama/llama-3.3-70b-instruct:free",
    },
    custom: {
      apiKey: "",
      model: "gpt-4o-mini",
      baseUrl: "",
      headers: "",
      temperature: 0.3,
      maxTokens: 800,
    },
    storeName: "Toy Hourse",
    systemPromptExtra: "",
    chatbot: {
      botName: "Toy Hourse AI",
      welcomeMessage:
        "হ্যালো! Toy Hourse এ আপনাকে স্বাগতম। আপনার বাচ্চার জন্য সেরা খেলনা খুঁজতে বা যেকোনো তথ্যের জন্য আমাকে জিজ্ঞেস করতে পারেন।",
      placeholder: "খেলনা খুঁজুন বা প্রশ্ন লিখুন...",
      quickPrompts: [
        "🚗 জনপ্রিয় খেলনা দেখাও",
        "🧸 ১-৩ বছরের খেলনা কি আছে?",
        "🚚 ডেলিভারি চার্জ ও সময় কত?",
        "💳 ক্যাশ অন ডেলিভারি আছে?",
      ],
      supportPhone: "",
      deliveryInsideDhaka: 70,
      deliveryOutsideDhaka: 130,
      deliveryTime: "ঢাকা সিটির ভেতরে ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ২-৩ দিন",
      returnPolicy: "৭ দিনের সহজ রিটার্ন ও রিপ্লেসমেন্ট পলিসি",
      primaryColor: "#7C3AED",
      position: "bottom-right",
      badgeText: "Chat with AI 🤖",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [newPromptInput, setNewPromptInput] = useState("");

  useEffect(() => {
    fetch("/api/admin/ai-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setConfig((prev) => ({
            ...prev,
            ...data.settings,
            chatbot: {
              ...prev.chatbot,
              ...(data.settings.chatbot || {}),
              quickPrompts:
                Array.isArray(data.settings.chatbot?.quickPrompts) &&
                data.settings.chatbot.quickPrompts.length > 0
                  ? data.settings.chatbot.quickPrompts
                  : prev.chatbot.quickPrompts,
            },
          }));
        }
      })
      .catch((err) => console.error("Failed to load AI settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddPrompt = () => {
    const trimmed = newPromptInput.trim();
    if (!trimmed) return;
    if (config.chatbot.quickPrompts.includes(trimmed)) {
      showToast("এই প্রশ্নটি ইতিমধ্যে তালিকায় রয়েছে", "error");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      chatbot: {
        ...prev.chatbot,
        quickPrompts: [...prev.chatbot.quickPrompts, trimmed],
      },
    }));
    setNewPromptInput("");
  };

  const handleRemovePrompt = (indexToRemove: number) => {
    setConfig((prev) => ({
      ...prev,
      chatbot: {
        ...prev.chatbot,
        quickPrompts: prev.chatbot.quickPrompts.filter((_, idx) => idx !== indexToRemove),
      },
    }));
  };

  const COLOR_PRESETS = [
    { label: "Purple", hex: "#7C3AED" },
    { label: "Emerald", hex: "#043224" },
    { label: "Royal Blue", hex: "#2563EB" },
    { label: "Rose", hex: "#E11D48" },
    { label: "Slate Dark", hex: "#0F172A" },
  ];

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "সংরক্ষণ করতে ব্যর্থ হয়েছে");
      showToast("AI সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "সংরক্ষণ করতে সমস্যা হয়েছে", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const provider = config.activeProvider;
      const providerData =
        provider === "gemini"
          ? { apiKey: config.gemini.apiKey, model: config.gemini.model }
          : provider === "openrouter"
          ? { apiKey: config.openrouter.apiKey, model: config.openrouter.model }
          : {
              apiKey: config.custom.apiKey,
              model: config.custom.model,
              baseUrl: config.custom.baseUrl,
              headers: config.custom.headers,
            };

      const res = await fetch("/api/admin/ai-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          ...providerData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setTestResult({
          success: false,
          message: data.error || "কানেকশন টেস্ট ব্যর্থ হয়েছে।",
        });
      } else {
        setTestResult({
          success: true,
          message: `${data.message} উত্তর: "${data.reply}"`,
        });
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "কানেকশন টেস্টে ত্রুটি ঘটেছে।",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 font-bengali pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI সেটিংস ও কনফিগারেশন</h1>
            <p className="text-sm text-gray-500">
              দোকানের "AI দিয়ে অর্ডার করুন" এজেন্ট এবং বুদ্ধিমান প্রোডাক্ট সাজেশনের নিয়ন্ত্রণ
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 mt-6 pb-2 text-sm font-medium">
          <Link
            href="/admin/settings/shipping"
            className="px-3 py-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ডেলিভারি রেট
          </Link>
          <Link
            href="/admin/settings/pixel"
            className="px-3 py-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            পিক্সেল
          </Link>
          <Link
            href="/admin/settings/couriers"
            className="px-3 py-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            কুরিয়ার এপিআই
          </Link>
          <span className="px-3 py-1.5 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-200">
            AI সেটিংস ✨
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Feature Toggles Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Server size={18} className="text-purple-600" />
              <span>ফিচার সক্রিয়করণ (Feature Switches)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-purple-50/30 transition-colors">
                <div>
                  <p className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <MessageSquare size={15} className="text-purple-600" />
                    ওয়েবসাইট চ্যাটবট চালু
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ওয়েবসাইটের নিচে ফ্লোটিং AI লাইভ চ্যাটবট বাটন সক্রিয় রাখবে
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={config.isChatbotEnabled}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, isChatbotEnabled: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-purple-50/30 transition-colors">
                <div>
                  <p className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <Bot size={15} className="text-purple-600" />
                    AI অর্ডার এজেন্ট চালু
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    পণ্য বিবরণী পেজে "AI দিয়ে অর্ডার করুন" বাটন ও ড্রয়ার সক্রিয় করবে
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={config.isOrderAgentEnabled}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, isOrderAgentEnabled: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-purple-50/30 transition-colors">
                <div>
                  <p className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <Sparkles size={15} className="text-purple-600" />
                    AI প্রোডাক্ট সাজেশন চালু
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    পণ্য পেজে এবং অর্ডার শেষের পর বুদ্ধিমান প্রোডাক্ট সাজেশন সেকশন দেখাবে
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={config.isSuggestionsEnabled}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, isSuggestionsEnabled: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Provider Selection Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-purple-600" />
              <span>মডেল প্রোভাইডার নির্বাচন (Provider Settings)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  সক্রিয় প্রোভাইডার (Active Provider)
                </label>
                <select
                  value={config.activeProvider}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      activeProvider: e.target.value as "gemini" | "openrouter" | "custom",
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="gemini">Google Gemini (রেকমেন্ডেড ও দ্রুততম)</option>
                  <option value="openrouter">OpenRouter (নানা মডেল যেমন DeepSeek, Claude)</option>
                  <option value="custom">Custom (OpenAI-সামঞ্জস্যপূর্ণ নিজস্ব এন্ডপয়েন্ট)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ফলব্যাক প্রোভাইডার (Fallback Provider - ঐচ্ছিক)
                </label>
                <select
                  value={config.fallbackProvider}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      fallbackProvider: e.target.value as "gemini" | "openrouter" | "custom" | "none",
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="none">কোনো ফলব্যাক নেই</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="custom">Custom Provider</option>
                </select>
              </div>
            </div>

            {/* Provider Configuration Tabs / Panels */}
            <div className="border border-purple-100 bg-purple-50/20 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-600 text-white uppercase">
                  {config.activeProvider}
                </span>
                <span className="text-xs font-medium text-gray-600">
                  নির্বাচিত প্রোভাইডারের কনফিগারেশন:
                </span>
              </div>

              {/* Gemini Fields */}
              {config.activeProvider === "gemini" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      value={config.gemini.apiKey}
                      placeholder={
                        config.gemini.hasEnvFallback
                          ? "•••••••••••• (env GEMINI_API_KEY ব্যবহৃত হবে)"
                          : "AIzaSy..."
                      }
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          gemini: { ...p.gemini, apiKey: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      API Key এনক্রিপ্ট করে ডাটাবেজে রাখা হবে। ব্রাউজারে কখনো পুরো কি দেখানো হয় না।
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      মডেল নাম (Model Name)
                    </label>
                    <input
                      type="text"
                      value={config.gemini.model}
                      placeholder="gemini-2.0-flash"
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          gemini: { ...p.gemini, model: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="text-[10px] text-gray-400 py-0.5">সুপারিশ:</span>
                      {["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setConfig((p) => ({ ...p, gemini: { ...p.gemini, model: m } }))}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-mono border transition-colors cursor-pointer ${
                            config.gemini.model === m
                              ? "bg-purple-600 text-white border-purple-600 font-bold"
                              : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* OpenRouter Fields */}
              {config.activeProvider === "openrouter" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      OpenRouter API Key
                    </label>
                    <input
                      type="password"
                      value={config.openrouter.apiKey}
                      placeholder={
                        config.openrouter.hasEnvFallback
                          ? "•••••••••••• (env OPENROUTER_API_KEY ব্যবহৃত হবে)"
                          : "sk-or-v1-..."
                      }
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          openrouter: { ...p.openrouter, apiKey: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      মডেল নাম (Model Name)
                    </label>
                    <input
                      type="text"
                      value={config.openrouter.model}
                      placeholder="google/gemini-2.0-flash-001"
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          openrouter: { ...p.openrouter, model: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="text-[10px] text-gray-400 py-0.5">সুপারিশ:</span>
                      {[
                        "meta-llama/llama-3.3-70b-instruct:free",
                        "google/gemini-2.0-flash-exp:free",
                        "deepseek/deepseek-chat:free",
                        "openrouter/auto",
                      ].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setConfig((p) => ({ ...p, openrouter: { ...p.openrouter, model: m } }))}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-mono border transition-colors cursor-pointer ${
                            config.openrouter.model === m
                              ? "bg-purple-600 text-white border-purple-600 font-bold"
                              : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Provider Fields */}
              {config.activeProvider === "custom" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Base URL
                      </label>
                      <input
                        type="text"
                        value={config.custom.baseUrl}
                        placeholder="https://api.openai.com/v1"
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            custom: { ...p.custom, baseUrl: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Custom API Key
                      </label>
                      <input
                        type="password"
                        value={config.custom.apiKey}
                        placeholder="sk-..."
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            custom: { ...p.custom, apiKey: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Model Name
                      </label>
                      <input
                        type="text"
                        value={config.custom.model}
                        placeholder="gpt-4o-mini"
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            custom: { ...p.custom, model: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Temperature
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={config.custom.temperature}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            custom: { ...p.custom, temperature: parseFloat(e.target.value) || 0.3 },
                          }))
                        }
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        value={config.custom.maxTokens}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            custom: { ...p.custom, maxTokens: parseInt(e.target.value) || 800 },
                          }))
                        }
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      অতিরিক্ত Headers (JSON ফরম্যাট - ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={2}
                      value={config.custom.headers}
                      placeholder='{"X-Custom-Header": "value"}'
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          custom: { ...p.custom, headers: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Test Connection Button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-purple-200/60">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-4 py-2 bg-white border border-purple-300 text-purple-700 font-bold text-xs rounded-xl hover:bg-purple-50 transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  <RefreshCw size={14} className={testing ? "animate-spin" : ""} />
                  <span>{testing ? "টেস্ট হচ্ছে..." : "কানেকশন টেস্ট করুন"}</span>
                </button>

                {testResult && (
                  <div
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                      testResult.success
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {testResult.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Persona & Store Context Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Key size={18} className="text-purple-600" />
              <span>স্টোর ও প্রম্পট কনটেক্সট (Store & Persona)</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  দোকানের নাম (Store Name)
                </label>
                <input
                  type="text"
                  value={config.storeName}
                  onChange={(e) => setConfig((p) => ({ ...p, storeName: e.target.value }))}
                  placeholder="Toy Hourse"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  এজেন্টের জন্য অতিরিক্ত নির্দেশনা (System Prompt Additions)
                </label>
                <textarea
                  rows={3}
                  value={config.systemPromptExtra}
                  onChange={(e) =>
                    setConfig((p) => ({ ...p, systemPromptExtra: e.target.value }))
                  }
                  placeholder="যেমন: আমাদের ডেলিভারি সময় সাধারণত ২-৩ কার্যদিবস। শুক্রবার অফিস বন্ধ থাকে।"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <p className="text-xs text-gray-400 mt-1">
                  এই কথাগুলো AI এজেন্টের মূল বাংলা প্রম্পটের সাথে যুক্ত থাকবে।
                </p>
              </div>
            </div>
          </div>

          {/* Website Chatbot Configuration Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    ওয়েবসাইট চ্যাটবট কনফিগারেশন (Website Chatbot Configuration)
                  </h2>
                  <p className="text-xs text-gray-500">
                    গ্রাহকদের জন্য ফ্লোটিং AI লাইভ চ্যাটবটের লুক, ব্র্যান্ডিং, প্রশ্নের অপশন ও পলিসি সাজান
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">চ্যাটবট স্ট্যাটাস:</span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    config.isChatbotEnabled
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {config.isChatbotEnabled ? "● সক্রিয় (Active)" : "○ বন্ধ (Disabled)"}
                </span>
              </div>
            </div>

            {/* Layout: Settings on Left, Live Preview on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Controls (8 cols on lg) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <Bot size={14} />
                    <span>১. পরিচয় ও বেসিক সেটিংস</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        চ্যাটবটের নাম (Bot Name)
                      </label>
                      <input
                        type="text"
                        value={config.chatbot.botName}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            chatbot: { ...p.chatbot, botName: e.target.value },
                          }))
                        }
                        placeholder="Toy Hourse AI"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        লঞ্চার বাটন টেক্সট (Badge Text)
                      </label>
                      <input
                        type="text"
                        value={config.chatbot.badgeText}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            chatbot: { ...p.chatbot, badgeText: e.target.value },
                          }))
                        }
                        placeholder="Chat with AI 🤖"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        ইনপুট প্লেসহোল্ডার (Input Placeholder)
                      </label>
                      <input
                        type="text"
                        value={config.chatbot.placeholder}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            chatbot: { ...p.chatbot, placeholder: e.target.value },
                          }))
                        }
                        placeholder="খেলনা খুঁজুন বা প্রশ্ন লিখুন..."
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        স্ক্রিনে অবস্থান (Position)
                      </label>
                      <select
                        value={config.chatbot.position}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            chatbot: {
                              ...p.chatbot,
                              position: e.target.value as "bottom-right" | "bottom-left",
                            },
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="bottom-right">নিচে ডান পাশে (Bottom-Right)</option>
                        <option value="bottom-left">নিচে বাম পাশে (Bottom-Left)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Theme Color */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <Palette size={14} />
                    <span>২. চ্যাটবটের থিম কালার (Primary Accent)</span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {COLOR_PRESETS.map((preset) => {
                      const isSelected =
                        config.chatbot.primaryColor.toLowerCase() === preset.hex.toLowerCase();
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() =>
                            setConfig((p) => ({
                              ...p,
                              chatbot: { ...p.chatbot, primaryColor: preset.hex },
                            }))
                          }
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "border-purple-600 ring-2 ring-purple-600/20 bg-purple-50 text-purple-900"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}

                    {/* Custom Hex / Color Picker */}
                    <div className="flex items-center gap-1.5 ml-auto bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-1">
                      <input
                        type="color"
                        value={config.chatbot.primaryColor || "#7C3AED"}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            chatbot: { ...p.chatbot, primaryColor: e.target.value },
                          }))
                        }
                        className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={config.chatbot.primaryColor}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            chatbot: { ...p.chatbot, primaryColor: e.target.value },
                          }))
                        }
                        placeholder="#7C3AED"
                        className="w-20 bg-transparent text-xs font-mono font-bold text-gray-800 focus:outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Welcome Message */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-700">
                    ৩. স্বাগতম বার্তা (Welcome Greeting)
                  </label>
                  <p className="text-xs text-gray-500">
                    চ্যাটবক্স ওপেন করার সাথে সাথে কাস্টমার এই প্রারম্ভিক বার্তাটি দেখতে পাবেন
                  </p>
                  <textarea
                    rows={3}
                    value={config.chatbot.welcomeMessage}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        chatbot: { ...p.chatbot, welcomeMessage: e.target.value },
                      }))
                    }
                    placeholder="হ্যালো! Toy Hourse এ আপনাকে স্বাগতম..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                {/* 4. Quick Prompts */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-700">
                    ৪. কুইক প্রম্পট প্রশ্নসমূহ (Quick Prompt Chips)
                  </label>
                  <p className="text-xs text-gray-500">
                    গ্রাহক এক ক্লিকে সহজে প্রশ্ন করতে পারে এমন কিছু গুরুত্বপূর্ণ প্রশ্ন যোগ করুন
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {config.chatbot.quickPrompts.map((prompt, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-medium shadow-xs"
                      >
                        <span>{prompt}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePrompt(idx)}
                          className="text-purple-400 hover:text-red-600 p-0.5 rounded-full hover:bg-purple-100 transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Prompt Input */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newPromptInput}
                      onChange={(e) => setNewPromptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddPrompt();
                        }
                      }}
                      placeholder="নতুন প্রশ্ন লিখুন (যেমন: 💳 ক্যাশ অন ডেলিভারি আছে?)"
                      className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddPrompt}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus size={14} />
                      <span>যোগ করুন</span>
                    </button>
                  </div>
                </div>

                {/* 5. Business & Service Rules for AI */}
                <div className="space-y-3.5 pt-2 border-t border-gray-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <Truck size={14} />
                    <span>৫. ডেলিভারি ও পলিসি তথ্য (AI এর জন্য নির্দেশনা)</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    চ্যাটবট স্বয়ংক্রিয়ভাবে কাস্টমারকে এই চার্জ ও পলিসি জানিয়ে সহায়তা করবে
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        ঢাকা সিটির ভেতরে ডেলিভারি চার্জ (টাকা)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={config.chatbot.deliveryInsideDhaka}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            chatbot: {
                              ...p.chatbot,
                              deliveryInsideDhaka: Number(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        ঢাকার বাইরে ডেলিভারি চার্জ (টাকা)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={config.chatbot.deliveryOutsideDhaka}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            chatbot: {
                              ...p.chatbot,
                              deliveryOutsideDhaka: Number(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        ডেলিভারি সময়সীমা (Delivery Time)
                      </label>
                      <input
                        type="text"
                        value={config.chatbot.deliveryTime}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            chatbot: { ...p.chatbot, deliveryTime: e.target.value },
                          }))
                        }
                        placeholder="ঢাকা সিটির ভেতরে ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ২-৩ দিন"
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                        <Phone size={12} className="text-purple-600" />
                        <span>কাস্টমার হেল্পলাইন ফোন (Customer Hotline)</span>
                      </label>
                      <input
                        type="text"
                        value={config.chatbot.supportPhone}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            chatbot: { ...p.chatbot, supportPhone: e.target.value },
                          }))
                        }
                        placeholder="01XXXXXXXXX"
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      রিটার্ন ও রিপ্লেসমেন্ট পলিসি (Return Policy)
                    </label>
                    <input
                      type="text"
                      value={config.chatbot.returnPolicy}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          chatbot: { ...p.chatbot, returnPolicy: e.target.value },
                        }))
                      }
                      placeholder="৭ দিনের সহজ রিটার্ন ও রিপ্লেসমেন্ট পলিসি"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Box (5 cols on lg) */}
              <div className="lg:col-span-5 bg-slate-100/70 border border-slate-200 rounded-2xl p-4 sticky top-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Eye size={14} className="text-purple-600" />
                    <span>লাইভ প্রিভিউ (Live Preview)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">রিয়েলটাইম আপডেট</span>
                </div>

                {/* Mock Chat Window */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden flex flex-col h-[460px]">
                  {/* Mock Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs relative"
                        style={{ backgroundColor: config.chatbot.primaryColor || "#7C3AED" }}
                      >
                        AI
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-slate-900 rounded-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold leading-none">
                            {config.chatbot.botName || "Toy Hourse AI"}
                          </p>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded-sm">
                            Online
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-none mt-0.5">
                          তাৎক্ষণিক উত্তর
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <div className="p-1 rounded hover:bg-white/10">
                        <RotateCcw size={12} />
                      </div>
                      <div className="p-1 rounded hover:bg-white/10">
                        <span className="text-xs font-bold leading-none">&times;</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Conversation Body */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-50/50 to-white text-xs">
                    {/* Welcome Card */}
                    <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-slate-700 space-y-1.5">
                      <p className="font-bold text-[11px] text-purple-900 flex items-center gap-1">
                        <Sparkles size={12} className="text-purple-600" />
                        <span>{config.chatbot.botName || "Toy Hourse AI"} এ স্বাগতম!</span>
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-bengali">
                        {config.chatbot.welcomeMessage ||
                          "হ্যালো! Toy Hourse এ আপনাকে স্বাগতম..."}
                      </p>
                    </div>

                    {/* Quick Prompts */}
                    {config.chatbot.quickPrompts.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          সচরাচর জিজ্ঞাসিত প্রশ্ন:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {config.chatbot.quickPrompts.slice(0, 4).map((q, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded-full shadow-2xs font-medium"
                            >
                              {q}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mock Assistant Message */}
                    <div className="flex gap-2 pt-1">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] text-white shrink-0"
                        style={{ backgroundColor: config.chatbot.primaryColor || "#7C3AED" }}
                      >
                        AI
                      </div>
                      <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl rounded-tl-xs shadow-2xs text-[11px] text-slate-800 space-y-1">
                        <p>অবশ্যই! আমাদের সবথেকে জনপ্রিয় কিছু খেলনা দেখতে পারেন:</p>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">
                          <span>Electric Little Duck</span>
                          <span>↗</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mock Input Bar */}
                  <div className="p-2.5 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-400">
                      <span className="flex-1 truncate text-[11px]">
                        {config.chatbot.placeholder || "খেলনা খুঁজুন বা প্রশ্ন লিখুন..."}
                      </span>
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 text-[10px]"
                        style={{ backgroundColor: config.chatbot.primaryColor || "#7C3AED" }}
                      >
                        ➤
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Floating Trigger Launcher */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-slate-600">
                    ওয়েবসাইটে ফ্লোটিং বাটন:
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold bg-white text-slate-800 px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                      {config.chatbot.badgeText || "Chat with AI 🤖"}
                    </span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                      style={{ backgroundColor: config.chatbot.primaryColor || "#7C3AED" }}
                    >
                      AI
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-xl transition-all shadow-md disabled:opacity-60 cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <span>সেটিংস সেভ করুন</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

