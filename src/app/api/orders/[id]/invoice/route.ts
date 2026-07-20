/**
 * GET /api/orders/[id]/invoice
 *
 * Returns a redirect to the stored Cloudinary PDF URL.
 * Generates the invoice on-demand if it hasn't been generated yet.
 *
 * Auth:
 *  - Authenticated users: may only access their own order's invoice
 *    (session email must match order.customerEmail).
 *  - Unauthenticated / guest orders: accessible by order ID, consistent
 *    with the existing HTML invoice page at /invoice/[id] which has no auth.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { generateInvoiceForOrder } from '@/lib/invoice/generateInvoicePdf';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const order = await Order.findById(id).lean() as any;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // ── Auth check ──
    // If a session exists, ensure the user owns this order.
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const isAdmin = userRole === 'admin' || userRole === 'manager';

    if (session && !isAdmin) {
      const sessionEmail = session.user?.email?.toLowerCase();
      const orderEmail = (order.customerEmail as string | undefined)?.toLowerCase();
      // If the order has an email and it doesn't match the session, deny.
      if (orderEmail && sessionEmail && sessionEmail !== orderEmail) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // ── Retrieve or generate the invoice PDF ──
    let invoiceUrl: string | null = order.invoiceUrl ?? null;
    if (!invoiceUrl) {
      invoiceUrl = await generateInvoiceForOrder(id);
    }

    // Redirect to the Cloudinary PDF URL (browser will trigger a download)
    return NextResponse.redirect(invoiceUrl);
  } catch (error: any) {
    console.error('[invoice] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve invoice' },
      { status: 500 }
    );
  }
}
