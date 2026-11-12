import { NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/ratelimit';
import { createStoreOrder } from '@/lib/orderService';

export async function POST(req: Request) {
  try {
    // ── Distributed Rate Limiting ──
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    
    // Uses Upstash Redis (or bypasses if local config missing)
    const rateLimited = await isRateLimited(ip);
    if (rateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      customerEmail,
      customerName,
      items,
      shippingAddress,
      paymentMethod,
      shippingZone,
      notes,
      couponCode,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required order details: items list is empty.' },
        { status: 400 }
      );
    }

    // Basic email format validation if email is provided (linear non-backtracking check to prevent ReDoS)
    let normalizedEmail: string | undefined = undefined;
    if (customerEmail && typeof customerEmail === 'string' && customerEmail.trim()) {
      normalizedEmail = customerEmail.trim().toLowerCase();
      const atIdx = normalizedEmail.indexOf('@');
      const lastDotIdx = normalizedEmail.lastIndexOf('.');
      if (
        normalizedEmail.length > 254 ||
        atIdx <= 0 ||
        lastDotIdx <= atIdx + 1 ||
        lastDotIdx >= normalizedEmail.length - 1 ||
        normalizedEmail.includes(' ')
      ) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
      }
    }

    try {
      const result = await createStoreOrder({
        customerName: String(customerName || '').trim(),
        customerEmail: normalizedEmail,
        items,
        shippingAddress: {
          name: shippingAddress?.name,
          email: normalizedEmail,
          phone: shippingAddress?.phone,
          addressLine1: shippingAddress?.addressLine1,
          city: shippingAddress?.city,
          postcode: shippingAddress?.postcode,
          country: shippingAddress?.country,
        },
        paymentMethod,
        shippingZone,
        notes,
        couponCode,
        source: 'web',
      });

      return NextResponse.json({
        success: true,
        orderId: result.orderId,
        guestAccessToken: result.guestAccessToken,
        totalAmount: result.totalAmount,
        message: 'Order created successfully',
      });
    } catch (orderError: unknown) {
      const msg = orderError instanceof Error ? orderError.message : 'Product pricing verification failed.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Order Creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}
