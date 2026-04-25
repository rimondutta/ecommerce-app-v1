"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Plus, Trash } from "lucide-react"

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    price: "",
    category: "",
    description: "",
    inventory: 0,
    isPublished: true,
    imageUrl: ""
  })

  // Dynamic fields
  const [tags, setTags] = useState("")
  const [sizes, setSizes] = useState("")
  const [colors, setColors] = useState<{name: string, hex: string}[]>([])
  const [attributes, setAttributes] = useState<{name: string, value: string}[]>([])
  
  // Variations
  const [variations, setVariations] = useState<{
    combinationString: string, 
    attributes: Record<string, string>, 
    price: number, 
    stock: number, 
    sku: string, 
    image: string
  }[]>([])

  const generateVariations = () => {
    const sizeArray = sizes.split(",").map(s => s.trim()).filter(Boolean)
    const colorArray = colors.map(c => c.name).filter(Boolean)
    
    let generated: typeof variations = []
    
    if (colorArray.length > 0 && sizeArray.length > 0) {
      colorArray.forEach(color => {
        sizeArray.forEach(size => {
          generated.push({
            combinationString: `${color} / ${size}`,
            attributes: { "Color": color, "Size": size },
            price: Number(formData.price) || 0,
            stock: 0,
            sku: `${formData.title.substring(0, 3).toUpperCase()}-${color.substring(0, 3).toUpperCase()}-${size}`,
            image: formData.imageUrl || ""
          })
        })
      })
    } else if (colorArray.length > 0) {
      colorArray.forEach(color => {
        generated.push({
          combinationString: color,
          attributes: { "Color": color },
          price: Number(formData.price) || 0,
          stock: 0,
          sku: `${formData.title.substring(0, 3).toUpperCase()}-${color.substring(0, 3).toUpperCase()}`,
          image: formData.imageUrl || ""
        })
      })
    } else if (sizeArray.length > 0) {
      sizeArray.forEach(size => {
        generated.push({
          combinationString: size,
          attributes: { "Size": size },
          price: Number(formData.price) || 0,
          stock: 0,
          sku: `${formData.title.substring(0, 3).toUpperCase()}-${size}`,
          image: formData.imageUrl || ""
        })
      })
    }
    
    setVariations(generated)
  }

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories)
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          images: formData.imageUrl ? [{ url: formData.imageUrl, alt: formData.title }] : [],
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          sizes: sizes.split(",").map(s => s.trim()).filter(Boolean),
          colors,
          attributes,
          variations
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create product")
      }

      router.push("/admin/products")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataObj,
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload image");
      }
      
      const data = await res.json();
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Shopify input style
  const inputStyle = "w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] transition-colors"
  const labelStyle = "block text-sm font-medium text-[#202223] mb-1.5"

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 text-gray-500 hover:text-[#202223] hover:bg-gray-200/50 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[#202223]">Add Product</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Content Column */}
        <div className="flex-1 space-y-6">
          
          {/* Default Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-5">
              <div>
                <label className={labelStyle}>Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="Short sleeve t-shirt"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setFormData({
                      ...formData, 
                      title: newTitle,
                      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    });
                  }}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Description</label>
                <textarea 
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#202223]">Media</h2>
            </div>
            <div className="p-6 space-y-4">
              {formData.imageUrl ? (
                <div className="relative border rounded-lg overflow-hidden group">
                  <img 
                    src={formData.imageUrl} 
                    alt="Product preview" 
                    className="w-full h-64 object-contain bg-gray-50"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                      <Trash size={18} /> Delete Image
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className={labelStyle}>Upload Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:bg-gray-50 transition-colors">
                    <div className="space-y-1 text-center">
                      {uploadingImage ? (
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="w-8 h-8 border-4 border-[#008060] border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm text-gray-500">Uploading to Cloudinary...</p>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#005bd3] hover:text-[#004299] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#005bd3]">
                              <span>Upload a file</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {!formData.imageUrl && (
                <>
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>
                  <div>
                    <label className={labelStyle}>Image URL</label>
                    <input 
                      type="url" 
                      placeholder="https://"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className={inputStyle}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#202223]">Pricing & Inventory</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Price (৳)</label>
                <input 
                  type="number" 
                  required min="0" step="1"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Base Inventory</label>
                <input 
                  type="number" 
                  required min="0"
                  placeholder="0"
                  value={formData.inventory}
                  onChange={(e) => setFormData({...formData, inventory: parseInt(e.target.value)})}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Variants Generator Tool */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#202223]">Variants</h2>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Sizes (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="S, M, L, XL"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Tags (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="summer, oversized, trending"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Colors List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className={labelStyle}>Colors</label>
                  <button type="button" onClick={() => setColors([...colors, {name: '', hex: '#000000'}])} className="text-sm flex items-center gap-1 font-medium text-[#005bd3] hover:underline">
                    <Plus size={16}/> Add another value
                  </button>
                </div>
                <div className="space-y-3">
                  {colors.map((color, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center w-full">
                        <input type="text" placeholder="Color Name (e.g. Midnight Black)" value={color.name} onChange={(e) => { const newColors = [...colors]; newColors[idx].name = e.target.value; setColors(newColors) }} className={inputStyle} />
                        <div className="flex w-full sm:w-auto items-center gap-3">
                          <div className="h-10 w-16 min-w-[64px] rounded-lg border border-gray-300 overflow-hidden shrink-0">
                            <input type="color" value={color.hex} onChange={(e) => { const newColors = [...colors]; newColors[idx].hex = e.target.value; setColors(newColors) }} className="w-full h-full p-0 border-0 cursor-pointer" />
                          </div>
                          <button type="button" onClick={() => setColors(colors.filter((_, i) => i !== idx))} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash size={18} /></button>
                        </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={generateVariations}
                  className="px-4 py-2 border border-gray-300 text-[#202223] font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Generate Variations
                </button>
              </div>

              {/* Variations Table */}
              {variations.length > 0 && (
                <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-gray-700">Variant</th>
                          <th className="px-4 py-3 font-semibold text-gray-700">Price</th>
                          <th className="px-4 py-3 font-semibold text-gray-700 w-24">Stock</th>
                          <th className="px-4 py-3 font-semibold text-gray-700 min-w-[120px]">SKU</th>
                          <th className="px-4 py-3 font-semibold text-gray-700">Image URL</th>
                          <th className="px-4 py-3 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {variations.map((v, i) => (
                          <tr key={i} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-medium text-[#202223]">{v.combinationString}</td>
                            <td className="px-4 py-2">
                              <input type="number" value={v.price} onChange={e => { const vnew = [...variations]; vnew[i].price = Number(e.target.value); setVariations(vnew) }} className="w-full border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#008060] focus:border-[#008060] border bg-white" />
                            </td>
                            <td className="px-4 py-2">
                              <input type="number" value={v.stock} onChange={e => { const vnew = [...variations]; vnew[i].stock = Number(e.target.value); setVariations(vnew) }} className="w-full border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#008060] focus:border-[#008060] border bg-white" />
                            </td>
                            <td className="px-4 py-2">
                              <input type="text" value={v.sku} onChange={e => { const vnew = [...variations]; vnew[i].sku = e.target.value; setVariations(vnew) }} className="w-full border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#008060] focus:border-[#008060] border bg-white" placeholder="SKU" />
                            </td>
                            <td className="px-4 py-2">
                              <input type="text" value={v.image} onChange={e => { const vnew = [...variations]; vnew[i].image = e.target.value; setVariations(vnew) }} className="w-full border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#008060] focus:border-[#008060] border bg-white" placeholder="https://" />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button type="button" onClick={() => setVariations(variations.filter((_, idx) => idx !== i))} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                                <Trash size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specifications Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base font-semibold text-[#202223]">Specifications</h2>
              <button type="button" onClick={() => setAttributes([...attributes, {name: '', value: ''}])} className="text-sm flex items-center gap-1 font-medium text-[#005bd3] hover:underline"><Plus size={16}/> Add row</button>
            </div>
            <div className="p-6 space-y-3">
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center w-full">
                    <input type="text" placeholder="e.g. Material" value={attr.name} onChange={(e) => { const newAttrs = [...attributes]; newAttrs[idx].name = e.target.value; setAttributes(newAttrs) }} className={inputStyle} />
                    <input type="text" placeholder="e.g. 100% Organic Cotton" value={attr.value} onChange={(e) => { const newAttrs = [...attributes]; newAttrs[idx].value = e.target.value; setAttributes(newAttrs) }} className={inputStyle} />
                    <button type="button" onClick={() => setAttributes(attributes.filter((_, i) => i !== idx))} className="p-2.5 sm:w-auto w-full text-center shrink-0 justify-center flex text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash size={18} /></button>
                </div>
              ))}
              {attributes.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No custom attributes added.</p>}
            </div>
          </div>

        </div>

        {/* Right Sidebar Column */}
        <div className="w-full lg:w-[320px] space-y-6 shrink-0">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#202223]">Status</h2>
            </div>
            <div className="p-6">
              <select 
                value={formData.isPublished ? 'active' : 'draft'}
                onChange={(e) => setFormData({...formData, isPublished: e.target.value === 'active'})}
                className={inputStyle}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#202223]">Product Organization</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className={labelStyle}>Category</label>
                <select 
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className={inputStyle}
                >
                  <option value="" disabled>Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelStyle}>URL Handle</label>
                <input 
                  type="text" 
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Global Save Button - Sticky or Bottom */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-end z-40">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#008060] hover:bg-[#006e52] text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : <><Save size={16} /> Save Product</>}
          </button>
        </div>

      </form>
    </div>
  )
}
