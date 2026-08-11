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
      returnDocument: 'after',
      runValidators: true,
    });

    // Send Email Notification if status changed
    if (data.fulfillmentStatus && data.fulfillmentStatus !== oldOrder.fulfillmentStatus) {
      const { sendOrderStatusUpdateEmail } = await import('@/lib/nodemailer');
      await sendOrderStatusUpdateEmail(order, 'fulfillment', data.fulfillmentStatus).catch(err => console.error('Status email error:', err));
    } else if (data.paymentStatus && data.paymentStatus !== oldOrder.paymentStatus) {
      const { sendOrderStatusUpdateEmail } = await import('@/lib/nodemailer');
      await sendOrderStatusUpdateEmail(order, 'payment', data.paymentStatus).catch(err => console.error('Status email error:', err));
    }

    // Send Push Notification if user has pushToken
    if ((data.fulfillmentStatus && data.fulfillmentStatus !== oldOrder.fulfillmentStatus) || 
        (data.paymentStatus && data.paymentStatus !== oldOrder.paymentStatus)) {
      const User = (await import('@/models/User')).default;
      const user = await User.findOne({ email: order.customerEmail });
      
      if (user && user.pushToken) {
        const { Expo } = await import('expo-server-sdk');
        const expo = new Expo();
        if (Expo.isExpoPushToken(user.pushToken)) {
          const messages = [{
            to: user.pushToken,
            sound: 'default' as 'default',
            title: 'Order Status Update',
            body: `Your order #${order._id.toString().substring(18).toUpperCase()} is now ${order.fulfillmentStatus}.`,
            data: { orderId: order._id.toString() },
          }];
          expo.sendPushNotificationsAsync(messages).catch(err => console.error('Push notification error:', err));
        }
      }
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
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
    const deletedOrder = await Order.findByIdAndDelete(id);
    
    if (!deletedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
