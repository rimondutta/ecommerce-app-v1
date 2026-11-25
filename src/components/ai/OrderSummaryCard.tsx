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
    <div className="bg-[#FAF8F5] border border-[#EAE3D8] rounded-2xl p-3.5 space-y-3 font-bengali text-[#2C2416]">
      <div className="flex items-center justify-between border-b border-[#EFEAE2] pb-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConfirmed ? 'bg-emerald-500' : 'bg-[#5428D8]'
            }`}
          />
          <span className="text-xs font-bold text-[#2C2416]">
            {isConfirmed ? 'অর্ডার প্রস্তুত ও গৃহীত' : 'অর্ডার সামারি'}
          </span>
        </div>
        <span className="text-[11px] text-[#7A6E62] bg-white px-2 py-0.5 rounded-full border border-[#EFEAE2] font-medium">
          ক্যাশ অন ডেলিভারি
        </span>
      </div>

      {/* Product Info */}
      <div className="flex gap-3 items-center">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#EAE3D8] shrink-0">
          {summary.image ? (
            <Image
              src={summary.image}
              alt={summary.title}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#9A8F83]">
              <Package size={20} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-bold text-[#2C2416] truncate">{summary.title}</h4>
          {summary.variationLabel && (
            <p className="text-xs text-[#7A6E62] font-medium mt-0.5">
              ভ্যারিয়েশন: {summary.variationLabel}
            </p>
          )}
          <p className="text-xs text-[#7A6E62] mt-0.5">
            পরিমাণ: <span className="font-semibold text-[#2C2416]">{summary.quantity} টি</span> × ৳
            {summary.unitPrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Customer & Address Details */}
      {(summary.customerName || summary.shippingAddress) && (
        <div className="bg-white rounded-xl p-2.5 space-y-1.5 text-xs text-[#5E5449] border border-[#EFEAE2]">
          {summary.customerName && (
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-[#9A8F83] shrink-0" />
              <span className="truncate">
                {summary.customerName} {summary.customerPhone ? `(${summary.customerPhone})` : ''}
              </span>
            </div>
          )}
          {summary.shippingAddress && (
            <div className="flex items-start gap-1.5">
              <MapPin size={13} className="text-[#9A8F83] shrink-0 mt-0.5" />
              <span className="leading-snug">{summary.shippingAddress}</span>
            </div>
          )}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-1.5 text-xs border-t border-[#EFEAE2] pt-2.5 text-[#7A6E62]">
        <div className="flex justify-between">
          <span>পণ্যের সাবটোটাল:</span>
          <span className="text-[#2C2416] font-medium">৳{summary.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Truck size={12} className="text-[#9A8F83]" />
            ডেলিভারি চার্জ ({summary.shippingZone === 'inside_dhaka' ? 'ঢাকা সিটি' : 'ঢাকার বাইরে'}):
          </span>
          <span
            className={
              summary.shippingCost === 0
                ? 'text-emerald-600 font-bold'
                : 'text-[#2C2416] font-medium'
            }
          >
            {summary.shippingCost === 0 ? 'ফ্রি' : `৳${summary.shippingCost}`}
          </span>
        </div>
        {summary.discountAmount && summary.discountAmount > 0 ? (
          <div className="flex justify-between text-emerald-700 font-semibold">
            <span>কুপন ডিসকাউন্ট {summary.couponCode ? `(${summary.couponCode})` : ''}:</span>
            <span>-৳{summary.discountAmount.toLocaleString()}</span>
          </div>
        ) : null}
        <div className="flex justify-between items-center text-[13px] font-bold text-[#2C2416] pt-2 border-t border-[#EAE3D8]">
          <span>সর্বমোট প্রদেয়:</span>
          <span className="text-[#5428D8] text-base font-extrabold">
            ৳{summary.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
