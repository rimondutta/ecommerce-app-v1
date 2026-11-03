import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch all products that have reviews
    const products = await Product.find({ 'reviews.0': { $exists: true } })
      .select('title images reviews')
      .lean();

    // Flatten reviews and add product context
    const allReviews: any[] = [];
    products.forEach((product: any) => {
      product.reviews.forEach((review: any) => {
        allReviews.push({
          _id: review._id || review.id || new mongoose.Types.ObjectId().toString(),
          productId: {
            _id: product._id,
            title: product.title,
            images: product.images
          },
          userName: review.name,
          rating: review.rating,
          comment: review.text,
          status: review.status || 'published', // legacy reviews are considered published
          createdAt: review.date
        });
      });
    });

    // Sort by newest first
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ reviews: allReviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, productId, status } = body;

    if (!id || !productId || !status || !['pending', 'published'].includes(status)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await connectToDatabase();
    
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const review = product.reviews.id ? product.reviews.id(id) : (product.reviews || []).find((r: any) => r._id?.toString() === id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    review.status = status;

    // Recalculate rating from strictly published reviews only
    const publishedReviews = (product.reviews || []).filter(
      (r: any) => r.status === 'published'
    );
    const reviewCount = publishedReviews.length;
    const totalRating = publishedReviews.reduce((sum: number, r: any) => sum + r.rating, 0);

    product.rating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 0;
    product.reviewCount = reviewCount;

    await product.save();

    revalidatePath('/');
    revalidatePath('/products');
    if (product.slug) {
      revalidatePath(`/products/${product.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const productId = searchParams.get('productId');

    if (!id || !productId) {
      return NextResponse.json({ error: 'Review ID and Product ID are required' }, { status: 400 });
    }

    await connectToDatabase();
    
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Pull the review
    if (product.reviews.pull) {
      product.reviews.pull({ _id: id });
    } else {
      product.reviews = product.reviews.filter((r: any) => r._id?.toString() !== id);
    }

    // Recalculate average rating using strictly published reviews
    const publishedReviews = (product.reviews || []).filter(
      (r: any) => r.status === 'published'
    );
    const reviewCount = publishedReviews.length;
    const totalRating = publishedReviews.reduce((sum: number, r: any) => sum + r.rating, 0);

    product.rating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 0;
    product.reviewCount = reviewCount;

    await product.save();

    revalidatePath('/');
    revalidatePath('/products');
    if (product.slug) {
      revalidatePath(`/products/${product.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
