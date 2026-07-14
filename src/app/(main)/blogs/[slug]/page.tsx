import React from 'react';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Product from '@/models/Product';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowLeft, Calendar, User, Clock, Star, ShoppingBag, ArrowRight } from 'lucide-react';

async function getBlogPost(slug: string) {
  try {
    await dbConnect();
    return await BlogPost.findOne({ slug, isPublished: true }).lean();
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return null;
  }
}

async function getRelatedProducts() {
  try {
    await dbConnect();
    return await Product.find({ isPublished: true }).limit(4).lean();
  } catch (error) {
    console.error("Failed to fetch related products:", error);
    return [];
  }
}

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

  const relatedProducts: any = await getRelatedProducts();

  return (
    <div className="min-h-screen bg-paper relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-halftone" />
      </div>

      <main className="pt-40 pb-32 relative z-10 px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Action */}
          <Link href="/blogs" className="inline-flex items-center gap-4 mb-12 group font-bangers text-3xl text-secondary hover:text-ink transition-colors uppercase tracking-tight">
             <ArrowLeft size={32} /> BACK TO ARCHIVES
          </Link>

          {/* Hero Section */}
          <div className="relative w-full aspect-[21/9] border-4 border-ink bg-white overflow-hidden mb-16 cartoon-shadow-lg rotate-[-1deg]">
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              fill
              sizes="100vw"
              className="object-cover transition-all duration-700 group-hover:scale-105"
              priority
            />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-ink/60 backdrop-blur-[2px]">
              <div className="bg-white border-4 border-ink px-6 py-2 cartoon-shadow-xs rotate-2 mb-8">
                <span className="font-bebas text-2xl text-ink tracking-[0.2em] uppercase">
                  {post.category} ★ {post.readingTime}M READ
                </span>
              </div>
              <h1 className="font-bangers text-5xl md:text-8xl text-white uppercase leading-none tracking-tight mb-8 max-w-4xl drop-shadow-[6px_6px_0px_#000]">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-8 font-bebas text-2xl text-white/80 tracking-widest uppercase border-t-2 border-white/20 pt-8">
                <div className="flex items-center gap-3">
                  <User size={24} className="text-secondary" />
                  <span className="text-white">AUTHOR: {post.author.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={24} className="text-secondary" />
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <article className="max-w-4xl mx-auto bg-white border-4 border-ink p-10 md:p-20 cartoon-shadow-lg relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-halftone opacity-5 pointer-events-none" />

            <div className="font-comic font-bold italic text-xl md:text-2xl text-ink/80 leading-relaxed space-y-12 relative z-10">
              {post.content.split('\n\n').map((paragraph: string, i: number) => {
                if (paragraph.startsWith('# ')) {
                  return (
                    <div key={i} className="pt-12 mb-8">
                       <h1 className="font-bangers text-5xl md:text-7xl text-ink border-b-4 border-ink pb-6 uppercase tracking-tight inline-block rotate-[-1deg]">
                        {paragraph.replace('# ', '')}
                      </h1>
                    </div>
                  );
                }
                if (paragraph.startsWith('## ')) {
                  return (
                    <div key={i} className="pt-8 mb-6">
                      <h2 className="font-bangers text-4xl text-secondary uppercase tracking-tight">
                        // {paragraph.replace('## ', '')}
                      </h2>
                    </div>
                  );
                }
                return (
                  <p key={i} className="relative pl-10">
                    <Star className="absolute left-0 top-2 text-secondary fill-secondary" size={24} />
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Tags */}
            <div className="mt-20 pt-12 border-t-4 border-ink flex flex-wrap gap-4 relative z-10">
              {post.tags?.map((tag: string) => (
                 <span key={tag} className="font-bebas text-xl text-ink border-3 border-ink bg-paper px-4 py-2 uppercase tracking-widest hover:bg-secondary hover:text-white transition-all cartoon-shadow-xs rotate-[-2deg]">
                   #{tag}
                 </span>
              ))}
            </div>
          </article>

          {/* Related Products */}
          <section className="mt-32 pt-24 border-t-4 border-ink relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-ink text-paper border-4 border-ink px-10 py-4 cartoon-shadow rotate-1">
               <h3 className="font-bangers text-4xl uppercase tracking-tight leading-none flex items-center gap-4">
                 <ShoppingBag size={32} /> RELATED GEAR
               </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((product: any, idx: number) => (
                 <Link 
                  key={product._id.toString()} 
                  href={`/products/${product.slug}`} 
                  className="group block bg-white border-4 border-ink p-6 cartoon-shadow-sm hover:translate-y-[-8px] transition-all"
                  style={{ transform: `rotate(${idx % 2 === 0 ? '-1.5deg' : '1.5deg'})` }}
                >
                   <div className="relative aspect-square bg-surface border-2 border-ink overflow-hidden mb-6">
                     <Image
                       src={product.images[0]?.url || '/placeholder-product.jpg'}
                       alt={product.title}
                       fill
                       sizes="(max-width: 768px) 50vw, 25vw"
                       className="object-cover transition-transform duration-700 group-hover:scale-110"
                     />
                   </div>
                   <h4 className="font-bangers text-2xl text-ink uppercase tracking-tight mb-2 truncate group-hover:text-secondary">{product.title}</h4>
                   <div className="flex items-center justify-between">
                      <p className="font-bangers text-3xl text-secondary">৳{Math.round(product.price).toLocaleString()}</p>
                      <ArrowRight size={20} className="text-ink group-hover:translate-x-2 transition-transform" />
                   </div>
                 </Link>
              ))}
            </div>
            
            <div className="mt-20 text-center">
               <Link href="/products">
                  <Button size="lg">VIEW ALL GEAR</Button>
               </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SingleBlogPage;
