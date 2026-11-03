import React from "react";
import connectToDatabase from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ShopClient from "@/components/product/ShopClient";

// Set ISR Revalidation window to 60 seconds
export const revalidate = 60;

interface ShopPageProps {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    category?: string;
    age?: string;
    search?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = (await searchParams) || {};
  const page = Math.max(1, parseInt(params.page || '1') || 1);
  const limit = Math.min(36, Math.max(1, parseInt(params.limit || '24') || 24));
  const skip = (page - 1) * limit;

  await connectToDatabase();
  const { withCache } = await import('@/lib/cache');

  const cacheKey = `products:catalog:v2:p${page}:l${limit}:${params.category || 'all'}:${params.age || 'all'}:${params.search || 'none'}`;

  // Fetch paginated products and all categories in parallel with Redis caching
  const { products, totalCount, categories } = await withCache(cacheKey, 60, async () => {
    const filter: Record<string, any> = { isPublished: true };

    if (params.age) {
      filter.ageRange = params.age;
    }

    if (params.search) {
      const escaped = params.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: escaped, $options: 'i' };
    }

    if (params.category) {
      const cat = await Category.findOne({
        $or: [{ slug: params.category }, { name: params.category }],
      })
        .select('_id')
        .lean() as any;

      if (cat) {
        filter.category = cat._id;
      }
    }

    const [dbProducts, total, allCategories] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .select('title price compareAtPrice slug images category badge ageRange createdAt rating reviewCount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
      Category.find({}).select('name slug').lean(),
    ]);

    return {
      products: dbProducts,
      totalCount: total,
      categories: allCategories,
    };
  });

  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <React.Suspense fallback={<div>Loading products...</div>}>
      <ShopClient
        initialProducts={serializedProducts}
        allCategories={serializedCategories}
        pagination={{
          page,
          limit,
          total: totalCount,
          totalPages,
          hasMore: page < totalPages,
        }}
      />
    </React.Suspense>
  );
}
