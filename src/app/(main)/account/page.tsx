"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { CartoonPageLoader } from "@/components/ui/CartoonLoader";
import CartoonButton from "@/components/ui/CartoonButton";
import CartoonProductCard from "@/components/product/CartoonProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut, 
  Clock, 
  User,
  ChevronRight,
  Package
} from "lucide-react";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentTime, setCurrentTime] = useState("");

  const { items: wishlistIds, count: wishlistCount } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/account");
    if (status === "authenticated") fetchOrders();
  }, [status]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTab === "wishlist" && wishlistIds.length > 0) fetchWishlistProducts();
  }, [activeTab, wishlistIds]);

  const fetchWishlistProducts = async () => {
    setWishlistLoading(true);
    try {
      const res = await fetch(`/api/store/products?ids=${wishlistIds.join(",")}`);
      const data = await res.json();
      if (data.products) setWishlistProducts(data.products);
    } catch (err) { console.error(err); }
    finally { setWishlistLoading(false); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/store/orders/user");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (status === "loading") return <CartoonPageLoader />;
  if (!session) return null;

  const tabs = [
    { id: "overview", label: "DASHBOARD", icon: LayoutDashboard },
    { id: "orders", label: "ORDERS", icon: ShoppingBag, count: orders.length },
    { id: "wishlist", label: "WISHLIST", icon: Heart, count: wishlistCount },
    { id: "settings", label: "SETTINGS", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-halftone opacity-5 pointer-events-none" />

      <div className="max-w-7xl mx-auto min-h-screen flex flex-col lg:flex-row relative z-10">
        {/* Sidebar */}
        <aside className="lg:w-80 border-b-4 lg:border-b-0 lg:border-r-4 border-ink bg-white flex flex-col">
          <div className="p-8 space-y-10 sticky top-24">
            {/* Identity */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                <span className="font-bebas text-2xl tracking-widest text-secondary uppercase">// OPERATIVE</span>
                <div className="flex items-center gap-2 bg-ink text-paper px-2 py-0.5 font-bebas text-lg">
                  <Clock size={14} /> {currentTime}
                </div>
              </div>
              <div className="bg-paper border-4 border-ink p-6 cartoon-shadow-sm space-y-4">
                <div className="w-16 h-16 bg-ink flex items-center justify-center border-3 border-ink cartoon-shadow-xs rotate-[-3deg]">
                  <User size={32} className="text-paper" />
                </div>
                <div>
                  <h1 className="font-bangers text-3xl text-ink uppercase leading-none tracking-tight">
                    {session.user?.name || "ANONYMOUS"}
                  </h1>
                  <p className="font-comic font-bold italic text-sm text-ink/40 truncate">{session.user?.email}</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-3 h-3 bg-ink animate-pulse" />
                  <span className="font-bebas text-lg text-ink tracking-widest">STATUS: ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 transition-all border-4",
                      activeTab === tab.id
                        ? "bg-ink text-paper border-ink cartoon-shadow-sm translate-x-1 translate-y-1 shadow-none"
                        : "bg-white text-ink border-ink hover:bg-surface cartoon-shadow-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Icon size={20} />
                      <span className="font-bebas text-2xl tracking-widest">{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span className="font-bangers text-2xl">
                        {String(tab.count).padStart(2, "0")}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sign Out */}
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-3 p-4 font-bebas text-2xl text-secondary border-4 border-ink/10 hover:border-ink hover:text-ink transition-all uppercase"
            >
              <LogOut size={20} /> EXIT ARCHIVE
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 md:p-12 overflow-hidden bg-paper/50">
          <AnimatePresence mode="wait">
            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <motion.div 
                key="overview" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="space-y-12"
              >
                <div className="space-y-2">
                  <span className="font-bebas text-2xl text-secondary tracking-[0.3em] uppercase">// SYSTEM DASHBOARD</span>
                  <h2 className="font-bangers text-7xl text-ink uppercase tracking-tight leading-none">THE DOSSIER</h2>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "GEAR DROPS", value: orders.length, icon: Package },
                    { label: "TARGET LIST", value: wishlistCount, icon: Heart },
                    { label: "CLEARANCE", value: "OMEGA", icon: LayoutDashboard },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="bg-white border-4 border-ink p-8 cartoon-shadow space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="font-bebas text-2xl text-secondary tracking-widest">{stat.label}</span>
                           <Icon size={24} className="text-ink/20" />
                        </div>
                        <div className="font-bangers text-6xl text-ink">
                          {typeof stat.value === "number" ? String(stat.value).padStart(2, "0") : stat.value}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Order Panel */}
                {orders.length > 0 && (
                  <div className="bg-white border-4 border-ink p-10 cartoon-shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-halftone opacity-10 rotate-45 translate-x-16 -translate-y-16" />
                    <div className="relative z-10 space-y-8">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-ink text-paper border-2 border-ink">
                           <Package size={24} />
                         </div>
                         <h3 className="font-bangers text-4xl text-ink uppercase tracking-tight">LATEST ACQUISITION</h3>
                       </div>
                       
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                          ["SERIAL", `#${orders[0]._id.slice(-8).toUpperCase()}`],
                          ["STATUS", orders[0].paymentStatus?.toUpperCase() || "PENDING"],
                          ["VALUE", `৳${orders[0].totalAmount?.toLocaleString()}`],
                          ["UNITS", `${orders[0].items?.length || 0} ITEMS`],
                        ].map(([label, value]) => (
                          <div key={label} className="space-y-1">
                            <span className="font-bebas text-xl text-secondary tracking-widest uppercase">{label}</span>
                            <span className="font-bangers text-3xl text-ink block tracking-tight uppercase">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-6">
                  <Link href="/products">
                    <CartoonButton size="lg">BROWSE ARCHIVES</CartoonButton>
                  </Link>
                  <CartoonButton variant="outline" size="lg" onClick={() => setActiveTab("orders")}>
                    ORDER HISTORY
                  </CartoonButton>
                </div>
              </motion.div>
            )}

            {/* ── ORDERS ── */}
            {activeTab === "orders" && (
              <motion.div 
                key="orders" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="space-y-10"
              >
                <div className="space-y-2">
                  <span className="font-bebas text-2xl text-secondary tracking-[0.3em] uppercase">// LOGISTICS</span>
                  <h2 className="font-bangers text-7xl text-ink uppercase tracking-tight">ACQUISITIONS</h2>
                </div>

                {loading ? <CartoonPageLoader /> : orders.length === 0 ? (
                  <div className="bg-white border-4 border-ink p-20 text-center space-y-8 cartoon-shadow">
                    <div className="font-bangers text-8xl text-ink/10">EMPTY</div>
                    <p className="font-comic font-bold italic text-2xl text-secondary">No drops recorded in your dossier.</p>
                    <Link href="/products" className="inline-block">
                      <CartoonButton>START ACQUISITION</CartoonButton>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order._id} className="bg-white border-4 border-ink p-6 md:p-8 cartoon-shadow hover:translate-x-1 transition-all group">
                        <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                          <div className="flex flex-wrap items-center gap-6">
                            <span className="font-bangers text-3xl text-ink tracking-tight uppercase">#{order._id.slice(-8).toUpperCase()}</span>
                            <span className="font-bebas text-xl text-secondary">{new Date(order.createdAt).toISOString().split("T")[0]}</span>
                            <div className={cn(
                              "font-bebas text-xl px-4 py-1 border-3",
                              order.paymentStatus === "paid" ? "bg-ink text-paper border-ink" : "bg-white text-ink border-ink/20"
                            )}>
                              {order.paymentStatus?.toUpperCase()}
                            </div>
                          </div>
                          <span className="font-bangers text-4xl text-ink">৳{order.totalAmount?.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                          {order.items?.slice(0, 8).map((item: any, i: number) => (
                            <div key={i} className="w-16 h-20 relative shrink-0 border-3 border-ink cartoon-shadow-xs rotate-[-2deg] hover:rotate-0 transition-transform">
                              {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                            </div>
                          ))}
                          {order.items?.length > 8 && (
                            <div className="w-16 h-20 shrink-0 bg-ink border-3 border-ink flex items-center justify-center font-bangers text-2xl text-paper cartoon-shadow-xs">
                              +{order.items.length - 8}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── WISHLIST ── */}
            {activeTab === "wishlist" && (
              <motion.div 
                key="wishlist" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="space-y-10"
              >
                <div className="space-y-2">
                  <span className="font-bebas text-2xl text-secondary tracking-[0.3em] uppercase">// PRIORITY LIST</span>
                  <h2 className="font-bangers text-7xl text-ink uppercase tracking-tight">TARGETED GEAR</h2>
                </div>

                {wishlistLoading ? <CartoonPageLoader /> : wishlistProducts.length === 0 ? (
                  <div className="bg-white border-4 border-ink p-20 text-center space-y-8 cartoon-shadow">
                    <div className="font-bangers text-8xl text-ink/10">MISSING</div>
                    <p className="font-comic font-bold italic text-2xl text-secondary">No targets marked for acquisition.</p>
                    <Link href="/products" className="inline-block">
                      <CartoonButton>SCOUT ARCHIVES</CartoonButton>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {wishlistProducts.map((product, i) => (
                      <CartoonProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── SETTINGS ── */}
            {activeTab === "settings" && (
              <motion.div 
                key="settings" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="space-y-10"
              >
                <div className="space-y-2">
                  <span className="font-bebas text-2xl text-secondary tracking-[0.3em] uppercase">// CALIBRATION</span>
                  <h2 className="font-bangers text-7xl text-ink uppercase tracking-tight">CONFIGURATIONS</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white border-4 border-ink p-10 cartoon-shadow space-y-10">
                    <div className="space-y-2">
                       <h3 className="font-bangers text-3xl text-ink uppercase tracking-tight">PERSONAL DATA</h3>
                       <p className="font-comic font-bold italic text-secondary text-lg">Intel recorded in the archives.</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="font-bebas text-xl text-secondary tracking-widest uppercase">NAME</span>
                        <div className="bg-surface border-3 border-ink p-4 font-bangers text-2xl text-ink uppercase">{session.user?.name}</div>
                      </div>
                      <div className="space-y-2">
                        <span className="font-bebas text-xl text-secondary tracking-widest uppercase">SECURE EMAIL</span>
                        <div className="bg-surface border-3 border-ink p-4 font-comic font-bold italic text-lg text-ink/60">{session.user?.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-ink text-paper p-10 border-4 border-ink cartoon-shadow space-y-10">
                     <div className="space-y-2">
                       <h3 className="font-bangers text-3xl uppercase tracking-tight">ENCRYPTION & SECURITY</h3>
                       <p className="font-comic font-bold italic text-paper/60 text-lg">Manage your access protocols.</p>
                    </div>
                    <p className="font-comic font-bold italic text-xl leading-snug">
                      Updating your security keys requires two-factor validation from your remote device.
                    </p>
                    <CartoonButton variant="secondary" className="w-full">UPDATE PROTOCOLS</CartoonButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
