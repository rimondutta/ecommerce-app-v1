"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import {
  Mail,
  ShoppingBag,
  Calendar,
  Trash2,
  Loader2,
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react"

interface Customer {
  _id: string
  name: string
  email: string
  ordersCount: number
  totalSpent: number
  createdAt: string
  lastOrderDate?: string
}

export default function CustomersClient() {
  const { data: session } = useSession()
  const currentUserRole = session?.user?.role || "admin"

  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await fetch("/api/admin/customers")
        if (!res.ok) throw new Error("Failed to fetch customers")
        const data = await res.json()
        if (!ignore) {
          setCustomers(data.customers || [])
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to fetch customers")
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  // ── Delete Customer ─────────────────────────────────────────────────────────
  const handleDeleteCustomer = async (customer: Customer) => {
    if (currentUserRole !== "admin") {
      alert("Permission denied: Managers are not allowed to remove customers.")
      return
    }

    const customerDisplayName = customer.name || customer.email
    if (
      !confirm(
        `Are you sure you want to delete customer "${customerDisplayName}"?\n\nThis will remove their customer account. Historical order logs will be preserved.`
      )
    ) {
      return
    }

    setDeletingId(customer._id)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/admin/customers?id=${customer._id}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete customer.")
      }

      setCustomers((prev) => prev.filter((c) => c._id !== customer._id))
      setSuccess(`Customer "${customerDisplayName}" has been deleted successfully.`)
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer.")
    } finally {
      setDeletingId(null)
    }
  }

  // ── Filter customers ───────────────────────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const q = searchQuery.toLowerCase().trim()
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    )
  }, [customers, searchQuery])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              <Users size={12} className="mr-1" />
              {customers.length}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage your registered customer accounts and view their purchase history.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <p className="flex-1 font-medium">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <p className="flex-1 font-medium">{success}</p>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-600">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* ── Customers Table ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Registered On</th>
                <th className="px-6 py-3.5 text-center">Total Orders</th>
                <th className="px-6 py-3.5 text-right">Total Spent</th>
                <th className="px-6 py-3.5 text-right">Last Order</th>
                <th className="px-6 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    {searchQuery ? `No customers match "${searchQuery}"` : "No customers found."}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const isDeleting = deletingId === customer._id

                  return (
                    <tr key={customer._id || customer.email} className="hover:bg-gray-50/80 transition-colors">
                      {/* Customer info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                            {customer.name?.charAt(0).toUpperCase() || customer.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-gray-900 truncate">
                              {customer.name || "Unknown"}
                            </span>
                            <span className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                              <Mail size={12} className="shrink-0" />
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Registered date */}
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "—"}
                      </td>

                      {/* Orders Count */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            <ShoppingBag size={12} />
                            {customer.ordersCount}
                          </span>
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        ৳{customer.totalSpent?.toLocaleString() || "0"}
                      </td>

                      {/* Last Order Date */}
                      <td className="px-6 py-4 text-right text-gray-500 text-xs">
                        {customer.lastOrderDate ? (
                          <div className="flex items-center justify-end gap-1">
                            <Calendar size={12} className="shrink-0" />
                            {new Date(customer.lastOrderDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>

                      {/* Delete Action */}
                      <td className="px-6 py-4 text-center">
                        {currentUserRole === "admin" ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomer(customer)}
                            disabled={isDeleting}
                            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title={`Delete customer ${customer.name || customer.email}`}
                          >
                            {isDeleting ? (
                              <Loader2 size={16} className="animate-spin text-red-600" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic" title="Managers cannot remove customers">
                            Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
