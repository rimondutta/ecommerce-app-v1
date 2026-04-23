import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

// This handles fetching published products for the storefront - REBUILD TRIGGER
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryQuery = searchParams.get('category');
    const searchQuery = searchParams.get('search');
    const idsQuery = searchParams.get('ids');
    
    await connectToDatabase();
    
    let query: any = { isPublished: true };
    
    if (idsQuery) {
      const idList = idsQuery.split(',').filter(id => id.length > 0);
      if (idList.length > 0) {
        query._id = { $in: idList };
      }
    } else {
      if (categoryQuery) {
        const category = await Category.findOne({ slug: categoryQuery });
        if (category) {
          query.category = category._id;
        }
      }
  
  if (searchQuery) {
        // Security: Escape special regex characters to prevent NoSQL injection / Regex DoS
        const escapedSearch = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
          { title: { $regex: escapedSearch, $options: 'i' } },
          { description: { $regex: escapedSearch, $options: 'i' } }
        ];
      }
    }

    // Security: Use select() to strictly return public fields
    // Scalability: Use lean() and sort correctly
    const products = await Product.find(query)
      .populate('category')
      .select('title price slug images category badge colors sizes')
      .sort({ createdAt: -1 })
      .lean();

    // High Traffic Scaling: Cache search results at the edge
    return NextResponse.json(
      { products },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    // Security: Don't leak raw error stack traces to the client in production
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
