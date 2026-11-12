import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import AiSettings, { IAiSettings } from '@/models/AiSettings';
import { isRateLimited } from '@/lib/ratelimit';
import { getProductSuggestions } from '@/lib/ai/suggestions';

const SuggestSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  query: z.string().max(200).optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const settings = await AiSettings.findOne({ key: 'global' }).lean() as IAiSettings | null;
    if (settings && !settings.isSuggestionsEnabled) {
      return NextResponse.json({ suggestions: [], available: false });
    }

    const suggestions = await getProductSuggestions(productId);
    return NextResponse.json({ suggestions, available: true });
  } catch (err: unknown) {
    console.error('[API /api/ai/suggest GET] Error:', err);
    return NextResponse.json({ suggestions: [], error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    const rateLimited = await isRateLimited(`ai_suggest_${ip}`, 'global');
    if (rateLimited) {
      return NextResponse.json(
        { error: 'অতিরিক্ত অনুরোধ করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = SuggestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'সঠিক প্রোডাক্ট আইডি প্রদান করুন' },
        { status: 400 }
      );
    }

    const suggestions = await getProductSuggestions(parsed.data.productId, parsed.data.query);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error: unknown) {
    console.error('[API /api/ai/suggest POST] Error:', error);
    return NextResponse.json(
      { error: 'সাজেশন লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

