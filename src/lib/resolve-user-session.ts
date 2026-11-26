import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { getBearerSession } from '@/lib/mobile-auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export interface ResolvedUserSession {
  id: string;
  email: string;
  name?: string;
  role: string;
}

/**
 * Resolves the authenticated user across both mobile Bearer JWTs and web NextAuth cookie sessions.
 * Ensures a valid MongoDB user ObjectId string is always returned when authenticated.
 */
export async function resolveUserSession(
  req?: NextRequest | Request
): Promise<ResolvedUserSession | null> {
  const bearerSession = await getBearerSession(req);
  if (bearerSession?.user?.email && bearerSession.user.id) {
    return bearerSession.user;
  }

  const webSession = await getServerSession(authOptions);
  if (!webSession?.user?.email) {
    return null;
  }

  let userId = webSession.user.id;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    await connectToDatabase();
    const userDoc = (await User.findOne({ email: webSession.user.email.toLowerCase() })
      .select('_id role name email')
      .lean()) as { _id?: { toString(): string }; role?: string; name?: string } | null;

    if (!userDoc?._id) {
      return null;
    }
    userId = userDoc._id.toString();
  }

  return {
    id: userId,
    email: webSession.user.email,
    name: webSession.user.name ?? undefined,
    role: webSession.user.role || 'customer',
  };
}
