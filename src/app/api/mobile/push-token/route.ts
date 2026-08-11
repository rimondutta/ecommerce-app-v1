import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { getBearerSession } from '@/lib/mobile-auth';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getBearerSession(req);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Push token is required' }, { status: 400 });
    }

    await connectToDatabase();

    await User.findByIdAndUpdate(session.user.id, { pushToken: token });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Push Token registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
