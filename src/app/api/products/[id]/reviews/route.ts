import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { revalidatePath } from 'next/cache';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { rating, title, text, name } = body;

    // Basic validation
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'Valid rating between 1 and 5 is required' }, { status: 400 });
    }
    if (!title || !text || !name) {
      return NextResponse.json({ error: 'Title, review text, and name are required' }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Add the new review with 'pending' status awaiting admin moderation
    const newReview = {
      rating: numRating,
      title: String(title).trim().slice(0, 150),
      text: String(text).trim().slice(0, 1000),
      name: String(name).trim().slice(0, 100),
      date: new Date(),
      status: 'pending',
    };

    product.reviews.push(newReview);

    // SECURITY: Recalculate average rating using strictly 'published' reviews only
    const publishedReviews = (product.reviews || []).filter(
      (review: any) => review.status === 'published'
    );
    const reviewCount = publishedReviews.length;
    const totalRating = publishedReviews.reduce((sum: number, review: any) => sum + review.rating, 0);

    product.rating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 0;
    product.reviewCount = reviewCount;

    await product.save();

    // Clear cache so the storefront updates instantly when appropriate
    revalidatePath('/');
    revalidatePath('/products');
    if (product.slug) {
      revalidatePath(`/products/${product.slug}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully and is pending approval.',
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
