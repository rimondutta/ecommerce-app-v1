import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';
import { resolveUserSession } from '@/lib/resolve-user-session';

// ─────────────────────────────────────────────────────────────
// GET /api/users/addresses — returns the user's saved addresses
// POST /api/users/addresses — add a new address
// Auth: Bearer JWT or Web NextAuth session
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const cors = getCorsHeaders(req, 'GET, POST, OPTIONS');
  try {
    const session = await resolveUserSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    await connectToDatabase();
    const user = (await User.findById(session.id).select('addresses').lean()) as { addresses?: unknown[] } | null;
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404, headers: cors });
    }

    return NextResponse.json(
      { success: true, data: user.addresses ?? [], addresses: user.addresses ?? [] },
      { headers: { ...cors, 'Cache-Control': 'private, no-store' } }
    );
  } catch (error: unknown) {
    console.error('[GET /api/users/addresses]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: cors });
  }
}

export async function POST(req: NextRequest) {
  const cors = getCorsHeaders(req, 'GET, POST, OPTIONS');
  try {
    const session = await resolveUserSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    const body = await req.json();
    const label = typeof body.label === 'string' && body.label.trim() ? body.label.trim().slice(0, 30) : 'Home';
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim().slice(0, 100) : '';
    const streetAddress = typeof body.streetAddress === 'string' ? body.streetAddress.trim().slice(0, 250) : '';
    const city = typeof body.city === 'string' ? body.city.trim().slice(0, 80) : '';
    const state = typeof body.state === 'string' ? body.state.trim().slice(0, 80) : '';
    const zipCode = typeof body.zipCode === 'string' ? body.zipCode.trim().slice(0, 20) : '';
    const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber.trim().slice(0, 30) : '';
    const isDefault = Boolean(body.isDefault);

    if (!fullName || !streetAddress || !city) {
      return NextResponse.json({ success: false, error: 'Full name, street address, and city are required' }, { status: 400, headers: cors });
    }

    await connectToDatabase();

    // If marked default, clear default flag on existing addresses first
    if (isDefault) {
      await User.updateOne(
        { _id: session.id },
        { $set: { 'addresses.$[].isDefault': false } }
      );
    }

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault,
    };

    const user = (await User.findByIdAndUpdate(
      session.id,
      { $push: { addresses: newAddress } },
      { new: true }
    ).select('addresses').lean()) as { addresses?: unknown[] } | null;

    return NextResponse.json(
      { success: true, data: user?.addresses ?? [], addresses: user?.addresses ?? [] },
      { status: 201, headers: cors }
    );
  } catch (error: unknown) {
    console.error('[POST /api/users/addresses]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: cors });
  }
}

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req, 'GET, POST, OPTIONS');
}
