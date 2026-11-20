import Homepage from "@/components/sections/Homepage";
import connectToDatabase from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import BlogPost from "@/models/BlogPost";

// Set ISR Revalidation window to 60 seconds.
// This allows 800k traffic to hit the Vercel Edge Cache, falling back to DB only once per minute.
export const revalidate = 60;

interface HomeProduct {
  _id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: { url: string; alt?: string }[];
  badge?: string;
  ageRange?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  inventory?: number | { quantity?: number };
}

interface HomeCategory {
  name: string;
  slug: string;
  image: string;
}

interface HomeBlog {
  _id: string | { toString(): string };
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  publishedAt?: string | Date;
  createdAt?: string | Date;
  featuredImage?: { url?: string; alt?: string };
}

export default async function Home() {
  let trendingProducts: HomeProduct[] = [];
  let categories: HomeCategory[] = [];
  let latestBlogs: HomeBlog[] = [];
  let specialOfferProducts: HomeProduct[] = [];
  let bestsellingProducts: HomeProduct[] = [];
  let discountProducts: HomeProduct[] = [];
  let freeDeliveryProducts: HomeProduct[] = [];

  try {
    await connectToDatabase();

    // Fetch homepage products and categories server-side in parallel
    const { withCache } = await import('@/lib/cache');

    const [
      dbProducts,
      dbCategories,
      dbBlogs,
      dbSpecialOffers,
      dbBestsellers,
      dbDiscounts,
      dbFreeDelivery,
    ] = await withCache('home:isr:data', 60, async () => {
      return await Promise.all([
        Product.find({ isPublished: true })
          .select('title price compareAtPrice slug images category badge colors sizes inventory rating reviewCount')
          .sort({ createdAt: -1 })
          .limit(4)
          .lean(),
        Category.find({ isActive: true })
          .select('name slug description image isActive')
          .sort({ createdAt: -1 })
          .lean(),
        BlogPost.find({ isPublished: true })
          .sort({ publishedAt: -1 })
          .limit(3)
          .lean(),
        Product.find({ isPublished: true, tags: 'specialoffer' })
          .select('title price compareAtPrice slug images badge rating reviewCount tags category inventory')
          .sort({ createdAt: -1 })
          .limit(12)
          .lean(),
        Product.find({ isPublished: true, tags: 'bestselling' })
          .select('title price compareAtPrice slug images badge rating reviewCount tags')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Product.find({ isPublished: true, tags: 'discount' })
          .select('title price compareAtPrice slug images badge rating reviewCount tags category inventory')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Product.find({
          isPublished: true,
          $or: [{ tags: 'freedelivery' }, { tags: 'freeshipping' }, { isFreeShipping: true }],
        })
          .select('title price compareAtPrice slug images badge rating reviewCount tags category inventory')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);
    });

    // Serialize MongoDB Data (object IDs to strings)
    trendingProducts = JSON.parse(JSON.stringify(dbProducts || []));
    categories = JSON.parse(JSON.stringify(dbCategories || []));
    latestBlogs = JSON.parse(JSON.stringify(dbBlogs || []));
    specialOfferProducts = JSON.parse(JSON.stringify(dbSpecialOffers || []));
    bestsellingProducts = JSON.parse(JSON.stringify(dbBestsellers || []));
    discountProducts = JSON.parse(JSON.stringify(dbDiscounts || []));
    freeDeliveryProducts = JSON.parse(JSON.stringify(dbFreeDelivery || []));
  } catch (error) {
    console.warn("Could not load initial homepage data (DB offline or build-time prerender):", error);
  }

  return (
    <Homepage
      initialTrendingProducts={trendingProducts}
      initialCategories={categories}
      initialBlogs={latestBlogs}
      initialSpecialOfferProducts={specialOfferProducts}
      initialBestsellingProducts={bestsellingProducts}
      initialDiscountProducts={discountProducts}
      initialFreeDeliveryProducts={freeDeliveryProducts}
    />
  );
}
