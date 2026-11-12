"use client";

import React from 'react';
import Image from 'next/image';
import { OrderSummaryData } from '@/lib/ai/orderAgent';
import { Package, Truck, User, MapPin } from 'lucide-react';

interface OrderSummaryCardProps {
  summary: OrderSummaryData;
  isConfirmed?: boolean;
}

export default function OrderSummaryCard({ summary, isConfirmed }: OrderSummaryCardProps) {
  return (
    <div className="bg-white border-2 border-emerald-500/20 rounded-2xl p-4 shadow-sm space-y-3 font-bengali text-joy-navy">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            {isConfirmed ? 'অর্ডার প্রস্তুত ও গৃহীত' : 'অর্ডার সামারি'}
          </span>
        </div>
        <span className="text-xs text-gray-500 font-medium">ক্যাশ অন ডেলিভারি</span>
      </div>

      {/* Product Info */}
      <div className="flex gap-3 items-center">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shrink-0">
          {summary.image ? (
            <Image
              src={summary.image}
              alt={summary.title}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package size={24} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 truncate">{summary.title}</h4>
          {summary.variationLabel && (
            <p className="text-xs text-purple-700 font-medium mt-0.5">
              ভ্যারিয়েশন: {summary.variationLabel}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">
            পরিমাণ: <span className="font-semibold text-gray-800">{summary.quantity} টি</span> × ৳
            {summary.unitPrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Customer & Address Details */}
      {(summary.customerName || summary.shippingAddress) && (
        <div className="bg-gray-50 rounded-xl p-2.5 space-y-1.5 text-xs text-gray-600">
          {summary.customerName && (
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-gray-400 shrink-0" />
              <span className="truncate">
                {summary.customerName} {summary.customerPhone ? `(${summary.customerPhone})` : ''}
              </span>
            </div>
          )}
          {summary.shippingAddress && (
            <div className="flex items-start gap-1.5">
              <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{summary.shippingAddress}</span>
            </div>
          )}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-1 text-xs border-t border-gray-100 pt-2 text-gray-600">
        <div className="flex justify-between">
          <span>পণ্যের সাবটোটাল:</span>
          <span>৳{summary.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Truck size={12} className="text-gray-400" />
            ডেলিভারি চার্জ ({summary.shippingZone === 'inside_dhaka' ? 'ঢাকা সিটি' : 'ঢাকার বাইরে'}):
          </span>
          <span className={summary.shippingCost === 0 ? 'text-emerald-600 font-bold' : ''}>
            {summary.shippingCost === 0 ? 'ফ্রি' : `৳${summary.shippingCost}`}
          </span>
        </div>
        {summary.discountAmount && summary.discountAmount > 0 ? (
          <div className="flex justify-between text-emerald-700 font-semibold">
            <span>কুপন ডিসকাউন্ট {summary.couponCode ? `(${summary.couponCode})` : ''}:</span>
            <span>-৳{summary.discountAmount.toLocaleString()}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-dashed border-gray-200">
          <span>সর্বমোট প্রদেয়:</span>
          <span className="text-emerald-700 text-base">৳{summary.totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

