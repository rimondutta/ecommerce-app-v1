"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Plus, Edit, Trash2, Filter, MoreHorizontal, ChevronRight } from "lucide-react"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete product");
      
      setProducts(products.filter(p => p._id !== id));
    } catch(err) {
      console.error("Delete error:", err);
      alert("Failed to delete product.");
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-[#202223]">Products</h1>
        <div className="flex gap-2">
          <button className="bg-white border border-[#d2d2d2] rounded-md px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f6] shadow-sm transition-colors">
            Export
          </button>
          <button className="bg-white border border-[#d2d2d2] rounded-md px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f6] shadow-sm transition-colors">
            Import
          </button>
          <Link 
            href="/admin/products/new"
            className="bg-[#008060] text-white px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#006e52] shadow-sm transition-colors flex items-center gap-2"
          >
            Add product
          </Link>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg border border-[#d2d2d2] shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {/* Tabs */}
        <div className="flex items-center px-4 py-2 border-b border-[#d2d2d2] gap-4">
          <button className="text-[13px] font-semibold text-[#202223] border-b-2 border-[#008060] pb-2 pt-1 px-1 text-left">All</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Active</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Draft</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Archived</button>
        </div>

        {/* Search Bar */}
        <div className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" />
            <input 
              type="text" 
              placeholder="Search products" 
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
              <tr className="bg-[#f9f9f9] border-b border-[#e1e3e5]">
                <th className="px-6 py-3 text-[12px] font-bold text-[#616161] w-12 uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-[#d2d2d2] text-[#008060] focus:ring-[#008060] cursor-pointer" />
                </th>
                <th className="px-6 py-3 text-[12px] font-bold text-[#616161] uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-[12px] font-bold text-[#616161] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[12px] font-bold text-[#616161] uppercase tracking-wider">Inventory</th>
                <th className="px-6 py-3 text-[12px] font-bold text-[#616161] uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-[12px] font-bold text-[#616161] text-right uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f1f1]">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-[13px] text-[#616161]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#d2d2d2] border-t-[#008060] rounded-full animate-spin" />
                    <p>Loading products...</p>
                  </div>
                </td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-[13px] text-[#616161]">No products found</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-[#f8f9fa] group transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-[#d2d2d2] text-[#008060] focus:ring-[#008060] cursor-pointer" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded border border-[#e1e3e5] overflow-hidden flex-shrink-0 relative bg-[#f9f9f9]">
                          <Image 
                            src={product.images?.[0]?.url || "/placeholder.png"} 
                            alt={product.title} 
                            fill 
                            sizes="48px"
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-[#202223] group-hover:text-[#008060] transition-colors">
                            {product.title}
                          </div>
                          <div className="text-[11px] text-[#616161] mt-0.5">৳{product.price?.toLocaleString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block border ${
                        product.isPublished ? 'bg-[#e3f1df] text-[#008060] border-[#bee0b5]' : 'bg-[#e4e5e7] text-[#202223] border-[#ccd0d2]'
                      }`}>
                        {product.isPublished ? 'ACTIVE' : 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-[13px] font-medium ${product.inventory <= 5 ? 'text-[#d82c0d]' : 'text-[#202223]'}`}>
                        {product.inventory || 0} in stock
                      </div>
                      {product.inventory <= 5 && <div className="text-[10px] text-[#d82c0d] font-bold uppercase mt-0.5">Low stock</div>}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#616161] font-medium">
                      {product.category || "Uncategorized"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                        <Link href={`/admin/products/${product._id}/edit`} className="p-2 text-[#616161] hover:text-[#202223] hover:bg-white border border-transparent hover:border-[#d2d2d2] rounded-md transition-all shadow-sm">
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product._id, product.title)}
                          className="p-2 text-[#616161] hover:text-[#d82c0d] hover:bg-white border border-transparent hover:border-[#f8d0c9] rounded-md transition-all shadow-sm"
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
