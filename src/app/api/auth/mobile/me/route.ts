import { NextResponse } from 'next/server';
import { getBearerSession } from '@/lib/mobile-auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { NextRequest } from 'next/server';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';

/**
 * GET /api/auth/mobile/me
 *
 * Returns the current user's profile from the Bearer JWT.
 * Used by the mobile AuthContext on app resume to:
 *   1. Validate the stored token is still valid
 *   2. Refresh user data (name, role, image) from the DB
 *
 * Response: { success: true, data: { id, name, email, role, image } }
 */
export async function GET(req: NextRequest) {
  const cors = getCorsHeaders(req, 'GET, OPTIONS');
  const session = await getBearerSession(req);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401, headers: cors }
    );
  }

  try {
    await connectToDatabase();
    const user = await User.findById(session.user.id).select('-password').lean() as {
      _id: { toString(): string };
      name?: string;
      email: string;
      role: string;
      image?: string | null;
    } | null;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404, headers: cors }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image ?? null,
        },
      },
      { headers: cors }
    );
  } catch (error: unknown) {
    console.error('[GET /api/auth/mobile/me]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: cors }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req, 'GET, OPTIONS');
}
