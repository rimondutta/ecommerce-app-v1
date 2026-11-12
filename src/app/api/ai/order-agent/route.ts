import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isRateLimited } from '@/lib/ratelimit';
import { processOrderAgentTurn } from '@/lib/ai/orderAgent';
import { isOrderAgentAvailable } from '@/lib/ai/providers';

const RequestSchema = z.object({
  sessionId: z.string().optional(),
  productId: z.string().min(1, 'Product ID is required'),
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional().default(''),
});

export async function GET() {
  const available = await isOrderAgentAvailable();
  return NextResponse.json({ available });
}

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    // Strict rate limit check per IP (Upstash Redis)
    const rateLimited = await isRateLimited(`ai_order_${ip}`, 'strict');
    if (rateLimited) {
      return NextResponse.json(
        {
          error: 'অতিরিক্ত অনুরোধ করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
          reply: 'অতিরিক্ত অনুরোধ করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
        },
        { status: 429 }
      );
    }

    // Check if feature is enabled and configured
    const available = await isOrderAgentAvailable();
    if (!available) {
      return NextResponse.json(
        {
          error: 'AI অর্ডার এজেন্ট বর্তমানে বন্ধ রয়েছে।',
          reply: 'দুঃখিত, AI অর্ডার এজেন্ট বর্তমানে নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে স্বাভাবিক চেকআউট ব্যবহার করুন।',
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'ইনপুট তথ্য সঠিক নয়',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { sessionId, productId, message } = parsed.data;

    const result = await processOrderAgentTurn({
      sessionId,
      productId,
      userMessage: message,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[API /api/ai/order-agent] Error:', error);
    const msg = error instanceof Error ? error.message : 'দুঃখিত, একটু সমস্যা হয়েছে। আবার চেষ্টা করুন।';
    return NextResponse.json(
      {
        error: msg,
        reply: 'দুঃখিত, একটু কারিগরি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      },
      { status: 500 }
    );
  }
}

