import ModernHero from "@/components/sections/BrutalistHero";
import BentoCategories from "@/components/sections/BrutalistCategories";
import TechnicalBlueprint from "@/components/sections/TechnicalBlueprint";
import ModernProductGrid from "@/components/sections/BrutalistProductGrid";
import BrutalistBlogSection from "@/components/sections/BrutalistBlogSection";
import ShopGram from "@/components/sections/ShopGram";
import ShopTheLook from "@/components/sections/ShopTheLook";
import connectToDatabase from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

import Reveal from "@/components/ui/Reveal";

export default async function Home() {
  await connectToDatabase();
  
  // Fetch latest products with populated categories
  const products = await Product.find({ isPublished: true })
    .populate("category", "name slug")
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

      <div className="relative z-10 bg-[#f0ece5] rounded-none overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        {/* FAST MARQUEE 1 */}
        <div className="bg-black text-white py-8 overflow-hidden pointer-events-none relative z-20 border-y border-white/10">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array(10).fill(0).map((_, i) => (
              <span key={i} className="font-display font-black text-3xl md:text-5xl uppercase tracking-tighter mx-8 opacity-20 hover:opacity-100 transition-opacity">
                Flex Wear // ARCHIVAL TECHNICAL GEAR // ✳
              </span>
            ))}
          </div>
        </div>

        {/* CATEGORIES */}
        <Reveal width="100%" delay={0.2}>
          <BentoCategories />
        </Reveal>

        {/* TECHNICAL BLUEPRINT */}
        <Reveal width="100%" delay={0.4}>
          <TechnicalBlueprint />
        </Reveal>

        {/* SHOP THE LOOK */}
        <Reveal width="100%" delay={0.2}>
          <ShopTheLook />
        </Reveal>

        {/* PRODUCTS */}
        <ModernProductGrid initialProducts={sanitizedProducts} categories={sanitizedCategories} />
        
        <Reveal width="100%">
          <BrutalistBlogSection />
        </Reveal>
        
        <Reveal width="100%">
          <ShopGram />
        </Reveal>
      </div>

      {/* FINAL CALL TO ACTION */}
      <div className="relative z-10 bg-black text-[#f0ece5] py-24 md:py-40 flex flex-col items-center justify-center text-center overflow-hidden" data-cursor="EXPLORE">
        <Reveal direction="down" distance={100}>
          <h2 className="relative z-10 font-display font-black text-6xl md:text-[18rem] uppercase leading-none tracking-tighter mix-blend-difference">
            DIRECT
          </h2>
        </Reveal>
        <Reveal direction="up" distance={100} delay={0.4}>
          <h2 className="relative z-10 font-display font-black text-6xl md:text-[12rem] uppercase leading-none tracking-tighter italic text-white/50">
            TO YOU
          </h2>
        </Reveal>
        
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
