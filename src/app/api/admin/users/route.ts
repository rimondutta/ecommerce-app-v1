import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// GET: List all staff (admins and managers)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const users = await User.find({ role: { $in: ['admin', 'manager'] } })
      .select('_id name email role createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      users,
      currentUser: {
        id: session.user.id,
        role: session.user.role,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Create a new admin or manager user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Only administrators can create new staff accounts.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, name: providedName, email, password, role } = body;

    const fullName = (providedName || `${firstName || ''} ${lastName || ''}`).trim();
    const cleanEmail = email?.toLowerCase().trim();

    if (!cleanEmail) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }
    if (!fullName) {
      return NextResponse.json({ error: 'User name is required.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Role must be 'admin' or 'manager'
    const assignedRole = role === 'manager' ? 'manager' : 'admin';

    await connectToDatabase();

    // Check for existing user
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email address already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: fullName,
      email: cleanEmail,
      password: hashedPassword,
      role: assignedRole,
    });

    return NextResponse.json({
      success: true,
      message: `${assignedRole === 'admin' ? 'Administrator' : 'Manager'} account created successfully.`,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Remove a staff user (Admins ONLY — managers cannot remove anyone)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Strict policy: Managers cannot remove anyone!
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied: Managers are not allowed to remove users.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // Prevent deleting your own account
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot remove your own administrator account.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found or already deleted.' }, { status: 404 });
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} (${targetUser.email}) removed successfully.`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

