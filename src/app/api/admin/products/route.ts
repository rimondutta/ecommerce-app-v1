import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { touchProductsTimestamp } from '@/lib/lastUpdated';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const [products, total] = await Promise.all([
      Product.find({})
        .select('title price compareAtPrice slug images category inventory isPublished tags isFreeShipping shippingRate hasVariations variants.stock variants.price variants.comparePrice variants.isActive createdAt')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({}),
    ]);

    const formattedProducts = products.map((prod: {
      hasVariations?: boolean;
      variants?: Array<{ stock?: number; price?: number; comparePrice?: number; isActive?: boolean }>;
      inventory?: number;
      price?: number;
      compareAtPrice?: number | null;
      [key: string]: unknown;
    }) => {
      let inventory = prod.inventory ?? 0;
      let price = prod.price ?? 0;
      let compareAtPrice = prod.compareAtPrice ?? null;

      if (prod.hasVariations && Array.isArray(prod.variants) && prod.variants.length > 0) {
        inventory = prod.variants.reduce(
          (sum: number, v: { stock?: number; isActive?: boolean }) =>
            sum + (v.isActive !== false ? (Number(v.stock) || 0) : 0),
          0
        );

        const activeVariants = prod.variants.filter(v => v.isActive !== false);
        const vList = activeVariants.length > 0 ? activeVariants : prod.variants;
        const minVariant = vList.reduce((min, curr) => (Number(curr.price || 0) < Number(min.price || 0) ? curr : min), vList[0]);
        if (minVariant) {
          if (!price || price === 0) price = Number(minVariant.price) || 0;
          if (!compareAtPrice && minVariant.comparePrice) compareAtPrice = Number(minVariant.comparePrice);
        }
      }
      return {
        ...prod,
        inventory,
        price,
        compareAtPrice,
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? (error as Error).message : String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Sanitize image URLs to prevent next/image crash
    if (data.images && Array.isArray(data.images)) {
      data.images = data.images.filter((img: { url?: string }) => Boolean(img?.url && (img.url.startsWith('http') || img.url.startsWith('/'))));
    }

    // Auto-calculate inventory and pricing from variants if hasVariations is true
    if (data.hasVariations && Array.isArray(data.variants)) {
      data.inventory = data.variants.reduce(
        (sum: number, v: { stock?: number; isActive?: boolean }) =>
          sum + (v.isActive !== false ? (Number(v.stock) || 0) : 0),
        0
      );

      const activeVariants = data.variants.filter((v: { isActive?: boolean }) => v.isActive !== false);
      const vList = activeVariants.length > 0 ? activeVariants : data.variants;
      const minVariant = vList.reduce((min: { price?: number; comparePrice?: number }, curr: { price?: number; comparePrice?: number }) =>
        (Number(curr.price || 0) < Number(min.price || 0) ? curr : min), vList[0]
      );
      if (minVariant) {
        if (!data.price || Number(data.price) === 0) data.price = Number(minVariant.price) || 0;
        if (!data.compareAtPrice && minVariant.comparePrice) data.compareAtPrice = Number(minVariant.comparePrice);
      }
    }

    await connectToDatabase();
    const product = await Product.create(data);

    // Bump last-updated timestamp so mobile polling detects this new product
    await touchProductsTimestamp();

    // Invalidate Redis caches
    const { invalidateCache } = await import('@/lib/cache');
    await invalidateCache('products:*', 'product:*', 'home:*', 'api:products:*');

    return NextResponse.json({ product }, { status: 201 });
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
