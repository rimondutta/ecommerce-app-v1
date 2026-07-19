import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

// ── Simple in-memory rate limiter (per-IP, per-minute) ──
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;     // max 5 orders per minute per IP
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// Periodically clean up stale entries (prevent memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimit) {
    if (now > entry.resetAt) rateLimit.delete(ip);
  }
}, 60_000);

export async function POST(req: Request) {
  try {
    // ── Rate Limiting ──
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { customerEmail, customerName, items, totalAmount, shippingAddress, paymentMethod, shippingCost } = body;

    if (!items || items.length === 0 || !totalAmount) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    // Basic email format validation if email is provided
    if (customerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
      }
    }

    await connectToDatabase();

    // Create the order
    const orderData: any = {
      customerName: String(customerName || '').trim(),
      items,
      totalAmount,
      shippingCost: shippingCost || 0,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
    };
    if (customerEmail) {
      orderData.customerEmail = String(customerEmail).toLowerCase().trim();
    }
    const order = await Order.create(orderData);

    // Reduce inventory for each item
    for (const item of items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { inventory: -item.quantity }
        }).catch(err => console.error(`Failed to update inventory for product ${item.productId}:`, err));
      }
    }

    // Send Confirmation Email (Async/Non-blocking)
    if (customerEmail) {
      try {
        const { sendOrderConfirmationEmail } = await import('@/lib/nodemailer');
        sendOrderConfirmationEmail({
          orderId: order._id.toString(),
          customerName,
          customerEmail,
          items,
          totalAmount,
          shippingAddress,
          paymentMethod: paymentMethod || 'cod',
          shippingCost: shippingCost || 0
        }).catch(err => console.error('Email background task error:', err));
      } catch (emailErr) {
        console.error('Failed to initiate email process:', emailErr);
      }
    }

    // High Traffic Scaling: Telegram Admin Notification (Non-blocking)
    try {
      const { sendTelegramNotification } = await import('@/lib/telegram');
      sendTelegramNotification({
        orderId: order._id.toString(),
        customerName,
        customerEmail,
        totalAmount,
        items,
        shippingAddress,
        paymentMethod: paymentMethod || 'cod'
      }).catch(err => console.error('Telegram notification background error:', err));
    } catch (telegramErr) {
      console.error('Failed to initiate Telegram notification:', telegramErr);
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order._id,
      message: 'Order created successfully' 
    });
  } catch (error: any) {
    console.error('Order Creation error:', error);
    // Don't leak internal error details in production
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}
