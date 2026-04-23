"use client"

import { useEffect, useState, useMemo } from "react"
import { Search, Filter, Mail, Phone, MoreHorizontal, ChevronRight, User } from "lucide-react"
import Link from "next/link"

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) setCustomers(data.customers)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => 
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [customers, searchQuery])

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-[#202223]">Customers</h1>
        <div className="flex gap-2">
          <button className="bg-white border border-[#d2d2d2] rounded-md px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f6] shadow-sm transition-colors">
            Export
          </button>
          <button className="bg-white border border-[#d2d2d2] rounded-md px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f6] shadow-sm transition-colors">
            Import
          </button>
          <button className="bg-[#008060] text-white px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#006e52] shadow-sm transition-colors">
            Add customer
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg border border-[#d2d2d2] shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {/* Tabs */}
        <div className="flex items-center px-4 py-2 border-b border-[#d2d2d2] gap-4">
          <button className="text-[13px] font-semibold text-[#202223] border-b-2 border-[#008060] pb-2 pt-1 px-1">All</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">New</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Returning</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Abandoned checkouts</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Email subscribers</button>
        </div>

        {/* Search Bar */}
        <div className="p-4 flex items-center gap-3 bg-[#fcfcfc]">
          <div className="relative flex-1 group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161] group-focus-within:text-[#008060] transition-colors" />
            <input 
              type="text" 
              placeholder="Filter customers" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#d2d2d2] rounded-md py-1.5 pl-10 pr-4 text-[13px] text-[#202223] placeholder:text-[#616161] focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-[#d2d2d2] rounded-md px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f6] shadow-sm transition-colors">
            <Filter size={14} />
            <span>Filter</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f9f9f9] border-b border-[#e1e3e5]">
                <th className="px-6 py-3 text-[12px] font-bold text-[#616161] w-12 uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-[#d2d2d2] text-[#008060] focus:ring-[#008060] cursor-pointer" />
                </th>
                <th className="px-6 py-3 text-[12px] font-bold text-[#616161] uppercase tracking-wider">Customer name</th>
                <th className="px-6 py-3 text-[12px] font-bold text-[#616161] uppercase tracking-wider">Email subscription</th>
                <th className="px-6 py-3 text-[12px] font-bold text-[#616161] uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-[12px] font-bold text-[#616161] uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-[12px] font-bold text-[#616161] text-right uppercase tracking-wider">Total spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f1f1]">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-[13px] text-[#616161]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#d2d2d2] border-t-[#008060] rounded-full animate-spin" />
                    <p>Loading customers...</p>
                  </div>
                </td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-[13px] text-[#616161]">No customers found</td></tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-[#f8f9fa] transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-[#d2d2d2] text-[#008060] focus:ring-[#008060] cursor-pointer" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[14px] font-bold text-[#202223] group-hover:text-[#008060] transition-colors">
                        {customer.name || 'Anonymous Customer'}
                      </div>
                      <div className="text-[11px] text-[#616161] font-medium mt-0.5">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#e3f1df] text-[#008060] border border-[#bee0b5]">
                        SUBSCRIBED
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#616161] font-medium">
                      {customer.location || 'Dhaka, BD'}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#202223] font-bold">
                      {customer.ordersCount || 0} orders
                    </td>
                    <td className="px-6 py-4 text-right text-[14px] font-bold text-[#202223]">
                      ৳{(customer.totalSpent || 0).toLocaleString()}
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
