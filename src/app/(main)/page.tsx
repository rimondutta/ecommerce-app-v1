import ModernHero from "@/components/sections/BrutalistHero";
import BentoCategories from "@/components/sections/BrutalistCategories";
import TechnicalBlueprint from "@/components/sections/TechnicalBlueprint";
import ModernProductGrid from "@/components/sections/BrutalistProductGrid";
import BrutalistBlogSection from "@/components/sections/BrutalistBlogSection";
import ShopGram from "@/components/sections/ShopGram";
import connectToDatabase from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

export default async function Home() {
  await connectToDatabase();
  
  // Fetch latest products with populated categories
  const products = await Product.find({ isPublished: true })
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .lean();

  // Fetch all active categories for filtering
  const categories = await Category.find({ isActive: true }).select("name slug").lean();

  // Convert MongoDB results to plain objects safely for client components
  const sanitizedProducts = JSON.parse(JSON.stringify(products));
  const sanitizedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <div className="bg-[#f0ece5] flex-1 min-h-screen">
      {/* HERO */}
      <ModernHero />

      {/* FAST MARQUEE 1 */}
      <div className="bg-black text-white py-8 overflow-hidden pointer-events-none sticky top-0 z-0 opacity-20">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array(10).fill(0).map((_, i) => (
            <span key={i} className="font-display font-black text-3xl md:text-5xl uppercase tracking-tighter mx-8 opacity-50">
              Flex Wear // REDEFINING CASUAL WEAR // ✳
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 bg-[#f0ece5] rounded-t-[40px]">
        {/* CATEGORIES */}
        <BentoCategories />

        {/* TECHNICAL BLUEPRINT */}
        <TechnicalBlueprint />

        {/* PRODUCTS */}
        <ModernProductGrid initialProducts={sanitizedProducts} categories={sanitizedCategories} />
        
        <BrutalistBlogSection />
        <ShopGram />
      </div>

      {/* FINAL CALL TO ACTION */}
      <div className="bg-black text-[#f0ece5] py-40 flex flex-col items-center justify-center text-center overflow-hidden relative" data-cursor="EXPLORE">
         <h2 className="relative z-10 font-display font-black text-7xl md:text-[18rem] uppercase leading-none tracking-tighter mix-blend-difference mb-12">
          DIRECT
        </h2>
        <h2 className="relative z-10 font-display font-black text-7xl md:text-[12rem] uppercase leading-none tracking-tighter italic text-white/50">
          TO YOU
        </h2>
      </div>
    </div>
  );
}
