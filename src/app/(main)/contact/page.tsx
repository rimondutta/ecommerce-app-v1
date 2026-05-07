"use client";

import React from 'react';
import CartoonButton from '@/components/ui/CartoonButton';
import CartoonInput from '@/components/ui/CartoonInput';
import { Send, Mail, Phone, MapPin, Globe } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper pt-40 pb-32 px-8 md:px-16 flex-1 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-halftone" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-crosshatch opacity-20 -rotate-12 translate-x-20" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="max-w-4xl mb-24 space-y-8">
          <div className="inline-block px-4 py-2 bg-ink text-paper border-2 border-ink rotate-[-2deg]">
            <span className="font-bebas text-2xl tracking-[0.2em] uppercase">
              COMMUNICATION HUB
            </span>
          </div>
          <h1 className="font-bangers text-7xl md:text-9xl text-ink uppercase leading-none tracking-tight">
            SEND A <br />
            <span className="text-secondary drop-shadow-[6px_6px_0px_#000]">SIGNAL</span>
          </h1>
          <p className="font-comic font-bold italic text-2xl text-ink/60 leading-relaxed max-w-3xl">
            Whether you have a technical inquiry or a collaboration proposal, our frequency is open for your transmission.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Contact Form */}
          <div className="lg:col-span-7 space-y-12 p-10 md:p-16 bg-white border-4 border-ink cartoon-shadow-lg relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-halftone opacity-5 pointer-events-none" />

            <form className="space-y-10 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <CartoonInput label="FIRST NAME" placeholder="BRUCE" required />
                <CartoonInput label="LAST NAME" placeholder="WAYNE" required />
              </div>

              <CartoonInput label="EMAIL ADDRESS" type="email" placeholder="AGENT@INKANDTHREAD.COM" required />
              
              <CartoonInput label="DOSSIER ID (OPTIONAL)" placeholder="#ORD_XXXXXXXX" />

              <div className="space-y-4">
                <label className="font-bebas text-2xl text-ink tracking-widest uppercase">
                  TRANSMISSION BODY
                </label>
                <div className="relative">
                   <textarea 
                    rows={6} 
                    placeholder="ENTER YOUR INTEL HERE..."
                    className="w-full bg-paper border-3 border-ink p-6 font-comic font-bold text-xl italic cartoon-shadow-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <CartoonButton size="lg" className="w-full md:w-auto">
                SEND SIGNAL <Send className="ml-3" size={24} />
              </CartoonButton>
            </form>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-16">
            <div className="space-y-12">
              <div className="space-y-4 group">
                <div className="flex items-center gap-3">
                   <Mail className="text-ink" size={24} />
                   <h3 className="font-bebas text-2xl text-secondary uppercase tracking-widest">// EMAIL_US</h3>
                </div>
                <p className="font-bangers text-4xl text-ink hover:text-secondary transition-colors cursor-pointer tracking-tight">intel@inkandthread.com</p>
                <p className="font-comic font-bold italic text-lg text-ink/40">Response latency: &lt; 24h</p>
              </div>

              <div className="space-y-4 group">
                <div className="flex items-center gap-3">
                   <Phone className="text-ink" size={24} />
                   <h3 className="font-bebas text-2xl text-secondary uppercase tracking-widest">// VOICE_LINE</h3>
                </div>
                <p className="font-bangers text-4xl text-ink tracking-tight">+1.800.INK.THREAD</p>
                <p className="font-comic font-bold italic text-lg text-ink/40">Active: 09:00 - 18:00 EST</p>
              </div>

              <div className="space-y-4 group">
                <div className="flex items-center gap-3">
                   <MapPin className="text-ink" size={24} />
                   <h3 className="font-bebas text-2xl text-secondary uppercase tracking-widest">// PHYSICAL_NODE</h3>
                </div>
                <p className="font-bangers text-4xl text-ink tracking-tight">INK QUARTERS, NYC</p>
                <p className="font-comic font-bold italic text-lg text-ink/40">Districts: LND / NYC / TKY</p>
              </div>
            </div>

            {/* Global Presence Card */}
            <div className="p-10 border-4 border-ink bg-ink text-paper cartoon-shadow space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rotate-45 translate-x-16 -translate-y-16" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <Globe size={32} />
                  <h4 className="font-bangers text-4xl uppercase tracking-tight">GLOBAL NETWORK</h4>
                </div>
                <p className="font-comic font-bold italic text-xl leading-snug">
                  Our distribution network spans across all major sectors, ensuring gear reaches your coordinates.
                </p>
                <div className="flex items-center gap-4 bg-white text-ink px-4 py-2 font-bebas text-xl w-fit">
                  <div className="w-3 h-3 bg-ink animate-pulse" />
                  WORLDWIDE SHIPPING ACTIVE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
