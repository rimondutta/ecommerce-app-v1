import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { getJwtSecret } from "@/lib/jwt-secret";
import { getCorsHeaders, handleCorsPreflight } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return handleCorsPreflight(req, "POST, OPTIONS");
}

export async function POST(req: Request) {
  const cors = getCorsHeaders(req, "POST, OPTIONS");
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Google access token is required" },
        { status: 400, headers: cors }
      );
    }

    // Verify the Google access token and get user info from Google's userinfo endpoint
    const googleRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );

    if (!googleRes.ok) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired Google token" },
        { status: 401, headers: cors }
      );
    }

    const googleUser = await googleRes.json();
    const { email, name, picture, email_verified } = googleUser;

    if (!email || !email_verified) {
      return NextResponse.json(
        { success: false, error: "Google account email is not verified" },
        { status: 400, headers: cors }
      );
    }

    await connectToDatabase();

    // Check if user exists, if not create them
    let user = await User.findOne({ email });

    if (!user) {
      // Create user without password (OAuth user)
      const randomPassword = randomUUID();
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      user = await User.create({
        name: name || "Customer",
        email,
        password: hashedPassword,
        image: picture,
        role: "customer",
        provider: "google",
      });
    } else {
      // Update image if available and not set
      if (picture && !user.image) {
        user.image = picture;
        await user.save();
      }
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
            image: user.image || picture,
          },
        },
      },
      { headers: cors }
    );
  } catch (error: unknown) {
    console.error("Mobile Google login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: cors }
    );
  }
}
