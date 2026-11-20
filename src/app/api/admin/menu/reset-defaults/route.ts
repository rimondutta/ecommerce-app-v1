import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DEFAULT_MENU_ITEMS } from '@/lib/defaultMenu';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    await MenuItem.deleteMany({});
    const created = await MenuItem.insertMany(DEFAULT_MENU_ITEMS);

    return NextResponse.json({ success: true, data: created });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
