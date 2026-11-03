/**
 * GET /api/orders/[id]/invoice
 *
 * Secure Invoice Download Endpoint.
 *
 * Access Rules:
 *  - Authenticated Admin/Manager: Allowed.
 *  - Authenticated Customer: Allowed ONLY if session email matches order.customerEmail.
 *  - Guest / Unauthenticated: Allowed ONLY if valid guestAccessToken is provided via ?token=...
 *  - All other requests: Rejected (404 Not Found to prevent leaking order existence).
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { getInvoiceBufferForOrder } from '@/lib/invoice/generateInvoicePdf';
import { getBearerSession } from '@/lib/mobile-auth';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await connectToDatabase();

    const order = await Order.findById(id)
      .select('+guestAccessToken +guestAccessTokenHash')
      .lean() as any;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // ── Authorization check ──
    const session = (await getBearerSession(req)) || (await getServerSession(authOptions));
    const userRole = (session?.user as any)?.role;
    const isAdmin = userRole === 'admin' || userRole === 'manager';

    let isAuthorized = false;

    if (session) {
      if (isAdmin) {
        isAuthorized = true;
      } else {
        const sessionEmail = session.user?.email?.toLowerCase();
        const orderEmail = (order.customerEmail as string | undefined)?.toLowerCase();
        if (orderEmail && sessionEmail && sessionEmail === orderEmail) {
          isAuthorized = true;
        }
      }
    }

    // If not authorized via session, check guest access token
    if (!isAuthorized) {
      const incomingToken = req.nextUrl.searchParams.get('token')?.trim();
      if (incomingToken) {
        if (order.guestAccessTokenHash) {
          const incomingHash = crypto.createHash('sha256').update(incomingToken).digest('hex');
          if (
            incomingHash.length === order.guestAccessTokenHash.length &&
            crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(order.guestAccessTokenHash))
          ) {
            isAuthorized = true;
          }
        } else if (order.guestAccessToken) {
          // Backward compatibility for pre-hash guest orders
          if (order.guestAccessToken === incomingToken) {
            isAuthorized = true;
          }
        }
      }
    }

    if (!isAuthorized) {
      // Return 404 to avoid leaking whether another customer's order ID exists
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // ── Generate the invoice PDF buffer on the fly ──
    const { buffer, filename } = await getInvoiceBufferForOrder(id);

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[invoice] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve invoice' },
      { status: 500 }
    );
  }
}
