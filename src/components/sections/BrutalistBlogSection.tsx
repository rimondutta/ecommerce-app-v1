"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: {
    url: string;
    alt: string;
  };
  category: string;
  publishedAt: string;
  readingTime: string;
}

const BrutalistBlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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
    <section className="py-40 px-4 md:px-16 bg-white overflow-hidden rounded-[3rem] mt-32 max-w-[1900px] mx-auto z-20 relative">
      <div className="max-w-[1700px] mx-auto relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-32 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-6xl md:text-[9rem] font-display font-black uppercase leading-[0.8] tracking-tighter text-black">
              Cultural <br />
              <span className="text-black/30 italic font-light">Index</span>
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Link 
              href="/blogs" 
              className="group flex items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-[0.3em] border-b border-black pb-2 hover:opacity-60 transition-opacity"
              data-cursor="CLICK"
            >
              Browse The Journal
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-20">
          {/* Main Featured Post */}
          <div className="lg:col-span-12 xl:col-span-8">
            <Link href={`/blogs/${posts[0].slug}`} className="group block" data-cursor="READ">
              <motion.div 
                className="relative aspect-[16/9] lg:aspect-[21/9] overflow-hidden rounded-3xl mb-12 bg-black"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.img
                  src={posts[0].featuredImage.url}
                  alt={posts[0].featuredImage.alt}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-1000"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </motion.div>
              <div className="max-w-4xl">
                <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-black/60 mb-6 uppercase tracking-[0.3em]">
                  <span>{posts[0].category}</span>
                  <span className="w-1 h-1 rounded-full bg-black/20"></span>
                  <span>{new Date(posts[0].publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
                <h3 className="text-4xl md:text-7xl font-display font-black uppercase leading-[0.9] tracking-tighter mb-8 group-hover:text-black/60 transition-colors">
                  {posts[0].title}
                </h3>
              </div>
            </Link>
          </div>

          {/* Secondary Posts */}
          <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-16 justify-between border-l border-black/10 lg:pl-16">
            {posts.slice(1).map((post, i) => (
              <Link key={post._id} href={`/blogs/${post.slug}`} className="group flex flex-col gap-6" data-cursor="READ">
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                >
                  <div className="flex items-center gap-3 text-[9px] font-mono font-bold text-black/50 mb-3 uppercase tracking-[0.3em]">
                    <span>{post.category}</span>
                  </div>
                  <h4 className="text-3xl font-display font-black uppercase leading-[0.9] tracking-tighter mb-4 group-hover:text-black/50 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-sm font-mono text-black/70 leading-relaxed font-medium">
                    {post.excerpt}
                  </p>
                </motion.div>
              </Link>
            ))}
            
            <motion.div 
              className="mt-8 p-10 bg-[#f0ece5] rounded-3xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h5 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-4 text-black/60">The Vanguard</h5>
              <p className="text-xl font-display font-black uppercase tracking-tighter mb-8 leading-none">Join the Manifesto.</p>
              <div className="flex border-b border-black pb-2 focus-within:border-black/50 transition-all">
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS"
                  className="bg-transparent border-none text-[10px] font-mono tracking-[0.2em] w-full focus:ring-0 placeholder:text-black/50 text-black outline-none"
                />
                <button className="text-[10px] font-black uppercase tracking-widest hover:text-black/50 transition-colors">Apply</button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrutalistBlogSection;
