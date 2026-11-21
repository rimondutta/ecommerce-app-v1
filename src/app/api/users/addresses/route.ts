import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { getBearerSession } from '@/lib/mobile-auth';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';

// ─────────────────────────────────────────────────────────────
// GET /api/users/addresses — returns the user's saved addresses
// POST /api/users/addresses — add a new address
// Auth: Bearer JWT required
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const cors = getCorsHeaders(req, 'GET, POST, OPTIONS');
  try {
    const session = await getBearerSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    await connectToDatabase();
    const user = (await User.findById(session.user.id).select('addresses').lean()) as { addresses?: unknown[] } | null;
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404, headers: cors });
    }

    return NextResponse.json(
      { success: true, data: user.addresses ?? [], addresses: user.addresses ?? [] },
      { headers: cors }
    );
  } catch (error: unknown) {
    console.error('[GET /api/users/addresses]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: cors });
  }
}

export async function POST(req: NextRequest) {
  const cors = getCorsHeaders(req, 'GET, POST, OPTIONS');
  try {
    const session = await getBearerSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    const body = await req.json();
    const { label, fullName, streetAddress, city, state, zipCode, phoneNumber, isDefault } = body;

    if (!fullName || !streetAddress || !city) {
      return NextResponse.json({ success: false, error: 'Missing required address fields' }, { status: 400, headers: cors });
    }

    await connectToDatabase();

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      label: label ?? 'Home',
      fullName,
      streetAddress,
      city,
      state: state ?? '',
      zipCode: zipCode ?? '',
      phoneNumber: phoneNumber ?? '',
      isDefault: isDefault ?? false,
    };

    const user = (await User.findByIdAndUpdate(
      session.user.id,
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
