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
    <div className="bg-zinc-50 flex-1 min-h-screen noise-bg">
      {/* HERO */}
      <EditorialHero />

      <div className="relative z-10 bg-white rounded-t-[2.5rem] -mt-10 overflow-hidden shadow-[0_-8px_30px_rgba(0,0,0,0.04)] pb-24">

        {/* CATEGORIES */}
        <EditorialCategories />

        {/* PRODUCTS */}
        <EditorialProductGrid initialProducts={sanitizedProducts} categories={sanitizedCategories} />

        {/* TECHNICAL BLUEPRINT */}
        <TechnicalBlueprint />

        {/* SHOP THE LOOK */}
        <ShopTheLook />
        
        {/* BLOGS */}
        <EditorialBlogSection />
        
        {/* INSTAGRAM/SOCIAL */}
        <ShopGram />
      </div>

      {/* FINAL CALL TO ACTION */}
      <GsapCTA />
    </div>
  );
}
