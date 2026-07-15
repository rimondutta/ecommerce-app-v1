import Homepage from "@/components/sections/Homepage";
import connectToDatabase from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

// Set ISR Revalidation window to 60 seconds.
// This allows 800k traffic to hit the Vercel Edge Cache, falling back to DB only once per minute.
export const revalidate = 60;

export default async function Home() {
  await connectToDatabase();

  // Fetch trending products and categories server-side in parallel
  const [dbProducts, dbCategories] = await Promise.all([
    Product.find({ isPublished: true })
      .select('title price slug images category badge colors sizes inventory rating reviewCount')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean(),
    Category.find({}).lean()
  ]);

  // Serialize MongoDB Data (object IDs to strings)
  const trendingProducts = JSON.parse(JSON.stringify(dbProducts));
  const categories = JSON.parse(JSON.stringify(dbCategories));

  return <Homepage initialTrendingProducts={trendingProducts} initialCategories={categories} />;
}
