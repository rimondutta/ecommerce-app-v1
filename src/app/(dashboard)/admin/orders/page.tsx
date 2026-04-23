"use client"

import { useEffect, useState } from "react"
import { Search, Filter, ArrowUpRight, ChevronRight, MoreHorizontal, Download } from "lucide-react"
import Link from "next/link"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = () => {
    setLoading(true)
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'bg-[#e3f1df] text-[#008060]'
      case 'processing':
      case 'shipped':
        return 'bg-[#fff4e5] text-[#965e00]'
      case 'pending':
      case 'unfulfilled':
        return 'bg-[#fff4e5] text-[#965e00]'
      case 'cancelled':
      case 'failed':
        return 'bg-[#fbeae5] text-[#d82c0d]'
      default:
        return 'bg-[#e4e5e7] text-[#202223]'
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-[#202223]">Orders</h1>
        <div className="flex gap-2">
          <button className="bg-white border border-[#d2d2d2] rounded-md px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f6] shadow-sm transition-colors flex items-center gap-2">
            <Download size={14} /> Export
          </button>
          <button className="bg-[#008060] text-white px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#006e52] shadow-sm transition-colors">
            Create order
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg border border-[#d2d2d2] shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {/* Tabs */}
        <div className="flex items-center px-4 py-2 border-b border-[#d2d2d2] gap-4">
          <button className="text-[13px] font-semibold text-[#202223] border-b-2 border-[#008060] pb-2 pt-1 px-1">All</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Unfulfilled</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Unpaid</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Open</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Closed</button>
        </div>

        {/* Search Bar */}
        <div className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" />
            <input 
              type="text" 
              placeholder="Filter orders" 
              className="w-full bg-white border border-[#d2d2d2] rounded-md py-1.5 pl-10 pr-4 text-[13px] text-[#202223] placeholder:text-[#616161] focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-[#d2d2d2] rounded-md px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f6]">
            <Filter size={14} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f9f9f9] border-b border-[#d2d2d2]">
                <th className="px-5 py-3 text-[12px] font-semibold text-[#616161] w-12">
                  <input type="checkbox" className="rounded border-[#d2d2d2] text-[#008060] focus:ring-[#008060]" />
                </th>
                <th className="px-5 py-3 text-[12px] font-semibold text-[#616161]">Order</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-[#616161]">Date</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-[#616161]">Customer</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-[#616161]">Total</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-[#616161]">Payment status</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-[#616161]">Fulfillment status</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-[#616161]">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d2d2d2]">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-20 text-center text-[13px] text-[#616161]">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-20 text-center text-[13px] text-[#616161]">No orders found</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#f6f6f6] group transition-colors cursor-pointer">
                    <td className="px-5 py-4">
                      <input type="checkbox" className="rounded border-[#d2d2d2] text-[#008060] focus:ring-[#008060]" />
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order._id}`} className="text-[13px] font-bold text-[#202223] hover:underline flex items-center gap-1 group-hover:text-[#008060]">
                        #{order._id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#202223]">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      <div className="text-[11px] text-[#616161]">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#202223]">
                      <div className="font-medium">{order.customerName || 'Guest'}</div>
                      <div className="text-[11px] text-[#616161] truncate max-w-[120px]">{order.customerEmail}</div>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-bold text-[#202223]">
                      ৳{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium inline-block ${getStatusStyle(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium inline-block ${getStatusStyle(order.fulfillmentStatus)}`}>
                        {order.fulfillmentStatus.charAt(0).toUpperCase() + order.fulfillmentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#202223]">
                      {order.items?.length || 0} items
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
