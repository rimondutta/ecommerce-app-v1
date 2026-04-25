import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    await connectToDatabase();
    // Only allow updating statuses explicitly
    const { id } = await params;
    const oldOrder = await Order.findById(id);
    
    if (!oldOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = await Order.findByIdAndUpdate(id, {
      fulfillmentStatus: data.fulfillmentStatus || oldOrder.fulfillmentStatus,
      paymentStatus: data.paymentStatus || oldOrder.paymentStatus
    }, {
      new: true,
      runValidators: true,
    });

    // Send Email Notification if status changed
    if (data.fulfillmentStatus && data.fulfillmentStatus !== oldOrder.fulfillmentStatus) {
      const { sendOrderStatusUpdateEmail } = await import('@/lib/nodemailer');
      sendOrderStatusUpdateEmail(order, 'fulfillment', data.fulfillmentStatus).catch(err => console.error('Status email error:', err));
    } else if (data.paymentStatus && data.paymentStatus !== oldOrder.paymentStatus) {
      const { sendOrderStatusUpdateEmail } = await import('@/lib/nodemailer');
      sendOrderStatusUpdateEmail(order, 'payment', data.paymentStatus).catch(err => console.error('Status email error:', err));
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
