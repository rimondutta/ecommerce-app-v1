"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
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

  if (loading || posts.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-24 md:py-40 bg-[#0a0a0a] relative overflow-hidden border-t border-white/5">
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-20 scanlines" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24 md:mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-[1px] bg-[#333]" />
              <span className="label-tiny text-[#555]">Bureau Chronicles</span>
            </div>
            <h2 className="leading-[0.85]">
              <span className="font-serif text-5xl md:text-8xl text-white block">Editorial</span>
              <span className="font-serif italic text-5xl md:text-8xl text-[#555] block">Journal.</span>
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-md label-tiny leading-[2] text-[#8e9192]"
          >
            A curated perspective on contemporary culture, design philosophy, and technical archival systems.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Main Featured Post */}
          <div className="lg:col-span-8">
            <Link href={`/blogs/${posts[0].slug}`} className="group block relative">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#111] border border-white/5">
                 <Image 
                    src={posts[0].featuredImage.url} 
                    alt={posts[0].featuredImage.alt} 
                    fill
                    className="object-cover grayscale brightness-75 transition-all duration-[1s] ease-[0.16,1,0.3,1] group-hover:scale-105 group-hover:grayscale-0" 
                 />
                 <div className="absolute inset-0 bg-[#0a0a0a]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 
                 <div className="absolute inset-0 p-12 flex flex-col justify-end">
                    <div className="max-w-2xl translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1]">
                      <div className="flex items-center gap-4 text-white mb-6">
                        <span className="label-tiny tracking-[0.3em]">{posts[0].category}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="label-tiny opacity-50">{new Date(posts[0].publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h3 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-6">
                        {posts[0].title}
                      </h3>
                      <p className="label-tiny text-white/50 max-w-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 leading-relaxed">
                        {posts[0].excerpt}
                      </p>
                    </div>
                 </div>
              </div>
            </Link>
          </div>

          {/* Side Posts */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            {posts.slice(1).map((post, idx) => (
              <Link key={post._id} href={`/blogs/${post.slug}`} className="group block border-b border-white/5 py-12 first:pt-0 last:border-0">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="label-tiny text-white">{post.category}</span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="label-tiny text-[#333]">{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-serif text-white group-hover:text-[#555] transition-colors leading-tight">
                    {post.title}
                  </h4>
                  <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="label-tiny text-white" style={{ fontSize: '7px' }}>READ TRANSMISSION</span>
                      <div className="h-[1px] w-8 bg-white" />
                  </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter Integration */}
        <div className="mt-40">
          <div className="bg-[#111] py-32 md:py-48 relative overflow-hidden border border-white/5">
            <div className="max-w-4xl mx-auto text-center space-y-16 relative z-10 px-6">
              <div className="space-y-10">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="label-tiny text-[#555]">TRANSMISSION FEED LIVE</span>
                </div>
                <h2 className="leading-none">
                  <span className="font-serif text-6xl md:text-9xl text-white block">Access the</span>
                  <span className="font-serif italic text-6xl md:text-9xl text-[#555] block">Collective.</span>
                </h2>
                <p className="label-tiny leading-[2] text-[#8e9192] max-w-xl mx-auto">
                  Join our private directory for prioritized access to archival drops, technical specifications, and exclusive editorial perspectives.
                </p>
              </div>
              
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col md:flex-row gap-0 max-w-2xl mx-auto border border-white/10">
                 <div className="flex-1 relative">
                   <input 
                     type="email" 
                     placeholder="IDENTIFICATION / EMAIL" 
                     className="w-full bg-transparent px-10 h-20 text-white placeholder:text-[#333] label-tiny focus:outline-none focus:bg-white/5 transition-all"
                   />
                 </div>
                 <button className="h-20 px-12 bg-white text-black label-tiny hover:bg-[#8e9192] transition-colors">
                   AUTHORIZE
                 </button>
              </form>
              
              <div className="flex items-center justify-center gap-16 pt-8">
                {[
                  { label: "Directives", value: "14.2K+" },
                  { label: "Archival Drops", value: "03" },
                  { label: "System Vol", value: "12" }
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-serif text-white text-2xl mb-1">{stat.value}</p>
                    <p className="label-tiny text-[#333]" style={{ fontSize: '7px' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Watermark */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 label-tiny text-white/[0.02] text-[15vw] pointer-events-none select-none">
                AVANT
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialBlogSection;
