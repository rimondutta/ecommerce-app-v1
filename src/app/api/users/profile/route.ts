import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';
import { resolveUserSession } from '@/lib/resolve-user-session';

// ─────────────────────────────────────────────────────────────
// GET   /api/users/profile — fetch current customer profile & saved addresses
// PUT   /api/users/profile — update name / image
// PATCH /api/users/profile — change own password
// Auth: Bearer JWT or Web NextAuth session
// ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const cors = getCorsHeaders(req, 'GET, PUT, PATCH, OPTIONS');
  try {
    const session = await resolveUserSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    await connectToDatabase();
    const user = (await User.findById(session.id)
      .select('name email role image addresses createdAt')
      .lean()) as {
      _id: { toString(): string };
      name?: string;
      email: string;
      role?: string;
      image?: string | null;
      addresses?: unknown[];
      createdAt?: Date | string;
    } | null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404, headers: cors });
    }

    return NextResponse.json(
      {
        success: true,
        profile: {
          id: user._id.toString(),
          name: user.name || '',
          email: user.email,
          role: user.role || 'customer',
          image: user.image ?? null,
          addresses: user.addresses ?? [],
          createdAt: user.createdAt ?? null,
        },
      },
      { headers: { ...cors, 'Cache-Control': 'private, no-store' } }
    );
  } catch (error: unknown) {
    console.error('[GET /api/users/profile]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: cors });
  }
}

export async function PUT(req: NextRequest) {
  const cors = getCorsHeaders(req, 'GET, PUT, PATCH, OPTIONS');
  try {
    const session = await resolveUserSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    const body = await req.json();
    const updates: Record<string, string> = {};

    if (typeof body.name === 'string') {
      const cleanName = body.name.trim().slice(0, 80);
      if (cleanName.length < 2) {
        return NextResponse.json({ success: false, error: 'Name must be at least 2 characters' }, { status: 400, headers: cors });
      }
      updates.name = cleanName;
    }

    if (typeof body.image === 'string' && body.image.trim()) {
      updates.image = body.image.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid profile fields provided' }, { status: 400, headers: cors });
    }

    await connectToDatabase();
    const user = (await User.findByIdAndUpdate(
      session.id,
      { $set: updates },
      { new: true }
    )
      .select('name email role image createdAt')
      .lean()) as {
      _id: { toString(): string };
      name?: string;
      email: string;
      role?: string;
      image?: string | null;
      createdAt?: Date | string;
    } | null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404, headers: cors });
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name || '',
          email: user.email,
          role: user.role || 'customer',
          image: user.image ?? null,
          createdAt: user.createdAt ?? null,
        },
      },
      { headers: cors }
    );
  } catch (error: unknown) {
    console.error('[PUT /api/users/profile]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: cors });
  }
}

export async function PATCH(req: NextRequest) {
  const cors = getCorsHeaders(req, 'GET, PUT, PATCH, OPTIONS');
  try {
    const session = await resolveUserSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400, headers: cors }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters' },
        { status: 400, headers: cors }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.id).select('+password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404, headers: cors });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400, headers: cors });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return NextResponse.json(
      { success: true, message: 'Password updated successfully' },
      { headers: cors }
    );
  } catch (error: unknown) {
    console.error('[PATCH /api/users/profile]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: cors });
  }
}

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req, 'GET, PUT, PATCH, OPTIONS');
}
