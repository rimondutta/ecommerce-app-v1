"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import {
  Package,
  Truck,
  Heart,
  Wallet,
  ChevronRight,
  Download,
  MapPin,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { cn, getOptimizedCloudinaryUrl } from "@/lib/utils";
import OrderProgressBar from "./OrderProgressBar";
import {
  AccountOrder,
  AccountTabId,
  SavedAddress,
  formatCurrencyBDT,
  formatOrderRef,
  formatShortDate,
  getFulfillmentStyle,
  getPaymentStyle,
  isOrderActive,
} from "./types";

interface OverviewTabProps {
  orders: AccountOrder[];
  ordersLoading: boolean;
  wishlistCount: number;
  addresses: SavedAddress[];
  onSwitchTab: (tab: AccountTabId) => void;
  onInspectOrder: (orderId: string) => void;
}

export default function OverviewTab({
  orders,
  ordersLoading,
  wishlistCount,
  addresses,
  onSwitchTab,
  onInspectOrder,
}: OverviewTabProps) {
  const activeOrders = orders.filter(isOrderActive);
  const totalSpent = orders
    .filter((o) => (o.fulfillmentStatus || "").toLowerCase() !== "cancelled")
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  const spotlightOrder = activeOrders[0] || orders[0] || null;
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

  const kpiCards = [
    {
      label: "Total Orders",
      value: ordersLoading ? "—" : orders.length.toLocaleString(),
      sublabel: orders.length > 0 ? "Lifetime purchases" : "Ready for first toy",
      icon: Package,
      iconBg: "bg-[#F3F0FE] text-[#5428D8]",
      accentHover: "hover:border-[#5428D8]/30",
      onClick: () => onSwitchTab("orders"),
    },
    {
      label: "Active Deliveries",
      value: ordersLoading ? "—" : activeOrders.length.toLocaleString(),
      sublabel: activeOrders.length > 0 ? "Currently on the way" : "All orders completed",
      icon: Truck,
      iconBg: "bg-sky-50 text-sky-600",
      accentHover: "hover:border-sky-300",
      onClick: () => onSwitchTab("orders"),
    },
    {
      label: "Total Spent",
      value: ordersLoading ? "—" : formatCurrencyBDT(totalSpent),
      sublabel: "Completed & active orders",
      icon: Wallet,
      iconBg: "bg-emerald-50 text-emerald-600",
      accentHover: "hover:border-emerald-300",
      onClick: () => onSwitchTab("orders"),
    },
    {
      label: "Saved Wishlist",
      value: wishlistCount.toLocaleString(),
      sublabel: wishlistCount === 1 ? "Favorite toy saved" : "Favorite toys saved",
      icon: Heart,
      iconBg: "bg-rose-50 text-rose-500",
      accentHover: "hover:border-rose-300",
      onClick: () => onSwitchTab("wishlist"),
    },
  ];

  return (
    <m.div
      key="overview"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* ─── Bento KPI Row ─── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <m.button
              key={card.label}
              type="button"
              onClick={card.onClick}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              className={cn(
                "group text-left bg-white/95 backdrop-blur-md rounded-[22px] border border-[#EDE4D8] p-4 sm:p-5",
                "shadow-[0_2px_10px_rgba(44,36,22,0.04)] hover:shadow-[0_10px_28px_rgba(84,40,216,0.08)]",
                "hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between",
                card.accentHover
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <span className="text-xs sm:text-[13px] font-semibold text-[#7A6E62]">
                  {card.label}
                </span>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105", card.iconBg)}>
                  <Icon size={17} strokeWidth={2.2} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-[26px] font-extrabold text-[#2C2416] tracking-tight tabular-nums leading-none">
                  {card.value}
                </div>
                <p className="text-[11px] font-medium text-[#9A8F83] mt-2 flex items-center justify-between">
                  <span className="truncate">{card.sublabel}</span>
                  <ChevronRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#5428D8] shrink-0" />
                </p>
              </div>
            </m.button>
          );
        })}
      </div>

      {/* ─── Featured Order Spotlight Card ─── */}
      {spotlightOrder ? (
        <div className="bg-white/95 backdrop-blur-md rounded-[26px] border border-[#EDE4D8] shadow-[0_4px_20px_rgba(44,36,22,0.05)] overflow-hidden">
          <div className="bg-gradient-to-r from-[#F3F0FE]/90 via-[#FBF4EB]/80 to-[#FEF3C7]/45 px-5 sm:px-7 py-4 border-b border-[#EDE4D8] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E4DCFC] flex items-center justify-center text-[#5428D8] shadow-xs shrink-0">
                <Sparkles size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5428D8]">
                  {activeOrders.length > 0 ? "Active Shipment Spotlight" : "Latest Order Summary"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-extrabold text-[#2C2416]">
                    {formatOrderRef(spotlightOrder)}
                  </span>
                  <span className="text-xs text-[#7A6E62]">
                    • Placed {formatShortDate(spotlightOrder.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(() => {
                const fStyle = getFulfillmentStyle(spotlightOrder.fulfillmentStatus);
                const pStyle = getPaymentStyle(spotlightOrder.paymentStatus);
                return (
                  <>
                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", fStyle.pillClass)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", fStyle.dotClass)} />
                      {fStyle.label}
                    </span>
                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", pStyle.pillClass)}>
                      {pStyle.label}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            <OrderProgressBar
              fulfillmentStatus={spotlightOrder.fulfillmentStatus}
              courierStatus={spotlightOrder.courierStatus}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#F3ECE2]">
              {/* Items Preview + Total */}
              <div className="flex items-center gap-3.5">
                <div className="flex -space-x-2.5 overflow-hidden">
                  {spotlightOrder.items?.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className="relative w-11 h-11 rounded-xl ring-2 ring-white border border-[#EDE4D8] bg-[#FBF4EB] overflow-hidden shrink-0"
                    >
                      <Image
                        src={getOptimizedCloudinaryUrl(item.image || "/placeholder.jpg", { width: 120 })}
                        alt={item.title || "Product"}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {(spotlightOrder.items?.length ?? 0) > 3 && (
                    <div className="w-11 h-11 rounded-xl ring-2 ring-white bg-[#F3F0FE] border border-[#E4DCFC] flex items-center justify-center text-xs font-bold text-[#5428D8]">
                      +{(spotlightOrder.items?.length ?? 0) - 3}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#7A6E62] truncate max-w-[240px]">
                    {spotlightOrder.items?.[0]?.title || "Toy Hourse Order"}
                    {(spotlightOrder.items?.length ?? 0) > 1
                      ? ` + ${(spotlightOrder.items?.length ?? 1) - 1} more`
                      : ""}
                  </p>
                  <p className="text-base sm:text-lg font-extrabold text-[#2C2416] tabular-nums">
                    {formatCurrencyBDT(spotlightOrder.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onInspectOrder(spotlightOrder._id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#2C2416] bg-[#FBF4EB] hover:bg-[#F3E9DB] rounded-xl border border-[#E8DDD0] transition-colors cursor-pointer"
                >
                  View Details
                </button>
                <Link
                  href={`/track-order?id=${encodeURIComponent(spotlightOrder.invoiceNumber || spotlightOrder._id)}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#5428D8] hover:bg-[#4318C4] rounded-xl shadow-[0_2px_10px_rgba(84,40,216,0.22)] transition-all"
                >
                  <Truck size={13} />
                  Track Live
                </Link>
                <a
                  href={`/api/orders/${spotlightOrder._id}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`Invoice-${spotlightOrder.invoiceNumber || spotlightOrder._id}.pdf`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#5428D8] bg-[#F3F0FE] hover:bg-[#E7E0FD] rounded-xl border border-[#DFD6FE] transition-colors"
                >
                  <Download size={13} />
                  Invoice
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : !ordersLoading ? (
        <div className="bg-white/95 backdrop-blur-md rounded-[26px] border border-[#EDE4D8] p-8 sm:p-10 text-center shadow-[0_4px_20px_rgba(44,36,22,0.04)]">
          <div className="w-16 h-16 rounded-2xl bg-[#F3F0FE] border border-[#DFD6FE] flex items-center justify-center text-[#5428D8] mx-auto mb-4">
            <ShoppingBag size={28} strokeWidth={1.8} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2C2416]">
            Your toy chest is waiting!
          </h3>
          <p className="text-sm text-[#7A6E62] mt-1.5 max-w-md mx-auto">
            You haven&apos;t placed any orders yet. Explore our playful collection and get fast nationwide delivery.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#5428D8] hover:bg-[#4318C4] text-white text-sm font-semibold px-6 py-3 shadow-[0_4px_14px_rgba(84,40,216,0.28)] transition-all hover:-translate-y-0.5"
          >
            Browse Toy Collection
            <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : null}

      {/* ─── Lower 2-Column Bento Split ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Orders List */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-[24px] border border-[#EDE4D8] p-5 sm:p-6 shadow-[0_2px_12px_rgba(44,36,22,0.04)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#2C2416]">Recent Orders</h3>
            <button
              type="button"
              onClick={() => onSwitchTab("orders")}
              className="text-xs font-semibold text-[#5428D8] hover:text-[#4318C4] flex items-center gap-1 cursor-pointer"
            >
              See all <ChevronRight size={14} />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <Package size={28} className="text-[#CFC2B2] mb-2" />
              <p className="text-sm font-medium text-[#7A6E62]">No recent orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3ECE2]">
              {orders.slice(0, 4).map((order) => {
                const fStyle = getFulfillmentStyle(order.fulfillmentStatus);
                return (
                  <button
                    key={order._id}
                    type="button"
                    onClick={() => onInspectOrder(order._id)}
                    className="w-full py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 text-left group hover:bg-[#FDF8F0]/70 -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-xl bg-[#FBF4EB] border border-[#EDE4D8] overflow-hidden shrink-0">
                        <Image
                          src={getOptimizedCloudinaryUrl(order.items?.[0]?.image || "/placeholder.jpg", { width: 100 })}
                          alt={order.items?.[0]?.title || "Order"}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#2C2416] truncate group-hover:text-[#5428D8] transition-colors">
                          {formatOrderRef(order)}
                        </p>
                        <p className="text-xs text-[#7A6E62] truncate">
                          {formatShortDate(order.createdAt)} • {order.items?.length || 0}{" "}
                          {(order.items?.length || 0) === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={cn("hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border", fStyle.pillClass)}>
                        {fStyle.label}
                      </span>
                      <span className="text-sm font-bold text-[#2C2416] tabular-nums">
                        {formatCurrencyBDT(order.totalAmount)}
                      </span>
                      <ChevronRight size={15} className="text-[#B5A898] group-hover:text-[#5428D8] transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Default Address & Quick Actions */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-white/95 backdrop-blur-md rounded-[24px] border border-[#EDE4D8] p-5 sm:p-6 shadow-[0_2px_12px_rgba(44,36,22,0.04)] flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FBF4EB] border border-[#EDE4D8] flex items-center justify-center text-[#E8470A]">
                  <MapPin size={15} />
                </div>
                <h3 className="text-base font-bold text-[#2C2416]">Default Address</h3>
              </div>
              <button
                type="button"
                onClick={() => onSwitchTab("addresses")}
                className="text-xs font-semibold text-[#5428D8] hover:text-[#4318C4] cursor-pointer"
              >
                Manage
              </button>
            </div>

            {defaultAddress ? (
              <div className="bg-[#FDF8F0] rounded-2xl border border-[#EDE4D8] p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5428D8] bg-[#F3F0FE] px-2.5 py-0.5 rounded-full">
                    {defaultAddress.label || "Home"}
                  </span>
                  {defaultAddress.isDefault && (
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-[#2C2416] pt-1">
                  {defaultAddress.fullName}
                </p>
                <p className="text-xs text-[#7A6E62] leading-relaxed">
                  {defaultAddress.streetAddress}, {defaultAddress.city}
                  {defaultAddress.state ? `, ${defaultAddress.state}` : ""}
                  {defaultAddress.zipCode ? ` - ${defaultAddress.zipCode}` : ""}
                </p>
                {defaultAddress.phoneNumber && (
                  <p className="text-xs font-semibold text-[#2C2416]/80">
                    {defaultAddress.phoneNumber}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-[#FDF8F0] rounded-2xl border border-dashed border-[#DDD0BE] p-4 text-center space-y-2.5">
                <p className="text-xs text-[#7A6E62]">
                  Save your home or office address for faster checkout.
                </p>
                <button
                  type="button"
                  onClick={() => onSwitchTab("addresses")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5428D8] bg-white border border-[#DFD6FE] px-3.5 py-2 rounded-xl hover:bg-[#F3F0FE] transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  Add Delivery Address
                </button>
              </div>
            )}
          </div>

          {/* Wishlist / Track Shortcut Card */}
          <div className="bg-gradient-to-br from-[#5428D8] to-[#7C3AED] rounded-[24px] p-5 sm:p-6 text-white shadow-[0_10px_28px_rgba(84,40,216,0.22)] relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/75">
                  Saved Favorites
                </p>
                <h4 className="text-lg font-extrabold mt-0.5">
                  {wishlistCount} {wishlistCount === 1 ? "Toy" : "Toys"} in Wishlist
                </h4>
                <p className="text-xs text-white/80 mt-1">
                  Quickly move saved toys to cart or keep them for birthdays.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSwitchTab("wishlist")}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-white text-[#5428D8] text-xs font-bold hover:bg-[#FDF8F0] transition-colors shadow-sm cursor-pointer"
              >
                Open
              </button>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
}
