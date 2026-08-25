import connectToDatabase from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import "@/models/VariationType";
import "@/models/VariationValue";
import { notFound } from "next/navigation";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * GENERATE DYNAMIC METADATA (SEO)
 * High performance: Fetches metadata on the server before rendering
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const product = await Product.findOne({ slug, isPublished: true }).select('title description images');
  
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.title} - Toy Hourse`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [product.images?.[0]?.url || ""],
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
  try {
    await connectToDatabase();
    // Pre-render the top 100 products for instant scaling during high traffic
    const products = await Product.find({ isPublished: true }).select('slug').limit(100).lean();
    return products.map((p) => ({ slug: (p as any).slug }));
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
  await connectToDatabase();

  const sanitizedSlug = typeof slug === 'string' ? slug : String(slug);

  const populateConfig = [
    { path: 'category' },
    { path: 'variationTypes' },
    { path: 'variants.combination.variationType' },
    { path: 'variants.combination.variationValue' }
  ];

  const { withCache } = await import('@/lib/cache');

  const [product, relatedProducts] = await withCache(`product:isr:${sanitizedSlug}`, 60, async () => {
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

  if (!product) {
    notFound();
  }

  // Serialize MongoDB data (lean() gives us POJO, but we still need to handle ObjectIds)
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRelated = JSON.parse(JSON.stringify(relatedProducts?.filter((p: any) => p.slug !== sanitizedSlug) || []));

  return <ProductDetailsClient product={serializedProduct} relatedProducts={serializedRelated} />;
}
