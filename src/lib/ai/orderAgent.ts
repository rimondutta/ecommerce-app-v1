import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import AiSettings, { IAiSettings } from '@/models/AiSettings';
import AiOrderSession, { IAiOrderSession, IAiCollectedFields } from '@/models/AiOrderSession';
import { generateAI } from '@/lib/ai/providers';
import {
  buildSystemPrompt,
  AiTurnResponseSchema,
  normalizeBangladeshiPhone,
  normalizeBanglaDigits,
  detectShippingZone,
  ProductContextInfo,
} from '@/lib/ai/prompts';
import { calculateOrderPricing } from '@/lib/pricing';
import { createStoreOrder } from '@/lib/orderService';
import { getProductSuggestions, SuggestedProduct } from '@/lib/ai/suggestions';
import crypto from 'crypto';
import mongoose from 'mongoose';

export interface OrderSummaryData {
  title: string;
  image?: string;
  variationLabel?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  discountAmount?: number;
  couponCode?: string;
  shippingZone: 'inside_dhaka' | 'outside_dhaka';
  shippingAddress: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
}

export interface OrderAgentResponse {
  sessionId: string;
  reply: string;
  step: 'phone' | 'name' | 'variation' | 'quantity' | 'address' | 'review' | 'done' | 'cancelled';
  quickReplies: string[];
  summary?: OrderSummaryData | null;
  orderId?: string | null;
  suggestions?: SuggestedProduct[];
  isCompleted?: boolean;
}

interface ProductVariantLean {
  _id?: { toString(): string };
  combinationLabel?: string;
  price: number;
  stock: number;
  isActive?: boolean;
}

interface ProductDocLean {
  _id: { toString(): string };
  title: string;
  price: number;
  inventory?: number;
  hasVariations?: boolean;
  variants?: ProductVariantLean[];
  description?: string;
  ageRange?: string;
  images?: Array<{ url?: string }>;
}

/**
 * Helper to detect greetings
 */
function isGreetingMessage(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase().trim();
  return /^(hello|hi|hey|hy|hola|salam|assalam|slm|halo|হ্যালো|হাই|হে|সালাম|আসসালামু|কেমন আছেন|কেমন আছো|kemon acho|kemon achen)/i.test(t);
}

/**
 * Extracts and parses LLM turn with single retry and code fence removal
 */
/**
 * Strips markdown code fences and extracts the first JSON object from raw LLM output.
 * Free models often wrap JSON in ```json...``` or add text before/after.
 */
function extractJsonFromRawOutput(raw: string): string {
  if (!raw) return '';

  // 1. Remove code fences
  let cleaned = raw.replace(/^```(?:json)?\s*/im, '').replace(/```\s*$/m, '').trim();

  // 2. If still not starting with '{', try to find the first '{' and last '}'
  if (!cleaned.startsWith('{')) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.slice(start, end + 1);
    }
  }

  return cleaned;
}

