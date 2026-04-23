"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Save, CheckCircle2, Loader2, DollarSign, Package } from "lucide-react"

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updates, setUpdates] = useState<{ [key: string]: { inventory?: number, price?: number } }>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

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

  const handleInputChange = (productId: string, field: 'inventory' | 'price', value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) && value !== "") return

    setUpdates(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [field]: value === "" ? 0 : numValue
      }
    }))
  }

  const handleUpdate = async (productId: string) => {
    const productUpdates = updates[productId]
    if (!productUpdates) return

    setSavingId(productId)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productUpdates),
      })

      if (!res.ok) throw new Error("Failed to update product")

      const data = await res.json()
      
      // Update local state
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, ...productUpdates } : p))
      
      // Clear specific updates for this product
      const newUpdates = { ...updates }
      delete newUpdates[productId]
      setUpdates(newUpdates)

      setMessage({ type: 'success', text: `Updated ${data.product.title} successfully!` })
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Inventory & Price</h1>
          <p className="text-gray-500 text-sm font-medium">Fast Editor: Update stock and pricing inline.</p>
        </div>
        
        {message && (
          <div className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
            message.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span className="text-xs font-bold uppercase tracking-wider">{message.text}</span>
          </div>
        )}
      </div>

      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-black bg-gray-50/50">
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Info</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Price (৳)</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Stock Level</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Status</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="animate-spin text-black" size={40} />
                      <p className="font-bold uppercase tracking-widest text-xs text-gray-400">Syncing Inventory...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center font-bold uppercase tracking-widest text-gray-400">No inventory to track.</td>
                </tr>
              ) : (
                products.map((product) => {
                  const currentInventory = updates[product._id]?.inventory ?? product.inventory ?? 0;
                  const currentPrice = updates[product._id]?.price ?? product.price ?? 0;
                  const isDirty = updates[product._id] !== undefined;
                  const isSaving = savingId === product._id;

                  const isLow = currentInventory <= 5 && currentInventory > 0;
                  const isOut = currentInventory === 0;

                  return (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-black/5">
                            {product.images?.[0] ? (
                              <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="text-gray-300" size={20} />
                            )}
                          </div>
                          <div>
                            <div className="font-black text-sm uppercase tracking-tight">{product.title}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.category?.[0]?.name || "Uncategorized"}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-5">
                        <div className="flex justify-center">
                          <div className="relative w-32 group/input">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-black transition-colors">
                              <DollarSign size={14} />
                            </span>
                            <input 
                              type="number"
                              value={currentPrice}
                              onChange={(e) => handleInputChange(product._id, 'price', e.target.value)}
                              className="w-full pl-8 pr-3 py-2 bg-gray-100 border-2 border-transparent rounded-lg font-bold text-center focus:bg-white focus:border-black transition-all outline-none"
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="flex justify-center">
                          <input 
                            type="number"
                            value={currentInventory}
                            onChange={(e) => handleInputChange(product._id, 'inventory', e.target.value)}
                            className="w-20 px-3 py-2 bg-gray-100 border-2 border-transparent rounded-lg font-bold text-center focus:bg-white focus:border-black transition-all outline-none"
                          />
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="flex justify-center">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 rounded-full flex items-center gap-2 whitespace-nowrap ${
                            isOut 
                              ? 'bg-red-50 text-red-500 border-red-200' 
                              : isLow 
                                ? 'bg-orange-50 text-orange-500 border-orange-200' 
                                : 'bg-green-50 text-green-500 border-green-200'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`} />
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleUpdate(product._id)}
                            disabled={!isDirty || isSaving}
                            className={`h-10 px-4 rounded-lg font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all ${
                              isDirty 
                                ? 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 translate-y-0 scale-100' 
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-0 scale-95'
                            } ${isSaving ? 'animate-pulse' : ''}`}
                          >
                            {isSaving ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Save size={14} />
                            )}
                            Save
                          </button>
                        </div>
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
