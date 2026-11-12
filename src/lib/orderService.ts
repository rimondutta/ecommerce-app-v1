import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { calculateOrderPricing, CheckoutInputItem } from '@/lib/pricing';
import crypto from 'crypto';

export interface CreateOrderParams {
  customerName: string;
  customerEmail?: string;
  items: CheckoutInputItem[];
  shippingAddress: {
    name?: string;
    email?: string;
    phone: string;
    addressLine1: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
  paymentMethod?: 'cod' | 'bkash' | 'card';
  shippingZone?: 'inside_dhaka' | 'outside_dhaka' | string;
  notes?: string;
  couponCode?: string;
  source?: 'web' | 'ai_agent' | 'mobile';
}

export interface CreateOrderResult {
  orderId: string;
  guestAccessToken: string;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  items: Array<{
    product: string;
    title: string;
    price: number;
    quantity: number;
    variantId?: string;
    image?: string;
  }>;
}

/**
 * Shared, authoritative order creation service.
 * Used by web checkout, API endpoints, and the AI Order Agent.
 *
 * Ensures:
 * 1. Authoritative server pricing and inventory validation
 * 2. Order persistence with guest access token and source tag
 * 3. Atomic stock decrements via bulkWrite
 * 4. Coupon usage increments
 * 5. Full side effects: PDF Invoice generation, Email alert, Telegram alert, Google Sheets logging
 */
export async function createStoreOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const {
    customerName,
    customerEmail,
    items,
    shippingAddress,
    paymentMethod = 'cod',
    shippingZone,
    notes,
    couponCode,
    source = 'web',
  } = params;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Missing required order details: items list is empty.');
  }

  // Basic email normalization
  let normalizedEmail: string | undefined = undefined;
  if (customerEmail && typeof customerEmail === 'string' && customerEmail.trim()) {
    normalizedEmail = customerEmail.trim().toLowerCase();
  }

  await connectToDatabase();

  // ── Authoritative Server-Side Price & Inventory Verification ──
  const pricing = await calculateOrderPricing({
    items,
    shippingZone,
    couponCode,
  });

  // Generate cryptographically secure access token for guest invoice verification
  const rawGuestAccessToken = crypto.randomBytes(32).toString('hex');
  const guestAccessTokenHash = crypto.createHash('sha256').update(rawGuestAccessToken).digest('hex');

  // Create order doc using server-verified values
  const orderData: Record<string, unknown> = {
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
      city: String(shippingAddress?.city || 'Dhaka').trim(),
      postcode: String(shippingAddress?.postcode || '').trim(),
      country: shippingAddress?.country || 'Bangladesh',
    },
    paymentMethod,
    paymentStatus: 'pending',
    fulfillmentStatus: 'unfulfilled',
    guestAccessToken: rawGuestAccessToken,
    guestAccessTokenHash,
    source,
  };

  if (normalizedEmail) {
    orderData.customerEmail = normalizedEmail;
  }

  const order = await Order.create(orderData);

  // Atomically increment coupon count if applicable
  if (pricing.couponCode) {
    await Coupon.updateOne(
      { code: pricing.couponCode },
      { $inc: { usedCount: 1 } }
    ).catch((err: unknown) => console.error('Failed to increment coupon usedCount:', err));
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
    await Product.bulkWrite(inventoryOps).catch((err: unknown) =>
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

  return {
    orderId: order._id.toString(),
    guestAccessToken: rawGuestAccessToken,
    totalAmount: pricing.totalAmount,
    subtotal: pricing.subtotal,
    shippingCost: pricing.shippingCost,
    discountAmount: pricing.discountAmount,
    items: pricing.items.map((item) => ({
      product: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      variantId: item.variantId ? item.variantId.toString() : undefined,
      image: item.image,
    })),
  };
}

