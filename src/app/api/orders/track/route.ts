import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getCourierTrackingUrl, getTrackingSteps } from '@/lib/courier';


interface TrackProduct {
  _id?: { toString(): string } | string;
  title?: string;
  image?: string;
  images?: Array<string | { url: string }>;
}

interface TrackOrderItem {
  product?: string | TrackProduct;
  title?: string;
  quantity?: number;
  price?: number;
}

interface TrackOrderDoc {
  _id: { toString(): string };
  invoiceNumber?: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: { phone?: string; [key: string]: unknown };
  totalAmount?: number;
  shippingCost?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  fulfillmentStatus?: string;
  courierStatus?: string;
  courier?: {
    name?: string;
    code?: string;
    trackingId?: string | null;
    trackingUrl?: string | null;
  };
  estimatedDeliveryDate?: string | Date | null;
  trackingTimeline?: unknown[];
  items?: TrackOrderItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId') || searchParams.get('id') || searchParams.get('invoiceNumber');
    const phone = searchParams.get('phone');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID or Invoice Number is required' },
        { status: 400 }
      );
    }

    const cleanId = orderId.trim();

    // Query by Mongo _id, invoiceNumber, or string matching
    const query: { $or: Array<Record<string, unknown>> } = {
      $or: [
        { invoiceNumber: cleanId },
        { invoiceNumber: cleanId.toUpperCase() },
      ],
    };

    // If cleanId looks like a valid MongoDB ObjectId
    if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: cleanId });
    }

    let order = (await Order.findOne(query).populate('items.product').lean()) as TrackOrderDoc | null;

    // Fallback: search last 6 characters of ObjectId or invoice if needed
    if (!order) {
      const allOrders = (await Order.find({}).sort({ createdAt: -1 }).limit(100).populate('items.product').lean()) as TrackOrderDoc[];
      order = allOrders.find(
        (o: TrackOrderDoc) =>
          o._id.toString().endsWith(cleanId) ||
          (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(cleanId.toLowerCase()))
      ) || null;
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found. Please check your Order ID or Invoice Number.' },
        { status: 404 }
      );
    }

    // Phone validation if phone parameter is provided
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const orderPhone = (order.shippingAddress?.phone || '').replace(/\D/g, '');

      if (cleanPhone && orderPhone && !orderPhone.endsWith(cleanPhone.slice(-8)) && !cleanPhone.endsWith(orderPhone.slice(-8))) {
        return NextResponse.json(
          { success: false, error: 'Phone number does not match shipping phone for this order.' },
          { status: 401 }
        );
      }
    }

    // Courier tracking link calculation
    let trackingUrl = order.courier?.trackingUrl;
    if (!trackingUrl && order.courier?.name && order.courier?.trackingId) {
      trackingUrl = getCourierTrackingUrl(order.courier.name, order.courier.trackingId);
    }

    // Visual 5-step status calculation
    const steps = getTrackingSteps(
      order.fulfillmentStatus || 'unfulfilled',
      order.courierStatus,
      order.createdAt,
      order.updatedAt
    );

    return NextResponse.json({
      success: true,
      data: {
        _id: order._id,
        invoiceNumber: order.invoiceNumber || `TH-${order._id.toString().slice(-6).toUpperCase()}`,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        totalAmount: order.totalAmount,
        shippingCost: order.shippingCost,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        fulfillmentStatus: order.fulfillmentStatus,
        courierStatus: order.courierStatus || 'pending',
        courier: {
          name: order.courier?.name || 'Standard Courier',
          code: order.courier?.code || 'standard',
          trackingId: order.courier?.trackingId || null,
          trackingUrl: trackingUrl || null,
        },
        estimatedDeliveryDate: order.estimatedDeliveryDate || null,
        steps,
        timeline: order.trackingTimeline || [],
        items: (order.items || []).map((item: TrackOrderItem) => {
          const prod = typeof item.product === 'object' && item.product !== null ? item.product : null;
          const firstImg = prod?.images?.[0];
          const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url || prod?.image || null;
          return {
            productId: typeof prod?._id === 'object' ? prod._id.toString() : prod?._id || (typeof item.product === 'string' ? item.product : null),
            title: item.title || prod?.title || 'Toy Product',
            quantity: item.quantity,
            price: item.price,
            image: imgUrl,
          };
        }),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error: unknown) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? (error as Error).message : String(error) || 'Internal server error' },
      { status: 500 }
    );
  }
}
