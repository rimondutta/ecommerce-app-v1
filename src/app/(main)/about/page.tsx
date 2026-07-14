import React from "react";
import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";

import Button from "@/components/ui/Button";

export const metadata = {
  title: "OUR STORY | INK & THREAD",
  description: "The origin story of the world's most fearless streetwear manga.",
};

export default function AboutPage() {
  return (
    <div className="bg-paper min-h-screen">
      {/* Hero Header */}
      <section className="relative pt-20 pb-32 px-6 md:px-12 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none" />
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            
            <h1 className="font-bangers text-7xl md:text-9xl text-ink leading-none text-ink-shadow uppercase">
              THE ORIGIN<br />CHAPTER 01
            </h1>
            <p className="font-comic text-2xl md:text-3xl font-bold italic text-secondary max-w-3xl">
              "We didn't just want to make clothes. We wanted to write a legend."
            </p>
          </div>
        </div>
      </section>

      

      {/* Chapter 01: The Spark */}
      <section className="py-24 px-6 md:px-12">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <span className="font-bebas text-3xl tracking-widest text-secondary">// PANEL 01: THE VISION</span>
              <h2 className="font-bangers text-6xl text-ink uppercase">BORN FROM THE INK</h2>
              <div className="h-2 w-32 bg-ink -rotate-1" />
            </div>
            
            <div className="prose prose-2xl font-comic font-bold italic text-secondary leading-relaxed space-y-8">
              <p>
                In a small studio filled with the scent of fresh markers and espresso, Ink & Thread was born. 
                Our founders weren't designers in the traditional sense—they were storytellers. 
                They saw every t-shirt as a blank manga panel, every hoodie as a canvas for a character's journey.
              </p>
              <p>
                The idea was simple: Streetwear shouldn't just be about brands; it should be about narratives. 
                Wearable art that feels like you've just stepped out of a high-octane shonen series.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 relative group">
            <div className="absolute inset-0 bg-speed-lines opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />
            <Card className="aspect-square rotate-3 relative overflow-hidden">
               <Image 
                src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800" 
                alt="Artist Sketching" 
                fill 
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
               />
               <div className="absolute top-4 left-4">
                 
               </div>
            </Card>
            <div className="absolute -bottom-6 -right-6">
              
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 02: The Philosophy */}
      <section className="py-24 px-6 md:px-12 bg-ink text-paper relative overflow-hidden">
        <div className="absolute inset-0 bg-crosshatch opacity-10 pointer-events-none" />
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <h2 className="font-bangers text-7xl md:text-8xl text-paper-shadow uppercase">OUR NINDO — THE WAY</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="text-6xl text-secondary">✦</div>
                <h3 className="font-bebas text-3xl tracking-widest">FEARLESS STYLE</h3>
                <p className="font-comic italic opacity-80 text-lg">We don't follow trends. We draw them ourselves.</p>
              </div>
              <div className="space-y-4">
                <div className="text-6xl text-secondary">★</div>
                <h3 className="font-bebas text-3xl tracking-widest">PREMIUM INK</h3>
                <p className="font-comic italic opacity-80 text-lg">Highest quality fabrics that feel as good as they look.</p>
              </div>
              <div className="space-y-4">
                <div className="text-6xl text-secondary">⚡</div>
                <h3 className="font-bebas text-3xl tracking-widest">TRUE LEGACY</h3>
                <p className="font-comic italic opacity-80 text-lg">Every drop is a limited volume. Once it's gone, it's history.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 03: The Crew */}
      <section className="py-32 px-6 md:px-12 bg-white">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="relative order-2 lg:order-1">
             <div className="grid grid-cols-2 gap-6">
                <Card className="aspect-[3/4] -rotate-3">
                   <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400" alt="Team member" fill sizes="(max-width: 1024px) 50vw, 20vw" className="object-cover" />
                </Card>
                <Card className="aspect-[3/4] rotate-6 translate-y-12">
                   <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400" alt="Team member" fill sizes="(max-width: 1024px) 50vw, 20vw" className="object-cover" />
                </Card>
             </div>
             <div className="absolute -top-10 -left-10 font-bangers text-8xl text-ink/5 select-none -z-10">THE CREW</div>
           </div>

           <div className="space-y-10 order-1 lg:order-2">
             <div className="space-y-4">
                <span className="font-bebas text-3xl tracking-widest text-secondary">// PANEL 03: THE SQUAD</span>
                <h2 className="font-bangers text-6xl text-ink uppercase">MEET THE ARTISTS</h2>
                <div className="h-2 w-32 bg-ink -rotate-1" />
              </div>
              <div className="prose prose-2xl font-comic font-bold italic text-secondary leading-relaxed">
                <p>
                  Behind every stitch is a team of fanatics. We are artists, skaters, gamers, and comic book nerds 
                  who believe that what you wear is the ultimate form of self-expression.
                </p>
                <p>
                  Based in Dhaka, Bangladesh, we're taking our ink to the global stage. 
                  Join the movement. Be the character you were meant to be.
                </p>
              </div>
              <Link href="/products" className="inline-block">
                <Button size="lg">EXPLORE THE ARCHIVE →</Button>
              </Link>
           </div>
        </div>
      </section>

      {/* Final Call */}
      <section className="py-32 bg-surface text-center">
        <div className="container mx-auto px-6 space-y-12">
          <h2 className="font-bangers text-6xl md:text-8xl text-ink uppercase italic">TO BE CONTINUED...</h2>
          <p className="font-comic text-2xl font-bold italic text-secondary max-w-2xl mx-auto">
            This is only the first volume. The Ink & Thread saga is just getting started. 
            Are you ready for the next drop?
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/products">
              <Button size="xl">SHOP VOL. 01</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
