import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    const fulfillmentStatus = searchParams.get('fulfillmentStatus') || searchParams.get('status');
    if (fulfillmentStatus) {
      filter.fulfillmentStatus = fulfillmentStatus;
    }
    const paymentStatus = searchParams.get('paymentStatus');
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    await connectToDatabase();

    // High performance: Uses OrderSchema.index({ createdAt: -1 })
    // or OrderSchema.index({ fulfillmentStatus: 1, createdAt: -1 })
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? (error as Error).message : String(error) }, { status: 500 });
  }
}
