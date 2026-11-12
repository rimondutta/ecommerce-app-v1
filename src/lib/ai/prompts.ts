import { z } from 'zod';

/**
 * Normalizes Bangla digits (০-৯) to Arabic digits (0-9)
 */
export function normalizeBanglaDigits(str: string): string {
  if (!str) return '';
  const banglaDigits: { [key: string]: string } = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return str.replace(/[০-৯]/g, (d) => banglaDigits[d] || d);
}

/**
 * Validates and normalizes a Bangladeshi mobile number.
 */
export function normalizeBangladeshiPhone(input?: string | null): string | null {
  if (!input) return null;
  const converted = normalizeBanglaDigits(String(input));
  const cleaned = converted.replace(/[^0-9]/g, '');
  const match = cleaned.match(/^(?:(?:88)?0)?(1[3-9]\d{8})$/);
  if (match && match[1]) {
    return `0${match[1]}`;
  }
  return null;
}

/**
 * Detects whether an address/area is inside Dhaka or outside Dhaka.
 */
export function detectShippingZone(
  address?: string | null,
  area?: string | null
): 'inside_dhaka' | 'outside_dhaka' {
  const combined = `${address || ''} ${area || ''}`.toLowerCase();

  const dhakaKeywords = [
    'ঢাকা', 'dhaka', 'মিরপুর', 'mirpur', 'ধানমন্ডি', 'dhanmondi', 'গুলশান', 'gulshan',
    'উত্তরা', 'uttara', 'বনানী', 'banani', 'মোহাম্মদপুর', 'mohammadpur', 'বাড্ডা', 'badda',
    'মতিঝিল', 'motijheel', 'মহাখালী', 'mohakhali', 'মগবাজার', 'mogbazar', 'খিলগাঁও', 'khilgaon',
    'যাত্রাবাড়ী', 'jatrabari', 'বাসাবো', 'basabo', 'রামপুরা', 'rampura', 'শ্যামলী', 'shyamoli',
    'কাকরাইল', 'kakrail', 'পল্টন', 'paltan', 'বসুন্ধরা', 'bashundhara', 'বারিধারা', 'baridhara',
    'টঙ্গী', 'tongi', 'কেরানীগঞ্জ', 'keraniganj', 'তেজগাঁও', 'tejgaon', 'ফার্মগেট', 'farmgate',
    'আজিমপুর', 'azimpur', 'লালবাগ', 'lalbag', 'সাভার', 'savar', 'আশুলিয়া', 'ashulia',
  ];

  for (const kw of dhakaKeywords) {
    if (combined.includes(kw)) return 'inside_dhaka';
  }

  const outsideKeywords = [
    'চট্টগ্রাম', 'chittagong', 'chattogram', 'সিলেট', 'sylhet', 'রাজশাহী', 'rajshahi',
    'খুলনা', 'khulna', 'বরিশাল', 'barisal', 'রংপুর', 'rangpur', 'ময়মনসিংহ', 'mymensingh',
    'কুমিল্লা', 'comilla', 'নারায়ণগঞ্জ', 'narayanganj', 'গাজীপুর', 'gazipur',
    'বগুড়া', 'bogra', 'bogura', 'ফরিদপুর', 'faridpur', 'কক্সবাজার', 'cox', 'যশোর', 'jessore',
    'নোয়াখালী', 'noakhali', 'ব্রাহ্মণবাড়িয়া', 'brahmanbaria', 'টাঙ্গাইল', 'tangail',
    'মাদারীপুর', 'madaripur', 'নরসিংদী', 'narsingdi', 'মুন্সিগঞ্জ', 'munshiganj',
  ];

  for (const kw of outsideKeywords) {
    if (combined.includes(kw)) return 'outside_dhaka';
  }

  return combined.includes('dhaka') || combined.includes('ঢাকা') ? 'inside_dhaka' : 'outside_dhaka';
}

/**
 * Zod schema for the LLM turn output
 */
export const AiTurnResponseSchema = z.object({
  reply: z.string().describe('Human Bangla reply — natural, warm, like a real Facebook page admin'),
  intent: z.enum([
    'provide_info',
    'confirm',
    'decline',
    'edit',
    'ask_question',
    'cancel',
    'other',
  ]).default('provide_info'),
  extracted: z.object({
    phone: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    variation: z.string().nullable().optional(),
    quantity: z.union([z.number(), z.string()]).nullable().optional(),
    address: z.string().nullable().optional(),
    area: z.string().nullable().optional(),
    coupon: z.string().nullable().optional(),
  }).default({}),
});

