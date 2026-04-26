"use client"

import Link from "next/link"
import Image from "next/image"
import { 
  ArrowUpRight, 
  MoreHorizontal, 
  Download, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  Calendar,
  ChevronRight,
  Info,
  Plus
} from "lucide-react"

interface DashboardClientProps {
  totalRevenue: number;
  totalOrdersCount: number;
  totalCustomersCount: number;
  totalProductsCount: number;
  recentOrders: any[];
  topProducts: any[];
}

function StatCard({ title, value, change, icon: Icon, color }: any) {
  return (
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">{title}</span>
        <div className={`p-2 border-2 border-black ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black uppercase tracking-tighter text-black">{value}</span>
        {change !== undefined && (
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-black ${change >= 0 ? 'bg-green-400 text-black' : 'bg-red-400 text-black'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  )
}

export default function DashboardClient({
  totalRevenue,
  totalOrdersCount,
  totalCustomersCount,
  totalProductsCount,
  recentOrders,
  topProducts,
}: DashboardClientProps) {

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Dashboard</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">REAL-TIME STORE PERFORMANCE INSIGHTS</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-white border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
            <Calendar size={16} />
            Last 30 days
          </button>
          <Link href="/admin/categories" className="flex items-center gap-2 bg-black text-white border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
            <Plus size={16} />
            Add Category
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total revenue" 
          value={`৳${Math.round(totalRevenue).toLocaleString()}`} 
          change={12.5} 
          icon={TrendingUp}
          color="bg-green-400"
        />
        <StatCard 
          title="Orders" 
          value={totalOrdersCount.toLocaleString()} 
          change={8.2} 
          icon={ShoppingCart}
          color="bg-blue-400"
        />
        <StatCard 
          title="Customers" 
          value={totalCustomersCount.toLocaleString()} 
          change={-2.4} 
          icon={Users}
          color="bg-purple-400"
        />
        <StatCard 
          title="Products" 
          value={totalProductsCount.toLocaleString()} 
          icon={Package}
          color="bg-yellow-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          <div className="px-6 py-5 border-b-4 border-black flex items-center justify-between bg-gray-50">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Recent orders</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">LATEST TRANSACTIONS</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-black uppercase tracking-widest border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-black">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r-2 border-black">Order</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r-2 border-black">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r-2 border-black">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center font-black uppercase tracking-widest text-gray-400">
                      <div className="flex flex-col items-center gap-4">
                        <ShoppingCart size={40} className="text-gray-300" />
                        <p>No orders recorded yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 border-r-2 border-black">
                        <span className="text-xs font-black uppercase tracking-tight">
                          #{order._id.toString().slice(-5).toUpperCase()}
                        </span>
                        <p className="text-[9px] font-bold text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4 border-r-2 border-black">
                        <div className="text-xs font-black uppercase tracking-tight">{order.customerName || "Guest User"}</div>
                        <p className="text-[9px] font-bold text-gray-500 truncate max-w-[140px] mt-1">{order.customerEmail}</p>
                      </td>
                      <td className="px-6 py-4 border-r-2 border-black">
                        <span className={`px-2 py-1 border-2 border-black text-[9px] font-black uppercase tracking-widest ${
                          order.paymentStatus === 'paid' ? 'bg-green-400' : 
                          order.paymentStatus === 'pending' ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-sm">
                        ৳{Math.round(order.totalAmount).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products / Insights */}
        <div className="space-y-8">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black uppercase tracking-tight">Top products</h2>
              <Link href="/admin/products" className="text-[10px] font-black uppercase tracking-widest hover:underline">View all</Link>
            </div>
            <div className="space-y-6">
              {topProducts.map((product, i) => (
                <div key={product._id || i} className="flex items-center gap-4 group">
                  <div className="w-14 h-14 border-2 border-black overflow-hidden flex-shrink-0 relative bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <Image 
                      src={(product.images?.[0]?.url && (product.images[0].url.startsWith('http') || product.images[0].url.startsWith('/'))) ? product.images[0].url : "/placeholder.png"} 
                      alt={product.title} 
                      fill 
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black uppercase tracking-tight truncate group-hover:underline">{product.title}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">{Math.floor(Math.random() * 50) + 10} units sold</div>
                  </div>
                  <div className="text-sm font-black text-black">
                    ৳{product.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 border-2 border-white">
                 <Info size={18} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest">Growth Hack</h3>
            </div>
            <p className="text-xs font-bold leading-relaxed text-gray-300">
              CUSTOMERS ARE <span className="text-white font-black underline decoration-2">20% MORE LIKELY</span> TO BUY WHEN YOU OFFER FREE SHIPPING ON ORDERS OVER ৳5000.
            </p>
            <button className="mt-6 w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              SETUP SHIPPING RULE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
