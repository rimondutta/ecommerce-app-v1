import { streamText, tool, zodSchema, convertToModelMessages, isStepCount } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import AiSettings, { IAiSettings } from '@/models/AiSettings';
import { decryptApiKey } from '@/lib/ai/crypto';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 35 seconds
export const maxDuration = 35;

/**
 * Public endpoint to check if the website chatbot is currently enabled
 */
export async function GET() {
  try {
    await connectToDatabase();
    const settings = (await AiSettings.findOne({ key: 'global' }).lean()) as IAiSettings | null;
    return NextResponse.json({
      enabled: settings?.isChatbotEnabled !== false,
      storeName: settings?.storeName || 'Toy Hourse',
      chatbot: {
        botName: settings?.chatbot?.botName || 'Toy Hourse AI',
        welcomeMessage:
          settings?.chatbot?.welcomeMessage ||
          'হ্যালো! Toy Hourse এ আপনাকে স্বাগতম। আপনার বাচ্চার জন্য সেরা খেলনা খুঁজতে বা যেকোনো তথ্যের জন্য আমাকে জিজ্ঞেস করতে পারেন।',
        placeholder: settings?.chatbot?.placeholder || 'খেলনা খুঁজুন বা প্রশ্ন লিখুন...',
        quickPrompts:
          Array.isArray(settings?.chatbot?.quickPrompts) && settings.chatbot.quickPrompts.length > 0
            ? settings.chatbot.quickPrompts
            : [
                '🚗 জনপ্রিয় খেলনা দেখাও',
                '🧸 ১-৩ বছরের খেলনা কি আছে?',
                '🚚 ডেলিভারি চার্জ ও সময় কত?',
                '💳 ক্যাশ অন ডেলিভারি আছে?',
              ],
        supportPhone: settings?.chatbot?.supportPhone || '',
        deliveryInsideDhaka: settings?.chatbot?.deliveryInsideDhaka ?? 70,
        deliveryOutsideDhaka: settings?.chatbot?.deliveryOutsideDhaka ?? 130,
        deliveryTime:
          settings?.chatbot?.deliveryTime || 'ঢাকা সিটির ভেতরে ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ২-৩ দিন',
        returnPolicy: settings?.chatbot?.returnPolicy || '৭ দিনের সহজ রিটার্ন ও রিপ্লেসমেন্ট পলিসি',
        primaryColor: settings?.chatbot?.primaryColor || '#7C3AED',
        position: settings?.chatbot?.position || 'bottom-right',
        badgeText: settings?.chatbot?.badgeText || 'Chat with AI 🤖',
      },
    });
  } catch {
    return NextResponse.json({
      enabled: true,
      storeName: 'Toy Hourse',
      chatbot: {
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
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const settings = (await AiSettings.findOne({ key: 'global' }).lean()) as IAiSettings | null;

    // Check if chatbot is enabled in dashboard
    if (settings && settings.isChatbotEnabled === false) {
      return NextResponse.json(
        { error: 'Website Chatbot is currently disabled from admin dashboard.' },
        { status: 403 }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // Limit conversation payload length to protect against abuse and excessive token consumption
    const boundedMessages = messages.slice(-15);

    // ── Resolve Provider from Dashboard Settings ──
    const activeProvider = settings?.activeProvider || 'openrouter';
    let apiKey = '';
    let modelName = 'openrouter/free';
    let baseURL = 'https://openrouter.ai/api/v1';
    let headers: Record<string, string> = {
      'HTTP-Referer': 'https://toyhourse.com',
      'X-Title': 'Toy Hourse AI Assistant',
    };

    if (activeProvider === 'gemini') {
      apiKey = decryptApiKey(settings?.gemini?.apiKey) || process.env.GEMINI_API_KEY || '';
      modelName = settings?.gemini?.model || 'gemini-2.5-flash';
      // Google Generative AI provides an official OpenAI-compatible endpoint
      baseURL = 'https://generativelanguage.googleapis.com/v1beta/openai/';
    } else if (activeProvider === 'custom' && settings?.custom?.baseUrl) {
      apiKey = decryptApiKey(settings?.custom?.apiKey) || '';
      modelName = settings?.custom?.model || 'gpt-4o-mini';
      baseURL = settings.custom.baseUrl;
      if (settings.custom.headers) {
        try {
          headers = { ...headers, ...JSON.parse(settings.custom.headers) };
        } catch { /* ignore */ }
      }
    } else {
      // Default / OpenRouter
      apiKey = decryptApiKey(settings?.openrouter?.apiKey) || process.env.OPENROUTER_API_KEY || '';
      modelName = settings?.openrouter?.model || process.env.OPENROUTER_MODEL || 'openrouter/free';
      baseURL = 'https://openrouter.ai/api/v1';
    }

    // Fallback if the selected provider has no key configured
    if (!apiKey && process.env.OPENROUTER_API_KEY) {
      apiKey = process.env.OPENROUTER_API_KEY;
      modelName = 'openrouter/free';
      baseURL = 'https://openrouter.ai/api/v1';
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI API Key is not configured. Please set an API key in Admin Settings > AI.' },
        { status: 500 }
      );
    }

    const aiProvider = createOpenAI({
      baseURL,
      apiKey,
      headers,
    });

    const storeName = settings?.storeName || 'Toy Hourse';
    const extraInstructions = settings?.systemPromptExtra || '';
    const chatbotConfig = settings?.chatbot;
    const botName = chatbotConfig?.botName || 'Toy Hourse AI';
    const deliveryInside = chatbotConfig?.deliveryInsideDhaka ?? 70;
    const deliveryOutside = chatbotConfig?.deliveryOutsideDhaka ?? 130;
    const deliveryTime =
      chatbotConfig?.deliveryTime || 'ঢাকা সিটির ভেতরে ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ২-৩ দিন';
    const returnPolicy =
      chatbotConfig?.returnPolicy || '৭ দিনের সহজ রিটার্ন ও রিপ্লেসমেন্ট পলিসি';
    const supportPhone = chatbotConfig?.supportPhone || '';

    const systemPrompt = `You are "${botName}", a helpful, polite, and professional customer support AI for "${storeName}", a premier toy and baby shop in Bangladesh.
Your goal is to warmly welcome customers, help them find the best toys, check real-time stock, and guide them in completing purchases.
- You can communicate fluently in both Bengali (বাংলা) and English. If the user writes in Bangla, reply in natural, polite Bangla.
- Always use the 'searchProducts' tool when a user asks about product availability, prices, categories, age range, or if we have a specific toy.
- If a product is out of stock (inventory <= 0), politely inform the customer and suggest checking similar products.
- Always provide clickable markdown product links (e.g., [Product Name](/products/product-slug)) so they can click and buy it right away.
- Format prices in BDT (৳).
- Delivery information:
  * Cash on Delivery (ক্যাশ অন ডেলিভারি) is available nationwide across Bangladesh.
  * Delivery charge: ঢাকা সিটির ভেতরে ৳${deliveryInside}, ঢাকার বাইরে ৳${deliveryOutside}.
  * Delivery timeframe: ${deliveryTime}.
- Return & Replacement Policy: ${returnPolicy}.
${supportPhone ? `- Customer Support Hotline / Phone: ${supportPhone}. Share this if customer asks for direct phone support or urgent assistance.` : ''}
- Be concise, clear, and trustworthy. Use fitting emojis tastefully (🧸, 🚗, ✨, 🎁, 📦).
- Do not make up products, prices, or inventory. ONLY rely on the information returned by the searchProducts tool.
${extraInstructions ? `Additional Store Instructions:\n${extraInstructions}` : ''}`;

    const result = streamText({
      model: aiProvider(modelName) as unknown as Parameters<typeof streamText>[0]['model'],
      system: systemPrompt,
      messages: await convertToModelMessages(boundedMessages),
      stopWhen: isStepCount(5),
      tools: {
        searchProducts: tool({
          description: 'Search for products in the store catalog by name, category, or keyword.',
          inputSchema: zodSchema(
            z.object({
              query: z
                .string()
                .min(1)
                .max(80)
                .describe('The search keyword (e.g., "car", "lego", "doll"). Max 80 characters.'),
            })
          ),
          execute: async ({ query }: { query: string }) => {
            const sanitizedQuery = (query || '').trim().slice(0, 80);
            if (!sanitizedQuery) {
              return { results: 'No search term provided.' };
            }

            // Escape regex metacharacters to eliminate regular-expression injection / ReDoS
            const escapedQuery = sanitizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // 1. Try high-performance MongoDB text index first
            let products = await Product.find({
              $text: { $search: sanitizedQuery },
              isPublished: true,
            })
              .select('title slug price compareAtPrice inventory hasVariations variants badge')
              .limit(5)
              .lean();

            // 2. Fall back to escaped regex if text search yielded zero matches
            if (!products.length) {
              products = await Product.find({
                $or: [
                  { title: { $regex: escapedQuery, $options: 'i' } },
                  { tags: { $regex: escapedQuery, $options: 'i' } },
                ],
                isPublished: true,
              })
                .select('title slug price compareAtPrice inventory hasVariations variants badge')
                .limit(5)
                .lean();
            }

            if (!products.length) {
              return { results: 'No products found for this query.' };
            }

            interface ProductVariant {
              inventory?: number;
              stock?: number;
              price: number;
            }

            interface ProductType {
              title: string;
              slug: string;
              price: number;
              compareAtPrice?: number;
              inventory: number;
              hasVariations: boolean;
              variants?: ProductVariant[];
              badge?: string;
            }

            return {
              results: (products as ProductType[]).map((p) => {
                let stock = p.inventory;
                let price = p.price;

                if (p.hasVariations && p.variants && p.variants.length > 0) {
                  stock = p.variants.reduce(
                    (total: number, v: ProductVariant) => total + (v.stock ?? v.inventory ?? 0),
                    0
                  );
                  price = p.variants[0].price;
                }

                return {
                  name: p.title,
                  price,
                  originalPrice: p.compareAtPrice,
                  stock,
                  inStock: stock > 0,
                  link: `/products/${p.slug}`,
                  badge: p.badge,
                };
              }),
            };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
