import React from 'react';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Image from 'next/image';
import Link from 'next/link';
import { Newspaper, Calendar, Clock, ArrowRight, Star } from 'lucide-react';

async function getBlogs() {
  try {
    await dbConnect();
    return await BlogPost.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .lean();
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
}

const BlogListingPage = async () => {
  const posts: any = await getBlogs();

  return (
    <div className="min-h-screen bg-paper flex-1 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-halftone" />
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-crosshatch opacity-10 rotate-12 -translate-x-1/2" />
      </div>

      <main className="pt-40 pb-32 px-8 md:px-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-24 space-y-8">
            <div className="inline-block px-4 py-2 bg-ink text-paper border-2 border-ink rotate-[-2deg]">
              <span className="font-bebas text-2xl tracking-[0.2em] uppercase">
                // ARCHIVE_LOGS
              </span>
            </div>
            <h1 className="font-bangers text-7xl md:text-9xl text-ink uppercase leading-none tracking-tight">
              THE INK <br/>
              <span className="text-secondary drop-shadow-[6px_6px_0px_#000]">CHRONICLES</span>
            </h1>
            <p className="font-comic font-bold italic text-2xl text-ink/60 leading-tight max-w-2xl">
              Narratives on high-fashion gear, comic aesthetics, and the future of the zine storefront.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {posts.map((post: any, idx: number) => (
              <Link 
                key={post._id.toString()} 
                href={`/blogs/${post.slug}`}
                className="group relative flex flex-col bg-white border-4 border-ink cartoon-shadow-lg transition-all hover:translate-y-[-8px]"
                style={{ transform: `rotate(${idx % 2 === 0 ? '-1deg' : '1deg'})` }}
              >
                {/* Image Container */}
                <div className="relative aspect-[16/9] overflow-hidden border-b-4 border-ink">
                  <Image
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt || post.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-ink text-paper border-2 border-ink font-bebas text-xl uppercase tracking-widest rotate-[-3deg] block">
                      {post.category}
                    </span>
                  </div>

                  {/* Corner Star Overlay */}
                  <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white border-4 border-ink flex items-center justify-center rotate-12 group-hover:rotate-[30deg] transition-transform">
                     <Star size={32} className="text-secondary fill-secondary" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-10 space-y-6 bg-white flex-1 flex flex-col">
                  <div className="flex items-center gap-6 font-bebas text-xl text-ink/40 tracking-widest uppercase">
                    <div className="flex items-center gap-2">
                       <Calendar size={18} />
                       <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Clock size={18} />
                       <span>{post.readingTime} MIN_READ</span>
                    </div>
                  </div>
                  
                  <h2 className="font-bangers text-4xl text-ink uppercase leading-none group-hover:text-secondary transition-colors tracking-tight">
                    {post.title}
                  </h2>
                  
                  <p className="font-comic font-bold italic text-xl text-ink/60 leading-tight line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto pt-8">
                     <div className="inline-flex items-center gap-4 font-bangers text-2xl text-secondary uppercase tracking-tight group-hover:gap-6 transition-all">
                      READ DATA PACKET <ArrowRight size={24} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="py-32 text-center border-4 border-ink bg-white cartoon-shadow">
               <div className="flex justify-center mb-6 text-ink/20"><Newspaper size={64} /></div>
               <p className="font-bangers text-4xl text-ink uppercase tracking-tight">NO LOGS FOUND IN ARCHIVE</p>
               <p className="font-comic font-bold italic text-xl text-secondary mt-2">Checking signal connection...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BlogListingPage;
