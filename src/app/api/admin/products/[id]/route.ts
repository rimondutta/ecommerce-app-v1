import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { deleteImage, isCloudinaryUrl } from '@/lib/cloudinary';
import { touchProductsTimestamp } from '@/lib/lastUpdated';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    
    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).populate('category', 'name');
    }
    if (!product) {
      product = await Product.findOne({ $or: [{ _id: id }, { slug: id }] }).populate('category', 'name');
    }
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? (error as Error).message : String(error) }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Sanitize image URLs to prevent next/image crash
    if (data.images && Array.isArray(data.images)) {
      data.images = data.images.filter((img: { url?: string }) => img.url && (img.url.startsWith('http') || img.url.startsWith('/')));
    }

    await connectToDatabase();
    const { id } = await params;

    // Fetch existing product to compare images
    let existingProduct = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      existingProduct = await Product.findById(id);
    }
    if (!existingProduct) {
      existingProduct = await Product.findOne({ $or: [{ _id: id }, { slug: id }] });
    }

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Identify images being removed
    const existingUrls = existingProduct.images?.map((img: { url?: string }) => img.url) || [];
    const newUrls = data.images?.map((img: { url?: string }) => img.url) || [];
    const urlsToDelete = existingUrls.filter((url: string) => !newUrls.includes(url) && isCloudinaryUrl(url));

    // Delete removed images from Cloudinary
    for (const url of urlsToDelete) {
      try {
        await deleteImage(url);
      } catch (cloudinaryError) {
        console.error(`Failed to delete replaced Cloudinary image: ${url}`, cloudinaryError);
      }
    }

    const product = await Product.findByIdAndUpdate(existingProduct._id, data, {
      new: true,
      runValidators: true,
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    if (product?.slug) {
      revalidatePath(`/products/${product.slug}`);
    }

    // Bump last-updated so mobile polling detects this update
    await touchProductsTimestamp();

    // Invalidate Redis caches
    try {
      const { invalidateCache } = await import('@/lib/cache');
      await invalidateCache('products:*', `product:*:*`);
    } catch {}

    return NextResponse.json({ product });
  } catch (error: unknown) {
    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error instanceof Error ? (error as Error).message : String(error) }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    
    // Find the product by ObjectId or slug/string ID
    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ $or: [{ _id: id }, { slug: id }] });
    }

    // If product is already gone, treat DELETE as idempotent success
    if (!product) {
      await touchProductsTimestamp();
      revalidatePath('/');
      revalidatePath('/products');
      revalidatePath('/admin/products');
      try {
        const { invalidateCache } = await import('@/lib/cache');
        await invalidateCache('products:*', `product:*:*`);
      } catch {}
      return NextResponse.json({ message: 'Product already deleted', success: true });
    }

    // Delete images from Cloudinary if they exist
    if (product.images && Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img?.url && isCloudinaryUrl(img.url)) {
          try {
            await deleteImage(img.url);
          } catch (cloudinaryError) {
            console.error(`Failed to delete Cloudinary image: ${img.url}`, cloudinaryError);
          }
        }
      }
    }

    // Also delete any variant images if on Cloudinary
    if (product.variants && Array.isArray(product.variants)) {
      for (const v of product.variants) {
        if (v.images && Array.isArray(v.images)) {
          for (const vImg of v.images) {
            const u = typeof vImg === 'string' ? vImg : vImg?.url;
            if (u && isCloudinaryUrl(u)) {
              try {
                await deleteImage(u);
              } catch {}
            }
          }
        }
      }
    }

    // Delete product from database using resolved document _id
    await Product.deleteOne({ _id: product._id });

    // Bump last-updated so mobile polling detects this deletion
    await touchProductsTimestamp();

    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    if (product.slug) {
      revalidatePath(`/products/${product.slug}`);
    }

    // Invalidate Redis caches
    try {
      const { invalidateCache } = await import('@/lib/cache');
      await invalidateCache('products:*', `product:*:*`);
    } catch {}

    return NextResponse.json({ message: 'Product and associated images deleted', success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? (error as Error).message : String(error) }, { status: 500 });
  }
}
