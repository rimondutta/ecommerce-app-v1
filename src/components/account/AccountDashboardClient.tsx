"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { m, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  LogOut,
  Truck,
  Sparkles,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/components/providers/WishlistProvider";
import OverviewTab from "./OverviewTab";
import OrdersTab from "./OrdersTab";
import WishlistTab from "./WishlistTab";
import AddressesTab from "./AddressesTab";
import ProfileTab from "./ProfileTab";
import {
  AccountOrder,
  AccountProfile,
  AccountTabId,
  SavedAddress,
} from "./types";

const VALID_TABS: ReadonlySet<string> = new Set([
  "overview",
  "orders",
  "wishlist",
  "addresses",
  "profile",
]);

function normalizeTabParam(raw: string | null): AccountTabId {
  if (raw && VALID_TABS.has(raw)) {
    return raw as AccountTabId;
  }
  return "overview";
}

function getInitials(name?: string | null, email?: string | null): string {
  const source = (name || email || "C").trim();
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDF8F0] py-8 sm:py-10">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        {/* Hero skeleton */}
        <div className="h-36 sm:h-40 rounded-[28px] bg-white/80 border border-[#EDE4D8] p-6 flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#E8DDD0]" />
          <div className="space-y-3 flex-1">
            <div className="h-6 w-48 bg-[#E8DDD0] rounded-lg" />
            <div className="h-4 w-64 bg-[#F3ECE2] rounded-lg" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-68 shrink-0 h-64 rounded-[24px] bg-white/80 border border-[#EDE4D8]" />
          <div className="flex-1 grid grid-cols-2 xl:grid-cols-4 gap-4 h-32">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-[22px] bg-white/80 border border-[#EDE4D8]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountDashboardClient() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = normalizeTabParam(searchParams.get("tab"));
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [productSlugs, setProductSlugs] = useState<Record<string, string>>({});
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const { items: wishlistIds, count: wishlistCount } = useWishlist();

  const handleSelectTab = useCallback(
    (tab: AccountTabId) => {
      const nextUrl = tab === "overview" ? "/account" : `/account?tab=${tab}`;
      router.replace(nextUrl, { scroll: false });
    },
    [router]
  );

  const handleInspectOrder = useCallback(
    (orderId: string) => {
      setExpandedOrderId(orderId);
      handleSelectTab("orders");
    },
    [handleSelectTab]
  );

  // Redirect unauthenticated users and fetch account dashboard data in parallel
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account");
      return;
    }
    if (status !== "authenticated") return;

    let ignore = false;

    async function loadDashboardData() {
      try {
        const [ordersRes, profileRes] = await Promise.all([
          fetch("/api/store/orders/user"),
          fetch("/api/users/profile"),
        ]);

        const [ordersData, profileData] = await Promise.all([
          ordersRes.json().catch(() => ({})),
          profileRes.json().catch(() => ({})),
        ]);

        if (ignore) return;

        if (ordersData.success && Array.isArray(ordersData.orders)) {
          setOrders(ordersData.orders);
          if (ordersData.productSlugs && typeof ordersData.productSlugs === "object") {
            setProductSlugs(ordersData.productSlugs);
          }
        }
        if (profileData.success && profileData.profile) {
          setProfile(profileData.profile);
        }
      } catch (err) {
        console.error("[AccountDashboardClient] Load error:", err);
      } finally {
        if (!ignore) {
          setOrdersLoading(false);
          setProfileLoading(false);
        }
      }
    }

    loadDashboardData();
    return () => {
      ignore = true;
    };
  }, [status, router]);

  const handleProfileUpdated = useCallback(
    async (updates: { name?: string; image?: string }) => {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: updates.name ?? prev.name,
              image: updates.image ?? prev.image,
            }
          : prev
      );
      await update(updates);
    },
    [update]
  );

  const handleAddressesUpdated = useCallback((nextAddresses: SavedAddress[]) => {
    setProfile((prev) => (prev ? { ...prev, addresses: nextAddresses } : prev));
  }, []);

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  const displayName = profile?.name || session.user.name || "Toy Explorer";
  const displayEmail = profile?.email || session.user.email || "";
  const displayImage = profile?.image ?? session.user.image ?? null;
  const displayRole = profile?.role || session.user.role || "customer";
  const firstName = displayName.split(" ")[0] || displayName;
  const addresses = profile?.addresses ?? [];

  const navItems: Array<{
    id: AccountTabId;
    label: string;
    icon: React.ElementType;
    count?: number;
  }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag, count: orders.length },
    { id: "wishlist", label: "Wishlist", icon: Heart, count: wishlistCount },
    { id: "addresses", label: "Addresses", icon: MapPin, count: addresses.length },
    { id: "profile", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F0] relative overflow-x-clip pb-24">
      {/* Subtle Ambient Brand Glow Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden"
      >
        <div className="absolute -top-24 left-1/4 w-[420px] h-[420px] rounded-full bg-[#5428D8]/[0.07] blur-3xl" />
        <div className="absolute -top-12 right-1/5 w-[340px] h-[340px] rounded-full bg-[#F5A623]/[0.09] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-9 space-y-6 sm:space-y-8">
        {/* ─── Glassmorphic Customer Welcome Header Banner ─── */}
        <m.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[28px] border border-[#EDE4D8] bg-white/85 backdrop-blur-xl p-5 sm:p-7 md:p-8 shadow-[0_8px_30px_rgba(44,36,22,0.05)]"
        >
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#F3F0FE]/75 via-[#F3F0FE]/25 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              {/* Avatar */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#5428D8] to-[#7C3AED] text-white flex items-center justify-center shadow-[0_8px_22px_rgba(84,40,216,0.28)] ring-4 ring-[#F3F0FE] overflow-hidden shrink-0">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={displayName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {getInitials(displayName, displayEmail)}
                  </span>
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3F0FE] text-[#5428D8] border border-[#DFD6FE]">
                    <Sparkles size={11} />
                    Toy Hourse Member
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2416] tracking-tight truncate">
                  Welcome back, {firstName}
                </h1>
                <p className="text-xs sm:text-sm text-[#7A6E62] truncate">
                  {displayEmail}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FDF8F0] text-[#2C2416] text-xs sm:text-sm font-semibold border border-[#E8DDD0] shadow-xs transition-colors"
              >
                <Truck size={15} className="text-[#5428D8]" />
                Track Package
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5428D8] hover:bg-[#4318C4] text-white text-xs sm:text-sm font-semibold shadow-[0_4px_14px_rgba(84,40,216,0.28)] transition-all hover:-translate-y-0.5"
              >
                Shop Toys
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </m.section>

        {/* ─── Mobile / Tablet Horizontal Segmented Tab Bar (< lg) ─── */}
        <nav
          aria-label="Account sections"
          className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#EDE4D8] shadow-[0_2px_10px_rgba(44,36,22,0.04)]"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shrink-0 cursor-pointer",
                  isActive ? "text-white" : "text-[#7A6E62] hover:text-[#2C2416]"
                )}
              >
                {isActive && (
                  <m.span
                    layoutId="mobile-account-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-[#5428D8] shadow-[0_2px_10px_rgba(84,40,216,0.25)]"
                  />
                )}
                <Icon size={15} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={cn(
                      "relative z-10 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#F3ECE2] text-[#7A6E62]"
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ─── Main 2-Column Workspace ─── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Desktop Sticky Frosted Sidebar */}
          <aside className="hidden lg:flex lg:w-72 shrink-0 flex-col gap-4 sticky top-24">
            <div className="bg-white/90 backdrop-blur-xl rounded-[24px] border border-[#EDE4D8] p-3 shadow-[0_4px_20px_rgba(44,36,22,0.04)]">
              <nav aria-label="Account navigation" className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      className={cn(
                        "relative flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-colors cursor-pointer",
                        isActive
                          ? "text-white"
                          : "text-[#7A6E62] hover:bg-[#FDF8F0] hover:text-[#2C2416]"
                      )}
                    >
                      {isActive && (
                        <m.span
                          layoutId="desktop-account-pill"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#5428D8] to-[#6B3FEF] shadow-[0_4px_14px_rgba(84,40,216,0.24)]"
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-3">
                        <Icon
                          size={17}
                          className={isActive ? "text-white" : "text-[#9A8F83]"}
                        />
                        {item.label}
                      </span>

                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={cn(
                            "relative z-10 py-0.5 px-2 rounded-full text-xs font-bold tabular-nums",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[#F3ECE2] text-[#7A6E62]"
                          )}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="my-3 border-t border-[#F0E8DC]" />

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut size={17} />
                Sign Out
              </button>
            </div>

            {/* Helpful Support Tile */}
            <div className="bg-gradient-to-br from-[#FBF4EB] to-[#F3F0FE]/70 rounded-[22px] border border-[#EDE4D8] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#2C2416]">
                <HelpCircle size={15} className="text-[#5428D8]" />
                Need help with an order?
              </div>
              <p className="text-xs text-[#7A6E62] leading-relaxed">
                Check real-time courier updates or message our support team anytime.
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <Link
                  href="/contact"
                  className="text-xs font-bold text-[#5428D8] hover:underline"
                >
                  Contact Support →
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Tab Content Area */}
          <main className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <OverviewTab
                  orders={orders}
                  ordersLoading={ordersLoading}
                  wishlistCount={wishlistCount}
                  addresses={addresses}
                  onSwitchTab={handleSelectTab}
                  onInspectOrder={handleInspectOrder}
                />
              )}

              {activeTab === "orders" && (
                <OrdersTab
                  orders={orders}
                  productSlugs={productSlugs}
                  loading={ordersLoading}
                  expandedOrderId={expandedOrderId}
                  onToggleExpand={(id) =>
                    setExpandedOrderId((prev) => (prev === id ? null : id))
                  }
                />
              )}

              {activeTab === "wishlist" && (
                <WishlistTab wishlistIds={wishlistIds} />
              )}

              {activeTab === "addresses" && (
                <AddressesTab
                  addresses={addresses}
                  loading={profileLoading}
                  defaultCustomerName={displayName}
                  onAddressesUpdated={handleAddressesUpdated}
                />
              )}

              {activeTab === "profile" && (
                <ProfileTab
                  name={displayName}
                  email={displayEmail}
                  image={displayImage}
                  role={displayRole}
                  createdAt={profile?.createdAt ?? null}
                  onProfileUpdated={handleProfileUpdated}
                />
              )}
            </AnimatePresence>

            {/* Mobile Sign Out Footer Button */}
            <div className="lg:hidden mt-8 pt-6 border-t border-[#E8DDD0]">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-rose-200 text-rose-600 text-sm font-bold hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
