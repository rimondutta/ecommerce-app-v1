import React from 'react';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Product from '@/models/Product';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaFacebookF, FaPinterest } from "react-icons/fa";
import { FaXTwitter, FaPlus } from "react-icons/fa6";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";

async function getBlogPost(slug: string) {
  try {
    await dbConnect();
    return await BlogPost.findOne({ slug, isPublished: true }).lean();
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return null;
  }
}

export const revalidate = 60;
export const dynamicParams = true;
const SingleBlogPage = async ({
  params
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params;
  const post: any = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="w-full flex-1 pb-20">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-12 md:pt-20">
        
        {/* ── Heading & Meta ── */}
        <div className="text-center mb-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-[45px] font-bold text-black leading-tight mb-6">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#767676] uppercase tracking-wide">
            <span>by {post.author?.name || "admin"}</span>
            <span>
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span>{post.category}</span>
          </div>
        </div>

        {/* ── Featured Image ── */}
        <div className="relative w-full aspect-[16/9] md:aspect-[2/1] mb-12">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt || post.title}
            fill
            sizes="(max-width: 800px) 100vw, 800px"
            className="object-cover"
            priority
          />
        </div>

        {/* ── Content Body ── */}
        <div className="prose prose-lg max-w-none prose-p:text-[#444] prose-p:leading-relaxed prose-headings:font-semibold prose-headings:text-black">
          {post.content.split('\n\n').map((paragraph: string, i: number) => {
            if (paragraph.startsWith('# ')) {
              return <h2 key={i} className="text-3xl mt-12 mb-6">{paragraph.replace('# ', '')}</h2>;
            }
            if (paragraph.startsWith('## ')) {
              return <h3 key={i} className="text-2xl mt-10 mb-4">{paragraph.replace('## ', '')}</h3>;
            }
            if (paragraph.startsWith('- ')) {
               return <li key={i} className="ml-6 list-disc mb-2">{paragraph.replace('- ', '')}</li>;
            }
            return <p key={i} className="mb-6">{paragraph}</p>;
          })}
        </div>

        {/* ── Tags ── */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-neutral-200">
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-xs uppercase bg-neutral-100 px-3 py-1 text-neutral-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Share Buttons ── */}
        <div className="flex flex-wrap items-center gap-4 mt-10">
          <button className="flex items-center gap-2 bg-[#3b5998] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
            <FaFacebookF /> Share on Facebook
          </button>
          <button className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
            <FaXTwitter /> Share on Twitter
          </button>
          <button className="flex items-center gap-2 bg-[#cb2027] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
            <FaPinterest /> Share on Pinterest
          </button>
          <button className="flex items-center justify-center bg-neutral-200 text-black w-9 h-9 rounded hover:bg-neutral-300 transition-colors">
            <FaPlus size={16} />
          </button>
        </div>

        {/* ── Next / Prev Navigation ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-16 pt-10 border-t border-neutral-200">
          <Link href="/blogs" className="group flex flex-col gap-2 cursor-pointer w-full md:w-1/2">
            <div className="flex items-center gap-2 text-sm text-[#767676] font-medium tracking-widest transition-colors group-hover:text-black">
              <GoChevronLeft size={18} />
              <p>PREVIOUS POST</p>
            </div>
            <p className="text-black font-semibold line-clamp-1 transition-colors group-hover:underline">
              Return to Archives
            </p>
          </Link>
          
          <div className="hidden md:block w-px h-16 bg-neutral-200" />

          <Link href="/blogs" className="group flex flex-col items-end gap-2 cursor-pointer w-full md:w-1/2 text-right">
            <div className="flex items-center gap-2 text-sm text-[#767676] font-medium tracking-widest transition-colors group-hover:text-black">
              <p>NEXT POST</p>
              <GoChevronRight size={18} />
            </div>
            <p className="text-black font-semibold line-clamp-1 transition-colors group-hover:underline">
              Discover More
            </p>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SingleBlogPage;
