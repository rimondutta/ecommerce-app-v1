import React from 'react';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Image from 'next/image';
import Link from 'next/link';

async function getBlogs() {
  try {
    await dbConnect();
    return await BlogPost.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .lean();
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
}

export const metadata = {
  title: "The Blog | Store",
  description: "Read our latest articles.",
};

// Enable ISR to cache the page at the Edge and prevent DB crashes under load
export const revalidate = 60;

const BlogListingPage = async () => {
  const posts: any = await getBlogs();

  return (
    <div className="w-full flex-1">
      {/* ── Header Container ── */}
      <div className="border-2 border-[#e4e4e4] p-2.5 m-2.5 mb-12">
        <div className="bg-[#eeeeee] flex flex-col justify-center px-8 md:px-[140px] gap-4 h-[240px] md:h-[440px]">
          <h2 className="text-[37px] md:text-[60px] font-bold uppercase text-black leading-tight">
            The Blog
          </h2>
          
          <div className="flex flex-wrap gap-4 mt-2">
            {["ALL", "COMPANY", "FASHION", "STYLE", "TRENDS", "BEAUTY"].map((cat, idx) => (
              <div
                key={cat}
                className={`relative text-[16px] font-semibold cursor-pointer group ${
                  idx === 0 ? "text-black" : "text-[#767676] hover:text-black"
                }`}
              >
                {cat}
                {idx === 0 && (
                  <span className="absolute left-0 -bottom-1.5 w-[60%] border-b-2 border-black" />
                )}
                {idx !== 0 && (
                  <span className="absolute left-0 -bottom-1.5 w-0 border-b-2 border-black transition-all duration-200 ease-out group-hover:w-[60%]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Blog Post Grid ── */}
      <div className="px-4 sm:px-[60px] lg:px-[160px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[30px] gap-y-[50px]">
        {posts.map((post: any) => (
          <div key={post._id.toString()} className="flex flex-col gap-5">
            {/* Thumbnail */}
            <div className="w-full aspect-[4/3] relative overflow-hidden bg-neutral-100">
              <Link href={`/blogs/${post.slug}`} className="block w-full h-full">
                <Image
                  src={post.featuredImage.url}
                  alt={post.featuredImage.alt || post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </Link>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2.5">
              <div className="flex gap-[30px] text-[14px] text-[#767676] uppercase">
                <p>by {post.author?.name || "admin"}</p>
                <p>
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="mt-1">
                <Link href={`/blogs/${post.slug}`} className="text-black text-[18px] font-medium hover:underline">
                  {post.title}
                </Link>
              </div>
              
              <div className="text-[14px] text-black/80 mt-1 line-clamp-3">
                <p>{post.excerpt}</p>
              </div>
              
              <div className="mt-2">
                <Link 
                  href={`/blogs/${post.slug}`}
                  className="text-[14px] uppercase text-black font-medium relative inline-block group"
                >
                  Continue Reading
                  <span className="absolute left-0 -bottom-1.5 w-[70%] border-b-2 border-black transition-all duration-200 ease-out group-hover:w-full" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="col-span-full py-20 text-center text-neutral-500">
            <p>No blog posts found.</p>
          </div>
        )}
      </div>

      {posts.length > 0 && (
        <div className="text-center text-[14px] font-medium uppercase mt-[60px] mb-[60px] cursor-pointer hover:text-neutral-600 transition-colors">
          Show More
        </div>
      )}
    </div>
  );
};

export default BlogListingPage;
