import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBearerSession } from '@/lib/mobile-auth';

export async function GET(req: NextRequest) {
  try {
    const session = (await getBearerSession(req)) || (await getServerSession(authOptions));

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await connectToDatabase();

    const emailVariants = Array.from(
      new Set([session.user.email, session.user.email.toLowerCase()])
    );

    // Performance: .select() returns only fields the /account & mobile UI need
    // Performance: .lean() returns plain JS objects instead of full Mongoose Documents
    const orders = await Order.find({ customerEmail: { $in: emailVariants } })
      .select(
        '_id items subtotal discountAmount shippingCost totalAmount paymentStatus fulfillmentStatus courierStatus courier estimatedDeliveryDate createdAt updatedAt shippingAddress invoiceNumber invoiceUrl paymentMethod customerName'
      )
      .sort({ createdAt: -1 })
      .lean();

    // Collect product IDs to resolve storefront slugs cleanly without altering item shape
    const productIdSet = new Set<string>();
    for (const order of orders) {
      const items = (order as { items?: Array<{ product?: unknown }> }).items;
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        if (item.product) {
          productIdSet.add(String(item.product));
        }
      }
    }

    const productSlugs: Record<string, string> = {};
    if (productIdSet.size > 0) {
      const products = (await Product.find({
        _id: { $in: Array.from(productIdSet) },
        isPublished: true,
      })
        .select('_id slug')
        .lean()) as Array<{ _id: { toString(): string }; slug?: string }>;

      for (const p of products) {
        if (p.slug) {
          productSlugs[p._id.toString()] = p.slug;
        }
      }
    }

    // Security: Explicitly mark as private — prevents CDN/proxy from caching user-specific data
    return NextResponse.json(
      { success: true, orders, productSlugs },
      {
        headers: {
          'Cache-Control': 'private, no-store',
        },
      }
    );
  } catch (error: unknown) {
    console.error('User Orders Fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
