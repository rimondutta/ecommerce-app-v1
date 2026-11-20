import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET single item
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const item = await MenuItem.findById(id).lean();

    if (!item) {
      return NextResponse.json({ success: false, error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT update single item
export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();
    const updated = await MenuItem.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE single item
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const deleted = await MenuItem.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
