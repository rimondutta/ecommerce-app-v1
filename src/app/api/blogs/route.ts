import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';

export async function GET() {
  try {
    await dbConnect();
    
    const posts = await BlogPost.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .lean();

    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
