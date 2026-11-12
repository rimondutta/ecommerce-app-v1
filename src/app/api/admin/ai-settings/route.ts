import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import AiSettings, { IAiSettings } from '@/models/AiSettings';
import { encryptApiKey, decryptApiKey, maskApiKey, isMaskedKey } from '@/lib/ai/crypto';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    let settings = (await AiSettings.findOne({ key: 'global' }).lean()) as IAiSettings | null;

    if (!settings) {
      settings = (await AiSettings.create({ key: 'global' })) as IAiSettings;
    }

    // Decrypt and mask keys so only last 4 chars are visible
    const geminiDecrypted = decryptApiKey(settings.gemini?.apiKey);
    const openrouterDecrypted = decryptApiKey(settings.openrouter?.apiKey);
    const customDecrypted = decryptApiKey(settings.custom?.apiKey);

    const safeSettings = {
      isChatbotEnabled: settings.isChatbotEnabled !== false,
      isOrderAgentEnabled: Boolean(settings.isOrderAgentEnabled),
      isSuggestionsEnabled: Boolean(settings.isSuggestionsEnabled),
      activeProvider: settings.activeProvider || 'gemini',
      fallbackProvider: settings.fallbackProvider || 'none',
      gemini: {
        apiKey: maskApiKey(geminiDecrypted || process.env.GEMINI_API_KEY),
        model: settings.gemini?.model || 'gemini-2.0-flash',
        hasEnvFallback: Boolean(process.env.GEMINI_API_KEY),
      },
      openrouter: {
        apiKey: maskApiKey(openrouterDecrypted || process.env.OPENROUTER_API_KEY),
        model:
          settings.openrouter?.model === 'openrouter/free'
            ? 'meta-llama/llama-3.3-70b-instruct:free'
            : settings.openrouter?.model || 'meta-llama/llama-3.3-70b-instruct:free',
        hasEnvFallback: Boolean(process.env.OPENROUTER_API_KEY),
      },
      custom: {
        apiKey: maskApiKey(customDecrypted),
        model: settings.custom?.model || 'gpt-4o-mini',
        baseUrl: settings.custom?.baseUrl || '',
        headers: settings.custom?.headers || '',
        temperature: settings.custom?.temperature ?? 0.3,
        maxTokens: settings.custom?.maxTokens ?? 800,
      },
      storeName: settings.storeName || 'Toy Hourse',
      systemPromptExtra: settings.systemPromptExtra || '',
      chatbot: {
        botName: settings.chatbot?.botName || 'Toy Hourse AI',
        welcomeMessage:
          settings.chatbot?.welcomeMessage ||
          'হ্যালো! Toy Hourse এ আপনাকে স্বাগতম। আপনার বাচ্চার জন্য সেরা খেলনা খুঁজতে বা যেকোনো তথ্যের জন্য আমাকে জিজ্ঞেস করতে পারেন।',
        placeholder: settings.chatbot?.placeholder || 'খেলনা খুঁজুন বা প্রশ্ন লিখুন...',
        quickPrompts:
          Array.isArray(settings.chatbot?.quickPrompts) && settings.chatbot.quickPrompts.length > 0
            ? settings.chatbot.quickPrompts
            : [
                '🚗 জনপ্রিয় খেলনা দেখাও',
                '🧸 ১-৩ বছরের খেলনা কি আছে?',
                '🚚 ডেলিভারি চার্জ ও সময় কত?',
                '💳 ক্যাশ অন ডেলিভারি আছে?',
              ],
        supportPhone: settings.chatbot?.supportPhone || '',
        deliveryInsideDhaka: settings.chatbot?.deliveryInsideDhaka ?? 70,
        deliveryOutsideDhaka: settings.chatbot?.deliveryOutsideDhaka ?? 130,
        deliveryTime:
          settings.chatbot?.deliveryTime || 'ঢাকা সিটির ভেতরে ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ২-৩ দিন',
        returnPolicy: settings.chatbot?.returnPolicy || '৭ দিনের সহজ রিটার্ন ও রিপ্লেসমেন্ট পলিসি',
        primaryColor: settings.chatbot?.primaryColor || '#7C3AED',
        position: settings.chatbot?.position || 'bottom-right',
        badgeText: settings.chatbot?.badgeText || 'Chat with AI 🤖',
      },
    };

    return NextResponse.json({ settings: safeSettings });
  } catch (error: unknown) {
    console.error('[GET /api/admin/ai-settings] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch AI settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    const existingSettings = (await AiSettings.findOne({ key: 'global' })) as IAiSettings | null;

    // Resolve Gemini Key: If incoming is masked or empty, preserve existing encrypted key
    let geminiEncryptedKey = existingSettings?.gemini?.apiKey || '';
    if (body.gemini?.apiKey && !isMaskedKey(body.gemini.apiKey)) {
      geminiEncryptedKey = encryptApiKey(body.gemini.apiKey.trim());
    }

    // Resolve OpenRouter Key
    let openrouterEncryptedKey = existingSettings?.openrouter?.apiKey || '';
    if (body.openrouter?.apiKey && !isMaskedKey(body.openrouter.apiKey)) {
      openrouterEncryptedKey = encryptApiKey(body.openrouter.apiKey.trim());
    }

    // Resolve Custom Key
    let customEncryptedKey = existingSettings?.custom?.apiKey || '';
    if (body.custom?.apiKey && !isMaskedKey(body.custom.apiKey)) {
      customEncryptedKey = encryptApiKey(body.custom.apiKey.trim());
    }

    const updateDoc = {
      isChatbotEnabled: body.isChatbotEnabled !== false,
      isOrderAgentEnabled: Boolean(body.isOrderAgentEnabled),
      isSuggestionsEnabled: Boolean(body.isSuggestionsEnabled),
      activeProvider: body.activeProvider || 'gemini',
      fallbackProvider: body.fallbackProvider || 'none',
      gemini: {
        apiKey: geminiEncryptedKey,
        model: body.gemini?.model || 'gemini-2.0-flash',
      },
      openrouter: {
        apiKey: openrouterEncryptedKey,
        model: body.openrouter?.model === 'openrouter/free'
          ? 'meta-llama/llama-3.3-70b-instruct:free'
          : body.openrouter?.model || 'meta-llama/llama-3.3-70b-instruct:free',
      },
      custom: {
        apiKey: customEncryptedKey,
        model: body.custom?.model || 'gpt-4o-mini',
        baseUrl: body.custom?.baseUrl || '',
        headers: body.custom?.headers || '',
        temperature: Number(body.custom?.temperature ?? 0.3),
        maxTokens: Number(body.custom?.maxTokens ?? 800),
      },
      storeName: body.storeName?.trim() || 'Toy Hourse',
      systemPromptExtra: body.systemPromptExtra?.trim() || '',
      chatbot: {
        botName: body.chatbot?.botName?.trim() || 'Toy Hourse AI',
        welcomeMessage: body.chatbot?.welcomeMessage?.trim() || '',
        placeholder: body.chatbot?.placeholder?.trim() || 'খেলনা খুঁজুন বা প্রশ্ন লিখুন...',
        quickPrompts: Array.isArray(body.chatbot?.quickPrompts)
          ? body.chatbot.quickPrompts.map((q: string) => String(q).trim()).filter(Boolean)
          : [],
        supportPhone: body.chatbot?.supportPhone?.trim() || '',
        deliveryInsideDhaka: Number(body.chatbot?.deliveryInsideDhaka ?? 70),
        deliveryOutsideDhaka: Number(body.chatbot?.deliveryOutsideDhaka ?? 130),
        deliveryTime: body.chatbot?.deliveryTime?.trim() || '',
        returnPolicy: body.chatbot?.returnPolicy?.trim() || '',
        primaryColor: body.chatbot?.primaryColor?.trim() || '#7C3AED',
        position: body.chatbot?.position === 'bottom-left' ? 'bottom-left' : 'bottom-right',
        badgeText: body.chatbot?.badgeText?.trim() || 'Chat with AI 🤖',
      },
    };

    const saved = await AiSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: updateDoc },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'AI সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!',
      settings: saved,
    });
  } catch (error: unknown) {
    console.error('[PUT /api/admin/ai-settings] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'সেটিংস সেভ করতে ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}

