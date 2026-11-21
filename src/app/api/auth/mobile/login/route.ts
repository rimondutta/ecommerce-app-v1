import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/jwt-secret";
import { getCorsHeaders, handleCorsPreflight } from "@/lib/cors";

export async function POST(req: Request) {
  const cors = getCorsHeaders(req, "POST, OPTIONS");
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400, headers: cors }
      );
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401, headers: cors }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401, headers: cors }
      );
    }

    // Create JWT Token for mobile app using verified secret
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      getJwtSecret(),
      { expiresIn: "30d" }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      },
      { headers: cors }
    );
  } catch (error: unknown) {
    console.error("Mobile login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: cors }
    );
  }
}

export async function OPTIONS(req: Request) {
  return handleCorsPreflight(req, "POST, OPTIONS");
}
