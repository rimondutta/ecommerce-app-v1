"use client"

import React from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24 px-6 md:px-16 flex-1">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/50 text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-6"
          >
            <MessageSquare size={12} />
            Connect With Us
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold text-zinc-900 tracking-tight leading-none mb-8"
          >
            Reach Our <br/>
            <span className="text-zinc-400 italic">Collective Bureau</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed"
          >
            Whether you have a technical inquiry or a collaboration proposal, our team is ready to assist you in navigating the OUTFIT ecosystem.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-100 shadow-soft"
          >
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">First Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Alex"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Rivera"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Email Address</label>
                <input 
                  type="email" 
                  placeholder="alex@collective.com"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Order ID [Optional]</label>
                <input 
                  type="text" 
                  placeholder="#ORD_XXXXXXXX"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Message</label>
                <textarea 
                  rows={6} 
                  placeholder="How can we help you today?"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-[2rem] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all resize-none placeholder:text-zinc-300"
                ></textarea>
              </div>

              <button className="group w-full md:w-auto px-10 py-5 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-soft hover:shadow-soft-xl">
                Send Message
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-4 space-y-12"
          >
            <div className="space-y-10">
              <div className="flex gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shadow-soft group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Email Us</h3>
                  <p className="text-zinc-900 font-medium">transmission@flexwear.com</p>
                  <p className="text-zinc-500 text-sm">Response within 24 hours</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shadow-soft group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Call Us</h3>
                  <p className="text-zinc-900 font-medium">+1.800.555.0199</p>
                  <p className="text-zinc-500 text-sm">Mon-Fri, 9am - 6pm EST</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shadow-soft group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Studio</h3>
                  <p className="text-zinc-900 font-medium">784 Technical Blvd</p>
                  <p className="text-zinc-500 text-sm">LND / NYC / TKY</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-zinc-900 text-white space-y-6 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-xl font-display font-bold mb-2">Global Presence</h4>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">Our distribution network spans across 40+ countries, ensuring performance gear reaches you wherever you train.</p>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                  <Globe size={14} />
                  Worldwide Shipping Available
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
