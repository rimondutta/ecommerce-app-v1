"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight,
  Fingerprint,
  Terminal,
  ShieldCheck,
  ArrowUpRight,
  MapPin,
  Activity,
  Box,
  CornerDownRight,
  Search
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/components/providers/WishlistProvider";
import ProductCard from "@/components/ui/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

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
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account");
    }
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTab === "wishlist" && wishlistIds.length > 0) {
      fetchWishlistProducts();
    }
  }, [activeTab, wishlistIds]);

  const fetchWishlistProducts = async () => {
    setWishlistLoading(true);
    try {
      const res = await fetch(`/api/store/products?ids=${wishlistIds.join(',')}`);
      const data = await res.json();
      if (data.products) {
        setWishlistProducts(data.products);
      }
    } catch (err) {
      console.error("Wishlist sync error:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/store/orders/user");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
         <div className="relative">
            <div className="w-20 h-20 border border-black/5 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-t-2 border-black rounded-full animate-spin" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest whitespace-nowrap opacity-60">Authenticating...</span>
         </div>
      </div>
    );
  }

  if (!session) return null;

  const tabs = [
    { id: "overview", label: "Dashboard", icon: Activity },
    { id: "orders", label: "Orders", icon: Package, count: orders.length },
    { id: "wishlist", label: "Wishlist", icon: Heart, count: wishlistCount },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-black selection:bg-black selection:text-white font-sans overflow-x-hidden">
      
      {/* BACKGROUND GRID */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      <div className="max-w-[1800px] mx-auto min-h-screen flex flex-col lg:flex-row border-x border-black/5 bg-white relative">
        
        {/* LEFT NAV PANEL */}
        <aside className="lg:w-80 xl:w-96 border-r border-black/5 flex flex-col z-20 bg-white">
           <div className="p-10 xl:p-14 space-y-12">
              {/* Brand/Identity */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest">
                       <ShieldCheck size={10} /> MEMBER
                     </div>
                    <span className="text-[10px] font-mono text-black/60">{currentTime}</span>
                 </div>
                 
                 <div className="space-y-1">
                    <h1 className="font-display font-black text-5xl uppercase tracking-tighter leading-tight">
                       {session.user?.name?.split(' ')[0] || "User"}
                    </h1>
                    <p className="text-[10px] font-mono text-black/60 uppercase tracking-widest truncate">{session.user?.email}</p>
                 </div>
              </div>

               {/* Navigation Menu */}
               <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full group relative flex items-center justify-between p-5 rounded-2xl transition-all duration-500 ${
                        activeTab === tab.id 
                        ? 'bg-black text-white shadow-2xl shadow-black/20 scale-[1.02]' 
                        : 'hover:bg-black/5 text-black/60 hover:text-black'
                      }`}
                    >
                       <div className="flex items-center gap-4 relative z-10">
                         <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white/10' : 'bg-transparent'}`}>
                            <tab.icon size={16} className={activeTab === tab.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
                       </div>
                       
                       {tab.count !== undefined && tab.count !== null && (
                         <span className={`text-[10px] font-mono font-black px-2 py-1 rounded-md transition-all ${
                           activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-black/5 text-black/60 group-hover:bg-black/10'
                         }`}>
                           {tab.count < 10 ? `0${tab.count}` : tab.count}
                         </span>
                       )}

                       {activeTab === tab.id && (
                         <motion.div 
                           layoutId="activeGlow"
                           className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-2xl pointer-events-none"
                         />
                       )}
                    </button>
                  ))}
               </nav>

               <div className="pt-10">
                  <button 
                    onClick={() => signOut()}
                    className="w-full p-5 border border-black/10 rounded-2xl flex items-center justify-center gap-4 group hover:bg-red-500 hover:border-red-500 transition-all duration-500 active:scale-95"
                  >
                     <LogOut size={16} className="text-black/60 group-hover:text-white transition-colors" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-black/60 group-hover:text-white transition-colors">Log Out</span>
                  </button>
               </div>
           </div>

           {/* Mobile status pill */}
           <div className="mt-auto p-10 border-t border-black/5 bg-neutral-50/50">
              <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-widest opacity-60">
                    <span>Account Status</span>
                    <span className="text-green-600 font-bold">● Active</span>
                 </div>
                 <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-black/20"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                 </div>
              </div>
           </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-h-screen flex flex-col bg-white">
           <div className="p-8 lg:p-14 xl:p-20 max-w-[1200px] w-full mx-auto space-y-16">
              
              <AnimatePresence mode="wait">
                 {activeTab === "overview" && (
                   <motion.div 
                     key="overview"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="space-y-12"
                   >
                       <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                          <div className="space-y-8">
                             <div className="flex items-center gap-4 text-black/50">
                                <div className="w-12 h-[1px] bg-black/10" />
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] italic">Dashboard</span>
                             </div>
                             <div className="space-y-2">
                                <h2 className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter leading-[0.8] italic">
                                   My <span className="opacity-40 font-light">Account</span>
                                </h2>
                             </div>
                          </div>
                          
                          <div className="hidden md:flex flex-col items-end gap-2 text-right">
                             <span className="text-[10px] font-mono text-black/50 uppercase tracking-[0.2em]">Session Active</span>
                             <div className="flex gap-1">
                                {[1, 1, 1, 1, 0.4, 0.2].map((op, i) => (
                                  <div key={i} className="w-4 h-4 bg-black rounded-sm" style={{ opacity: op }} />
                                ))}
                             </div>
                          </div>
                       </header>

                      {/* STATS CARDS & MEMBER TIER */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         {/* MEMBER CARD */}
                         <div className="lg:col-span-2 relative group overflow-hidden rounded-[2rem] bg-black p-10 text-white shadow-2xl shadow-black/20">
                            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                               <div className="flex justify-between items-start">
                                  <div className="space-y-4">
                                     <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md w-fit">
                                        <ShieldCheck size={10} className="text-emerald-400" /> Verified Member
                                     </div>
                                     <h3 className="text-5xl font-display font-black uppercase tracking-tighter italic leading-none">
                                        Premium <br /> <span className="text-neutral-500">Access</span>
                                     </h3>
                                  </div>
                                  <div className="w-16 h-16 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform duration-500">
                                     <Fingerprint size={32} className="opacity-60" />
                                  </div>
                               </div>
                               
                               <div className="flex flex-wrap items-end justify-between gap-8">
                                  <div className="space-y-2">
                                     <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Account Hash</span>
                                     <div className="text-sm font-mono tracking-widest">FX-7729-BK-2024</div>
                                  </div>
                                  <div className="flex -space-x-3">
                                     {[1, 2, 3, 4].map((i) => (
                                       <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-neutral-800 flex items-center justify-center overflow-hidden">
                                          <div className="w-full h-full bg-gradient-to-tr from-neutral-700 to-neutral-500 opacity-40" />
                                       </div>
                                     ))}
                                     <div className="w-10 h-10 rounded-full border-2 border-black bg-white/10 flex items-center justify-center backdrop-blur-md text-[8px] font-black">+VIP</div>
                                  </div>
                               </div>
                            </div>
                            
                            {/* Background Elements */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4" />
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23fff' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '20px 20px' }} />
                         </div>

                         {/* SIDE STATS */}
                         <div className="space-y-6">
                            {[
                              { label: "Orders", value: orders.length, icon: Box, sub: "Activity", color: "black" },
                              { label: "Wishlist", value: wishlistCount, icon: Heart, sub: "Saved", color: "emerald-500" }
                            ].map((stat, i) => (
                              <div key={i} className="p-8 border border-black/5 bg-[#FBFBFB] rounded-3xl group hover:border-black transition-all relative overflow-hidden h-[160px] flex flex-col justify-between">
                                 <div className="flex items-center justify-between relative z-10">
                                    <div className="p-3 bg-white border border-black/5 rounded-xl group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                                       <stat.icon size={18} />
                                    </div>
                                    <span className="text-[10px] font-mono text-black/50 uppercase tracking-widest">{stat.sub}</span>
                                 </div>
                                 <div className="relative z-10 space-y-1">
                                    <div className="text-4xl font-display font-black tracking-tighter italic">{stat.value < 10 ? `0${stat.value}` : stat.value}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-black/60">{stat.label}</div>
                                 </div>
                                 <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                    <stat.icon size={100} strokeWidth={4} />
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* DATA VISUALIZATION - ACTIVITY CHART */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                         <div className="lg:col-span-3 p-10 border border-black/5 bg-white rounded-[2rem] space-y-10 relative overflow-hidden group">
                            <div className="flex items-center justify-between">
                               <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                                     <span className="text-[10px] font-black uppercase tracking-widest italic">Shopping Activity</span>
                                  </div>
                                  <p className="text-[10px] font-mono text-black/50 uppercase">Relative activity (6 month window)</p>
                               </div>
                               <div className="flex gap-2">
                                  {['M', 'A', 'M', 'J', 'J', 'A'].map((m, i) => (
                                    <span key={i} className="text-[8px] font-mono text-black/20">{m}</span>
                                  ))}
                               </div>
                            </div>
                            
                            {/* MOCK CHART */}
                            <div className="h-40 flex items-end justify-between gap-2 px-2">
                               {[40, 70, 45, 90, 65, 80, 50, 100, 30, 60, 85, 45].map((h, i) => (
                                 <motion.div 
                                   key={i}
                                   initial={{ height: 0 }}
                                   animate={{ height: `${h}%` }}
                                   transition={{ delay: i * 0.05, duration: 1, ease: "easeOut" }}
                                   className={`w-full max-w-[20px] rounded-t-md transition-colors duration-500 ${
                                     h > 80 ? 'bg-black' : h > 50 ? 'bg-black/40' : 'bg-black/10'
                                   } group-hover:grayscale-0`}
                                 />
                               ))}
                            </div>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-black/5">
                               <div className="flex gap-8">
                                  <div className="flex flex-col">
                                     <span className="text-[8px] font-mono text-black/50 uppercase mb-1">Peak Volume</span>
                                     <span className="text-xs font-black tracking-tight">৳ 45,000.00</span>
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-[8px] font-mono text-black/50 uppercase mb-1">Frequency</span>
                                     <span className="text-xs font-black tracking-tight">2.4 / MO</span>
                                  </div>
                                </div>
                                <div className="text-[10px] font-mono text-black/50 bg-black/5 px-3 py-1 rounded-full">ACTIVE SESSION</div>
                            </div>
                         </div>

                         {/* ACTION PANEL */}
                         <div className="p-8 border border-black/5 bg-[#FBFBFB] rounded-[2rem] flex flex-col justify-between group hover:bg-black hover:text-white transition-all duration-500 cursor-pointer">
                            <div className="space-y-6">
                               <div className="p-4 bg-white border border-black/5 rounded-2xl w-fit group-hover:bg-white/10 group-hover:border-white/10 transition-colors">
                                  <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                               </div>
                               <div className="space-y-2">
                                  <h4 className="text-2xl font-display font-black uppercase tracking-tighter leading-tight italic">New <br /> Order</h4>
                                  <p className="text-[10px] font-mono opacity-60 group-hover:opacity-60 leading-relaxed uppercase">Explore our store and find your next premium piece.</p>
                               </div>
                            </div>
                            <Link href="/products" className="mt-8 py-4 border-t border-black/5 group-hover:border-white/10 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                               Browse Store <ChevronRight size={14} />
                            </Link>
                         </div>
                      </div>

                       {/* LATEST ORDER PREVIEW */}
                       {orders.length > 0 && (
                         <section className="space-y-8">
                            <div className="flex items-center justify-between border-b border-black/5 pb-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                  <span className="text-[11px] font-black uppercase tracking-widest italic">Recent Purchases</span>
                               </div>
                               <button onClick={() => setActiveTab('orders')} className="text-[10px] font-bold uppercase tracking-widest text-black/60 hover:text-black transition-colors flex items-center gap-2 group">
                                  View All Orders <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                               </button>
                            </div>
                            
                            <div className="bg-[#FBFBFB] border border-black/5 p-1 rounded-[2.5rem]">
                               <div className="bg-white border border-black/5 p-10 rounded-[2.2rem] shadow-sm relative overflow-hidden group">
                                  <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
                                     <div className="space-y-10 flex-1">
                                        <div className="space-y-4">
                                           <div className="flex items-center gap-4">
                                              <span className="px-3 py-1 bg-black text-white text-[10px] font-mono uppercase tracking-widest">RECENT</span>
                                              <span className="text-[10px] font-mono text-black/60 uppercase tracking-widest">ORDER: #{orders[0]._id.slice(-12).toUpperCase()}</span>
                                           </div>
                                           <h3 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none italic">
                                              Order <br /> <span className="opacity-40 font-light">Confirmed</span>
                                           </h3>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-black/5">
                                           <div className="space-y-2">
                                              <span className="text-[8px] font-mono text-black/50 uppercase tracking-widest">Payment</span>
                                              <div className="flex items-center gap-2">
                                                 <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                                 <span className="text-xs font-black uppercase tracking-widest">{orders[0].paymentStatus}</span>
                                              </div>
                                           </div>
                                           <div className="space-y-2">
                                              <span className="text-[8px] font-mono text-black/50 uppercase tracking-widest">Total</span>
                                              <div className="text-xs font-black tracking-tight italic">৳{orders[0].totalAmount.toLocaleString()}</div>
                                           </div>
                                           <div className="space-y-2">
                                              <span className="text-[8px] font-mono text-black/50 uppercase tracking-widest">Items</span>
                                              <div className="text-xs font-black tracking-widest">{orders[0].items.length} UNIT(S)</div>
                                           </div>
                                           <div className="space-y-2">
                                              <span className="text-[8px] font-mono text-black/50 uppercase tracking-widest">Region</span>
                                              <div className="text-xs font-black tracking-widest">GLOBAL</div>
                                           </div>
                                        </div>
                                     </div>

                                     <div className="lg:w-72 flex flex-col justify-between gap-8">
                                        <div className="flex -space-x-4 self-end lg:self-start">
                                           {orders[0].items.slice(0, 4).map((item: any, idx: number) => (
                                             <div key={idx} className="w-16 h-16 rounded-2xl border-4 border-white bg-[#FBFBFB] shadow-lg overflow-hidden relative group-hover:translate-y-2 transition-transform duration-500" style={{ transitionDelay: `${idx * 100}ms` }}>
                                                {item.image && <img src={item.image} alt="" className="w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />}
                                             </div>
                                           ))}
                                           {orders[0].items.length > 4 && (
                                             <div className="w-16 h-16 rounded-2xl border-4 border-white bg-black text-white flex items-center justify-center text-[10px] font-black shadow-lg">+{orders[0].items.length - 4}</div>
                                           )}
                                        </div>
                                        
                                        <button className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 group">
                                           View Details <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </button>
                                     </div>
                                  </div>
                                  
                                  {/* Decor */}
                                  <div className="absolute right-0 top-0 p-10 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                                     <Package size={200} strokeWidth={1} />
                                  </div>
                               </div>
                            </div>
                         </section>
                       )}
                   </motion.div>
                 )}

                 {activeTab === "orders" && (
                   <motion.div 
                     key="orders"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-12"
                   >
                       <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                          <div className="space-y-6">
                             <div className="flex items-center gap-4 text-black/50">
                                <Package size={18} />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Order History</span>
                             </div>
                             <h2 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none italic">
                                Orders
                             </h2>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="px-6 py-4 border border-black/5 bg-[#FBFBFB] rounded-xl flex items-center gap-3">
                                <Terminal size={14} className="opacity-30" />
                                <span className="text-[10px] font-mono text-black/60">Total Orders: {orders.length}</span>
                             </div>
                          </div>
                       </header>

                       {loading ? (
                         <div className="py-40 flex flex-col items-center gap-6">
                            <div className="relative">
                               <div className="w-16 h-16 border border-black/5 rounded-full" />
                               <div className="absolute inset-0 w-16 h-16 border-t-2 border-black rounded-full animate-spin" />
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-[0.4em] opacity-60">Loading Orders...</span>
                         </div>
                       ) : orders.length === 0 ? (
                         <div className="py-32 border border-black/5 rounded-[2.5rem] bg-[#FBFBFB] flex flex-col items-center justify-center space-y-10">
                            <div className="w-20 h-20 bg-white border border-black/5 rounded-3xl flex items-center justify-center shadow-sm">
                               <Search size={32} className="opacity-10" />
                            </div>
                            <div className="text-center space-y-2">
                               <p className="text-[11px] font-black uppercase tracking-widest">No Orders Found</p>
                               <p className="text-[10px] font-mono text-black/60 uppercase">You haven't placed any orders yet.</p>
                            </div>
                            <Link href="/products" className="group px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-black/20 flex items-center gap-3">
                               Find Products <ArrowUpRight size={14} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                         </div>
                       ) : (
                         <div className="grid grid-cols-1 gap-10">
                            {orders.map((order) => (
                              <div key={order._id} className="group bg-white border border-black/5 rounded-[2.5rem] p-1 shadow-sm hover:shadow-2xl hover:shadow-black/[0.03] transition-all duration-700">
                                 <div className="bg-[#FBFBFB]/50 rounded-[2.4rem] p-8 md:p-12">
                                    <div className="flex flex-col lg:flex-row justify-between gap-12">
                                       <div className="space-y-12 flex-1">
                                          <div className="flex flex-wrap items-center gap-10 border-b border-black/5 pb-10">
                                             <div className="space-y-2">
                                                <span className="text-[10px] font-mono text-black/50 uppercase tracking-widest">Order ID</span>
                                                <div className="text-xs font-black tracking-widest uppercase">#{order._id.slice(-12).toUpperCase()}</div>
                                             </div>
                                             <div className="space-y-2">
                                                <span className="text-[10px] font-mono text-black/50 uppercase tracking-widest">Date</span>
                                                <div className="text-xs font-mono opacity-60 bg-black/5 px-2 py-1 rounded-md">{new Date(order.createdAt).toISOString().split('T')[0].replace(/-/g, '.')}</div>
                                             </div>
                                             <div className="space-y-2">
                                                <span className="text-[10px] font-mono text-black/50 uppercase tracking-widest">Total</span>
                                                <div className="text-xs font-black tracking-tight italic">৳{order.totalAmount.toLocaleString()}</div>
                                             </div>
                                             <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                               order.paymentStatus === 'paid' ? 'bg-black text-white' : 'bg-black/5 text-black/60'
                                             }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-400 animate-pulse' : 'bg-black/20'}`} />
                                                {order.paymentStatus}
                                             </div>
                                          </div>
  
                                          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                                             {order.items.map((item: any, i: number) => (
                                               <div key={i} className="aspect-square bg-white border border-black/5 rounded-2xl overflow-hidden relative group/item shadow-sm">
                                                  {item.image && <img src={item.image} alt="" className="w-full h-full object-cover grayscale opacity-70 group-hover/item:grayscale-0 group-hover/item:opacity-100 transition-all duration-700 scale-110 group-hover/item:scale-100" />}
                                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity backdrop-blur-[2px]">
                                                     <span className="text-[10px] font-black text-white">x{item.quantity}</span>
                                                  </div>
                                               </div>
                                             ))}
                                          </div>
                                       </div>
  
                                       <div className="flex lg:flex-col justify-between lg:justify-end items-end lg:w-56 gap-10">
                                          <div className="hidden lg:block space-y-4 w-full">
                                             <div className="flex justify-between text-[10px] font-mono opacity-30 uppercase">
                                                <span>Status</span>
                                                <span className="text-black font-bold">Verified</span>
                                             </div>
                                             <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-black/20 w-3/4" />
                                             </div>
                                          </div>
                                          <button className="flex items-center gap-3 px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-black/10 group">
                                             Details <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                            ))}
                         </div>
                       )}
                   </motion.div>
                 )}

                 {activeTab === "wishlist" && (
                   <motion.div 
                     key="wishlist"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-12"
                   >
                       <header className="space-y-6">
                          <div className="flex items-center gap-4 text-black/50">
                             <Heart size={18} />
                             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Wishlist</span>
                          </div>
                          <h2 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none italic">
                             Saved <span className="opacity-40 font-light">Items</span>
                          </h2>
                       </header>
                       
                        {wishlistLoading ? (
                         <div className="py-40 flex flex-col items-center gap-6">
                            <div className="relative">
                               <div className="w-16 h-16 border border-black/5 rounded-full" />
                               <div className="absolute inset-0 w-16 h-16 border-t-2 border-emerald-400 rounded-full animate-spin" />
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-[0.4em] opacity-60">Loading Wishlist...</span>
                         </div>
                       ) : wishlistProducts.length === 0 ? (
                         <div className="py-32 border border-black/5 rounded-[2.5rem] bg-[#FBFBFB] flex flex-col items-center justify-center space-y-10">
                            <div className="relative">
                               <div className="w-24 h-24 bg-white border border-black/5 rounded-full flex items-center justify-center shadow-inner">
                                  <Heart size={32} className="opacity-10" />
                               </div>
                               <motion.div 
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="absolute -top-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white"
                               >
                                  <ShieldCheck size={14} />
                               </motion.div>
                            </div>
                            <div className="text-center space-y-2">
                               <p className="text-[11px] font-black uppercase tracking-widest">Wishlist is Empty</p>
                               <p className="text-[10px] font-mono text-black/60 uppercase">Your saved items will appear here.</p>
                            </div>
                            <Link href="/products" className="px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-2xl transition-all shadow-black/20 flex items-center gap-3">
                               Browse Store <ArrowUpRight size={14} />
                            </Link>
                         </div>
                       ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
                            {wishlistProducts.map((product, i) => (
                              <motion.div 
                                key={product._id} 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative"
                              >
                                 <div className="absolute top-4 left-4 z-10">
                                    <span className="bg-black/80 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter">ITEM_0{i+1}</span>
                                 </div>
                                 <ProductCard product={product} />
                              </motion.div>
                            ))}
                         </div>
                       )}
                   </motion.div>
                 )}

                 {activeTab === "settings" && (
                   <motion.div 
                     key="settings"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="space-y-12"
                   >
                      <header className="space-y-6">
                         <div className="flex items-center gap-4 text-black/50">
                            <Settings size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Account Settings</span>
                         </div>
                         <h2 className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter leading-none italic">
                            Settings
                         </h2>
                      </header>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          <section className="bg-white border border-black/5 p-12 rounded-[2.5rem] space-y-12 relative overflow-hidden group shadow-sm">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 border-l-4 border-black pl-6">
                                   <span className="text-xl font-black uppercase tracking-tight italic">Personal Information</span>
                                </div>
                                <div className="p-3 bg-black/5 rounded-xl">
                                   <Fingerprint size={20} className="opacity-60" />
                                </div>
                             </div>
                             
                             <div className="space-y-10">
                                <div className="space-y-4">
                                   <label className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
                                      <div className="w-1 h-1 bg-black/20 rounded-full" /> Full Name
                                   </label>
                                   <div className="p-8 bg-[#FBFBFB] border border-black/5 rounded-2xl font-black uppercase tracking-widest text-lg group-hover:bg-white transition-colors">
                                      {session.user?.name}
                                   </div>
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
                                      <div className="w-1 h-1 bg-black/20 rounded-full" /> Email Address
                                   </label>
                                   <div className="p-8 bg-[#FBFBFB] border border-black/5 rounded-2xl font-mono text-sm opacity-60 group-hover:bg-white transition-colors">
                                      {session.user?.email}
                                   </div>
                                </div>
                             </div>
                             
                             <div className="pt-6 flex justify-between items-center text-[8px] font-mono opacity-40 uppercase tracking-[0.3em]">
                                <span>Status: Active</span>
                                <span>Security Verified</span>
                             </div>

                             <Fingerprint size={160} className="absolute -bottom-16 -right-16 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700" />
                          </section>
 
                          <div className="space-y-10">
                             <section className="bg-black text-white p-12 rounded-[2.5rem] space-y-10 relative overflow-hidden group shadow-2xl shadow-black/20">
                                <div className="flex items-center gap-4 relative z-10">
                                   <div className="p-3 bg-white/10 rounded-xl">
                                      <ShieldCheck size={20} className="text-emerald-400" />
                                   </div>
                                   <span className="text-[11px] font-black uppercase tracking-widest italic">Security Settings</span>
                                </div>
                                <p className="text-[11px] font-sans leading-relaxed opacity-60 relative z-10">Two-factor authentication is active. Any changes to your security settings will require verification.</p>
                                <button className="w-full py-6 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all relative z-10">
                                   Update Security
                                </button>
                                
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full" />
                             </section>
 
                             <section className="bg-white border border-black/5 p-12 rounded-[2.5rem] space-y-8 group shadow-sm hover:border-black/20 transition-all">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-4 opacity-30 group-hover:opacity-100 transition-opacity">
                                      <MapPin size={18} />
                                      <span className="text-[10px] font-black uppercase tracking-widest italic">Shipping Address</span>
                                   </div>
                                   <div className="text-[8px] font-mono opacity-40 group-hover:opacity-60">0 SAVED</div>
                                </div>
                                <div className="flex flex-col items-center justify-center py-16 space-y-6 border border-dashed border-black/10 rounded-3xl bg-[#FBFBFB] group-hover:bg-white transition-colors">
                                   <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center">
                                      <CornerDownRight size={20} className="opacity-40" />
                                   </div>
                                   <div className="text-center space-y-1">
                                      <span className="text-[10px] font-mono text-black/50 block">No address on file</span>
                                      <span className="text-[10px] font-black uppercase tracking-widest opacity-10">Verified</span>
                                   </div>
                                </div>
                             </section>
                          </div>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>

           </div>
           
           {/* Footer detail */}
           <div className="mt-auto p-14 border-t border-black/5 text-[10px] font-mono text-black/20 flex flex-col md:flex-row justify-between gap-6 uppercase tracking-[0.2em]">
              <p>© 2024 FLEXWEAR // ALL RIGHTS RESERVED</p>
              <div className="flex gap-10">
                 <span>Location: Dhaka, BD</span>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}
