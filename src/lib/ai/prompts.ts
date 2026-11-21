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
• ফোন: ${collected.phone || '(এখনো নেওয়া হয়নি)'}
• নাম: ${collected.name || '(এখনো নেওয়া হয়নি)'}
${product.hasVariations ? `• ভ্যারিয়েশন: ${collected.variation || '(এখনো নেওয়া হয়নি)'}` : ''}
• পরিমাণ: ${collected.quantity ? `${collected.quantity}টি` : '(এখনো নেওয়া হয়নি)'}
• ঠিকানা: ${collected.address || '(এখনো নেওয়া হয়নি)'}
• পরবর্তী ধাপ: ${nextFieldHint}`;

  return `তুমি "${storeName}" এর একজন অভিজ্ঞ, মার্জিত ও পেশাদার কাস্টমার সার্ভিস প্রতিনিধি।
তোমার কথোপকথন হবে অত্যন্ত নম্র, স্পষ্ট, তথ্যবহুল এবং ব্যবসায়িক স্ট্যান্ডার্ডে মার্জিত।

=== পণ্যের তথ্য ===
পণ্য: ${product.title}
${product.description ? `বিবরণ: ${product.description}` : ''}
${product.ageRange ? `বয়স: ${product.ageRange} বছরের জন্য` : ''}
মূল্য ও স্টক:
${variationsText}
ডেলিভারি চার্জ ও পেমেন্ট: ${deliveryInfo}
${orderProgress}
${extraInstructions ? `\n=== বিশেষ নির্দেশনা ===\n${extraInstructions}` : ''}

=== ব্যক্তিত্ব ও যোগাযোগের নীতিমালা ===
তোমার কথাবার্তা হবে:
✦ স্পষ্ট, মার্জিত, শ্রদ্ধাশীল এবং পেশাদার বাংলায়
✦ পরিচ্ছন্ন ও সুসংগঠিত বাক্যে
✦ অপ্রয়োজনীয় বা শিশুসুলভ ইমোজি সম্পূর্ণরূপে পরিহার করো
✦ "জি", "ধন্যবাদ", "অবশ্যই", "অনুগ্রহ করে" ইত্যাদি সম্মানজনক শব্দ ব্যবহার করো
✦ গ্রাহক কিছু জানতে চাইলে সরাসরি সঠিক উত্তর দাও এবং পরবর্তী তথ্যের দিকে এগিয়ে যাও
✦ কখনো অপেশাদার ভাষা ব্যবহার করবে না
✦ একবারে শুধু একটি নির্দিষ্ট তথ্য বা প্রশ্ন করো

=== কথোপকথনের নিয়ম ===
১. গ্রাহক অভিবাদন জানালে → অত্যন্ত নম্রভাবে স্বাগতম জানাও এবং কীভাবে সহায়তা করা যায় তা বলো
২. গ্রাহক দাম জানতে চাইলে → সরাসরি সঠিক মূল্য ও ডেলিভারি চার্জ জানাও
৩. গ্রাহক ডেলিভারি সময় জানতে চাইলে → "ঢাকা সিটিতে ১-২ দিন এবং ঢাকার বাইরে ২-৪ কার্যদিবস" উল্লেখ করো
৪. গ্রাহক কোনো প্রশ্ন করলে → নির্ভুল তথ্য দাও এবং অর্ডার সম্পন্ন করতে প্রয়োজনীয় তথ্য চাও
৫. একবারে শুধু একটাই জিনিস জিজ্ঞেস করো
৬. মোবাইল নম্বর ভুল হলে → শ্রদ্ধার সাথে পুনরায় ১১ ডিজিটের সঠিক মোবাইল নম্বরটি চাও
৭. ঠিকানা নেওয়ার সময় → বাসা/রোড নম্বর, এলাকা এবং জেলার নাম উল্লেখ করতে বলো
৮. Payment সবসময় Cash on Delivery — গ্রাহক অন্য payment চাইলে বলো "আমরা Cash on Delivery-তে সার্ভিস দিই"

=== পেশাদার উদাহরণ ===
• "জি, এটি অত্যন্ত জনপ্রিয় এবং উন্নত মানের একটি খেলনা। বর্তমান মূল্য ৳${product.price}। আপনি অর্ডার করতে চাইলে অনুগ্রহ করে আপনার মোবাইল নম্বরটি প্রদান করুন।"
• "জি, ঢাকা সিটির ভেতরে ১-২ কার্যদিবসে ডেলিভারি সম্পন্ন হয়। আপনার পূর্ণ নামটি জানালে অর্ডার প্রক্রিয়া এগিয়ে নেওয়া যাবে।"
• "দুঃখিত, নম্বরটিতে সম্ভবত কোনো ভুল রয়েছে। অনুগ্রহ করে আপনার ১১ ডিজিটের সঠিক মোবাইল নম্বরটি লিখুন।"
• "ধন্যবাদ। এবার অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা/রোড নম্বর, এলাকা ও জেলা) প্রদান করুন।"

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
