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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-black uppercase tracking-tight">Products</h1>
        <div className="flex flex-wrap gap-3">
          <button className="bg-white border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
            Export
          </button>
          <button className="bg-white border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
            Import
          </button>
          <Link 
            href="/admin/products/new"
            className="bg-black text-white px-6 py-2 border-2 border-black text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2"
          >
            <Plus size={16} /> Add product
          </Link>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex items-center px-4 py-2 border-b-4 border-black bg-gray-50 gap-4">
          <button className="text-xs font-black uppercase tracking-widest text-black border-b-4 border-black pb-2 pt-2 px-1">All</button>
          <button className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black pb-2 pt-2 px-1 border-b-4 border-transparent transition-colors">Active</button>
          <button className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black pb-2 pt-2 px-1 border-b-4 border-transparent transition-colors">Draft</button>
          <button className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black pb-2 pt-2 px-1 border-b-4 border-transparent transition-colors">Archived</button>
        </div>

        {/* Search Bar */}
        <div className="p-6 flex flex-col md:flex-row items-center gap-4 border-b-2 border-black">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black" />
            <input 
              type="text" 
              placeholder="SEARCH PRODUCTS..." 
              className="w-full bg-white border-2 border-black py-3 pl-12 pr-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow placeholder:text-gray-400"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border-2 border-black p-3 hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
            <Filter size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest w-12 border-r-2 border-black">
                  <input type="checkbox" className="w-4 h-4 border-2 border-black rounded-none appearance-none checked:bg-black" />
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest border-r-2 border-black">Product</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest border-r-2 border-black">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest border-r-2 border-black">Inventory</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest border-r-2 border-black">Category</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center font-black uppercase tracking-widest">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    <p>Loading products...</p>
                  </div>
                </td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center font-black uppercase tracking-widest text-gray-400">No products found</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 group transition-colors">
                    <td className="px-6 py-4 border-r-2 border-black">
                      <input type="checkbox" className="w-4 h-4 border-2 border-black rounded-none appearance-none checked:bg-black" />
                    </td>
                    <td className="px-6 py-4 border-r-2 border-black">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 border-2 border-black overflow-hidden flex-shrink-0 relative bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <Image 
                            src={(product.images?.[0]?.url && (product.images[0].url.startsWith('http') || product.images[0].url.startsWith('/'))) ? product.images[0].url : "/placeholder.png"} 
                            alt={product.title} 
                            fill 
                            sizes="64px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-black uppercase tracking-tight group-hover:underline decoration-2">
                            {product.title}
                          </div>
                          <div className="text-xs font-bold text-gray-600 mt-1">৳{product.price?.toLocaleString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r-2 border-black">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black ${
                        product.isPublished ? 'bg-green-400 text-black' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {product.isPublished ? 'ACTIVE' : 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r-2 border-black">
                      <div className={`text-xs font-black uppercase tracking-widest ${product.inventory <= 5 ? 'text-red-600' : 'text-black'}`}>
                        {product.inventory || 0} IN STOCK
                      </div>
                      {product.inventory <= 5 && <div className="text-[9px] font-black uppercase text-red-600 mt-1">Low stock</div>}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold uppercase tracking-widest border-r-2 border-black text-gray-600">
                      {product.category || "Uncategorized"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                          href={`/admin/products/${product._id}/edit`} 
                          className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product._id, product.title)}
                          className="p-2 border-2 border-black hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
