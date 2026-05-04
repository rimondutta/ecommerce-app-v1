"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

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
    <section ref={sectionRef} className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12"
        >
          <div className="max-w-2xl">
            <span className="text-zinc-400 font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4 block">Archive</span>
            <h2 className="text-5xl md:text-8xl font-display font-black text-zinc-900 tracking-[-0.05em] leading-[0.85]">
              Stories &<br/>
              <span className="text-zinc-400 italic">Insights.</span>
            </h2>
          </div>
          <Link href="/blogs" className="group relative flex items-center gap-4 bg-black text-white px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl overflow-hidden">
            <span className="relative z-10">View Journal</span>
            <div className="absolute inset-0 bg-zinc-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Main Featured Post */}
          <div className="lg:col-span-8">
            <Link href={`/blogs/${posts[0].slug}`} className="group block relative">
              <div className="relative aspect-[16/10] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-zinc-100 border border-zinc-100 shadow-soft-xl">
                 <Image 
                    src={posts[0].featuredImage.url} 
                    alt={posts[0].featuredImage.alt} 
                    fill
                    className="object-cover transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-110" 
                 />
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 
                 <div className="absolute inset-0 p-12 flex flex-col justify-end">
                    <div className="max-w-2xl translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1]">
                      <div className="flex items-center gap-3 text-[10px] font-black text-white mb-6 uppercase tracking-[0.2em]">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">{posts[0].category}</span>
                        <span>•</span>
                        <span>{new Date(posts[0].publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h3 className="text-3xl md:text-5xl font-display font-black text-white leading-[0.9] tracking-tighter mb-6">
                        {posts[0].title}
                      </h3>
                      <p className="text-white/70 text-sm md:text-base line-clamp-2 max-w-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                        {posts[0].excerpt}
                      </p>
                    </div>
                 </div>
                 
                 {/* Noise Overlay */}
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-overlay" />
              </div>
            </Link>
          </div>

          {/* Side Posts & Newsletter */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {posts.slice(1).map((post, idx) => (
              <Link key={post._id} href={`/blogs/${post.slug}`} className="group block border-b border-zinc-100 pb-8">
                  <div className="flex items-center gap-3 text-[10px] font-black text-zinc-400 mb-4 uppercase tracking-[0.2em]">
                    <span className="text-zinc-900">{post.category}</span>
                    <span>•</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-display font-black text-zinc-900 leading-[1.1] tracking-tight group-hover:text-zinc-500 transition-colors">
                    {post.title}
                  </h4>
              </Link>
            ))}

            <div className="mt-4 bg-zinc-900 rounded-[2.5rem] p-10 md:p-12 text-white shadow-soft-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform group-hover:scale-110 duration-1000" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500 mb-4 block">Transmission</span>
              <p className="text-3xl font-display font-black leading-none tracking-tighter mb-8">Stay informed on archival releases.</p>
              
              <div className="relative border-b border-white/20 pb-4 mb-8 group-focus-within:border-white transition-colors">
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  className="bg-transparent w-full text-[10px] font-black tracking-[0.2em] outline-none placeholder:text-white/20" 
                />
                <button className="absolute right-0 top-0 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all">
                  Join
                </button>
              </div>
              <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest leading-loose">
                *By joining you agree to receive digital transmissions from our archive.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default EditorialBlogSection;
