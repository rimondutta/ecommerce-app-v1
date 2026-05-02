import React from 'react';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';

async function getBlogs() {
  await dbConnect();
  return await BlogPost.find({ isPublished: true })
    .sort({ publishedAt: -1 })
    .lean();
}

const BlogListingPage = async () => {
  const posts = await getBlogs();

  return (
    <div className="min-h-screen bg-zinc-50 flex-1">
      <main className="pt-32 pb-24 px-6 md:px-16 relative z-10">
        <div className="max-w-7xl mx-auto relative">
          
          {/* Header */}
          <div className="mb-20">
            <div className="flex flex-col gap-6 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/50 text-zinc-600 text-[10px] font-bold uppercase tracking-widest w-fit">
                <BookOpen size={12} />
                Journal & Editorial
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-zinc-900 tracking-tight leading-none">
                Refined <br/>
                <span className="text-zinc-400 italic">Perspectives</span>
              </h1>
              <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                Curated thoughts on the intersection of performance, design, and technical apparel. Explore our latest narratives.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {posts.map((post: any, index: number) => (
              <Link 
                key={post._id.toString()} 
                href={`/blogs/${post.slug}`}
                className="group flex flex-col gap-8 bg-white p-4 rounded-[2.5rem] border border-zinc-100 shadow-soft hover:shadow-soft-xl transition-all duration-500"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-zinc-100">
                  <Image
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt || post.title}
                    fill
                    className="object-cover transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-zinc-900 shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="px-4 pb-4 space-y-4">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingTime} MIN READ
                    </span>
                    <span>•</span>
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-zinc-900 tracking-tight leading-snug group-hover:text-zinc-600 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 font-medium">
                    {post.excerpt}
                  </p>

                  <div className="pt-4 flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-widest group/btn">
                    Read Story
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover/btn:bg-zinc-900 group-hover/btn:text-white transition-all">
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-zinc-100 shadow-soft">
              <p className="text-zinc-400 font-medium italic">Our story is just beginning. Stories are coming soon.</p>
            </div>
          )}

          {/* Load More Button */}
          {posts.length > 0 && (
            <div className="mt-20 flex justify-center">
              <button className="px-10 py-4 bg-white border border-zinc-200 text-zinc-900 rounded-full text-xs font-bold uppercase tracking-widest hover:border-zinc-300 hover:shadow-soft transition-all">
                Discover More
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BlogListingPage;
