"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

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
      const { gsap, ScrollTrigger } = await import("@/lib/gsap");
      if (!sectionRef.current) return;
      const ctx = gsap.context(() => {
        // Heading
        const heading = sectionRef.current!.querySelector("[data-blog-heading]");
        if (heading) gsap.fromTo(heading, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: heading, start: "top 85%" } });
        // CTA
        const cta = sectionRef.current!.querySelector("[data-blog-cta]");
        if (cta) gsap.fromTo(cta, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: cta, start: "top 90%" } });
        // Featured image
        const featured = sectionRef.current!.querySelector("[data-blog-featured]");
        if (featured) gsap.fromTo(featured, { clipPath: "inset(10% 10% 10% 10%)", opacity: 0 }, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: featured, start: "top 80%" } });
        // Featured info
        const info = sectionRef.current!.querySelector("[data-blog-info]");
        if (info) gsap.fromTo(info, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: info, start: "top 90%" } });
        // Side posts
        const sidePosts = sectionRef.current!.querySelectorAll("[data-side-post]");
        gsap.fromTo(sidePosts, { opacity: 0, x: 60 }, { opacity: 1, x: 0, stagger: 0.2, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: sidePosts[0], start: "top 80%" } });
        // Newsletter
        const newsletter = sectionRef.current!.querySelector("[data-newsletter]");
        if (newsletter) gsap.fromTo(newsletter, { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: newsletter, start: "top 90%" } });
      }, sectionRef);
      return () => ctx.revert();
    };
    initGsap();
  }, [loading, posts]);

  if (loading || posts.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-32 px-4 md:px-16 overflow-hidden max-w-[1900px] mx-auto z-20 relative border-t border-black/10">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="max-w-[1700px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12 border-b border-black/10 pb-16">
          <div data-blog-heading style={{ opacity: 0 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-2 h-2 bg-black animate-pulse" />
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-black/60">COLLECTION // EDITORIAL</span>
            </div>
            <h2 className="text-5xl md:text-[9rem] font-display font-black uppercase leading-[0.8] tracking-tighter text-black">
              Cultural <br /><span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>Archive</span>
            </h2>
          </div>
          <div data-blog-cta style={{ opacity: 0 }}>
            <Link href="/blogs" className="group flex items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-[0.3em] bg-black text-white px-8 py-4 hover:bg-black/80 transition-colors" data-cursor="CLICK">
              Access Journal_<ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-20">
          <div className="lg:col-span-12 xl:col-span-8">
            <Link href={`/blogs/${posts[0].slug}`} className="group block" data-cursor="READ">
              <div data-blog-featured className="relative aspect-[16/9] lg:aspect-[21/9] overflow-hidden mb-12 bg-black border border-black/20 will-change-transform" style={{ opacity: 0 }}>
                <img src={posts[0].featuredImage.url} alt={posts[0].featuredImage.alt} className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" />
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/50" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/50" />
              </div>
              <div data-blog-info className="max-w-4xl relative pl-6 border-l-2 border-black" style={{ opacity: 0 }}>
                <div className="absolute -left-[5px] top-0 w-2 h-2 bg-black" />
                <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-black/60 mb-6 uppercase tracking-[0.3em]">
                  <span className="bg-black/5 px-2 py-1">{posts[0].category}</span>
                  <span className="w-8 h-[1px] bg-black/20"></span>
                  <span>{new Date(posts[0].publishedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}</span>
                </div>
                <h3 className="text-4xl md:text-6xl font-display font-black uppercase leading-[0.9] tracking-tighter mb-4 group-hover:text-black/60 transition-colors">{posts[0].title}</h3>
              </div>
            </Link>
          </div>
          <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-16 justify-between border-t lg:border-t-0 lg:border-l border-black/10 pt-16 lg:pt-0 lg:pl-16">
            {posts.slice(1).map((post) => (
              <Link key={post._id} href={`/blogs/${post.slug}`} className="group flex flex-col gap-4 border-b border-black/5 pb-8 relative" data-cursor="READ" data-side-post>
                <div className="absolute -left-16 top-2 w-8 h-[1px] bg-black/20 hidden lg:block transition-all group-hover:w-12 group-hover:bg-black" />
                <div>
                  <div className="flex items-center gap-3 text-[9px] font-mono font-bold text-black/50 mb-3 uppercase tracking-[0.3em]">
                    <span className="border border-black/10 px-2 py-1">{post.category}</span>
                  </div>
                  <h4 className="text-2xl font-display font-black uppercase leading-[0.9] tracking-tighter mb-3 group-hover:text-transparent transition-colors" style={{ WebkitTextStroke: '1px black' }}>{post.title}</h4>
                  <p className="text-xs font-mono text-black/60 leading-relaxed">{post.excerpt.length > 80 ? post.excerpt.substring(0, 80) + '...' : post.excerpt}</p>
                </div>
              </Link>
            ))}
            <div data-newsletter className="mt-4 p-8 border-2 border-black relative overflow-hidden group" style={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] pointer-events-none" />
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 bg-black animate-pulse" />
                <h5 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-black">JOURNAL // JOIN</h5>
              </div>
              <p className="text-2xl font-display font-black uppercase tracking-tighter mb-8 leading-none">SUBSCRIBE TO <br/> UPDATES.</p>
              <div className="flex border border-black p-1 bg-white focus-within:ring-2 ring-black/20 transition-all relative z-10">
                <input type="email" placeholder="EMAIL ADDRESS..." className="bg-transparent border-none text-[10px] font-mono tracking-[0.2em] w-full focus:ring-0 placeholder:text-black/30 text-black outline-none px-3 py-2" />
                <button className="bg-black text-white text-[10px] font-mono font-black uppercase tracking-widest px-4 hover:bg-black/80 transition-colors">SUBMIT</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialBlogSection;
