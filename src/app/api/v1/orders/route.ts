import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { isRateLimited } from '@/lib/ratelimit';

const OrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  title: z.string().min(1),
  image: z.string().optional(),
});

const OrderSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address").optional(),
  items: z.array(OrderItemSchema).min(1, "At least one item is required"),
  totalAmount: z.number().min(0),
  shippingCost: z.number().min(0).default(0),
  shippingZone: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cod', 'bkash', 'card']).default('cod'),
  shippingAddress: z.object({
    addressLine1: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    postcode: z.string().default(""),
    country: z.string().default("Bangladesh"),
    phone: z.string().min(1, "Phone is required"),
  }),
});

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    
    if (await isRateLimited(ip)) {
      return NextResponse.json(
        { data: null, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = OrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const orderData = parsed.data;

    await connectToDatabase();

    const orderDoc = {
      customerName: orderData.customerName.trim(),
      customerEmail: orderData.customerEmail?.toLowerCase().trim(),
      items: orderData.items.map(item => ({
        product: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
        image: item.image,
      })),
      totalAmount: orderData.totalAmount,
      shippingCost: orderData.shippingCost,
      shippingZone: orderData.shippingZone,
      notes: orderData.notes,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
    };

    const order = await Order.create(orderDoc);

    // Background tasks (Invoice, Email, Telegram) - Fire and forget
    Promise.allSettled([
      import('@/lib/invoice/generateInvoicePdf').then(({ generateInvoiceForOrder }) => generateInvoiceForOrder(order._id.toString())),
      orderData.customerEmail ? import('@/lib/nodemailer').then(({ sendOrderConfirmationEmail }) => sendOrderConfirmationEmail({
        orderId: order._id.toString(),
        ...orderData,
        customerEmail: orderData.customerEmail || ''
      })) : Promise.resolve(),
      import('@/lib/telegram').then(({ sendTelegramNotification }) => sendTelegramNotification({
        orderId: order._id.toString(),
        ...orderData,
        customerEmail: orderData.customerEmail || ''
      }))
    ]).catch(err => console.error('Background tasks error:', err));

    // Inventory Bulk Write
    const inventoryOps = orderData.items.map(item => {
      if (item.variantId) {
        return {
          updateOne: {
            filter: { _id: item.productId, 'variants._id': item.variantId },
            update: { $inc: { 'variants.$.stock': -item.quantity } },
          },
        };
      } else {
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

    return NextResponse.json({ 
      data: { orderId: order._id, message: 'Order created successfully' },
      error: null
    });
  } catch (err: any) {
    console.error('Order Creation error:', err);
    return NextResponse.json(
      { data: null, error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}
