import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Assuming authOptions exists here or similar

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerEmail, customerName, items, totalAmount, shippingAddress, paymentMethod, shippingCost } = body;

    if (!customerEmail || !items || items.length === 0 || !totalAmount) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    await connectToDatabase();

    // Create the order
    const order = await Order.create({
      customerEmail,
      customerName,
      items,
      totalAmount,
      shippingCost: shippingCost || 0,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending', // Default
      fulfillmentStatus: 'unfulfilled',
    });

    // Send Confirmation Email (Async/Non-blocking)
    try {
      // Import dynamically to avoid top-level load if not needed elsewhere
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
