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
    <main className="bg-black flex-1 min-h-screen noise-bg">
      {/* HERO SECTION - Immersive 3D Experience */}
      <EditorialHero />

      <div className="relative z-10 bg-white md:rounded-t-[5rem] md:-mt-24 overflow-hidden shadow-[0_-30px_100px_rgba(0,0,0,0.1)]">
        {/* KINETIC TYPOGRAPHY */}
        <KineticMarquee />

        {/* CATEGORIES GRID with 3D Interaction */}
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
        <div className="bg-black">
           <KineticMarquee />
        </div>

        {/* EDITORIAL CONTENT */}
        <div className="bg-zinc-50">
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
