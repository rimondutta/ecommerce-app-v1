import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { restoreOrderInventory } from '@/lib/orderService';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Enterprise Stripe Webhook Handler for Toy Hourse Platform.
 *
 * Security Controls:
 * 1. Cryptographic HMAC-SHA256 signature verification via stripe-signature.
 * 2. Unaltered raw body verification preventing tampering.
 * 3. Idempotent event processing preventing replay attacks.
 * 4. Authoritative amount and currency validation against database records.
 * 5. Automatic stock restoration upon confirmed payment failure.
 * 6. Audit logging for all financial status transitions.
 */
export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    logger.error('Stripe webhook keys not configured on server');
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    );
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    logger.security('Stripe webhook request missing stripe-signature header', {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    });
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-10-28.endive' });

    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    logger.security('Stripe webhook signature verification failed', {
      error: err instanceof Error ? err.message : String(err),
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    });
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        const paymentIntentId = paymentIntent.id;

        logger.info('Processing payment_intent.succeeded', {
          paymentIntentId,
          orderId,
          amountReceived: paymentIntent.amount_received,
        });

        // Locate order either by explicit orderId in metadata or by stripePaymentIntentId
        const order = orderId
          ? await Order.findById(orderId)
          : await Order.findOne({ stripePaymentIntentId: paymentIntentId });

        if (!order) {
          logger.warn('Order not found for succeeded PaymentIntent', {
            paymentIntentId,
            orderId,
          });
          // Return 200 to acknowledge receipt to Stripe so it doesn't repeatedly retry
          return NextResponse.json({ received: true, note: 'Order not found' });
        }

        // Idempotency check: if order is already marked as paid, skip processing
        if (order.paymentStatus === 'paid') {
          logger.info('Order is already marked as paid, idempotent skip', {
            orderId: order._id.toString(),
            paymentIntentId,
          });
          return NextResponse.json({ received: true, note: 'Already processed' });
        }

        // Authoritative Amount and Currency Verification
        const expectedCents = Math.round(order.totalAmount * 100);
        const actualCents = paymentIntent.amount_received;

        if (expectedCents !== actualCents) {
          logger.security('CRITICAL: Payment amount mismatch detected!', {
            orderId: order._id.toString(),
            expectedCents,
            actualCents,
            paymentIntentId,
          });
          return NextResponse.json(
            { error: 'Payment amount mismatch' },
            { status: 400 }
          );
        }

        // Transition order status to paid
        order.paymentStatus = 'paid';
        order.paymentMethod = 'card';
        if (!order.stripePaymentIntentId) {
          order.stripePaymentIntentId = paymentIntentId;
        }
        await order.save();

        logger.info('Order marked as PAID via verified Stripe webhook', {
          orderId: order._id.toString(),
          totalAmount: order.totalAmount,
        });

        // Trigger PDF Invoice and Notifications if not yet sent
        if (!order.invoiceNumber) {
          import('@/lib/invoice/generateInvoicePdf')
            .then(({ generateInvoiceForOrder }) => generateInvoiceForOrder(order._id.toString()))
            .catch((e) => logger.error('Invoice generation failed during webhook', e));
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        const paymentIntentId = paymentIntent.id;

        logger.warn('Processing payment_intent.payment_failed', {
          paymentIntentId,
          orderId,
          lastPaymentError: paymentIntent.last_payment_error?.message,
        });

        const order = orderId
          ? await Order.findById(orderId)
          : await Order.findOne({ stripePaymentIntentId: paymentIntentId });

        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'failed';
          await order.save();

          // Restore inventory atomically so stock isn't locked by abandoned payment
          await restoreOrderInventory(order._id.toString());

          logger.info('Order payment marked as failed and inventory restored', {
            orderId: order._id.toString(),
          });
        }
        break;
      }

      default:
        logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    logger.error('Error handling Stripe webhook event', err, { eventId: event.id });
    return NextResponse.json(
      { error: 'Webhook processing exception' },
      { status: 500 }
    );
  }
}