async function callLLMExtractor(
  systemPrompt: string,
  history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  userMessage: string
) {
  const messages = [
    ...history.slice(-10),
    { role: 'user' as const, content: userMessage },
  ];

  let rawOutput = '';
  try {
    rawOutput = await generateAI({
      system: systemPrompt,
      messages,
      jsonMode: true,
      temperature: 0.2,
    });
  } catch (error) {
    console.warn('[orderAgent] Initial LLM call failed:', error);
    return null;
  }

  console.log('[orderAgent] Raw LLM output (first 300):', rawOutput.slice(0, 300));

  const cleanJson = extractJsonFromRawOutput(rawOutput);

  // Try JSON parse
  if (cleanJson.startsWith('{')) {
    try {
      const parsed = JSON.parse(cleanJson);
      const validated = AiTurnResponseSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }
      // Partial parse: at least extract the reply field
      if (parsed?.reply && typeof parsed.reply === 'string' && parsed.reply.trim().length > 3) {
        return {
          reply: parsed.reply.trim(),
          intent: (parsed.intent as 'ask_question') || 'ask_question',
          extracted: parsed.extracted || {},
        };
      }
    } catch (parseErr) {
      console.warn('[orderAgent] JSON parse failed:', (parseErr as Error).message, '| raw snippet:', cleanJson.slice(0, 100));
    }
  }

  // If the output is natural Bangla text (not JSON at all), use it directly as reply
  const looksLikeText = cleanJson.length > 5 && !cleanJson.startsWith('{') && !cleanJson.startsWith('<');
  if (looksLikeText) {
    return {
      reply: cleanJson.trim(),
      intent: 'ask_question' as const,
      extracted: {},
    };
  }

  // Last resort: retry once with stricter instruction
  try {
    const retryOutput = await generateAI({
      system: `${systemPrompt}\n\nCRITICAL: Reply with ONLY a raw JSON object starting with { and ending with }. No markdown, no text outside the JSON.`,
      messages,
      jsonMode: true,
      temperature: 0.1,
    });
    const retryClean = extractJsonFromRawOutput(retryOutput);
    if (retryClean.startsWith('{')) {
      try {
        const parsedRetry = JSON.parse(retryClean);
        const validatedRetry = AiTurnResponseSchema.safeParse(parsedRetry);
        if (validatedRetry.success) return validatedRetry.data;
        if (parsedRetry?.reply && typeof parsedRetry.reply === 'string') {
          return { reply: parsedRetry.reply.trim(), intent: 'ask_question' as const, extracted: parsedRetry.extracted || {} };
        }
      } catch { /* ignore */ }
    }
    if (retryClean.length > 5 && !retryClean.startsWith('{')) {
      return { reply: retryClean.trim(), intent: 'ask_question' as const, extracted: {} };
    }
  } catch (retryErr) {
    console.warn('[orderAgent] Retry LLM call failed:', retryErr);
  }

  return null;
}

/**
 * Computes the server-authoritative order summary card data
 */
async function computeServerSummary(
  product: ProductDocLean,
  collected: IAiCollectedFields
): Promise<OrderSummaryData | null> {
  try {
    const qty = collected.quantity && collected.quantity > 0 ? collected.quantity : 1;
    const pricing = await calculateOrderPricing({
      items: [
        {
          productId: product._id.toString(),
          variantId: collected.variationId || undefined,
          quantity: qty,
        },
      ],
      shippingZone: collected.shippingZone || 'inside_dhaka',
      couponCode: collected.couponCode || undefined,
    });

    const item = pricing.items[0];
    const image = item?.image || product.images?.[0]?.url || '';

    return {
      title: product.title,
      image,
      variationLabel: collected.variationLabel || undefined,
      quantity: qty,
      unitPrice: item?.price || product.price,
      subtotal: pricing.subtotal,
      shippingCost: pricing.shippingCost,
      discountAmount: pricing.discountAmount,
      couponCode: pricing.couponCode,
      totalAmount: pricing.totalAmount,
      shippingZone: pricing.shippingZone,
      shippingAddress: collected.address || '',
      customerName: collected.name || '',
      customerPhone: collected.phone || '',
      paymentMethod: 'ক্যাশ অন ডেলিভারি (COD)',
    };
  } catch (err) {
    console.error('[orderAgent] computeServerSummary error:', err);
    return null;
  }
}

/**
 * Core order agent turn runner
 */
