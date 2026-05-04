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
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <span className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.4em]">Chronicles</span>
              <div className="h-[1px] w-12 bg-zinc-200" />
            </div>
            <h2 className="font-display font-black text-6xl md:text-8xl text-zinc-900 tracking-[-0.05em] leading-[0.85]">
              Editorial <br />
              <span className="text-zinc-300 italic">Journal</span>
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-md text-zinc-500 text-lg font-medium leading-relaxed"
          >
            A curated perspective on contemporary culture, design philosophy, and technical excellence.
          </motion.p>
        </div>

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
          </div>
        </div>

        {/* Newsletter Integration */}
        <div className="mt-40">
          <div className="bg-zinc-900 rounded-[3.5rem] py-32 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 pointer-events-none noise-overlay" />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none"
            />
            
            <div className="max-w-4xl mx-auto text-center space-y-16 relative z-10 px-6">
              <div className="space-y-8">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.4em]">Transmission Live</span>
                </div>
                <h2 className="font-display font-black text-6xl md:text-8xl text-white tracking-[-0.04em] leading-none">
                  Access the <br />
                  <span className="text-zinc-500">Collective</span>
                </h2>
                <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                  Join our private newsletter for prioritized access to limited drops, technical data, and exclusive editorial content.
                </p>
              </div>
              
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col md:flex-row gap-6 max-w-2xl mx-auto">
                 <div className="flex-1 relative">
                   <input 
                     type="email" 
                     placeholder="IDENTIFICATION / EMAIL" 
                     className="w-full bg-white/5 border border-white/10 px-10 h-20 rounded-[2rem] text-white placeholder:text-zinc-700 text-[10px] font-black tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all uppercase"
                   />
                 </div>
                 <button className="group relative h-20 px-16 bg-white text-black font-black rounded-[2rem] uppercase text-[10px] tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl">
                   <span className="relative z-10">Authorize</span>
                   <div className="absolute inset-0 bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                 </button>
              </form>
              
              <div className="flex items-center justify-center gap-10 pt-8">
                {[
                  { label: "Subscribers", value: "14.2K+" },
                  { label: "Weekly Drops", value: "03" },
                  { label: "Editorial Vol", value: "12" }
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-white font-display font-black text-xl mb-1 tracking-tighter">{stat.value}</p>
                    <p className="text-zinc-600 font-black text-[8px] uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center mt-8 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
            *By joining you agree to receive digital transmissions from our archive.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EditorialBlogSection;
