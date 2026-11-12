import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
// Make sure Order is loaded for aggregation
import '@/models/Order'; 

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch all customers, joining with their orders
    const customers = await User.aggregate([
      {
        $match: { role: 'customer' }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'email',
          foreignField: 'customerEmail',
          as: 'orders'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          createdAt: 1,
          ordersCount: { $size: "$orders" },
          totalSpent: { $sum: "$orders.totalAmount" },
          lastOrderDate: { $max: "$orders.createdAt" }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return NextResponse.json({
      customers,
      currentUserRole: session.user.role,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? (error as Error).message : String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only full administrators can remove customers ("manager cannot remove anyone")
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied: Managers are not allowed to remove customers.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    await connectToDatabase();

    const customer = await User.findById(id);
    if (!customer) {
      // Idempotent: already deleted
      return NextResponse.json({ success: true, message: 'Customer already removed' });
    }

    // Protect staff/admin accounts from accidental deletion via customers endpoint
    if (customer.role !== 'customer') {
      return NextResponse.json(
        { error: 'Cannot delete staff or administrator accounts from the customers list.' },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Customer ${customer.name || customer.email} deleted successfully.`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? (error as Error).message : String(error) },
      { status: 500 }
    );
  }
}
