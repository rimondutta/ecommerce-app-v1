import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { generateAI, isSuggestionsAvailable } from '@/lib/ai/providers';
import { redis, hasRedis } from '@/lib/redis';
import mongoose from 'mongoose';
import { z } from 'zod';

export interface SuggestedProduct {
  _id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  reason: string; // One-line Bangla recommendation reason
}

const SuggestionResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      id: z.string(),
      reason: z.string().min(1),
    })
  ),
});

// In-memory fallback cache (12 hours)
const memoryCache = new Map<string, { data: SuggestedProduct[]; expiresAt: number }>();

interface ProductCandidateLean {
  _id: { toString(): string };
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images?: Array<{ url?: string }>;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  category?: { toString(): string };
  tags?: string[];
  ageRange?: string;
  inventory?: number;
}

/**
 * Generates or retrieves cached AI product suggestions for a given product
 */
export async function getProductSuggestions(
  productId: string,
  userQuery?: string
): Promise<SuggestedProduct[]> {
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return [];
  }

  const cacheKey = `ai:suggestions:${productId}${userQuery ? `:${userQuery.trim().toLowerCase()}` : ''}`;
  const now = Date.now();

  // 1. Check in-memory cache
  const cachedMem = memoryCache.get(cacheKey);
  if (cachedMem && cachedMem.expiresAt > now) {
    return cachedMem.data;
  }

  // 2. Check Redis cache if configured
  if (hasRedis && redis) {
    try {
      const cached = await redis.get<SuggestedProduct[] | string>(cacheKey);
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCache.set(cacheKey, { data: parsed, expiresAt: now + 43200 * 1000 });
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[suggestions] Redis cache read error:', e);
    }
  }

  await connectToDatabase();

  const targetProduct = (await Product.findById(productId).lean()) as ProductCandidateLean | null;
  if (!targetProduct) return [];

  // 3. Select up to 20 candidate products from DB
  const filter: Record<string, unknown> = {
    _id: { $ne: targetProduct._id },
    isPublished: true,
    $or: [{ inventory: { $gt: 0 } }, { 'variants.stock': { $gt: 0 } }],
  };

  const candidates = (await Product.find(filter)
    .select('title slug price compareAtPrice images rating reviewCount badge category tags ageRange inventory')
    .limit(20)
    .lean()) as ProductCandidateLean[];

  if (candidates.length === 0) {
    return [];
  }

  const candidateMap = new Map<string, ProductCandidateLean>();
  candidates.forEach((c) => candidateMap.set(c._id.toString(), c));

  // Fallback function when AI is disabled or fails
  const getRuleBasedFallback = (): SuggestedProduct[] => {
    return candidates.slice(0, 4).map((c) => ({
      _id: c._id.toString(),
      title: c.title,
      slug: c.slug,
      price: c.price,
      compareAtPrice: c.compareAtPrice,
      image: c.images?.[0]?.url || '',
      rating: c.rating,
      reviewCount: c.reviewCount,
      badge: c.badge,
      reason: c.category?.toString() === targetProduct.category?.toString()
        ? 'এই ক্যাটাগরির অন্যতম জনপ্রিয় খেলনা!'
        : 'শিশুদের অত্যন্ত পছন্দের একটি সেরা খেলনা!',
    }));
  };

  const aiAvailable = await isSuggestionsAvailable();
  if (!aiAvailable) {
    return getRuleBasedFallback();
  }

  // 4. Compact candidates payload for LLM
  const compactCandidates = candidates.map((c) => ({
    id: c._id.toString(),
    title: c.title,
    price: c.price,
    ageRange: c.ageRange || 'সকল বয়সের জন্য',
  }));

  const systemPrompt = `তুমি "${targetProduct.title}" (মূল্য ৳${targetProduct.price}) পণ্যের সাথে মানানসই অথবা বিকল্প সেরা ৩-৪টি খেলনা সুপারিশ করার একজন অভিজ্ঞ খেলনা বিশেষজ্ঞ।
গ্রাহকের রুচি ও বয়সের সাথে সামঞ্জস্য রেখে নিচে দেওয়া তালিকা থেকে ৩টি বা ৪টি প্রোডাক্ট নির্বাচন করো।
প্রতিটি সুপারিশের জন্য গ্রাহককে আকর্ষণ করার মতো মিষ্টি, এক লাইনের বাংলা কারণ (reason) লিখবে।

[নিয়মাবলি]
1. শুধুমাত্র প্রদত্ত তালিকা থেকে 'id' বেছে নাও। কখনোই তালিকার বাইরে কোনো আইডি বা পণ্য তৈরি করবে না।
2. কারণটি (reason) অবশ্যই বাংলায় হতে হবে।
3. আউটপুট ফরম্যাট STRICT JSON:
{
  "suggestions": [
    { "id": "<প্রদত্ত আইডি>", "reason": "<এক লাইনের মিষ্টি বাংলা কারণ>" }
  ]
}`;

  const userPrompt = userQuery
    ? `গ্রাহকের অনুসন্ধান: "${userQuery}". মূল পণ্য: "${targetProduct.title}". প্রার্থীরা: ${JSON.stringify(compactCandidates)}`
    : `মূল পণ্য: "${targetProduct.title}" (৳${targetProduct.price}). প্রার্থীরা: ${JSON.stringify(compactCandidates)}`;

  try {
    const rawResult = await generateAI({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      jsonMode: true,
      temperature: 0.3,
      timeoutMs: 6000,
    });

    let clean = rawResult.replace(/^```(?:json)?\s*/im, '').replace(/```\s*$/m, '').trim();
    if (!clean.startsWith('{')) {
      const start = clean.indexOf('{');
      const end = clean.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        clean = clean.slice(start, end + 1);
      }
    }
    const parsed = JSON.parse(clean);
    const validated = SuggestionResponseSchema.safeParse(parsed);

    if (!validated.success || !validated.data.suggestions.length) {
      return getRuleBasedFallback();
    }

    // Strictly validate returned IDs against candidates and hydrate full data
    const hydrated: SuggestedProduct[] = [];
    for (const item of validated.data.suggestions) {
      const match = candidateMap.get(item.id);
      if (match) {
        hydrated.push({
          _id: match._id.toString(),
          title: match.title,
          slug: match.slug,
          price: match.price,
          compareAtPrice: match.compareAtPrice,
          image: match.images?.[0]?.url || '',
          rating: match.rating,
          reviewCount: match.reviewCount,
          badge: match.badge,
          reason: item.reason,
        });
      }
    }

    const finalResults = hydrated.length > 0 ? hydrated.slice(0, 4) : getRuleBasedFallback();

    // Cache results (12 hours)
    memoryCache.set(cacheKey, { data: finalResults, expiresAt: now + 43200 * 1000 });
    if (hasRedis && redis) {
      redis.setex(cacheKey, 43200, JSON.stringify(finalResults)).catch((err) =>
        console.warn('[suggestions] Redis setex error:', err)
      );
    }

    return finalResults;
  } catch (err) {
    console.warn('[suggestions] AI generation failed, falling back to rule-based:', err);
    const fallbackResults = getRuleBasedFallback();
    // Cache the rule-based fallback for 5 minutes so subsequent views render instantly without lag
    memoryCache.set(cacheKey, { data: fallbackResults, expiresAt: now + 300 * 1000 });
    return fallbackResults;
  }
}

