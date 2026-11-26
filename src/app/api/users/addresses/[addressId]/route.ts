import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';
import { resolveUserSession } from '@/lib/resolve-user-session';

// ─────────────────────────────────────────────────────────────
// PUT /api/users/addresses/[addressId] — update a specific address
// DELETE /api/users/addresses/[addressId] — delete a specific address
// Auth: Bearer JWT or Web NextAuth session
// ─────────────────────────────────────────────────────────────

const ALLOWED_ADDRESS_STRING_FIELDS = [
  'label',
  'fullName',
  'streetAddress',
  'city',
  'state',
  'zipCode',
  'phoneNumber',
] as const;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ addressId: string }> }) {
  const cors = getCorsHeaders(req, 'PUT, DELETE, OPTIONS');
  try {
    const session = await resolveUserSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    const { addressId } = await params;
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ success: false, error: 'Invalid address ID' }, { status: 400, headers: cors });
    }

    const body = await req.json();
    await connectToDatabase();

    const updateFields: Record<string, unknown> = {};
    for (const key of ALLOWED_ADDRESS_STRING_FIELDS) {
      if (typeof body[key] === 'string') {
        updateFields[`addresses.$.${key}`] = body[key].trim();
      }
    }
    if (typeof body.isDefault === 'boolean') {
      if (body.isDefault) {
        await User.updateOne(
          { _id: session.id },
          { $set: { 'addresses.$[].isDefault': false } }
        );
      }
      updateFields['addresses.$.isDefault'] = body.isDefault;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400, headers: cors });
    }

    const user = (await User.findOneAndUpdate(
      { _id: session.id, 'addresses._id': addressId },
      { $set: updateFields },
      { new: true }
    ).select('addresses').lean()) as { addresses?: unknown[] } | null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Address not found' }, { status: 404, headers: cors });
    }

    return NextResponse.json(
      { success: true, data: user.addresses ?? [], addresses: user.addresses ?? [] },
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
    const session = await resolveUserSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    const { addressId } = await params;
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ success: false, error: 'Invalid address ID' }, { status: 400, headers: cors });
    }

    await connectToDatabase();

    const user = (await User.findByIdAndUpdate(
      session.id,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).select('addresses').lean()) as { addresses?: unknown[] } | null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404, headers: cors });
    }

    return NextResponse.json(
      { success: true, data: user.addresses ?? [], addresses: user.addresses ?? [] },
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
