import React from "react";
import connectToDatabase from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import VariationType from "@/models/VariationType";
import VariationValue from "@/models/VariationValue";
import ShopClient from "@/components/product/ShopClient";
import {
  buildMongoAgeFilter,
  VariationFilterGroup,
  VariationFilterOption,
  sortAgeRanges,
} from "@/lib/ageHelper";

// Set ISR Revalidation window to 60 seconds
export const revalidate = 60;

interface ShopPageProps {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    category?: string;
    age?: string;
    search?: string;
    variant?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = (await searchParams) || {};
  const page = Math.max(1, parseInt(params.page || "1") || 1);
  const limit = Math.min(36, Math.max(1, parseInt(params.limit || "24") || 24));
  const skip = (page - 1) * limit;

  await connectToDatabase();
  const { withCache } = await import("@/lib/cache");

  const cacheKey = `products:catalog:v3:p${page}:l${limit}:${params.category || "all"}:${params.age || "all"}:${params.variant || "none"}:${params.search || "none"}`;

  // Fetch paginated products, categories, and variation filters with Redis caching
  const { products, totalCount, categories, variationFilters, ageRanges } = await withCache(
    cacheKey,
    60,
    async () => {
      const filter: Record<string, unknown> = { isPublished: true };

      // 1. Age Range flexible filter
      if (params.age) {
        const ageFilter = buildMongoAgeFilter(params.age);
        Object.assign(filter, ageFilter);
      }

      // 2. Search query filter
      if (params.search) {
        const escaped = params.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.title = { $regex: escaped, $options: "i" };
      }

      // 3. Category filter
      if (params.category) {
        const cat = (await Category.findOne({
          $or: [{ slug: params.category }, { name: params.category }],
        })
          .select("_id")
          .lean()) as { _id: unknown } | null;

        if (cat) {
          filter.category = cat._id;
        }
      }

      // 4. Variation filter (e.g. ?variant=red or ?variant=red,xl)
      if (params.variant) {
        const variantSlugs = params.variant
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);

        if (variantSlugs.length > 0) {
          const matchingValues = (await VariationValue.find({
            $or: [
              { slug: { $in: variantSlugs } },
              {
                value: {
                  $in: variantSlugs.map((s) => new RegExp(`^${s}$`, "i")),
                },
              },
            ],
          })
            .select("_id")
            .lean()) as Array<{ _id: unknown }>;

          const valueIds = matchingValues.map((v) => v._id);

          const variantConditions: Record<string, unknown>[] = [
            { "variants.combination.variationValue": { $in: valueIds } },
            ...variantSlugs.map((slug) => ({
              "variants.combinationLabel": { $regex: slug, $options: "i" },
            })),
            ...variantSlugs.map((slug) => ({
              "variants.sku": { $regex: slug, $options: "i" },
            })),
          ];

          if (filter.$or) {
            filter.$and = [
              ...(Array.isArray(filter.$and) ? filter.$and : []),
              { $or: filter.$or },
              { $or: variantConditions },
            ];
            delete filter.$or;
          } else {
            filter.$or = variantConditions;
          }
        }
      }

      const [dbProducts, total, allCategories, allVariationTypes, allVariationValues, rawAgeRanges] =
        await Promise.all([
          Product.find(filter)
            .populate("category", "name slug")
            .populate("variationTypes", "name slug displayType")
            .populate("variants.combination.variationType", "name slug displayType")
            .populate("variants.combination.variationValue", "value slug colorHex")
            .select(
              "title price compareAtPrice slug images category badge ageRange createdAt rating reviewCount hasVariations variationTypes variants"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Product.countDocuments(filter),
          Category.find({}).select("name slug").lean(),
          VariationType.find({}).sort({ name: 1 }).lean(),
          VariationValue.find({}).sort({ sortOrder: 1, value: 1 }).lean(),
          // Distinct age ranges from ALL published products (no filter) for the sidebar
          Product.distinct("ageRange", { isPublished: true }),
        ]);

      // Group variation values under their variation type
      const valueMap = new Map<string, VariationFilterOption[]>();
      for (const val of allVariationValues as Array<{
        _id: unknown;
        variationType?: unknown;
        value: string;
        slug: string;
        colorHex?: string | null;
      }>) {
        const typeId = val.variationType?.toString();
        if (!typeId) continue;
        if (!valueMap.has(typeId)) valueMap.set(typeId, []);
        valueMap.get(typeId)!.push({
          _id: String(val._id),
          value: val.value,
          slug: val.slug,
          colorHex: val.colorHex || null,
        });
      }

      const groups: VariationFilterGroup[] = (
        allVariationTypes as Array<{
          _id: unknown;
          name: string;
          slug: string;
          displayType?: string;
        }>
      )
        .map((vt) => ({
          _id: String(vt._id),
          name: vt.name,
          slug: vt.slug,
          displayType: vt.displayType || "button",
          values: valueMap.get(String(vt._id)) || [],
        }))
        .filter((vt) => vt.values.length > 0);

      return {
        products: dbProducts,
        totalCount: total,
        categories: allCategories,
        variationFilters: groups,
        ageRanges: sortAgeRanges(
          (rawAgeRanges as (string | null | undefined)[])
            .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        ),
      };
    }
  );

  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const serializedVariationFilters = JSON.parse(JSON.stringify(variationFilters || []));
  const serializedAgeRanges: string[] = JSON.parse(JSON.stringify(ageRanges || []));
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <React.Suspense fallback={<div>Loading products...</div>}>
      <ShopClient
        initialProducts={serializedProducts}
        allCategories={serializedCategories}
        variationFilters={serializedVariationFilters}
        ageRanges={serializedAgeRanges}
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
