import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({ isActive: true }).select("name slug image description").lean();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
