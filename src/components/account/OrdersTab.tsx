"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Truck,
  Download,
  ChevronDown,
  Copy,
  Check,
  RotateCcw,
  MapPin,
  CreditCard,
  ExternalLink,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import { cn, getOptimizedCloudinaryUrl } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/playshelf/Toast";
import OrderProgressBar from "./OrderProgressBar";
import {
  AccountOrder,
  PAYMENT_METHOD_LABELS,
  formatCurrencyBDT,
  formatOrderRef,
  formatShortDate,
  getFulfillmentStyle,
  getPaymentStyle,
  isOrderActive,
} from "./types";

interface OrdersTabProps {
  orders: AccountOrder[];
  productSlugs: Record<string, string>;
  loading: boolean;
  expandedOrderId: string | null;
  onToggleExpand: (orderId: string) => void;
}

type OrderFilter = "all" | "active" | "delivered" | "cancelled";

export default function OrdersTab({
  orders,
  productSlugs,
  loading,
  expandedOrderId,
  onToggleExpand,
}: OrdersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();

  const counts = useMemo(() => {
    const active = orders.filter(isOrderActive).length;
    const delivered = orders.filter(
      (o) => (o.fulfillmentStatus || "").toLowerCase() === "delivered"
    ).length;
    const cancelled = orders.filter(
      (o) => (o.fulfillmentStatus || "").toLowerCase() === "cancelled"
    ).length;
    return { all: orders.length, active, delivered, cancelled };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter === "active" && !isOrderActive(order)) return false;
      if (
        filter === "delivered" &&
        (order.fulfillmentStatus || "").toLowerCase() !== "delivered"
      )
        return false;
      if (
        filter === "cancelled" &&
        (order.fulfillmentStatus || "").toLowerCase() !== "cancelled"
      )
        return false;

      if (!q) return true;
      const ref = formatOrderRef(order).toLowerCase();
      const idMatch = order._id.toLowerCase().includes(q);
      const itemMatch = order.items?.some((it) =>
        (it.title || "").toLowerCase().includes(q)
      );
      return ref.includes(q) || idMatch || Boolean(itemMatch);
    });
  }, [orders, filter, searchQuery]);

  const handleCopyRef = (e: React.MouseEvent, order: AccountOrder) => {
    e.stopPropagation();
    const text = formatOrderRef(order);
    navigator.clipboard.writeText(text);
    setCopiedId(order._id);
    showToast(`Copied ${text}`, "info");
    setTimeout(() => setCopiedId((prev) => (prev === order._id ? null : prev)), 2000);
  };

  const handleBuyAgain = (order: AccountOrder) => {
    const items = order.items || [];
    let addedCount = 0;

    for (const item of items) {
      const pid = item.product ? String(item.product) : "";
      const slug = pid ? productSlugs[pid] : undefined;
      if (!slug || !item.title || item.price === undefined) continue;

      addItem({
        id: pid,
        variantId: item.variantId ? String(item.variantId) : undefined,
        slug,
        title: item.title,
        price: item.price,
        quantity: item.quantity || 1,
        variantOptions: item.variantOptions,
        image: item.image || "/placeholder.jpg",
      });
      addedCount += 1;
    }

    if (addedCount > 0) {
      showToast(`Added ${addedCount} item(s) to cart!`, "success");
      openCart();
    } else {
      showToast("These products are currently unavailable to reorder", "info");
    }
  };

  const filterOptions: Array<{ id: OrderFilter; label: string; count: number }> = [
    { id: "all", label: "All Orders", count: counts.all },
    { id: "active", label: "Active", count: counts.active },
    { id: "delivered", label: "Delivered", count: counts.delivered },
    { id: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <m.div
      key="orders"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* ─── Filter & Search Toolbar ─── */}
      <div className="bg-white/95 backdrop-blur-md rounded-[22px] border border-[#EDE4D8] p-4 sm:p-5 shadow-[0_2px_10px_rgba(44,36,22,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2416]">
              Order History
            </h2>
            <p className="text-xs text-[#7A6E62]">
              Track live shipments, download PDF invoices, or reorder favorites
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8F83]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order # or toy..."
              className="w-full human-input pl-9 pr-3.5 py-2 text-xs sm:text-sm text-[#2C2416] placeholder:text-[#A39688]"
            />
          </div>
        </div>

        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {filterOptions.map((opt) => {
            const isSelected = filter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilter(opt.id)}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer",
                  isSelected
                    ? "text-white"
                    : "text-[#7A6E62] hover:text-[#2C2416] hover:bg-[#FBF4EB]"
                )}
              >
                {isSelected && (
                  <m.span
                    layoutId="order-filter-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-[#5428D8] shadow-[0_2px_8px_rgba(84,40,216,0.25)]"
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
                <span
                  className={cn(
                    "relative z-10 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#F3ECE2] text-[#7A6E62]"
                  )}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Content ─── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-[24px] border border-[#EDE4D8] p-6 space-y-4 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="h-5 w-32 bg-[#EDE4D8] rounded" />
                <div className="h-6 w-20 bg-[#F3F0FE] rounded-full" />
              </div>
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F5ECE0]" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 bg-[#EDE4D8] rounded" />
                  <div className="h-3 w-28 bg-[#F5ECE0] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-md rounded-[26px] border border-[#EDE4D8] p-10 sm:p-14 text-center shadow-[0_4px_20px_rgba(44,36,22,0.04)]">
          <div className="w-16 h-16 rounded-2xl bg-[#F3F0FE] border border-[#DFD6FE] flex items-center justify-center text-[#5428D8] mx-auto mb-4">
            <Package size={28} strokeWidth={1.8} />
          </div>
          <h3 className="text-lg font-bold text-[#2C2416]">
            {orders.length === 0 ? "No orders placed yet" : "No matching orders"}
          </h3>
          <p className="text-sm text-[#7A6E62] mt-1.5 max-w-sm mx-auto">
            {orders.length === 0
              ? "When you place an order, it will appear here with real-time tracking and invoices."
              : "Try clearing your search or choosing a different status filter."}
          </p>
          {orders.length === 0 ? (
            <Link
              href="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#5428D8] hover:bg-[#4318C4] text-white text-sm font-semibold px-6 py-3 shadow-[0_4px_14px_rgba(84,40,216,0.28)] transition-all"
            >
              Start Shopping
              <ArrowUpRight size={16} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setSearchQuery("");
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F3F0FE] hover:bg-[#E7E0FD] text-[#5428D8] text-xs font-bold px-4 py-2.5 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const fStyle = getFulfillmentStyle(order.fulfillmentStatus);
            const pStyle = getPaymentStyle(order.paymentStatus);
            const orderRef = formatOrderRef(order);
            const hasReorderableItems = Boolean(
              order.items?.some((it) => it.product && productSlugs[String(it.product)])
            );

            return (
              <div
                key={order._id}
                className="bg-white/95 backdrop-blur-md rounded-[24px] border border-[#EDE4D8] shadow-[0_2px_12px_rgba(44,36,22,0.04)] hover:shadow-[0_10px_28px_rgba(84,40,216,0.08)] transition-shadow overflow-hidden"
              >
                {/* Top Summary Card Body */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Top Row: ID + Badges + Total */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-[#2C2416]">
                          {orderRef}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyRef(e, order)}
                          className="p-1 rounded-lg text-[#9A8F83] hover:text-[#5428D8] hover:bg-[#F3F0FE] transition-colors cursor-pointer"
                          title="Copy order reference"
                          aria-label="Copy order reference"
                        >
                          {copiedId === order._id ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                        <span className="text-xs text-[#9A8F83]">•</span>
                        <span className="text-xs font-medium text-[#7A6E62]">
                          {formatShortDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                            fStyle.pillClass
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", fStyle.dotClass)} />
                          {fStyle.label}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                            pStyle.pillClass
                          )}
                        >
                          {pStyle.label}
                        </span>
                        {order.paymentMethod && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FBF4EB] text-[#7A6E62] border border-[#EDE4D8]">
                            <CreditCard size={11} />
                            {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9A8F83] block">
                        Total Amount
                      </span>
                      <span className="text-lg sm:text-xl font-extrabold text-[#5428D8] tabular-nums">
                        {formatCurrencyBDT(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Product Previews + Quick Actions */}
                  <div className="pt-3 border-t border-[#F4ECE2] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex -space-x-2.5 overflow-hidden shrink-0">
                        {order.items?.slice(0, 4).map((item, i) => (
                          <div
                            key={i}
                            className="relative w-11 h-11 rounded-xl ring-2 ring-white border border-[#EDE4D8] bg-[#FBF4EB] overflow-hidden"
                          >
                            <Image
                              src={getOptimizedCloudinaryUrl(item.image || "/placeholder.jpg", { width: 100 })}
                              alt={item.title || "Product"}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {(order.items?.length ?? 0) > 4 && (
                          <div className="w-11 h-11 rounded-xl ring-2 ring-white bg-[#F3F0FE] border border-[#E4DCFC] flex items-center justify-center text-xs font-bold text-[#5428D8]">
                            +{(order.items?.length ?? 0) - 4}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[#2C2416] truncate">
                          {order.items?.[0]?.title || "Toy Order"}
                        </p>
                        <p className="text-xs text-[#7A6E62]">
                          {order.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 0}{" "}
                          {(order.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 0) === 1
                            ? "unit"
                            : "units"}
                          {order.courier?.name ? ` • via ${order.courier.name}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {hasReorderableItems && (
                        <button
                          type="button"
                          onClick={() => handleBuyAgain(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#2C2416] bg-[#FBF4EB] hover:bg-[#F3E9DB] rounded-xl border border-[#E8DDD0] transition-colors cursor-pointer"
                        >
                          <RotateCcw size={13} />
                          Buy Again
                        </button>
                      )}

                      <Link
                        href={`/track-order?id=${encodeURIComponent(order.invoiceNumber || order._id)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5428D8] bg-[#F3F0FE] hover:bg-[#E7E0FD] rounded-xl border border-[#DFD6FE] transition-colors"
                      >
                        <Truck size={13} />
                        Track Live
                      </Link>

                      <a
                        href={`/api/orders/${order._id}/invoice`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={`Invoice-${order.invoiceNumber || order._id}.pdf`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#7A6E62] hover:text-[#2C2416] bg-white hover:bg-[#FDF8F0] rounded-xl border border-[#E8DDD0] transition-colors"
                      >
                        <Download size={13} />
                        Invoice
                      </a>

                      <button
                        type="button"
                        onClick={() => onToggleExpand(order._id)}
                        className={cn(
                          "inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer",
                          isExpanded
                            ? "bg-[#2C2416] text-white"
                            : "bg-[#F5F1EB] text-[#2C2416] hover:bg-[#EAE1D3]"
                        )}
                      >
                        {isExpanded ? "Hide" : "Details"}
                        <ChevronDown
                          size={14}
                          className={cn(
                            "transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Details Drawer */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden border-t border-[#EDE4D8] bg-[#FDF8F0]/75"
                    >
                      <div className="p-5 sm:p-6 space-y-6">
                        {/* Stepper */}
                        <div className="bg-white rounded-2xl border border-[#EDE4D8] p-4 sm:p-5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A6E62] mb-3">
                            Delivery Progress
                          </p>
                          <OrderProgressBar
                            fulfillmentStatus={order.fulfillmentStatus}
                            courierStatus={order.courierStatus}
                            compact
                          />
                        </div>

                        {/* Items List */}
                        <div className="bg-white rounded-2xl border border-[#EDE4D8] divide-y divide-[#F4ECE2]">
                          <div className="px-4 py-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A6E62]">
                            <ShoppingBag size={13} className="text-[#5428D8]" />
                            Items Ordered
                          </div>
                          {order.items?.map((item, idx) => {
                            const slug = item.product ? productSlugs[String(item.product)] : undefined;
                            const variantEntries = item.variantOptions
                              ? Object.entries(item.variantOptions)
                              : [];
                            return (
                              <div
                                key={idx}
                                className="p-4 flex items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="relative w-12 h-12 rounded-xl border border-[#EDE4D8] bg-[#FBF4EB] overflow-hidden shrink-0">
                                    <Image
                                      src={getOptimizedCloudinaryUrl(item.image || "/placeholder.jpg", { width: 120 })}
                                      alt={item.title || "Item"}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    {slug ? (
                                      <Link
                                        href={`/products/${slug}`}
                                        className="text-sm font-bold text-[#2C2416] hover:text-[#5428D8] transition-colors truncate block"
                                      >
                                        {item.title}
                                      </Link>
                                    ) : (
                                      <p className="text-sm font-bold text-[#2C2416] truncate">
                                        {item.title}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                      <span className="text-xs text-[#7A6E62] tabular-nums">
                                        Qty {item.quantity || 1} × {formatCurrencyBDT(item.price)}
                                      </span>
                                      {variantEntries.map(([k, v]) => (
                                        <span
                                          key={k}
                                          className="text-[10px] font-semibold bg-[#F3F0FE] text-[#5428D8] px-2 py-0.5 rounded-md"
                                        >
                                          {k}: {v}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-sm font-extrabold text-[#2C2416] tabular-nums shrink-0">
                                  {formatCurrencyBDT((item.price || 0) * (item.quantity || 1))}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Address & Price Summary Split */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Delivery & Courier Card */}
                          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-4 space-y-2.5">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A6E62]">
                              <MapPin size={13} className="text-[#E8470A]" />
                              Shipping Destination
                            </div>
                            <div className="text-xs text-[#2C2416] space-y-1">
                              <p className="font-bold text-sm">
                                {order.shippingAddress?.name || order.customerName || "Customer"}
                              </p>
                              {order.shippingAddress?.addressLine1 && (
                                <p className="text-[#7A6E62]">
                                  {order.shippingAddress.addressLine1}
                                  {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ""}
                                  {order.shippingAddress.postcode ? ` - ${order.shippingAddress.postcode}` : ""}
                                </p>
                              )}
                              {order.shippingAddress?.phone && (
                                <p className="font-medium text-[#2C2416]/80">
                                  Phone: {order.shippingAddress.phone}
                                </p>
                              )}
                            </div>

                            {order.courier?.trackingId && (
                              <div className="pt-2 border-t border-[#F4ECE2] flex items-center justify-between gap-2 text-xs">
                                <span className="text-[#7A6E62]">
                                  {order.courier.name || "Courier"} Tracking:
                                </span>
                                {order.courier.trackingUrl ? (
                                  <a
                                    href={order.courier.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-[#5428D8] hover:underline inline-flex items-center gap-1"
                                  >
                                    {order.courier.trackingId}
                                    <ExternalLink size={11} />
                                  </a>
                                ) : (
                                  <span className="font-bold text-[#2C2416]">
                                    {order.courier.trackingId}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Receipt Summary Card */}
                          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-4 space-y-2 text-xs">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A6E62] mb-2">
                              Payment Breakdown
                            </p>
                            {order.subtotal !== undefined && (
                              <div className="flex justify-between text-[#7A6E62]">
                                <span>Subtotal</span>
                                <span className="font-semibold text-[#2C2416] tabular-nums">
                                  {formatCurrencyBDT(order.subtotal)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-[#7A6E62]">
                              <span>Shipping</span>
                              <span className="font-semibold text-[#2C2416] tabular-nums">
                                {(order.shippingCost ?? 0) === 0
                                  ? "Free"
                                  : formatCurrencyBDT(order.shippingCost)}
                              </span>
                            </div>
                            {(order.discountAmount ?? 0) > 0 && (
                              <div className="flex justify-between text-emerald-700">
                                <span>Discount</span>
                                <span className="font-semibold tabular-nums">
                                  -{formatCurrencyBDT(order.discountAmount)}
                                </span>
                              </div>
                            )}
                            <div className="pt-2 border-t border-[#EDE4D8] flex justify-between items-center text-sm font-extrabold text-[#2C2416]">
                              <span>Order Total</span>
                              <span className="text-[#5428D8] text-base tabular-nums">
                                {formatCurrencyBDT(order.totalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </m.div>
  );
}
