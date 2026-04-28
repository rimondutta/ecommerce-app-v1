import React from 'react';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Product from '@/models/Product';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';

async function getBlogPost(slug: string) {
  await dbConnect();
  return await BlogPost.findOne({ slug, isPublished: true }).lean();
}

async function getRelatedProducts(category: string) {
  await dbConnect();
  // Fetch some products from the same category or just featured ones
  return await Product.find({ isPublished: true }).limit(4).lean();
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

  const relatedProducts = await getRelatedProducts(post.category);

  return (
    <div className="min-h-screen bg-[#f0ece5] relative z-10">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <main className="pt-8 pb-24 relative z-10">
        {/* Progress Bar Mockup */}
        <div className="fixed top-0 left-0 w-1/3 h-1 bg-black z-[100]"></div>

        {/* Hero Section */}
        <div className="relative w-full h-[50vh] md:h-[70vh] bg-[#f0ece5] border-y border-black overflow-hidden mt-20">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            fill
            className="object-cover opacity-60 grayscale mix-blend-multiply"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="max-w-[1000px] text-center bg-white/90 p-6 md:p-12 border border-black backdrop-blur-sm">
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className="px-4 py-1.5 border border-black bg-black text-[#f0ece5] font-mono text-[9px] font-black uppercase tracking-[0.2em]">
                  DIR_{post.category}
                </span>
                <span className="text-black font-mono text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border border-black bg-white px-3 py-1.5">
                  <Clock className="w-3 h-3" /> READ_T_{post.readingTime}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-8xl font-black text-black uppercase leading-[0.9] tracking-tighter mb-12">
                {post.title}
              </h1>
              <div className="flex items-center justify-center gap-6 text-black border-t border-black pt-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 overflow-hidden border border-black grayscale">
                    {post.author.avatar && (
                      <Image src={post.author.avatar} alt={post.author.name} width={40} height={40} className="object-cover" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest">USR_{post.author.name}</span>
                </div>
                <div className="w-[1px] h-8 bg-black"></div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-widest">
                  SYS_DATE: {new Date(post.publishedAt).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <article className="max-w-[800px] mx-auto px-6 pt-24 pb-32">
          {/* Back Action */}
          <Link href="/blogs" className="inline-flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-widest mb-16 border border-black px-4 py-2 bg-white hover:bg-black hover:text-[#f0ece5] transition-colors">
            <ArrowLeft className="w-4 h-4" /> REVERT_TO_INDEX
          </Link>

          <div className="prose prose-stone max-w-none font-medium leading-loose text-black marker:text-black prose-p:font-mono prose-p:text-[13px] prose-p:uppercase prose-p:tracking-wider prose-headings:font-display prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-h1:text-5xl prose-h2:text-4xl">
            {/* Simple content rendering for now - assuming markdown segments split by double newline */}
            {post.content.split('\n\n').map((paragraph: string, i: number) => {
              if (paragraph.startsWith('# ')) {
                return <h1 key={i} className="mb-8 mt-12 border-b border-black pb-4">{paragraph.replace('# ', '')}</h1>;
              }
              if (paragraph.startsWith('## ')) {
                return <h2 key={i} className="mb-6 mt-8">{paragraph.replace('## ', '')}</h2>;
              }
              return <p key={i} className="mb-8">{paragraph}</p>;
            })}
          </div>

          {/* Social Share & Tags */}
          <div className="mt-20 pt-12 border-t border-black flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-4">
              {post.tags.map((tag: string) => (
                <span key={tag} className="font-mono text-[9px] font-black text-black uppercase tracking-widest border border-black bg-white px-3 py-1">
                  TAG_{tag}
                </span>
              ))}
            </div>
            <button className="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-widest py-3 px-8 border border-black bg-white hover:bg-black hover:text-[#f0ece5] transition-colors">
              <Share2 className="w-4 h-4" /> DISSEMINATE_DATA
            </button>
          </div>
        </article>

        {/* Related Products Section */}
        <section className="bg-white py-24 px-6 border-t border-black">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <span className="w-12 h-[1px] bg-black"></span>
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-black">SYS_INTEGRATION</span>
              <h3 className="font-display text-3xl font-black uppercase tracking-tighter ml-4">FEATURED_COMPONENTS</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((product: any) => (
                <Link key={product._id} href={`/products/${product.slug}`} className="group block border border-black p-4 bg-[#f0ece5] hover:bg-black hover:text-[#f0ece5] transition-colors">
                  <div className="relative aspect-[4/5] bg-white border border-black overflow-hidden mb-4">
                    <Image
                      src={product.images[0]?.url || '/placeholder-product.jpg'}
                      alt={product.title}
                      fill
                      className="object-cover grayscale mix-blend-multiply group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h4 className="font-display font-black uppercase tracking-tight mb-1">{product.title}</h4>
                  <p className="font-mono text-[10px] font-bold tracking-widest">USD_{product.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SingleBlogPage;
