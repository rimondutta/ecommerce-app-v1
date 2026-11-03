import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { isRateLimited } from '@/lib/ratelimit';
import { calculateOrderPricing } from '@/lib/pricing';
import crypto from 'crypto';

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

    // Basic email format validation if email is provided
    let normalizedEmail: string | undefined = undefined;
    if (customerEmail && typeof customerEmail === 'string' && customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      normalizedEmail = customerEmail.trim().toLowerCase();
      if (!emailRegex.test(normalizedEmail)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
      }
    }

    await connectToDatabase();

    // ── Authoritative Server-Side Price & Inventory Verification ──
    let pricing;
    try {
      pricing = await calculateOrderPricing({
        items,
        shippingZone,
        couponCode,
      });
    } catch (pricingError: any) {
      return NextResponse.json(
        { error: pricingError.message || 'Product pricing verification failed.' },
        { status: 400 }
      );
    }

    // Generate cryptographically secure access token for guest invoice verification
    const rawGuestAccessToken = crypto.randomBytes(32).toString('hex');
    const guestAccessTokenHash = crypto.createHash('sha256').update(rawGuestAccessToken).digest('hex');

    // Create the order using verified server calculations ONLY
    const orderData: any = {
      customerName: String(customerName || '').trim(),
      items: pricing.items,
      subtotal: pricing.subtotal,
      shippingCost: pricing.shippingCost,
      discountAmount: pricing.discountAmount,
      couponCode: pricing.couponCode,
      totalAmount: pricing.totalAmount,
      shippingZone: pricing.shippingZone,
      notes: notes ? String(notes).trim().slice(0, 500) : undefined,
      shippingAddress: {
        name: String(shippingAddress?.name || customerName || '').trim(),
        email: normalizedEmail,
        phone: String(shippingAddress?.phone || '').trim(),
        addressLine1: String(shippingAddress?.addressLine1 || '').trim(),
        city: String(shippingAddress?.city || '').trim(),
        postcode: String(shippingAddress?.postcode || '').trim(),
        country: 'Bangladesh',
      },
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      guestAccessToken: rawGuestAccessToken,
      guestAccessTokenHash,
    };

    if (normalizedEmail) {
      orderData.customerEmail = normalizedEmail;
    }

    const order = await Order.create(orderData);

    // If a valid coupon was applied, increment its used count atomically
    if (pricing.couponCode) {
      await Coupon.updateOne(
        { code: pricing.couponCode },
        { $inc: { usedCount: 1 } }
      ).catch((err: any) => console.error('Failed to increment coupon usedCount:', err));
    }

    // ── Atomic Inventory Decrement ──
    const inventoryOps = pricing.items.map((item) => {
      if (item.variantId) {
        return {
          updateOne: {
            filter: { _id: item.product, 'variants._id': item.variantId },
            update: { $inc: { 'variants.$.stock': -item.quantity } },
          },
        };
      } else {
        return {
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { inventory: -item.quantity } },
          },
        };
      }
    });

    if (inventoryOps.length > 0) {
      await Product.bulkWrite(inventoryOps).catch((err: any) =>
        console.error('Failed to update inventory via bulkWrite:', err)
      );
    }

    // ── Background Tasks (Invoice, Email, Telegram, Google Sheets) ──
    const notificationPayload = {
      orderId: order._id.toString(),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalAmount: pricing.totalAmount,
      items: pricing.items.map((i) => ({
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      shippingCost: pricing.shippingCost,
    };

    await Promise.allSettled([
      import('@/lib/invoice/generateInvoicePdf').then(({ generateInvoiceForOrder }) =>
        generateInvoiceForOrder(order._id.toString())
      ),
      normalizedEmail
        ? import('@/lib/nodemailer').then(({ sendOrderConfirmationEmail }) =>
            sendOrderConfirmationEmail(notificationPayload)
          )
        : Promise.resolve(),
      import('@/lib/telegram').then(({ sendTelegramNotification }) =>
        sendTelegramNotification(notificationPayload)
      ),
      import('@/lib/googleSheets').then(({ appendOrderToSheet }) =>
        appendOrderToSheet({
          orderId: order._id.toString(),
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          phone: order.shippingAddress?.phone,
          addressLine1: order.shippingAddress?.addressLine1,
          city: order.shippingAddress?.city,
          paymentMethod: order.paymentMethod,
          items: pricing.items.map((i) => ({
            title: i.title,
            quantity: i.quantity,
            price: i.price,
          })),
          shippingCost: pricing.shippingCost,
          totalAmount: pricing.totalAmount,
          fulfillmentStatus: 'unfulfilled',
        })
      ),
    ]).catch((err) => console.error('Background tasks error:', err));

    return NextResponse.json({
      success: true,
      orderId: order._id,
      guestAccessToken: rawGuestAccessToken,
      totalAmount: pricing.totalAmount,
      message: 'Order created successfully',
    });
  } catch (error: any) {
    console.error('Order Creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}
