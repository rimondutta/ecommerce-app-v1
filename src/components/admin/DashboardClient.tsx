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
  Info
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
    <div className="bg-white rounded-lg border border-[#e1e3e5] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_5px_rgba(0,0,0,0.12)] transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-[#616161] group-hover:text-[#202223] transition-colors">{title}</span>
        <div className={`p-2 rounded-md ${color} transition-transform group-hover:scale-110`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[22px] font-bold text-[#202223] tracking-tight">{value}</span>
        {change !== undefined && (
          <span className={`text-[12px] font-bold flex items-center px-1.5 py-0.5 rounded-full ${change >= 0 ? 'bg-[#e3f1df] text-[#008060]' : 'bg-[#fbeae5] text-[#d82c0d]'}`}>
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

  const statusStyles: Record<string, string> = {
    paid: "bg-[#e3f1df] text-[#008060]",
    pending: "bg-[#fff4e5] text-[#965e00]",
    failed: "bg-[#fbeae5] text-[#d82c0d]",
    shipped: "bg-[#e4e5e7] text-[#202223]",
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-[#202223]">Dashboard</h1>
          <p className="text-[13px] text-[#616161] mt-0.5">Summary of your store's performance today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-white border border-[#d2d2d2] rounded-md px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f6] transition-colors shadow-sm">
            <Calendar size={16} />
            Last 30 days
          </button>
          <button className="flex items-center gap-2 bg-[#008060] rounded-md px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#006e52] transition-colors shadow-sm">
            Setup guide
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total sales" 
          value={`৳${Math.round(totalRevenue).toLocaleString()}`} 
          change={12.5} 
          icon={TrendingUp}
          color="bg-[#e3f1df] text-[#008060]"
        />
        <StatCard 
          title="Orders" 
          value={totalOrdersCount.toLocaleString()} 
          change={8.2} 
          icon={ShoppingCart}
          color="bg-[#e4e5e7] text-[#202223]"
        />
        <StatCard 
          title="Total customers" 
          value={totalCustomersCount.toLocaleString()} 
          change={-2.4} 
          icon={Users}
          color="bg-[#e4e5e7] text-[#202223]"
        />
        <StatCard 
          title="Products" 
          value={totalProductsCount.toLocaleString()} 
          icon={Package}
          color="bg-[#e4e5e7] text-[#202223]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#e1e3e5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#e1e3e5] flex items-center justify-between bg-white">
            <div>
              <h2 className="text-[14px] font-bold text-[#202223]">Recent orders</h2>
              <p className="text-[11px] text-[#616161] mt-0.5">Top 5 latest customer transactions</p>
            </div>
            <Link href="/admin/orders" className="text-[13px] font-semibold text-[#008060] hover:text-[#006e52] flex items-center gap-1 transition-colors">
              View all orders <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f9f9f9]">
                  <th className="px-6 py-3 text-[12px] font-bold text-[#616161] border-b border-[#e1e3e5] uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#616161] border-b border-[#e1e3e5] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#616161] border-b border-[#e1e3e5] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#616161] border-b border-[#e1e3e5] uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1f1]">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-[13px] text-[#616161]">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart size={32} className="text-[#d2d2d2]" />
                        <p>No orders recorded yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-[#f8f9fa] transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-bold text-[#202223] group-hover:text-[#008060] transition-colors">
                          #{order._id.toString().slice(-5).toUpperCase()}
                        </span>
                        <p className="text-[11px] text-[#616161] mt-0.5">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[13px] font-medium text-[#202223]">{order.customerName || "Guest User"}</div>
                        <p className="text-[11px] text-[#616161] truncate max-w-[140px] mt-0.5">{order.customerEmail}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block border ${
                          order.paymentStatus === 'paid' ? 'bg-[#e3f1df] text-[#008060] border-[#bee0b5]' : 
                          order.paymentStatus === 'pending' ? 'bg-[#fff4e5] text-[#965e00] border-[#ffe2bb]' :
                          'bg-[#fbeae5] text-[#d82c0d] border-[#f8d0c9]'
                        }`}>
                          {order.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-[13px] text-[#202223]">
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
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-[#d2d2d2] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-bold text-[#202223]">Top products</h2>
              <Link href="/admin/products" className="text-[12px] font-medium text-[#008060] hover:underline">View all</Link>
            </div>
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div key={product._id || i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded border border-[#d2d2d2] overflow-hidden flex-shrink-0 relative">
                    <Image 
                      src={product.images?.[0]?.url || "/placeholder.png"} 
                      alt={product.title} 
                      fill 
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#202223] truncate">{product.title}</div>
                    <div className="text-[11px] text-[#616161]">{Math.floor(Math.random() * 50) + 10} sold</div>
                  </div>
                  <div className="text-[13px] font-semibold text-[#202223]">
                    ৳{product.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f1f1f1] rounded-lg p-5 border border-[#d2d2d2]">
            <div className="flex items-center gap-2 mb-3 text-[#202223]">
              <Info size={16} />
              <h3 className="text-[14px] font-bold italic">Store Tip</h3>
            </div>
            <p className="text-[13px] text-[#616161] leading-relaxed">
              Offering <span className="font-semibold">free shipping</span> can increase your conversion rate by up to 20%. Try setting up a shipping profile.
            </p>
            <button className="mt-4 text-[13px] font-medium text-[#008060] hover:underline">
              Learn more about shipping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
