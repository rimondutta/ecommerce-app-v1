import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';
import { getBearerSession } from '@/lib/mobile-auth';
import { NextRequest } from 'next/server';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';

// ─────────────────────────────────────────────────────────────
// PUT /api/users/addresses/[addressId] — update a specific address
// DELETE /api/users/addresses/[addressId] — delete a specific address
// Auth: Bearer JWT required
// ─────────────────────────────────────────────────────────────

export async function PUT(req: NextRequest, { params }: { params: Promise<{ addressId: string }> }) {
  const cors = getCorsHeaders(req, 'PUT, DELETE, OPTIONS');
  try {
    const session = await getBearerSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    const { addressId } = await params;
    const body = await req.json();

    await connectToDatabase();

    const updateFields: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(body)) {
      updateFields[`addresses.$.${key}`] = val;
    }

    const user = await User.findOneAndUpdate(
      { _id: session.user.id, 'addresses._id': addressId },
      { $set: updateFields },
      { new: true }
    ).select('addresses').lean();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Address not found' }, { status: 404, headers: cors });
    }

    return NextResponse.json(
      { success: true, data: user.addresses, addresses: user.addresses },
      { headers: cors }
    );
  } catch (error: unknown) {
    console.error('[PUT /api/users/addresses/[id]]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: cors });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ addressId: string }> }) {
  const cors = getCorsHeaders(req, 'PUT, DELETE, OPTIONS');
  try {
    const session = await getBearerSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    const { addressId } = await params;
    await connectToDatabase();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).select('addresses').lean();

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404, headers: cors });
    }

    return NextResponse.json(
      { success: true, data: user.addresses, addresses: user.addresses },
      { headers: cors }
    );
  } catch (error: unknown) {
    console.error('[DELETE /api/users/addresses/[id]]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: cors });
  }
}

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req, 'PUT, DELETE, OPTIONS');
}
