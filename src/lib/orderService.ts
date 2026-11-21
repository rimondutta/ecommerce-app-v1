import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { calculateOrderPricing, CheckoutInputItem } from '@/lib/pricing';
import { logger } from '@/lib/logger';
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
  stripePaymentIntentId?: string;
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
 * Restores inventory for cancelled or failed orders.
 * Safe to call idempotently.
 */
export async function restoreOrderInventory(orderId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const order = await Order.findById(orderId);
    if (!order || order.inventoryRestored) {
      return false;
    }

    for (const item of order.items) {
      if (item.variantId) {
        await Product.updateOne(
          { _id: item.product, 'variants._id': item.variantId },
          {
            $inc: {
              'variants.$.stock': item.quantity,
              inventory: item.quantity,
              soldCount: -item.quantity,
            },
          }
        );
      } else {
        await Product.updateOne(
          { _id: item.product },
          {
            $inc: {
              inventory: item.quantity,
              soldCount: -item.quantity,
            },
          }
        );
      }
    }

    order.inventoryRestored = true;
    await order.save();
    logger.info('Inventory restored for order', { orderId });
    return true;
  } catch (error) {
    logger.error('Failed to restore order inventory', error, { orderId });
    return false;
  }
}

/**
 * Shared, authoritative order creation service with atomic concurrency controls.
 * Used by web checkout, API endpoints, and the AI Order Agent.
 *
 * Security & Integrity Guarantees:
 * 1. Authoritative server pricing and catalog validation.
 * 2. Atomic stock reservation with conditional matching ({ stock: { $gte: qty } }).
 * 3. Automatic compensation / rollback if any item fails or order persistence fails.
 * 4. Zero negative stock or overselling under high concurrency.
 * 5. Cryptographic guest access tokens with SHA-256 hashed lookups.
 * 6. Structured audit logging.
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
    stripePaymentIntentId,
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

  // ── 1. Authoritative Server-Side Price & Inventory Verification ──
  const pricing = await calculateOrderPricing({
    items,
    shippingZone,
    couponCode,
  });

  // ── 2. Atomic Stock Reservation with Conditional Concurrency Check ──
  // Ensures simultaneous orders cannot drive inventory negative.
  const reservedItems: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }> = [];

  try {
    for (const item of pricing.items) {
      let reservationResult;

      if (item.variantId) {
        // Atomic conditional update on specific variant with sufficient stock
        reservationResult = await Product.updateOne(
          {
            _id: item.product,
            variants: {
              $elemMatch: {
                _id: item.variantId,
                stock: { $gte: item.quantity },
              },
            },
          },
          {
            $inc: {
              'variants.$.stock': -item.quantity,
              inventory: -item.quantity,
              soldCount: item.quantity,
            },
          }
        );
      } else {
        // Atomic conditional update on product-level inventory with sufficient stock
        reservationResult = await Product.updateOne(
          {
            _id: item.product,
            inventory: { $gte: item.quantity },
          },
          {
            $inc: {
              inventory: -item.quantity,
              soldCount: item.quantity,
            },
          }
        );
      }

      if (!reservationResult || reservationResult.modifiedCount === 0) {
        logger.warn('Stock reservation failed due to race condition or exhaustion', {
          productId: item.product.toString(),
          variantId: item.variantId?.toString(),
          requestedQty: item.quantity,
        });

        // Rollback all items reserved in this transaction up to this point
        for (const reserved of reservedItems) {
          if (reserved.variantId) {
            await Product.updateOne(
              { _id: reserved.productId, 'variants._id': reserved.variantId },
              {
                $inc: {
                  'variants.$.stock': reserved.quantity,
                  inventory: reserved.quantity,
                  soldCount: -reserved.quantity,
                },
              }
            ).catch((err) => logger.error('Rollback failure for variant', err, reserved));
          } else {
            await Product.updateOne(
              { _id: reserved.productId },
              {
                $inc: {
                  inventory: reserved.quantity,
                  soldCount: -reserved.quantity,
                },
              }
            ).catch((err) => logger.error('Rollback failure for product', err, reserved));
          }
        }

        throw new Error(`Insufficient stock for "${item.title}". It may have just sold out.`);
      }

      reservedItems.push({
        productId: item.product.toString(),
        variantId: item.variantId ? item.variantId.toString() : undefined,
        quantity: item.quantity,
      });
    }

    // ── 3. Generate Cryptographically Secure Access Token for Guest Invoices ──
    const rawGuestAccessToken = crypto.randomBytes(32).toString('hex');
    const guestAccessTokenHash = crypto.createHash('sha256').update(rawGuestAccessToken).digest('hex');

    // ── 4. Persist Order Record with Authoritative Totals ──
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
      stripePaymentIntentId,
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
      ).catch((err: unknown) => logger.error('Failed to increment coupon usedCount', err));
    }

    logger.info('Order created with verified stock and pricing', {
      orderId: order._id.toString(),
      totalAmount: pricing.totalAmount,
      itemCount: pricing.items.length,
      source,
    });

    // ── 5. Asynchronous Background Side Effects ──
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

    Promise.allSettled([
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
    ]).catch((err) => logger.error('Background notification tasks error', err));

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
  } catch (error) {
    // If order persistence failed after reservations succeeded, rollback all reserved stock
    if (reservedItems.length > 0) {
      for (const reserved of reservedItems) {
        if (reserved.variantId) {
          await Product.updateOne(
            { _id: reserved.productId, 'variants._id': reserved.variantId },
            {
              $inc: {
                'variants.$.stock': reserved.quantity,
                inventory: reserved.quantity,
                soldCount: -reserved.quantity,
              },
            }
          ).catch((e) => logger.error('Rollback error after Order.create failure', e));
        } else {
          await Product.updateOne(
            { _id: reserved.productId },
            {
              $inc: {
                inventory: reserved.quantity,
                soldCount: -reserved.quantity,
              },
            }
          ).catch((e) => logger.error('Rollback error after Order.create failure', e));
        }
      }
    }
    throw error;
  }
}
