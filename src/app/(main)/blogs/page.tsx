import React from 'react';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

async function getBlogs() {
  await dbConnect();
  return await BlogPost.find({ isPublished: true })
    .sort({ publishedAt: -1 })
    .lean();
}

const BlogListingPage = async () => {
  const posts = await getBlogs();

  return (
    <div className="min-h-screen bg-[#f0ece5]">
      
      <main className="pt-24 pb-24 px-6 relative z-10">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
             
        <div className="max-w-[1400px] mx-auto relative">
          {/* Header */}
          <div className="mb-24 border-b border-black pb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-16 h-1 bg-black"></span>
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-black">SYS_MANIFEST</span>
            </div>
            <h1 className="font-display text-7xl md:text-9xl font-black uppercase leading-[0.8] tracking-tighter mb-8" style={{ WebkitTextStroke: "1px black", color: "transparent" }}>
              EDITORIAL<br />JOURNAL
            </h1>
            <p className="font-mono text-[12px] text-black uppercase tracking-widest max-w-2xl font-bold leading-loose">
              CURATED THOUGHTS ON THE INTERSECTION OF PERFORMANCE, DESIGN, AND TECHNICAL APPAREL.
            </p>
          </div>

          {/* Posts List */}
          <div className="space-y-32">
            {posts.map((post: any, index: number) => (
              <Link 
                key={post._id.toString()} 
                href={`/blogs/${post.slug}`}
                className="group block border-b border-black pb-24 last:border-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Image Column */}
                  <div className={`lg:col-span-7 ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
                    <div className="relative aspect-[16/9] overflow-hidden bg-white border border-black p-2">
                      <div className="relative w-full h-full overflow-hidden">
                        <Image
                          src={post.featuredImage.url}
                          alt={post.featuredImage.alt}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                      </div>
                      <div className="absolute top-0 left-0 bg-black text-[#f0ece5] font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 z-10">IMAGE_DATA</div>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className={`lg:col-span-5 ${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
                    <div className="flex items-center gap-4 font-mono text-[9px] font-black text-black mb-6 uppercase tracking-widest">
                      <span className="px-3 py-1 border border-black bg-white">
                        DIR_{post.category}
                      </span>
                      <span className="flex items-center gap-1.5 border border-black bg-white px-3 py-1">
                        <Clock className="w-3 h-3" />
                        READ_T_{post.readingTime}
                      </span>
                    </div>
                    
                    <h2 className="font-display text-4xl md:text-6xl font-black uppercase leading-tight mb-8 group-hover:translate-x-4 transition-transform duration-500">
                      {post.title}
                    </h2>
                    
                    <p className="font-mono text-[11px] text-black/80 mb-10 leading-[2] border-l border-black pl-8 uppercase tracking-widest">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-4 font-mono text-[10px] font-black uppercase tracking-[0.2em] border border-black w-fit px-6 py-3 hover:bg-black hover:text-[#f0ece5] transition-colors">
                      <span>ENTER_DISPATCH</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Mockup */}
          <div className="mt-32 flex justify-center border-t border-black pt-16">
            <button className="px-12 py-5 border border-black bg-white text-black font-mono text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-[#f0ece5] transition-colors">
              QUERY_ALL_ARCHIVES
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogListingPage;