export async function processOrderAgentTurn(params: {
  sessionId?: string;
  productId: string;
  userMessage?: string;
}): Promise<OrderAgentResponse> {
  const { sessionId: rawSessionId, productId, userMessage = '' } = params;
  await connectToDatabase();

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('সঠিক পণ্য নির্বাচন করা হয়নি।');
  }

  // 1. Fetch Product
  const product = (await Product.findById(productId).lean()) as ProductDocLean | null;
  if (!product) {
    throw new Error('পণ্যটি খুঁজে পাওয়া যায়নি বা বর্তমানে উপলব্ধ নেই।');
  }

  // 2. Fetch AI settings for extra system prompt & store name
  const aiSettings = (await AiSettings.findOne({ key: 'global' }).lean()) as IAiSettings | null;
  const storeName = aiSettings?.storeName || 'Toy Hourse';
  const extraInstructions = aiSettings?.systemPromptExtra || '';

  // 3. Build product context
  const activeVariants = (product.variants || []).filter(
    (v) => v.isActive !== false && v.stock > 0
  );

  const hasActiveVariations = Boolean(product.hasVariations && activeVariants.length > 0);

  const productContext: ProductContextInfo = {
    title: product.title,
    price: product.price,
    inventory: product.inventory ?? 0,
    hasVariations: hasActiveVariations,
    variants: (product.variants || []).map((v) => ({
      id: v._id ? v._id.toString() : '',
      label: v.combinationLabel || 'ডিফল্ট ভ্যারিয়েশন',
      price: v.price || product.price,
      stock: v.stock || 0,
    })),
    description: product.description,
    ageRange: product.ageRange,
  };

  // 4. Load or Initialize Session
  let session: any = null;
  let sessionId: string = (rawSessionId || '').trim();

  if (sessionId) {
    session = await AiOrderSession.findOne({ sessionId });
  }

  const isInitialGreeting = !session || !userMessage.trim();

  if (!session) {
    sessionId = sessionId || crypto.randomUUID();
    session = new AiOrderSession({
      sessionId,
      productId: new mongoose.Types.ObjectId(productId),
      step: 'phone',
      collected: {
        phone: null,
        name: null,
        variationId: null,
        variationLabel: null,
        quantity: 1,
        address: null,
        city: null,
        shippingZone: 'inside_dhaka',
      },
      messages: [],
      status: 'active',
    });
  } else {
    sessionId = session.sessionId || sessionId;
  }

  // Idempotency: If session already completed, return existing order
  if (session.status === 'completed' && session.orderId) {
    const summary = await computeServerSummary(product, session.collected);
    return {
      sessionId,
      reply: `আপনার অর্ডারটি আগেই গ্রহণ করা হয়েছে (অর্ডার নং: #${session.orderId.toString().slice(-8).toUpperCase()})। নতুন অর্ডার করতে চাইলে "নতুন অর্ডার করুন" চাপুন।`,
      step: 'done',
      quickReplies: ['নতুন অর্ডার করুন'],
      summary,
      orderId: session.orderId.toString(),
      isCompleted: true,
    };
  }

  // If first greeting (no user message yet) - dynamically generated by AI
  if (isInitialGreeting) {
    const initSystemPrompt = buildSystemPrompt(storeName, productContext, extraInstructions, {
      phone: null,
      name: null,
      variationLabel: null,
      quantity: null,
      address: null,
      nextMissingField: 'phone',
    });

    let greetingText = '';
    try {
      const initRes = await callLLMExtractor(
        initSystemPrompt,
        [],
        `গ্রাহক "${product.title}" পণ্যটির পেজে "AI দিয়ে অর্ডার করুন" বাটনে ক্লিক করেছেন। তাকে দোকানে সুন্দর করে স্বাগত জানিয়ে পণ্যটির কথা বলো এবং অর্ডার শুরু করতে বিনীতভাবে মোবাইল নম্বর চাও।`
      );
      if (initRes?.reply && !initRes.reply.includes('{')) {
        greetingText = initRes.reply.trim();
      }
    } catch (e) {
      console.warn('[orderAgent] Initial dynamic greeting failed:', e);
    }

    if (!greetingText) {
      greetingText = `আসসালামু আলাইকুম! 😊 "${storeName}"-এ আপনাকে স্বাগতম!\n\n"${product.title}" দেখছেন — চমৎকার পছন্দ! 🎁\n\nঅর্ডার করতে শুধু আপনার মোবাইল নম্বরটা দিন (যেমন: 017XXXXXXXX) 👇`;
    }

    session.messages.push({
      role: 'assistant',
      content: greetingText,
      timestamp: new Date(),
    });
    session.step = 'phone';
    await session.save();

    return {
      sessionId,
      reply: greetingText,
      step: 'phone',
      quickReplies: [],
    };
  }

  // 5. Append User Message
  const cleanUserMessage = userMessage.trim().slice(0, 500);
  session.messages.push({
    role: 'user',
    content: cleanUserMessage,
    timestamp: new Date(),
  });

  // Handle explicit Cancel
  const lowerMsg = cleanUserMessage.toLowerCase();
  if (lowerMsg === 'বাতিল' || lowerMsg === 'cancel' || lowerMsg.includes('বাতিল করুন')) {
    session.status = 'cancelled';
    session.step = 'cancelled';
    const cancelReply = 'ঠিক আছে ভাই/আপু, বাতিল করা হয়েছে 😊 পরে অর্ডার করতে চাইলে যেকোনো সময় আসবেন — সবসময় স্বাগতম! 💚';
    session.messages.push({ role: 'assistant', content: cancelReply, timestamp: new Date() });
    await session.save();
    return {
      sessionId,
      reply: cancelReply,
      step: 'cancelled',
      quickReplies: ['নতুন অর্ডার করুন'],
    };
  }

  // Handle explicit Restart
  if (lowerMsg === 'নতুন অর্ডার করুন' || lowerMsg === 'restart') {
    session.step = 'phone';
    session.status = 'active';
    session.collected = {
      phone: null,
      name: null,
      variationId: null,
      variationLabel: null,
      quantity: 1,
      address: null,
      city: null,
      shippingZone: 'inside_dhaka',
    };
    const restartReply = `ঠিক আছে, নতুন অর্ডার শুরু করি! 😊 আপনার মোবাইল নম্বরটা দিন (যেমন: 017XXXXXXXX) 👇`;
    session.messages.push({ role: 'assistant', content: restartReply, timestamp: new Date() });
    await session.save();
    return {
      sessionId,
      reply: restartReply,
      step: 'phone',
      quickReplies: [],
    };
  }

  // Determine what is currently missing before LLM turn
  let currentMissingField: 'phone' | 'name' | 'variation' | 'quantity' | 'address' | 'review' = 'phone';
  if (!session.collected.phone) currentMissingField = 'phone';
  else if (!session.collected.name) currentMissingField = 'name';
  else if (hasActiveVariations && !session.collected.variationId) currentMissingField = 'variation';
  else if (!session.collected.quantity || session.collected.quantity < 1) currentMissingField = 'quantity';
  else if (!session.collected.address || session.collected.address.length < 5) currentMissingField = 'address';
  else currentMissingField = 'review';

  // 6. LLM Extraction & Natural Conversational Reply
  const systemPrompt = buildSystemPrompt(storeName, productContext, extraInstructions, {
    phone: session.collected.phone,
    name: session.collected.name,
    variationLabel: session.collected.variationLabel,
    quantity: session.collected.quantity,
    address: session.collected.address,
    shippingZone: session.collected.shippingZone,
    nextMissingField: currentMissingField,
  });

  const llmResult = await callLLMExtractor(
    systemPrompt,
    session.messages.map((m: { role: string; content: string }) => ({ role: m.role as any, content: m.content })),
    cleanUserMessage
  );

  // 7. Update Collected State with Validation
  // Phone
  if (!session.collected.phone) {
    const extractedPhone = llmResult?.extracted?.phone || cleanUserMessage;
    const normalizedPhone = normalizeBangladeshiPhone(extractedPhone);
    if (normalizedPhone) {
      session.collected.phone = normalizedPhone;
    } else if (session.step === 'phone') {
      const directMatch = cleanUserMessage.match(/(?:(?:\+?880)|0)?1[3-9]\d{8}/);
      if (directMatch) {
        const val = normalizeBangladeshiPhone(directMatch[0]);
        if (val) session.collected.phone = val;
      }
    }
  }

  // Name
  if (!session.collected.name && llmResult?.extracted?.name) {
    const n = llmResult.extracted.name.trim();
    if (n.length >= 2 && !/^\d+$/.test(n) && !isGreetingMessage(n)) {
      session.collected.name = n;
    }
  } else if (!session.collected.name && session.step === 'name' && cleanUserMessage.length >= 2) {
    // If we're at name step and user types a name (ensure not digits, question, or greeting)
    if (
      !/^\d+$/.test(cleanUserMessage) &&
      !isGreetingMessage(cleanUserMessage) &&
      cleanUserMessage.length <= 40 &&
      !cleanUserMessage.includes('?') &&
      !cleanUserMessage.includes('কি')
    ) {
      session.collected.name = cleanUserMessage;
    }
  }

  // Variation (if product has variations)
  if (hasActiveVariations) {
    const rawVariation = llmResult?.extracted?.variation || (session.step === 'variation' ? cleanUserMessage : null);
    if (rawVariation && !isGreetingMessage(rawVariation)) {
      const normalizedVar = rawVariation.toLowerCase().trim();
      const matchedVariant = productContext.variants.find((v) => {
        const lbl = v.label.toLowerCase();
        return lbl.includes(normalizedVar) || normalizedVar.includes(lbl);
      });

      if (matchedVariant) {
        if (matchedVariant.stock <= 0) {
          const outOfStockMsg = `দুঃখিত, "${matchedVariant.label}" ভ্যারিয়েশনটির স্টক বর্তমানে শেষ। আপনি নিচের স্টক থাকা যেকোনো একটি অপশন বেছে নিতে পারেন:`;
          session.messages.push({ role: 'assistant', content: outOfStockMsg, timestamp: new Date() });
          await session.save();
          return {
            sessionId,
            reply: outOfStockMsg,
            step: 'variation',
            quickReplies: activeVariants.map((v) => v.combinationLabel || 'ডিফল্ট'),
          };
        } else {
          session.collected.variationId = matchedVariant.id;
          session.collected.variationLabel = matchedVariant.label;
        }
      }
    }
  }

  // Quantity
  if (llmResult?.extracted?.quantity) {
    const qStr = normalizeBanglaDigits(String(llmResult.extracted.quantity)).replace(/[^0-9]/g, '');
    const q = parseInt(qStr, 10);
    if (!isNaN(q) && q > 0) {
      session.collected.quantity = Math.min(q, 10); // cap max 10
    }
  } else if (session.step === 'quantity') {
    const qDigits = normalizeBanglaDigits(cleanUserMessage).replace(/[^0-9]/g, '');
    const q = parseInt(qDigits, 10);
    if (!isNaN(q) && q > 0) {
      session.collected.quantity = Math.min(q, 10);
    }
  }

  // Address & Shipping Zone
  const isQuestionOrGreeting =
    llmResult?.intent === 'ask_question' ||
    cleanUserMessage.includes('?') ||
    cleanUserMessage.includes('কি') ||
    isGreetingMessage(cleanUserMessage);

  const rawAddress =
    llmResult?.extracted?.address ||
    (session.step === 'address' && !isQuestionOrGreeting ? cleanUserMessage : null);

  if (rawAddress && rawAddress.length >= 5 && !isQuestionOrGreeting) {
    session.collected.address = rawAddress;
    const zone = detectShippingZone(rawAddress, llmResult?.extracted?.area);
    session.collected.shippingZone = zone;
  }

  // Coupon Code
  const extractedCoupon = llmResult?.extracted?.coupon?.trim().toUpperCase();
  if (extractedCoupon && extractedCoupon.length >= 3 && !session.collected.couponCode) {
    try {
      const couponDoc = await Coupon.findOne({ code: extractedCoupon, isActive: true });
      if (couponDoc) {
        const now = new Date();
        const isExpired = couponDoc.expiresAt && new Date(couponDoc.expiresAt) < now;
        const isLimitReached = couponDoc.maxUses > 0 && couponDoc.usedCount >= couponDoc.maxUses;
        if (!isExpired && !isLimitReached) {
          session.collected.couponCode = extractedCoupon;
        }
      }
    } catch {
      // ignore
    }
  }

  // Handle Edit in Review step
  if (
    session.step === 'review' &&
    (llmResult?.intent === 'edit' || lowerMsg.includes('পরিবর্তন') || lowerMsg === 'না' || lowerMsg === 'no')
  ) {
    const editReply = 'অবশ্যই! কোনটা পরিবর্তন করতে চান বলুন — আমি ঠিক করে দিচ্ছি 😊';
    session.messages.push({ role: 'assistant', content: editReply, timestamp: new Date() });
    await session.save();
    return {
      sessionId,
      reply: editReply,
      step: 'address',
      quickReplies: ['ঠিকানা পরিবর্তন', 'পরিমাণ পরিবর্তন'],
    };
  }

  // 8. Handle Confirmation at Review step
  if (session.step === 'review') {
    const isConfirmIntent =
      llmResult?.intent === 'confirm' ||
      lowerMsg === 'হ্যাঁ' ||
      lowerMsg === 'হ্যাঁ, কনফার্ম করুন' ||
      lowerMsg === 'confirm' ||
      lowerMsg === 'yes' ||
      lowerMsg === 'জি' ||
      lowerMsg === 'ji' ||
      lowerMsg === 'ha' ||
      lowerMsg.includes('কনফার্ম') ||
      lowerMsg.includes('অর্ডার করুন') ||
      lowerMsg.includes('অর্ডার দিন');

    if (isConfirmIntent) {
      // Authoritatively create order via shared orderService
      try {
        const orderResult = await createStoreOrder({
          customerName: session.collected.name || 'সম্মানিত গ্রাহক',
          items: [
            {
              productId: product._id.toString(),
              variantId: session.collected.variationId || undefined,
              quantity: session.collected.quantity || 1,
            },
          ],
          shippingAddress: {
            name: session.collected.name || undefined,
            phone: session.collected.phone || '',
            addressLine1: session.collected.address || 'ঠিকানা প্রদান করা হয়েছে',
            city: session.collected.shippingZone === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka',
            country: 'Bangladesh',
          },
          paymentMethod: 'cod',
          shippingZone: session.collected.shippingZone || 'inside_dhaka',
          couponCode: session.collected.couponCode || undefined,
          source: 'ai_agent',
        });

        session.orderId = new mongoose.Types.ObjectId(orderResult.orderId);
        session.status = 'completed';
        session.step = 'done';

        const finalSuccessText = `আলহামদুলিল্লাহ! 🎉 অর্ডার কনফার্ম হয়ে গেছে${session.collected.name ? ' ' + session.collected.name + ' ভাই/আপু' : ''}!\n\n✅ অর্ডার নম্বর: #${orderResult.orderId.slice(-8).toUpperCase()}\n💰 মোট পরিশোধ: ৳${orderResult.totalAmount.toLocaleString()} (Cash on Delivery)\n🚚 ডেলিভারি: ২-৪ কার্যদিবসের মধ্যে পৌঁছাবে ইনশাআল্লাহ\n\nআমাদের টিম শীঘ্রই আপনাকে কল করে অর্ডার কনফার্ম করবে। ধন্যবাদ! 💚`;

        session.messages.push({
          role: 'assistant',
          content: finalSuccessText,
          timestamp: new Date(),
        });
        await session.save();

        const summary = await computeServerSummary(product, session.collected);
        const suggestions = await getProductSuggestions(product._id.toString());

        return {
          sessionId,
          reply: finalSuccessText,
          step: 'done',
          quickReplies: ['নতুন অর্ডার করুন'],
          summary,
          orderId: orderResult.orderId,
          suggestions,
          isCompleted: true,
        };
      } catch (orderErr: unknown) {
        console.error('[orderAgent] Order placement error:', orderErr);
        const errorMsg = orderErr instanceof Error ? orderErr.message : 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে।';
        const failText = `দুঃখিত, ${errorMsg} অনুগ্রহ করে তথ্যগুলো আবার যাচাই করুন।`;
        session.messages.push({ role: 'assistant', content: failText, timestamp: new Date() });
        await session.save();
        return {
          sessionId,
          reply: failText,
          step: 'review',
          quickReplies: ['হ্যাঁ, কনফার্ম করুন', 'পরিবর্তন করুন', 'বাতিল'],
        };
      }
    }
  }

  // 9. Advance State Machine to Next Missing Field
  let nextStep: IAiOrderSession['step'] = 'phone';
  let quickReplies: string[] = [];

  if (!session.collected.phone) {
    nextStep = 'phone';
    quickReplies = [];
  } else if (!session.collected.name) {
    nextStep = 'name';
    quickReplies = [];
  } else if (hasActiveVariations && !session.collected.variationId) {
    nextStep = 'variation';
    quickReplies = activeVariants.map((v) => v.combinationLabel || 'ডিফল্ট');
  } else if (!session.collected.quantity || session.collected.quantity < 1) {
    nextStep = 'quantity';
    quickReplies = ['১ টি', '২ টি', '৩ টি', '৫ টি'];
  } else if (!session.collected.address || session.collected.address.length < 5) {
    nextStep = 'address';
    quickReplies = ['ঢাকা সিটি', 'ঢাকার বাইরে'];
  } else {
    nextStep = 'review';
    quickReplies = ['হ্যাঁ, কনফার্ম করুন', 'পরিবর্তন করুন', 'বাতিল'];
  }

  // 10. REAL AI CHAT: All text comes directly from the AI!
  // No static template text — the AI dynamically converses with the user.
  let promptReply = '';

  if (llmResult?.reply && !llmResult.reply.includes('{') && llmResult.reply.trim().length > 0) {
    promptReply = llmResult.reply.trim();
  }

  // Fallback ONLY if AI returned empty or failed
  if (!promptReply) {
    if (nextStep === 'phone') {
      promptReply = `আচ্ছা, আপনার মোবাইল নম্বরটা একটু দিন (যেমন: 017XXXXXXXX) 😊 👇`;
    } else if (nextStep === 'name') {
      promptReply = 'জি, আপনার নামটা বলুন 😊 (অর্ডার ফর্মে লিখে রাখব)';    
    } else if (nextStep === 'variation') {
      promptReply = `এই পণ্যটিতে কিছু সুন্দর ভ্যারিয়েশন রয়েছে। আপনি কোনটি নিতে চান?\n${activeVariants
        .map((v) => `• ${v.combinationLabel} - ৳${v.price}`)
        .join('\n')}`;
    } else if (nextStep === 'quantity') {
      promptReply = 'কতটি নিবেন? 😊 (১টি, ২টি বা যত নিতে চান বলুন)';    
    } else if (nextStep === 'address') {
      promptReply = 'এখন আপনার ডেলিভারি ঠিকানাটা দিন 🚚 — বাড়ি/ফ্ল্যাট নম্বর, রোড, এলাকা আর জেলা লিখুন 👇';    
    } else {
      promptReply = 'সব তথ্য ঠিক আছে! ✅ অর্ডারটি কি কনফার্ম করব? জি বললেই হবে 😊';    
    }
  }

  session.step = nextStep;
  session.messages.push({
    role: 'assistant',
    content: promptReply,
    timestamp: new Date(),
  });

  // Trim messages to last 15
  if (session.messages.length > 15) {
    session.messages = session.messages.slice(-15);
  }

  await session.save();

  const currentSummary = nextStep === 'review' ? await computeServerSummary(product, session.collected) : null;

  return {
    sessionId,
    reply: promptReply,
    step: nextStep,
    quickReplies,
    summary: currentSummary,
  };
}



