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
import KineticMarquee from "@/components/ui/KineticMarquee";
import HorizontalCollection from "@/components/sections/HorizontalCollection";

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
    <main className="bg-[#0a0a0a] flex-1 min-h-screen">
      {/* HERO SECTION — Editorial Brutalist */}
      <EditorialHero />

      <div className="relative z-10 bg-[#0a0a0a] overflow-hidden">
        {/* KINETIC TYPOGRAPHY */}
        <KineticMarquee />

        {/* CATEGORIES */}
        <EditorialCategories />

        {/* HORIZONTAL SCROLL FEATURE */}
        <HorizontalCollection />

        {/* PRODUCT ARCHIVE */}
        <div className="py-20">
          <EditorialProductGrid initialProducts={sanitizedProducts} categories={sanitizedCategories} />
        </div>

        {/* TECHNICAL BLUEPRINT */}
        <TechnicalBlueprint />

        {/* KINETIC REPEAT */}
        <KineticMarquee />

        {/* EDITORIAL CONTENT */}
        <div className="bg-[#111111]">
          <ShopTheLook />
          <EditorialBlogSection />
        </div>
        
        {/* SOCIAL SYSTEMS */}
        <ShopGram />
        
        {/* FINAL CTA */}
        <GsapCTA />
      </div>
    </main>
  );
}
