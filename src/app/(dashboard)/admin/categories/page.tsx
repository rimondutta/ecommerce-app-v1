"use client"

import { useEffect, useState } from "react"
import { Search, Plus, Save, Trash2, Edit } from "lucide-react"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form state for creating a new category inline
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ name: "", slug: "", isActive: true })
  const [formError, setFormError] = useState("")

  const fetchCategories = () => {
    setLoading(true)
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create category")
      }
      
      setIsCreating(false)
      setFormData({ name: "", slug: "", isActive: true })
      fetchCategories()
    } catch (err: any) {
      setFormError(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      fetchCategories()
    } catch (err) {
      console.error(err)
    }
  }

  // Shopify input style
  const inputStyle = "w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] transition-colors"
  const labelStyle = "block text-sm font-medium text-[#202223] mb-1.5"

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#202223]">Collections</h1>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-[#008060] hover:bg-[#006e52] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          {isCreating ? "Cancel" : <><Plus size={16} /> Create collection</>}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-base font-semibold text-[#202223] border-b border-gray-100 pb-3 mb-2">Create new collection</h2>
          {formError && <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg text-sm">{formError}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelStyle}>Title</label>
              <input 
                type="text" required
                placeholder="e.g. Summer Collection"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>URL handle</label>
              <input 
                type="text" required
                placeholder="summer-collection"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                className={inputStyle}
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-[#008060] hover:bg-[#006e52] text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
              <Save size={16} /> Save Collection
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
           <Search size={20} className="text-gray-400" />
           <input 
             type="text" 
             placeholder="Search collections..." 
             className="w-full focus:outline-none font-medium text-[#202223] placeholder-gray-400 text-sm"
           />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Handle</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-gray-500">Loading collections...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-gray-500">No collections found.</td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-[#202223] text-sm">{category.name}</td>
                    <td className="p-4 text-sm text-gray-500">{category.slug}</td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${category.isActive ? 'bg-[#AEE9D1] text-[#008060]' : 'bg-gray-100 text-gray-600'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleDelete(category._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
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
