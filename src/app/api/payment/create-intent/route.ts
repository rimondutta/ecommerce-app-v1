import { NextResponse, NextRequest } from 'next/server';
import { calculateOrderPricing } from '@/lib/pricing';
import { getCorsHeaders } from '@/lib/cors';
import { logger } from '@/lib/logger';
import Order from '@/models/Order';
import connectToDatabase from '@/lib/db';

// ─────────────────────────────────────────────────────────────
// POST /api/payment/create-intent
// Creates a Stripe PaymentIntent for the checkout flow.
// Auth: Bearer JWT optional (guests can checkout too)
// Body: { cartItems: CartItem[], orderId?: string, shippingAddress: { ... }, shippingZone?: string, couponCode?: string }
// Response: { clientSecret: string, totalAmount: number, paymentIntentId: string }
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const cors = getCorsHeaders(req);

  try {
    const body = await req.json();
    const { cartItems, items: rawItems, orderId, shippingAddress, shippingZone, couponCode } = body;

    let targetTotalAmount: number;
    let metadata: Record<string, string> = {
      orderId: orderId || '',
      shippingCity: shippingAddress?.city ?? '',
    };

    if (orderId) {
      // If an existing order is provided, fetch its authoritative amount from the database
      await connectToDatabase();
      const order = await Order.findById(orderId);
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Referenced order not found' },
          { status: 404, headers: cors }
        );
      }
      targetTotalAmount = order.totalAmount;
      metadata.itemCount = (order.items?.length || 0).toString();
      metadata.subtotal = (order.subtotal || 0).toString();
      metadata.orderId = order._id.toString();
    } else {
      const sourceItems = cartItems || rawItems;
      if (!sourceItems || !Array.isArray(sourceItems) || sourceItems.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Cart is empty' },
          { status: 400, headers: cors }
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
          { status: 400, headers: cors }
        );
      }

      targetTotalAmount = pricing.totalAmount;
      metadata = {
        itemCount: pricing.items.length.toString(),
        subtotal: pricing.subtotal.toString(),
        shippingCost: pricing.shippingCost.toString(),
        discountAmount: pricing.discountAmount.toString(),
        couponCode: pricing.couponCode || '',
        shippingCity: shippingAddress?.city ?? '',
      };
    }

    // Stripe amount in smallest currency unit (cents).
    const totalCents = Math.round(targetTotalAmount * 100);

    if (totalCents < 50) {
      return NextResponse.json(
        { success: false, error: 'Order total must be at least ৳0.50 to process payment' },
        { status: 400, headers: cors }
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      logger.error('STRIPE_SECRET_KEY not configured on server');
      return NextResponse.json(
        { success: false, error: 'Payment gateway is not currently configured.' },
        { status: 500, headers: cors }
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
        metadata,
      },
      idempotencyKey ? { idempotencyKey } : undefined
    );

    // If orderId was provided, link the payment intent id to the order
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        stripePaymentIntentId: paymentIntent.id,
      }).catch((e) => logger.warn('Failed to link paymentIntentId to order', { orderId, error: e }));
    }

    logger.info('Stripe PaymentIntent created', {
      paymentIntentId: paymentIntent.id,
      amountCents: totalCents,
      orderId,
    });

    return NextResponse.json(
      {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        totalAmount: targetTotalAmount,
      },
      { headers: cors }
    );
  } catch (error: unknown) {
    logger.error('Payment intent creation failed', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Payment initialization failed' },
      { status: 500, headers: cors }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}
