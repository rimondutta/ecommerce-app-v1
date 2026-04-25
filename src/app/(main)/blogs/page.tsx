import React from 'react';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

async function getBlogs() {
  await dbConnect();
  return await BlogPost.find({ isPublished: true })
    .sort({ publishedAt: -1 })
    .lean();
}

const BlogListingPage = async () => {
  const posts = await getBlogs();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-32 pb-24 px-6 mt-16">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-24 border-b-4 border-black pb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-16 h-1 bg-black"></span>
              <span className="text-sm font-black uppercase tracking-[0.5em]">The Manifest</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black uppercase leading-[0.8] tracking-tighter mb-8">
              Editorial <br />
              Journal
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 max-w-2xl font-medium leading-relaxed">
              Curated thoughts on the intersection of performance, design, and technical apparel.
            </p>
          </div>

          {/* Posts List */}
          <div className="space-y-32">
            {posts.map((post: any, index: number) => (
              <Link 
                key={post._id.toString()} 
                href={`/blogs/${post.slug}`}
                className="group block border-b border-gray-100 pb-24 last:border-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Image Column */}
                  <div className={`lg:col-span-7 ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 shadow-2xl">
                      <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className={`lg:col-span-5 ${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">
                      <span className="px-3 py-1 border border-gray-200 text-gray-600 italic">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readingTime}
                      </span>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-8 group-hover:translate-x-4 transition-transform duration-500">
                      {post.title}
                    </h2>
                    
                    <p className="text-lg text-gray-500 mb-10 line-clamp-3 leading-relaxed border-l-4 border-gray-100 pl-8 italic">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em]">
                      <span className="border-b-2 border-black pb-1">Enter Dispatch</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Mockup */}
          <div className="mt-32 flex justify-center">
            <button className="px-12 py-5 bg-black text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-gray-800 transition-colors">
              Explore All
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogListingPage;
