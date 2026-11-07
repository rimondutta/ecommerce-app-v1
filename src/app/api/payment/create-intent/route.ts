import { NextResponse } from 'next/server';
import { } from '@/lib/mobile-auth';
import { NextRequest } from 'next/server';
import { calculateOrderPricing } from '@/lib/pricing';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key',
};

// ─────────────────────────────────────────────────────────────
// POST /api/payment/create-intent
// Creates a Stripe PaymentIntent for the checkout flow.
// Auth: Bearer JWT optional (guests can checkout too)
// Body: { cartItems: CartItem[], shippingAddress: { ... }, shippingZone?: string, couponCode?: string }
// Response: { clientSecret: string, totalAmount: number }
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartItems, items: rawItems, shippingAddress, shippingZone, couponCode } = body;

    const sourceItems = cartItems || rawItems;
    if (!sourceItems || !Array.isArray(sourceItems) || sourceItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Normalize item format for authoritative pricing verification
    const normalizedItems = sourceItems.map((item: { productId?: string; product?: { _id?: string; id?: string }; id?: string; variantId?: string; variant?: { _id?: string }; quantity?: number | string; variantOptions?: Record<string, string> }) => ({
      productId: item.productId || item.product?._id || item.product?.id || item.id,
      variantId: item.variantId || item.variant?._id,
      quantity: Number(item.quantity) || 1,
      variantOptions: item.variantOptions,
    }));

    // Authoritative Server-Side Pricing Verification
    let pricing;
    try {
      pricing = await calculateOrderPricing({
        items: normalizedItems,
        shippingZone,
        couponCode,
      });
    } catch (pricingError: unknown) {
      return NextResponse.json(
        { success: false, error: pricingError instanceof Error ? pricingError.message : 'Pricing verification failed' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Stripe amount in smallest currency unit (cents).
    // Avoid floating-point imprecision using integer arithmetic.
    const totalCents = Math.round(pricing.totalAmount * 100);

    if (totalCents < 50) {
      return NextResponse.json(
        { success: false, error: 'Order total must be at least ৳0.50 to process payment' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error('[payment/create-intent] STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Payment gateway is not currently configured.' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    // Dynamic import to optimize serverless cold starts
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-10-28.endive' });

    const idempotencyKey = req.headers.get('idempotency-key') || undefined;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totalCents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          itemCount: pricing.items.length.toString(),
          subtotal: pricing.subtotal.toString(),
          shippingCost: pricing.shippingCost.toString(),
          discountAmount: pricing.discountAmount.toString(),
          couponCode: pricing.couponCode || '',
          shippingCity: shippingAddress?.city ?? '',
        },
      },
      idempotencyKey ? { idempotencyKey } : undefined
    );

    return NextResponse.json(
      {
        success: true,
        clientSecret: paymentIntent.client_secret,
        totalAmount: pricing.totalAmount,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: unknown) {
    console.error('[POST /api/payment/create-intent]', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? (error as Error).message : String(error) ?? 'Payment initialization failed' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}
