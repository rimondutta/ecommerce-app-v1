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
    tag?: string;
    offer?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    discount?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = (await searchParams) || {};
  const page = Math.max(1, parseInt(params.page || "1") || 1);
  const limit = Math.min(36, Math.max(1, parseInt(params.limit || "24") || 24));
  const skip = (page - 1) * limit;

  await connectToDatabase();
  const { withCache } = await import("@/lib/cache");

  const tagParam = params.tag || (params.offer === "special" ? "specialoffer" : undefined);

  const cacheKey = `products:catalog:v8:p${page}:l${limit}:${params.category || "all"}:${params.age || "all"}:${params.variant || "none"}:${tagParam || "none"}:${params.minPrice || "0"}:${params.maxPrice || "inf"}:${params.rating || "all"}:${params.search || "none"}`;

  // Fetch paginated products, categories, and variation filters with Redis & Memory caching
  const { products, totalCount, categories, variationFilters, availableSizes, availableColors, ageRanges } = await withCache(
    cacheKey,
    300,
    async () => {
      const filter: Record<string, unknown> = { isPublished: true };

      // 0. Tag filter (e.g. ?tag=specialoffer)
      if (tagParam) {
        filter.tags = tagParam;
      }

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

      // 3. Category filter (supports multi-category comma separated, e.g. ?category=toys,gadgets)
      if (params.category) {
        const catSlugs = params.category
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        if (catSlugs.length > 0) {
          const matchedCats = (await Category.find({
            $or: [
              { slug: { $in: catSlugs } },
              { name: { $in: catSlugs } },
              { slug: { $in: catSlugs.map((s) => new RegExp(`^${s}$`, "i")) } },
            ],
          })
            .select("_id")
            .lean()) as Array<{ _id: unknown }>;

          if (matchedCats.length > 0) {
            filter.category = { $in: matchedCats.map((c) => c._id) };
          }
        }
      }

      // 4. Price range filter
      if (params.minPrice || params.maxPrice) {
        const priceCond: Record<string, number> = {};
        if (params.minPrice) priceCond.$gte = Number(params.minPrice);
        if (params.maxPrice) priceCond.$lte = Number(params.maxPrice);
        filter.price = priceCond;
      }

      // 5. Rating filter
      if (params.rating) {
        filter.rating = { $gte: Number(params.rating) };
      }

      // 6. Variation filter (e.g. ?variant=red or ?variant=red,xl)
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

      const [allCategories, allVariationTypes, allVariationValues, rawAgeRanges, usedSizesList, usedColorsList] =
        await withCache('products:filter_metadata:v8', 1800, async () => {
          const [cats, vTypes, vVals, ages, catCounts, usedVarValues, varProducts] = await Promise.all([
            Category.find({ isActive: { $ne: false } }).select("name slug").sort({ name: 1 }).lean(),
            VariationType.find({}).sort({ name: 1 }).lean(),
            VariationValue.find({}).sort({ sortOrder: 1, value: 1 }).lean(),
            Product.distinct("ageRange", { isPublished: true }),
            Product.aggregate([
              { $match: { isPublished: true } },
              { $group: { _id: "$category", count: { $sum: 1 } } },
            ]),
            Product.distinct("variants.combination.variationValue", {
              isPublished: true,
              hasVariations: true,
            }),
            Product.find({ isPublished: true, hasVariations: true })
              .select("variationTypes variants.combination variants.combinationLabel variants.isActive")
              .lean(),
          ]);

          const countMap = new Map<string, number>(
            (catCounts as Array<{ _id: unknown; count: number }>).map((c) => [
              String(c._id),
              c.count,
            ])
          );

          const categoriesWithCount = (
            cats as Array<{ _id: unknown; name: string; slug: string }>
          ).map((c) => ({
            _id: String(c._id),
            name: c.name,
            slug: c.slug,
            count: countMap.get(String(c._id)) || 0,
          }));

          // Discover sizes configured on variable products by the admin
          const isSizeVariationType = (vt: { name?: string; slug?: string }) => {
            const n = (vt?.name || "").toLowerCase();
            const s = (vt?.slug || "").toLowerCase();
            return (
              s === "size" ||
              s === "sizes" ||
              n === "size" ||
              n === "sizes" ||
              s.includes("size") ||
              n.includes("size") ||
              n.includes("সাইজ")
            );
          };

          // Discover colors configured on variable products by the admin
          const isColorVariationType = (vt: { name?: string; slug?: string; displayType?: string }) => {
            const n = (vt?.name || "").toLowerCase();
            const s = (vt?.slug || "").toLowerCase();
            const d = (vt?.displayType || "").toLowerCase();
            return (
              d === "swatch" ||
              s === "color" ||
              s === "colour" ||
              s === "colors" ||
              n === "color" ||
              n === "colour" ||
              n === "colors" ||
              s.includes("color") ||
              n.includes("color") ||
              n.includes("colour") ||
              n.includes("রং")
            );
          };

          const sizeTypeIds = new Set(
            (vTypes as Array<{ _id: unknown; name: string; slug: string }>)
              .filter(isSizeVariationType)
              .map((vt) => String(vt._id))
          );

          const colorTypeIds = new Set(
            (vTypes as Array<{ _id: unknown; name: string; slug: string; displayType?: string }>)
              .filter(isColorVariationType)
              .map((vt) => String(vt._id))
          );

          const sizeValuesMap = new Map<string, { label: string; slug: string }>();
          const colorValuesMap = new Map<string, { name: string; hex: string; slug: string }>();

          (vVals as Array<{ _id: unknown; variationType?: unknown; value: string; slug: string; colorHex?: string | null }>).forEach((val) => {
            const tId = String(val.variationType);
            if (sizeTypeIds.has(tId)) {
              sizeValuesMap.set(String(val._id), {
                label: val.value,
                slug: val.slug,
              });
            }
            if (colorTypeIds.has(tId)) {
              colorValuesMap.set(String(val._id), {
                name: val.value,
                hex: val.colorHex || "#CCCCCC",
                slug: val.slug,
              });
            }
          });

          // Set of used variation value IDs
          const usedVarValueSet = new Set(
            (usedVarValues as Array<unknown>).map((id) => String(id))
          );

          const discoveredSizesMap = new Map<string, { label: string; slug: string }>();
          const discoveredColorsMap = new Map<string, { name: string; hex: string; slug: string }>();

          // Match from usedVarValues
          sizeValuesMap.forEach((info, valId) => {
            if (usedVarValueSet.has(valId)) {
              discoveredSizesMap.set(info.slug.toLowerCase(), info);
            }
          });
          colorValuesMap.forEach((info, valId) => {
            if (usedVarValueSet.has(valId)) {
              discoveredColorsMap.set(info.slug.toLowerCase(), info);
            }
          });

          // Also scan variable products in case of combinations or labels
          (varProducts as Array<{
            variationTypes?: unknown[];
            variants?: Array<{
              isActive?: boolean;
              combinationLabel?: string;
              combination?: Array<{ variationType?: unknown; variationValue?: unknown }>;
            }>;
          }>).forEach((prod) => {
            prod.variants?.forEach((v) => {
              if (v.isActive === false) return;
              if (Array.isArray(v.combination)) {
                v.combination.forEach((c) => {
                  const valObj = c.variationValue as { _id?: unknown } | string | undefined;
                  const typeObj = c.variationType as { _id?: unknown } | string | undefined;
                  const valId = String((typeof valObj === "object" && valObj?._id) ? valObj._id : valObj || "");
                  const typeId = String((typeof typeObj === "object" && typeObj?._id) ? typeObj._id : typeObj || "");

                  // Check size
                  if (sizeValuesMap.has(valId)) {
                    const info = sizeValuesMap.get(valId)!;
                    discoveredSizesMap.set(info.slug.toLowerCase(), info);
                  } else if (sizeTypeIds.has(typeId)) {
                    const matchedVal = (vVals as Array<{ _id: unknown; value: string; slug: string }>).find(
                      (item) => String(item._id) === valId
                    );
                    if (matchedVal) {
                      discoveredSizesMap.set(matchedVal.slug.toLowerCase(), {
                        label: matchedVal.value,
                        slug: matchedVal.slug,
                      });
                    }
                  }

                  // Check color
                  if (colorValuesMap.has(valId)) {
                    const info = colorValuesMap.get(valId)!;
                    discoveredColorsMap.set(info.slug.toLowerCase(), info);
                  } else if (colorTypeIds.has(typeId)) {
                    const matchedVal = (vVals as Array<{ _id: unknown; value: string; slug: string; colorHex?: string | null }>).find(
                      (item) => String(item._id) === valId
                    );
                    if (matchedVal) {
                      discoveredColorsMap.set(matchedVal.slug.toLowerCase(), {
                        name: matchedVal.value,
                        hex: matchedVal.colorHex || "#CCCCCC",
                        slug: matchedVal.slug,
                      });
                    }
                  }
                });
              }

              if (v.combinationLabel && typeof v.combinationLabel === "string") {
                const parts = v.combinationLabel.split(/\s*[\/\-,]\s*/).map((s) => s.trim());
                parts.forEach((part) => {
                  if (!part) return;
                  const matchedSize = (vVals as Array<{ _id: unknown; variationType?: unknown; value: string; slug: string }>).find(
                    (item) =>
                      sizeTypeIds.has(String(item.variationType)) &&
                      (item.value.toLowerCase() === part.toLowerCase() ||
                        item.slug.toLowerCase() === part.toLowerCase())
                  );
                  if (matchedSize) {
                    discoveredSizesMap.set(matchedSize.slug.toLowerCase(), {
                      label: matchedSize.value,
                      slug: matchedSize.slug,
                    });
                  }

                  const matchedColor = (vVals as Array<{ _id: unknown; variationType?: unknown; value: string; slug: string; colorHex?: string | null }>).find(
                    (item) =>
                      colorTypeIds.has(String(item.variationType)) &&
                      (item.value.toLowerCase() === part.toLowerCase() ||
                        item.slug.toLowerCase() === part.toLowerCase())
                  );
                  if (matchedColor) {
                    discoveredColorsMap.set(matchedColor.slug.toLowerCase(), {
                      name: matchedColor.value,
                      hex: matchedColor.colorHex || "#CCCCCC",
                      slug: matchedColor.slug,
                    });
                  }
                });
              }
            });
          });

          const activeSizes = Array.from(discoveredSizesMap.values());
          const activeColors = Array.from(discoveredColorsMap.values());

          return [categoriesWithCount, vTypes, vVals, ages, activeSizes, activeColors];
        });

      const [dbProducts, total] = await Promise.all([
        Product.find(filter)
          .populate("category", "name slug")
          .select(
            "title price compareAtPrice slug images category badge ageRange createdAt rating reviewCount hasVariations inventory variants.isActive variants.sku variants.combinationLabel variants.combination.variationValue tags isFreeShipping"
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(filter),
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
        availableSizes: (usedSizesList as Array<{ label: string; slug: string }>) || [],
        availableColors: (usedColorsList as Array<{ name: string; hex: string; slug: string }>) || [],
        ageRanges: sortAgeRanges(
          (rawAgeRanges as (string | null | undefined)[])
            .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        ),
      };
    }
  );

  const serializedData = JSON.parse(
    JSON.stringify({
      products,
      categories,
      variationFilters: variationFilters || [],
      availableSizes: availableSizes || [],
      availableColors: availableColors || [],
      ageRanges: ageRanges || [],
    })
  );
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <React.Suspense fallback={<div>Loading products...</div>}>
      <ShopClient
        initialProducts={serializedData.products}
        allCategories={serializedData.categories}
        variationFilters={serializedData.variationFilters}
        availableSizes={serializedData.availableSizes}
        availableColors={serializedData.availableColors}
        ageRanges={serializedData.ageRanges}
        initialTag={tagParam || null}
        initialMinPrice={params.minPrice || null}
        initialMaxPrice={params.maxPrice || null}
        initialRating={params.rating || null}
        initialDiscount={params.discount || null}
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
