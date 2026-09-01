import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

import { isRateLimited } from '@/lib/ratelimit';


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
    const { customerEmail, customerName, items, totalAmount, shippingAddress, paymentMethod, shippingCost, shippingZone, notes } = body;

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
      shippingZone,
      notes,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
    };
    if (customerEmail) {
      orderData.customerEmail = String(customerEmail).toLowerCase().trim();
    }
    const order = await Order.create(orderData);

    // ── Fire-and-forget invoice generation ──
    // Runs async; never blocks the checkout response.
    // If it fails, the order still succeeds — admin can regenerate later.
    import('@/lib/invoice/generateInvoicePdf')
      .then(({ generateInvoiceForOrder }) =>
        generateInvoiceForOrder(order._id.toString())
      )
      .catch((err) =>
        console.error('[invoice] generation failed for order', order._id, err)
      );

    // Performance: Replace N sequential inventory writes with a single bulkWrite.
    // Before: for (item of items) { await findByIdAndUpdate() } — N serial DB round-trips.
    // After: one bulkWrite — 1 DB round-trip regardless of cart size.
    const inventoryOps = items
      .filter((item: any) => item.productId)
      .map((item: any) => {
        if (item.variantId) {
          // Decrement specific variant's stock
          return {
            updateOne: {
              filter: { _id: item.productId, 'variants._id': item.variantId },
              update: { $inc: { 'variants.$.stock': -item.quantity } },
            },
          };
        } else {
          // Decrement legacy product inventory
          return {
            updateOne: {
              filter: { _id: item.productId },
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

    // Google Sheets: Auto-save customer order details (Non-blocking)
    try {
      const { appendOrderToSheet } = await import('@/lib/googleSheets');
      appendOrderToSheet({
        orderId: order._id.toString(),
        customerName,
        customerEmail,
        phone: shippingAddress?.phone,
        addressLine1: shippingAddress?.addressLine1,
        city: shippingAddress?.city,
        paymentMethod: paymentMethod || 'cod',
        items: (items || []).map((i: any) => ({ title: i.title || '', quantity: i.quantity || 1, price: i.price || 0 })),
        shippingCost: shippingCost || 0,
        totalAmount,
        fulfillmentStatus: 'unfulfilled',
      }).catch(err => console.error('[GoogleSheets] background error:', err));
    } catch (sheetsErr) {
      console.error('[GoogleSheets] Failed to initiate:', sheetsErr);
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
