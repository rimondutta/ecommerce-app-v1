"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: { url: string; alt: string };
  category: string;
  publishedAt: string;
  readingTime: string;
}

const EditorialBlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/blogs');
        const data = await res.json();
        setPosts(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (loading || posts.length === 0) return;
    const initGsap = async () => {
      const { gsap } = await import("@/lib/gsap");
      if (!sectionRef.current) return;
      const ctx = gsap.context(() => {
        const heading = sectionRef.current!.querySelector("[data-blog-heading]");
        if (heading) gsap.fromTo(heading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: heading, start: "top 85%" } });
        
        const featured = sectionRef.current!.querySelector("[data-blog-featured]");
        if (featured) gsap.fromTo(featured, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: featured, start: "top 80%" } });
        
        const sidePosts = sectionRef.current!.querySelectorAll("[data-side-post]");
        if (sidePosts.length) gsap.fromTo(sidePosts, { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.15, duration: 1, ease: "power3.out", scrollTrigger: { trigger: sidePosts[0], start: "top 85%" } });
      }, sectionRef);
      return () => ctx.revert();
    };
    initGsap();
  }, [loading, posts]);

  if (loading || posts.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-zinc-50 rounded-[3rem] mx-4 md:mx-8 my-12 relative overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        <div data-blog-heading style={{ opacity: 0 }} className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <span className="text-zinc-500 font-semibold text-xs tracking-wider uppercase mb-3 block">Journal</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-zinc-900 tracking-tight leading-tight">
              Stories & Insights
            </h2>
          </div>
          <Link href="/blogs" className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors">
            View All Posts
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Featured Post */}
          <div className="lg:col-span-7 xl:col-span-8">
            <Link href={`/blogs/${posts[0].slug}`} className="group block h-full">
              <div data-blog-featured style={{ opacity: 0 }} className="relative h-full min-h-[400px] md:min-h-[500px] rounded-3xl overflow-hidden shadow-soft-xl bg-white flex flex-col">
                <div className="relative h-[60%] lg:h-[70%] w-full overflow-hidden">
                   <Image 
                      src={posts[0].featuredImage.url} 
                      alt={posts[0].featuredImage.alt} 
                      fill
                      className="object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105" 
                   />
                </div>
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-center bg-white">
                  <div className="flex items-center gap-3 text-xs font-medium text-zinc-500 mb-4 uppercase tracking-wider">
                    <span className="bg-zinc-100 text-zinc-800 px-3 py-1 rounded-full">{posts[0].category}</span>
                    <span>•</span>
                    <span>{new Date(posts[0].publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h3 className="text-2xl md:text-4xl font-display font-bold text-zinc-900 leading-tight mb-4 group-hover:text-zinc-600 transition-colors line-clamp-2">
                    {posts[0].title}
                  </h3>
                  <p className="text-zinc-600 line-clamp-2 leading-relaxed">
                    {posts[0].excerpt}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Side Posts & Newsletter */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            {posts.slice(1).map((post) => (
              <Link key={post._id} href={`/blogs/${post.slug}`} data-side-post style={{ opacity: 0 }} className="group block bg-white rounded-3xl p-6 md:p-8 shadow-soft hover:shadow-soft-xl transition-shadow">
                  <div className="flex items-center gap-3 text-[10px] font-medium text-zinc-500 mb-3 uppercase tracking-wider">
                    <span className="text-zinc-800">{post.category}</span>
                    <span>•</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-display font-bold text-zinc-900 leading-tight mb-2 group-hover:text-zinc-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
              </Link>
            ))}

            {/* Soft Newsletter */}
            <div data-side-post style={{ opacity: 0 }} className="mt-2 bg-zinc-900 rounded-3xl p-8 md:p-10 text-white shadow-soft-2xl flex-1 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <h5 className="text-xs font-semibold tracking-wider uppercase text-zinc-400 mb-2">Newsletter</h5>
              <p className="text-2xl font-display font-bold mb-6">Stay Inspired.</p>
              <div className="flex flex-col gap-3 relative z-10">
                <input 
                  type="email" 
                  placeholder="Enter your email..." 
                  className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-full px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all" 
                />
                <button className="bg-white text-zinc-900 rounded-full px-5 py-3.5 text-sm font-semibold hover:bg-zinc-100 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default EditorialBlogSection;
