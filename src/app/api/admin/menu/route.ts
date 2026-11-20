import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DEFAULT_MENU_ITEMS } from '@/lib/defaultMenu';

export const dynamic = 'force-dynamic';

// GET all menu items for admin (active + inactive)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    let items = await MenuItem.find({}).sort({ order: 1 }).lean();

    // Auto-seed defaults if table is empty
    if (!items || items.length === 0) {
      await MenuItem.insertMany(DEFAULT_MENU_ITEMS);
      items = await MenuItem.find({}).sort({ order: 1 }).lean();
    }

    return NextResponse.json({ success: true, data: items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: create a new menu item
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.label || !body.url) {
      return NextResponse.json({ success: false, error: 'Label and URL are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Assign order to end if not specified
    if (typeof body.order !== 'number') {
      const highest = await MenuItem.findOne({}).sort({ order: -1 }).select('order').lean() as { order?: number } | null;
      body.order = (highest?.order ?? -1) + 1;
    }

    const newItem = await MenuItem.create(body);
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
