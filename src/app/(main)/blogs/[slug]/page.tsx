import React from 'react';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Product from '@/models/Product';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-24">
        {/* Progress Bar Mockup */}
        <div className="fixed top-0 left-0 w-1/3 h-1 bg-black z-[100]"></div>

        {/* Hero Section */}
        <div className="relative w-full h-[70vh] bg-black overflow-hidden mt-20">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            fill
            className="object-cover opacity-60 grayscale"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="max-w-[1000px] text-center">
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className="px-4 py-1.5 bg-white text-black text-xs font-black uppercase tracking-[0.2em]">
                  {post.category}
                </span>
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {post.readingTime}
                </span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-white uppercase leading-[0.9] tracking-tighter mb-12">
                {post.title}
              </h1>
              <div className="flex items-center justify-center gap-6 text-white/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden border-2 border-white/20">
                    {post.author.avatar && (
                        <Image src={post.author.avatar} alt={post.author.name} width={40} height={40} className="object-cover" />
                    )}
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest">{post.author.name}</span>
                </div>
                <div className="w-[1px] h-8 bg-white/20"></div>
                <span className="text-sm font-medium uppercase tracking-widest">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <article className="max-w-[800px] mx-auto px-6 pt-24 pb-32">
          {/* Back Action */}
          <Link href="/blogs" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest mb-16 hover:gap-5 transition-all">
            <ArrowLeft className="w-4 h-4" /> Return to Journal
          </Link>

          <div className="prose prose-xl prose-stone max-w-none">
            {/* Simple content rendering for now - assuming markdown segments split by double newline */}
            {post.content.split('\n\n').map((paragraph: string, i: number) => {
              if (paragraph.startsWith('# ')) {
                return <h1 key={i} className="text-4xl font-black uppercase tracking-tighter mb-8 mt-12">{paragraph.replace('# ', '')}</h1>;
              }
              if (paragraph.startsWith('## ')) {
                return <h2 key={i} className="text-3xl font-black uppercase tracking-tighter mb-6 mt-8">{paragraph.replace('## ', '')}</h2>;
              }
              return <p key={i} className="text-xl text-gray-700 leading-relaxed mb-8">{paragraph}</p>;
            })}
          </div>

          {/* Social Share & Tags */}
          <div className="mt-20 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-4">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1">
                  #{tag}
                </span>
              ))}
            </div>
            <button className="flex items-center gap-3 text-sm font-black uppercase tracking-widest py-3 px-8 border-2 border-black hover:bg-black hover:text-white transition-all">
              <Share2 className="w-4 h-4" /> Disseminate Dispatch
            </button>
          </div>
        </article>

        {/* Related Products Section */}
        <section className="bg-gray-50 py-24 px-6 border-t border-gray-100">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <span className="w-12 h-[1px] bg-black"></span>
              <span className="text-xs font-black uppercase tracking-[0.4em]">Integrated Registry</span>
              <h3 className="text-3xl font-black uppercase tracking-tighter ml-4">Featured Components</h3>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((product: any) => (
                <Link key={product._id} href={`/products/${product.slug}`} className="group">
                  <div className="relative aspect-[4/5] bg-white overflow-hidden mb-4">
                    <Image
                      src={product.images[0]?.url || '/placeholder-product.jpg'}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-tight mb-1">{product.title}</h4>
                  <p className="text-xs text-gray-500 font-bold">${product.price}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SingleBlogPage;
