import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  const cors = getCorsHeaders(request, 'POST, OPTIONS');

  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400, headers: cors }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400, headers: cors }
      );
    }

    const sanitizedEmail = String(email).toLowerCase().trim();
    const sanitizedName = String(name).trim();

    await connectToDatabase();

    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 400, headers: cors }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role: 'customer', // Security: Role is always locked to customer on self-registration
    });

    logger.info('New customer account registered', {
      userId: newUser._id.toString(),
      email: sanitizedEmail,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201, headers: cors }
    );
  } catch (error: unknown) {
    logger.error('Registration Error', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: cors }
    );
  }
}

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request, 'POST, OPTIONS');
}
