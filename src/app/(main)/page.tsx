import EditorialHero from "@/components/sections/EditorialHero";
import EditorialCategories from "@/components/sections/EditorialCategories";
import TechnicalBlueprint from "@/components/sections/TechnicalBlueprint";
import EditorialProductGrid from "@/components/sections/EditorialProductGrid";
import EditorialBlogSection from "@/components/sections/EditorialBlogSection";
import ShopGram from "@/components/sections/ShopGram";
import ShopTheLook from "@/components/sections/ShopTheLook";
import connectToDatabase from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

import GsapMarquee from "@/components/ui/GsapMarquee";
import GsapCTA from "@/components/sections/GsapCTA";

export default async function Home() {
  await connectToDatabase();
  
  const products = await Product.find({ isPublished: true })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  const categories = await Category.find({ isActive: true }).select("name slug").lean();

  const sanitizedProducts = JSON.parse(JSON.stringify(products));
  const sanitizedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <div className="bg-white flex-1 min-h-screen">
      {/* HERO */}
      <EditorialHero />

      <div className="relative z-10 bg-white rounded-none overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">


        {/* CATEGORIES */}
        <EditorialCategories />

        {/* TECHNICAL BLUEPRINT */}
        <TechnicalBlueprint />

        {/* REVERSE MARQUEE */}
        <div className="bg-white py-6 overflow-hidden pointer-events-none relative z-20 border-y border-black/10">
          <GsapMarquee speed={0.8} direction="right">
            {Array(5).fill(0).map((_, i) => (
              <span key={i} className="font-display font-black text-2xl md:text-4xl uppercase tracking-tighter mx-8 text-black/10">
                FORM // FOLLOWS // FEELING // ENGINEERED // FOR // MOTION //
              </span>
            ))}
          </GsapMarquee>
        </div>

        {/* SHOP THE LOOK */}
        <ShopTheLook />

        {/* PRODUCTS */}
        <EditorialProductGrid initialProducts={sanitizedProducts} categories={sanitizedCategories} />
        
        <EditorialBlogSection />
        
        <ShopGram />
      </div>

      {/* FINAL CALL TO ACTION */}
      <GsapCTA />
    </div>
  );
}
