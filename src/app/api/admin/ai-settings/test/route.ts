import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import AiSettings, { IAiSettings } from '@/models/AiSettings';
import { decryptApiKey, isMaskedKey } from '@/lib/ai/crypto';
import { GeminiProvider } from '@/lib/ai/providers/gemini';
import { OpenRouterProvider } from '@/lib/ai/providers/openrouter';
import { CustomProvider } from '@/lib/ai/providers/custom';
import { AIProvider } from '@/lib/ai/providers/types';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { provider = 'gemini', apiKey, model, baseUrl, headers } = body;

    await connectToDatabase();
    const settings = (await AiSettings.findOne({ key: 'global' }).lean()) as IAiSettings | null;

    let targetProvider: AIProvider | null = null;

    if (provider === 'gemini') {
      let resolvedKey = apiKey && !isMaskedKey(apiKey) ? apiKey : '';
      if (!resolvedKey) {
        resolvedKey = decryptApiKey(settings?.gemini?.apiKey) || process.env.GEMINI_API_KEY || '';
      }
      if (!resolvedKey) {
        return NextResponse.json(
          { success: false, error: 'Gemini API Key পাওয়া যায়নি। অনুগ্রহ করে কী (API Key) প্রদান করুন।' },
          { status: 400 }
        );
      }
      targetProvider = new GeminiProvider(resolvedKey, model || settings?.gemini?.model || 'gemini-2.5-flash');
    } else if (provider === 'openrouter') {
      let resolvedKey = apiKey && !isMaskedKey(apiKey) ? apiKey : '';
      if (!resolvedKey) {
        resolvedKey = decryptApiKey(settings?.openrouter?.apiKey) || process.env.OPENROUTER_API_KEY || '';
      }
      if (!resolvedKey) {
        return NextResponse.json(
          { success: false, error: 'OpenRouter API Key পাওয়া যায়নি। অনুগ্রহ করে কী (API Key) প্রদান করুন।' },
          { status: 400 }
        );
      }
      targetProvider = new OpenRouterProvider(
        resolvedKey,
        model || settings?.openrouter?.model || 'meta-llama/llama-3.3-70b-instruct:free'
      );
    } else if (provider === 'custom') {
      let resolvedKey = apiKey && !isMaskedKey(apiKey) ? apiKey : '';
      if (!resolvedKey) {
        resolvedKey = decryptApiKey(settings?.custom?.apiKey) || '';
      }
      const resolvedUrl = baseUrl || settings?.custom?.baseUrl || '';
      if (!resolvedUrl) {
        return NextResponse.json(
          { success: false, error: 'Custom Provider-এর জন্য Base URL আবশ্যক।' },
          { status: 400 }
        );
      }
      targetProvider = new CustomProvider({
        apiKey: resolvedKey,
        baseUrl: resolvedUrl,
        model: model || settings?.custom?.model || 'gpt-4o-mini',
        headers: headers || settings?.custom?.headers,
      });
    }

    if (!targetProvider) {
      return NextResponse.json(
        { success: false, error: 'প্রোভাইডার কনফিগারেশন সঠিক নয়।' },
        { status: 400 }
      );
    }

    const testReply = await targetProvider.generate({
      system: 'You are a test assistant. Reply with a short polite confirmation in Bangla (maximum 1 sentence).',
      messages: [{ role: 'user', content: 'হাই, তুমি কি প্রস্তুত?' }],
      temperature: 0.1,
      maxTokens: 50,
    });

    return NextResponse.json({
      success: true,
      message: 'কানেকশন সফল হয়েছে! প্রোভাইডার ঠিকঠাক উত্তর দিচ্ছে।',
      reply: testReply,
    });
  } catch (error: unknown) {
    console.error('[POST /api/admin/ai-settings/test] Error:', error);
    const msg = error instanceof Error ? error.message : 'কানেকশন টেস্ট ব্যর্থ হয়েছে।';
    return NextResponse.json(
      {
        success: false,
        error: `কানেকশন টেস্ট ব্যর্থ হয়েছে: ${msg}`,
      },
      { status: 500 }
    );
  }
}

