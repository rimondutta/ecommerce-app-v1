import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import { DEFAULT_MENU_ITEMS } from '@/lib/defaultMenu';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    let items = await MenuItem.find({ isActive: true }).sort({ order: 1 }).lean();

    // If completely empty, auto-seed defaults so website is never empty
    if (!items || items.length === 0) {
      const count = await MenuItem.countDocuments();
      if (count === 0) {
        await MenuItem.insertMany(DEFAULT_MENU_ITEMS);
        items = await MenuItem.find({ isActive: true }).sort({ order: 1 }).lean();
      }
    }

    return NextResponse.json({ success: true, data: items });
  } catch (err: unknown) {
    console.error('[GET /api/menu] Error:', err);
    return NextResponse.json({ success: true, data: DEFAULT_MENU_ITEMS });
  }
}
