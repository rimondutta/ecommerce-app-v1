import mongoose from 'mongoose';

export interface IAiProviderConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  headers?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IChatbotConfig {
  botName?: string;
  welcomeMessage?: string;
  placeholder?: string;
  quickPrompts?: string[];
  supportPhone?: string;
  deliveryInsideDhaka?: number;
  deliveryOutsideDhaka?: number;
  deliveryTime?: string;
  returnPolicy?: string;
  primaryColor?: string;
  position?: 'bottom-right' | 'bottom-left';
  badgeText?: string;
}

export interface IAiSettings {
  key: string;
  isChatbotEnabled: boolean;
  isOrderAgentEnabled: boolean;
  isSuggestionsEnabled: boolean;
  activeProvider: 'gemini' | 'openrouter' | 'custom';
  fallbackProvider: 'gemini' | 'openrouter' | 'custom' | 'none';
  gemini: {
    apiKey?: string;
    model: string;
  };
  openrouter: {
    apiKey?: string;
    model: string;
  };
  custom: {
    apiKey?: string;
    model: string;
    baseUrl?: string;
    headers?: string;
    temperature?: number;
    maxTokens?: number;
  };
  storeName: string;
  systemPromptExtra: string;
  chatbot?: IChatbotConfig;
}

const AiSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    isChatbotEnabled: { type: Boolean, default: true },
    isOrderAgentEnabled: { type: Boolean, default: false },
    isSuggestionsEnabled: { type: Boolean, default: false },
    activeProvider: {
      type: String,
      enum: ['gemini', 'openrouter', 'custom'],
      default: 'gemini',
    },
    fallbackProvider: {
      type: String,
      enum: ['gemini', 'openrouter', 'custom', 'none'],
      default: 'none',
    },
    gemini: {
      apiKey: { type: String, default: '' },
      model: { type: String, default: 'gemini-2.0-flash' },
    },
    openrouter: {
      apiKey: { type: String, default: '' },
      model: { type: String, default: 'meta-llama/llama-3.3-70b-instruct:free' },
    },
    custom: {
      apiKey: { type: String, default: '' },
      model: { type: String, default: 'gpt-4o-mini' },
      baseUrl: { type: String, default: '' },
      headers: { type: String, default: '' },
      temperature: { type: Number, default: 0.3 },
      maxTokens: { type: Number, default: 800 },
    },
    storeName: { type: String, default: 'Toy Hourse' },
    systemPromptExtra: { type: String, default: '' },
    chatbot: {
      botName: { type: String, default: 'Toy Hourse AI' },
      welcomeMessage: {
        type: String,
        default: 'হ্যালো! Toy Hourse এ আপনাকে স্বাগতম। আপনার বাচ্চার জন্য সেরা খেলনা খুঁজতে বা যেকোনো তথ্যের জন্য আমাকে জিজ্ঞেস করতে পারেন।'
      },
      placeholder: { type: String, default: 'খেলনা খুঁজুন বা প্রশ্ন লিখুন...' },
      quickPrompts: {
        type: [String],
        default: [
          '🚗 জনপ্রিয় খেলনা দেখাও',
          '🧸 ১-৩ বছরের খেলনা কি আছে?',
          '🚚 ডেলিভারি চার্জ ও সময় কত?',
          '💳 ক্যাশ অন ডেলিভারি আছে?'
        ]
      },
      supportPhone: { type: String, default: '' },
      deliveryInsideDhaka: { type: Number, default: 70 },
      deliveryOutsideDhaka: { type: Number, default: 130 },
      deliveryTime: { type: String, default: 'ঢাকা সিটির ভেতরে ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ২-৩ দিন' },
      returnPolicy: { type: String, default: '৭ দিনের সহজ রিটার্ন ও রিপ্লেসমেন্ট পলিসি' },
      primaryColor: { type: String, default: '#7C3AED' },
      position: { type: String, enum: ['bottom-right', 'bottom-left'], default: 'bottom-right' },
      badgeText: { type: String, default: 'Chat with AI 🤖' },
    },
  },
  { timestamps: true }
);

export default mongoose.models.AiSettings || mongoose.model('AiSettings', AiSettingsSchema);

