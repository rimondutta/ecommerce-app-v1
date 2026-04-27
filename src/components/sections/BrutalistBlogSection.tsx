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
    <section className="py-32 px-4 md:px-16 overflow-hidden max-w-[1900px] mx-auto z-20 relative border-t border-black/10">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-[1700px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12 border-b border-black/10 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-2 h-2 bg-black animate-pulse" />
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-black/60">SYS_INDEX // Cultural</span>
            </div>
            <h2 className="text-6xl md:text-[9rem] font-display font-black uppercase leading-[0.8] tracking-tighter text-black">
              Cultural <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>Archive</span>
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
              className="group flex items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-[0.3em] bg-black text-white px-8 py-4 hover:bg-black/80 transition-colors"
              data-cursor="CLICK"
            >
              Access Journal_
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-20">
          {/* Main Featured Post */}
          <div className="lg:col-span-12 xl:col-span-8">
            <Link href={`/blogs/${posts[0].slug}`} className="group block" data-cursor="READ">
              <motion.div 
                className="relative aspect-[16/9] lg:aspect-[21/9] overflow-hidden mb-12 bg-black border border-black/20"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.img
                  src={posts[0].featuredImage.url}
                  alt={posts[0].featuredImage.alt}
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-1000"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                
                {/* Technical Corner Accents */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/50" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/50" />
              </motion.div>
              
              <div className="max-w-4xl relative pl-6 border-l-2 border-black">
                <div className="absolute -left-[5px] top-0 w-2 h-2 bg-black" />
                <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-black/60 mb-6 uppercase tracking-[0.3em]">
                  <span className="bg-black/5 px-2 py-1">{posts[0].category}</span>
                  <span className="w-8 h-[1px] bg-black/20"></span>
                  <span>{new Date(posts[0].publishedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}</span>
                </div>
                <h3 className="text-4xl md:text-6xl font-display font-black uppercase leading-[0.9] tracking-tighter mb-4 group-hover:text-black/60 transition-colors">
                  {posts[0].title}
                </h3>
              </div>
            </Link>
          </div>

          {/* Secondary Posts */}
          <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-16 justify-between border-t lg:border-t-0 lg:border-l border-black/10 pt-16 lg:pt-0 lg:pl-16">
            {posts.slice(1).map((post, i) => (
              <Link key={post._id} href={`/blogs/${post.slug}`} className="group flex flex-col gap-4 border-b border-black/5 pb-8 relative" data-cursor="READ">
                <div className="absolute -left-16 top-2 w-8 h-[1px] bg-black/20 hidden lg:block transition-all group-hover:w-12 group-hover:bg-black" />
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                >
                  <div className="flex items-center gap-3 text-[9px] font-mono font-bold text-black/50 mb-3 uppercase tracking-[0.3em]">
                    <span className="border border-black/10 px-2 py-1">{post.category}</span>
                  </div>
                  <h4 className="text-2xl font-display font-black uppercase leading-[0.9] tracking-tighter mb-3 group-hover:text-transparent transition-colors" style={{ WebkitTextStroke: '1px black' }}>
                    {post.title}
                  </h4>
                  <p className="text-xs font-mono text-black/60 leading-relaxed">
                    {post.excerpt.length > 80 ? post.excerpt.substring(0, 80) + '...' : post.excerpt}
                  </p>
                </motion.div>
              </Link>
            ))}
            
            <motion.div 
              className="mt-4 p-8 border-2 border-black relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Terminal scanline */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-1.5 h-1.5 bg-black animate-pulse" />
                 <h5 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-black">Terminal // Join</h5>
              </div>
              <p className="text-2xl font-display font-black uppercase tracking-tighter mb-8 leading-none">Initialize <br/> Transmission.</p>
              
              <div className="flex border border-black p-1 bg-white focus-within:ring-2 ring-black/20 transition-all relative z-10">
                <input 
                  type="email" 
                  placeholder="ENTER_DATA..."
                  className="bg-transparent border-none text-[10px] font-mono tracking-[0.2em] w-full focus:ring-0 placeholder:text-black/30 text-black outline-none px-3 py-2"
                />
                <button className="bg-black text-white text-[10px] font-mono font-black uppercase tracking-widest px-4 hover:bg-black/80 transition-colors">Exec</button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrutalistBlogSection;
