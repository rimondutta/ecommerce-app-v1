import connectToDatabase from "@/lib/db";
import Product from "@/models/Product";
import "@/models/Category";
import "@/models/VariationType";
import "@/models/VariationValue";
import { notFound } from "next/navigation";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";
import { Metadata } from "next";
import { cache } from "react";
import { getOrSetCached } from "@/lib/cache/redis-cache";
import { KEYS } from "@/lib/cache/invalidation";

interface ProductLean {
  _id: unknown;
  title: string;
  slug: string;
  description?: string;
  images?: Array<{ url?: string }>;
  [key: string]: unknown;
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getProductData = cache(async (slug: string) => {
  await connectToDatabase();
  const sanitizedSlug = typeof slug === 'string' ? slug : String(slug);

  const populateConfig = [
    { path: 'category' },
    { path: 'variationTypes' },
    { path: 'variants.combination.variationType' },
    { path: 'variants.combination.variationValue' }
  ];

  return getOrSetCached(KEYS.productIsrSlug(sanitizedSlug), 60, async () => {
    return await Promise.all([
      Product.findOne({ slug: sanitizedSlug, isPublished: true })
        .populate(populateConfig)
        .select('-__v')
        .lean(),
      Product.find({ isPublished: true })
        .select('title price compareAtPrice slug images category inventory rating reviewCount')
        .limit(8)
        .lean(),
    ]);
  });
});

/**
 * GENERATE DYNAMIC METADATA (SEO)
 * High performance: Fetches metadata on the server before rendering
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product] = await getProductData(slug);

  if (!product) return { title: "Product Not Found" };

  const prod = product as ProductLean;

  return {
    title: `${prod.title} - Toy Hourse`,
    description: prod.description,
    openGraph: {
      title: prod.title,
      description: prod.description,
      images: [prod.images?.[0]?.url || ""],
    },
  };
}

/**
 * AUTOMATIC SCALING CONFIGURATION (ISR)
 * revalidate: Regenerates the page every 60 seconds (High Freshness + Low Load)
 * dynamicParams: Allows non-pre-rendered products to scale on-demand
 */
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  // In development, skip pre-rendering to eliminate slow dev startup/request times
  if (process.env.NODE_ENV === 'development') {
    return [];
  }

  try {
    await connectToDatabase();
    // Pre-render the top 100 products for instant scaling during high traffic
    const products = await Product.find({ isPublished: true }).select('slug').limit(100).lean();
    return products.map((p) => ({ slug: (p as { slug: string }).slug }));
  } catch (error) {
    console.error("Failed to generate static params at build time:", error);
    return [];
  }
}

/**
 * SERVER COMPONENT (Product Page)
 * High performance: Direct DB connection, no client-side fetching waterfall
 */
export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const [product, relatedProducts] = await getProductData(slug);

  if (!product) {
    notFound();
  }

  // Serialize MongoDB data (lean() gives us POJO, but we still need to handle ObjectIds)
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRelated = JSON.parse(JSON.stringify(relatedProducts?.filter((p: { slug?: string }) => p.slug !== slug) || []));

  return <ProductDetailsClient product={serializedProduct} relatedProducts={serializedRelated} />;
}