export type AiTurnResponse = z.infer<typeof AiTurnResponseSchema>;

export interface ProductContextInfo {
  title: string;
  price: number;
  inventory: number;
  hasVariations: boolean;
  variants: Array<{
    id: string;
    label: string;
    price: number;
    stock: number;
  }>;
  description?: string;
  ageRange?: string;
}

export interface OrderStatePromptContext {
  phone?: string | null;
  name?: string | null;
  variationLabel?: string | null;
  quantity?: number | null;
  address?: string | null;
  shippingZone?: string | null;
  nextMissingField: 'phone' | 'name' | 'variation' | 'quantity' | 'address' | 'review' | 'done';
  summaryDetails?: string;
}

export function buildSystemPrompt(
  storeName: string,
  product: ProductContextInfo,
  extraInstructions?: string,
  orderState?: OrderStatePromptContext
): string {
  const variationsText = product.hasVariations
    ? product.variants
        .map((v) => `  • ${v.label} → ৳${v.price} (${v.stock > 0 ? `${v.stock}টি স্টক আছে` : '❌ স্টক শেষ'})`)
        .join('\n')
    : `  • মূল্য: ৳${product.price} (${product.inventory > 0 ? `${product.inventory}টি স্টক আছে` : '❌ স্টক শেষ'})`;

  const deliveryInfo = `ঢাকার ভেতরে ৳৭০, ঢাকার বাইরে ৳১৩০। পেমেন্ট: Cash on Delivery (পণ্য পেয়ে টাকা দিবেন)। ডেলিভারি: ২-৪ কার্যদিবস।`;

  // Current order collection state
  const collected = {
    phone: orderState?.phone || null,
    name: orderState?.name || null,
    variation: orderState?.variationLabel || null,
    quantity: orderState?.quantity || null,
    address: orderState?.address || null,
  };

  const nextField = orderState?.nextMissingField || 'phone';

  const nextFieldHint =
    nextField === 'phone'
      ? 'এখন গ্রাহকের ১১ ডিজিটের মোবাইল নম্বর নাও (যেমন: 017XXXXXXXX)'
      : nextField === 'name'
      ? 'এখন গ্রাহকের নাম জানো'
      : nextField === 'variation'
      ? `এখন কোন ভ্যারিয়েশন চাই জানো (অপশন: ${product.variants.filter((v) => v.stock > 0).map((v) => v.label).join(', ')})`
      : nextField === 'quantity'
      ? 'এখন কতটি নিতে চান জানো'
      : nextField === 'address'
      ? 'এখন সম্পূর্ণ ডেলিভারি ঠিকানা (বাড়ি/রোড/এলাকা/জেলা) নাও'
      : 'এখন অর্ডার কনফার্ম করো';

  const orderProgress = `
=== অর্ডারের বর্তমান অগ্রগতি ===
✅ ফোন: ${collected.phone || '(এখনো নেওয়া হয়নি)'}
✅ নাম: ${collected.name || '(এখনো নেওয়া হয়নি)'}
${product.hasVariations ? `✅ ভ্যারিয়েশন: ${collected.variation || '(এখনো নেওয়া হয়নি)'}` : ''}
✅ পরিমাণ: ${collected.quantity ? `${collected.quantity}টি` : '(এখনো নেওয়া হয়নি)'}
✅ ঠিকানা: ${collected.address || '(এখনো নেওয়া হয়নি)'}
👉 পরবর্তী কাজ: ${nextFieldHint}`;

  return `তুমি "${storeName}" এর Facebook পেজের একজন অভিজ্ঞ, আন্তরিক ও বুদ্ধিমান অর্ডার নেওয়ার স্টাফ।
তুমি ঠিক যেভাবে বাংলাদেশের Facebook পেজের রিয়েল স্টাফরা মেসেজে কথা বলে, সেভাবেই কথা বলবে।

=== পণ্যের তথ্য ===
পণ্য: ${product.title}
${product.description ? `বিবরণ: ${product.description}` : ''}
${product.ageRange ? `বয়স: ${product.ageRange} বছরের জন্য` : ''}
মূল্য ও স্টক:
${variationsText}
ডেলিভারি চার্জ ও পেমেন্ট: ${deliveryInfo}
${orderProgress}
${extraInstructions ? `\n=== বিশেষ নির্দেশনা ===\n${extraInstructions}` : ''}

=== তোমার ব্যক্তিত্ব ও কথা বলার স্টাইল ===
তুমি একজন REAL HUMAN স্টাফ — রোবট বা AI না। তোমার কথাবার্তা হবে:
✦ সহজ, গরম, আন্তরিক বাংলায় — ঠিক যেমন Facebook পেজে মেসেজ করে
✦ ছোট ছোট প্যারায় লেখো, লম্বা প্যারা না
✦ প্রয়োজনে ইমোজি ব্যবহার করো (😊 ✅ 🎁 🚚 💚 ইত্যাদি)
✦ "জি আপু/ভাই", "অবশ্যই", "জ্বি", "আলহামদুলিল্লাহ" এই ধরনের স্বাভাবিক কথা বলতে পারো
✦ গ্রাহক কিছু জিজ্ঞেস করলে সরাসরি উত্তর দাও, তারপর পরবর্তী তথ্য চাও
✦ কখনো formal বা corporate ভাষা ব্যবহার করবে না
✦ কখনো "আমি একটি AI" বা "আমি একটি রোবট" বলবে না

=== কথোপকথনের নিয়ম ===
১. গ্রাহক "hello/হ্যালো/আচ্ছালামুয়ালাইকুম" বললে → উষ্ণভাবে সাড়া দাও, দোকান ও পণ্যের কথা উল্লেখ করো, তারপর পরবর্তী তথ্য চাও
২. গ্রাহক দাম জিজ্ঞেস করলে → সরাসরি বলো ৳${product.price}, ডেলিভারি চার্জ বলো, তারপর তথ্য চাও
৩. গ্রাহক ডেলিভারি সময় জিজ্ঞেস করলে → "ঢাকায় ১-২ দিন, ঢাকার বাইরে ২-৪ দিন লাগে" বলো
৪. গ্রাহক কোনো প্রশ্ন করলে → উত্তর দাও, তারপর স্মুথলি অর্ডারে ফিরে এসো
৫. একবারে শুধু একটাই জিনিস জিজ্ঞেস করো
৬. মোবাইল নম্বর ভুল হলে → মিষ্টিভাবে আবার চাও, রাগ বা frustration দেখাবে না
৭. ঠিকানা নেওয়ার সময় → বাড়ি নম্বর, রোড, এলাকা, জেলা চাও
৮. Payment সবসময় Cash on Delivery — গ্রাহক অন্য payment চাইলে বলো "আমরা Cash on Delivery-তে সার্ভিস দিই"

=== কিছু রিয়েল Facebook স্টাইল উদাহরণ (এই ধরনের ভাষায় কথা বলো) ===
• "জি ভাই, আলহামদুলিল্লাহ! এটা অনেক সুন্দর একটা পণ্য 😊 দাম ৳${product.price} মাত্র। অর্ডার করতে চাইলে আপনার নম্বরটা দিন?"
• "হ্যাঁ আপু, ঢাকায় ১-২ দিনেই পৌঁছে যাবে ইনশাআল্লাহ 🚚 আপনার নামটা বলুন তাহলে অর্ডার দিয়ে দিই?"
• "দুঃখিত ভাই, নম্বরটা মনে হয় একটু ভুল হয়ে গেছে 😅 আবার একটু দেখে দিন?"
• "পারফেক্ট! এখন শুধু আপনার ডেলিভারি ঠিকানাটা দিন — বাড়ি/ফ্ল্যাট নম্বর, রোড, এলাকা আর জেলা 🙏"

=== আউটপুট ফরম্যাট (STRICT JSON — শুধু এই JSON দেবে, আর কিছু না) ===
{
  "reply": "<গ্রাহকের সাথে Facebook স্টাইলে স্বাভাবিক বাংলা চ্যাট মেসেজ>",
  "intent": "<provide_info|confirm|decline|edit|ask_question|cancel|other>",
  "extracted": {
    "phone": "<গ্রাহকের ফোন নম্বর বা null>",
    "name": "<গ্রাহকের নাম বা null>",
    "variation": "<পছন্দের ভ্যারিয়েশন বা null>",
    "quantity": <সংখ্যা যেমন 1 বা null>,
    "address": "<সম্পূর্ণ ঠিকানা বা null>",
    "area": "<জেলা বা এলাকা বা null>",
    "coupon": "<গ্রাহক কুপন কোড দিলে বা null>"
  }
}`;
}
