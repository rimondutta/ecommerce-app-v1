"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Plus, Edit, Trash2, Filter, Upload, Download, RefreshCw } from "lucide-react"
import CsvImportModal from "@/components/admin/CsvImportModal"

interface AdminProduct {
  _id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  slug?: string;
  images?: Array<{ url: string; alt?: string }>;
  category?: { name?: string; slug?: string };
  inventory?: number;
  isPublished?: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "draft">("all")
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const fetchProducts = () => {
    setLoading(true)
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE"
      });
      
      // If 404, product is already gone from DB — still remove it from the UI list
      if (!res.ok && res.status !== 404) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete product");
      }

      setProducts(prev => prev.filter(p => p._id !== id));
    } catch(err) {
      console.error("Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete product.");
    }
  }

  const handleExport = () => {
    setIsExporting(true)
    try {
      window.open("/api/admin/products/export-csv", "_blank")
    } finally {
      setTimeout(() => setIsExporting(false), 1500)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Tab filter
      if (selectedTab === "active" && !p.isPublished) return false
      if (selectedTab === "draft" && p.isPublished) return false

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const titleMatch = p.title?.toLowerCase().includes(query)
        const catMatch = p.category?.name?.toLowerCase().includes(query)
        return titleMatch || catMatch
      }

      return true
    })
  }, [products, selectedTab, searchQuery])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          fetchProducts()
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage, import and export your store catalog</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-white border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Export all products to CSV"
          >
            <Download size={15} className="text-gray-500" />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-white border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 shadow-xs transition-colors flex items-center gap-1.5"
            title="Import products from CSV spreadsheet"
          >
            <Upload size={15} className="text-blue-600" />
            <span>Import CSV</span>
          </button>

          <Link 
            href="/admin/products/new"
            className="bg-gray-900 text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-800 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus size={16} /> Add product
          </Link>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex items-center px-4 pt-2 border-b border-gray-200 gap-6">
          <button
            onClick={() => setSelectedTab("all")}
            className={`text-sm font-medium pb-3 px-1 transition-colors relative ${
              selectedTab === "all" ? "text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All ({products.length})
            {selectedTab === "all" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />}
          </button>
          <button
            onClick={() => setSelectedTab("active")}
            className={`text-sm font-medium pb-3 px-1 transition-colors relative ${
              selectedTab === "active" ? "text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active ({products.filter(p => p.isPublished).length})
            {selectedTab === "active" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />}
          </button>
          <button
            onClick={() => setSelectedTab("draft")}
            className={`text-sm font-medium pb-3 px-1 transition-colors relative ${
              selectedTab === "draft" ? "text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Draft ({products.filter(p => !p.isPublished).length})
            {selectedTab === "draft" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />}
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 flex items-center justify-between gap-3 border-b border-gray-200 bg-white">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title or category..." 
              className="w-full bg-white border border-gray-300 rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:border-gray-500 transition-shadow placeholder:text-gray-400 text-gray-900"
            />
          </div>
          <button
            onClick={fetchProducts}
            title="Refresh list"
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-semibold text-gray-500">Product</th>
                <th className="px-5 py-3 font-semibold text-gray-500">Price</th>
                <th className="px-5 py-3 font-semibold text-gray-500">Status</th>
                <th className="px-5 py-3 font-semibold text-gray-500">Inventory</th>
                <th className="px-5 py-3 font-semibold text-gray-500">Category</th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                      <p className="text-sm">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-base font-semibold text-gray-700">No products found</p>
                      <p className="text-xs text-gray-400">
                        {searchQuery ? "Try adjusting your search query." : "Click \"Add product\" or \"Import CSV\" to add items."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/80 group transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg border border-gray-200 overflow-hidden shrink-0 relative bg-gray-50">
                          <Image 
                            src={(product.images?.[0]?.url && (product.images[0].url.startsWith('http') || product.images[0].url.startsWith('/'))) ? product.images[0].url : "/placeholder.png"} 
                            alt={product.title} 
                            fill 
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product._id}/edit`}
                            className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 block text-sm"
                          >
                            {product.title}
                          </Link>
                          {product.slug && (
                            <span className="text-[11px] text-gray-400 font-mono block">/{product.slug}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        {product.compareAtPrice ? (
                          <span className="text-xs text-gray-400 line-through">৳{product.compareAtPrice?.toLocaleString()}</span>
                        ) : null}
                        <span className={`text-sm font-semibold ${product.compareAtPrice ? 'text-green-600' : 'text-gray-900'}`}>
                          ৳{product.price?.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {product.isPublished ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className={`text-sm ${(product.inventory ?? 0) <= 5 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {product.inventory || 0} in stock
                      </div>
                      {(product.inventory ?? 0) <= 5 && <div className="text-[11px] text-red-500 font-medium">Low stock</div>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-sm">
                      {product.category?.name || "Uncategorized"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link 
                          href={`/admin/products/${product._id}/edit`} 
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product._id, product.title)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
