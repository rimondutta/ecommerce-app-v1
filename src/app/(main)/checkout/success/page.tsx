"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Package, Truck, Calendar, ShoppingBag } from "lucide-react";
import { Suspense } from "react";
import { motion } from "framer-motion";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-24 h-24 mb-8 bg-green-50 text-green-500 rounded-full flex items-center justify-center"
      >
         <CheckCircle2 size={48} strokeWidth={2} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl lg:text-6xl font-semibold tracking-tight text-neutral-900 mb-4">
            Order Confirmed
        </h1>
        <p className="text-neutral-700 max-w-lg mx-auto text-sm lg:text-base mb-12">
            Your order <span className="font-bold text-neutral-900">#{orderId?.slice(-8).toUpperCase()}</span> has been placed successfully. We've sent a confirmation email to your gateway.
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-16"
      >
         <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col items-center gap-4 group hover:shadow-xl hover:shadow-neutral-200/50 transition-all">
            <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-600 group-hover:bg-black group-hover:text-white transition-colors">
                <Package size={20} strokeWidth={1.5} />
            </div>
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">Processing</h3>
                <p className="text-[10px] text-neutral-600 uppercase tracking-widest mt-1 font-bold">2-4 Hours</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col items-center gap-4 group hover:shadow-xl hover:shadow-neutral-200/50 transition-all">
            <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-600 group-hover:bg-black group-hover:text-white transition-colors">
                <Truck size={20} strokeWidth={1.5} />
            </div>
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">Delivery</h3>
                <p className="text-[10px] text-neutral-600 uppercase tracking-widest mt-1 font-bold">48-72 Hours</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col items-center gap-4 group hover:shadow-xl hover:shadow-neutral-200/50 transition-all">
            <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-600 group-hover:bg-black group-hover:text-white transition-colors">
                <Calendar size={20} strokeWidth={1.5} />
            </div>
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">Estimated</h3>
                <p className="text-[10px] text-neutral-600 uppercase tracking-widest mt-1 font-bold">Soon</p>
            </div>
         </div>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
         <Link href="/shop" className="px-10 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all rounded-full flex items-center gap-3">
            Continue Shopping <ArrowRight size={16} />
         </Link>
         <Link href="/account" className="px-10 py-4 border border-neutral-200 text-neutral-900 text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all rounded-full flex items-center gap-3">
            View Order <ShoppingBag size={16} />
         </Link>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
