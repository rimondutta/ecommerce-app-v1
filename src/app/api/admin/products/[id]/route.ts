import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { deleteImage } from '@/lib/cloudinary';

/**
 * Extracts a Cloudinary public ID from a Cloudinary URL.
 * e.g. "https://res.cloudinary.com/dciffpt3t/image/upload/v1234/products/abc123.jpg"
 *   => "products/abc123"
 */
function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    // Remove the version segment (v1234567890/) and file extension
    const afterUpload = parts[1].replace(/^v\d+\//, '');
    const publicId = afterUpload.replace(/\.[^/.]+$/, '');
    return publicId;
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const product = await Product.findById(id).populate('category', 'name');
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Sanitize image URLs to prevent next/image crash
    if (data.images && Array.isArray(data.images)) {
      data.images = data.images.filter((img: any) => img.url && (img.url.startsWith('http') || img.url.startsWith('/')));
    }

    await connectToDatabase();
    const { id } = await params;

    // If images are being updated, check for removed images and delete from Cloudinary
    if (data.images) {
      const existingProduct = await Product.findById(id).lean();
      if (existingProduct && existingProduct.images) {
        const newUrls = new Set(data.images.map((img: any) => img.url));
        for (const oldImg of existingProduct.images) {
          if (!newUrls.has(oldImg.url)) {
            const publicId = getPublicIdFromUrl(oldImg.url);
            if (publicId) {
              try {
                await deleteImage(publicId);
                console.log(`Deleted Cloudinary image: ${publicId}`);
              } catch (err) {
                console.error(`Failed to delete Cloudinary image ${publicId}:`, err);
              }
            }
          }
        }
      }
    }

    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete all product images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        const publicId = getPublicIdFromUrl(img.url);
        if (publicId) {
          try {
            await deleteImage(publicId);
            console.log(`Deleted Cloudinary image: ${publicId}`);
          } catch (err) {
            console.error(`Failed to delete Cloudinary image ${publicId}:`, err);
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Product and images deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


