"use client"

import { useState, useEffect } from "react"
import { Plus, Trash, Save, Loader2 } from "lucide-react"

interface ProductFormProps {
  initialData?: any
  categories: any[]
  onSubmit: (data: any) => Promise<void>
  loading: boolean
}

export default function ProductForm({ initialData, categories, onSubmit, loading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    price: "",
    category: "",
    description: "",
    longDescription: "",
    inventory: 0,
    isPublished: true,
    ageRange: "",
    images: [] as { url: string, alt: string }[]
  })
  
  const [sizes, setSizes] = useState("")
  const [tags, setTags] = useState("")
  const [colors, setColors] = useState<{name: string, hex: string}[]>([])
  const [attributes, setAttributes] = useState<{name: string, value: string}[]>([])
  const [variations, setVariations] = useState<any[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        price: initialData.price?.toString() || "",
        category: initialData.category?._id || initialData.category || "",
        description: initialData.description || "",
        longDescription: initialData.longDescription || "",
        inventory: initialData.inventory || 0,
        isPublished: initialData.isPublished !== undefined ? initialData.isPublished : true,
        ageRange: initialData.ageRange || "",
        images: initialData.images || []
      })
      
      if (initialData.sizes) setSizes(initialData.sizes.join(", "))
      if (initialData.tags) setTags(initialData.tags.join(", "))
      if (initialData.colors) {
        setColors(initialData.colors.map((c: any) => ({ name: c.name, hex: c.hex || "#000000" })))
      }
      if (initialData.attributes) setAttributes(initialData.attributes)
      if (initialData.variations) setVariations(initialData.variations)
    }
  }, [initialData])

  const generateVariations = () => {
    const sizeArray = sizes.split(",").map(s => s.trim()).filter(Boolean)
    const colorArray = colors.map(c => c.name).filter(Boolean)
    
    let generated: any[] = []
    
    if (colorArray.length > 0 && sizeArray.length > 0) {
      colorArray.forEach(color => {
        sizeArray.forEach(size => {
          generated.push({
            combinationString: `${color} / ${size}`,
            attributes: { "Color": color, "Size": size },
            price: Number(formData.price) || 0,
            stock: 0,
            sku: `${formData.title.substring(0, 3).toUpperCase()}-${color.substring(0, 3).toUpperCase()}-${size}`,
            image: formData.images?.[0]?.url || ""
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
          image: formData.images?.[0]?.url || ""
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
          image: formData.images?.[0]?.url || ""
        })
      })
    }
    
    setVariations(generated)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const newUrls = [...(formData.images || [])];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataObj = new FormData();
        formDataObj.append('file', file);
        
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formDataObj,
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Failed to upload image ${i+1}`);
        }
        
        const data = await res.json();
        newUrls.push({ url: data.url, alt: formData.title });
      }
      
      setFormData(prev => ({ ...prev, images: newUrls }));
      
    } catch (err: any) {
      setError(err.message || "Failed to upload images");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToDelete = formData.images[index];
    if (!imageToDelete) return;
    
    // Only delete from Cloudinary if it's actually a cloudinary URL
    if (imageToDelete.url.includes("cloudinary.com")) {
      setUploadingImage(true);
      try {
        const res = await fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imageToDelete.url }),
        });
        
        if (!res.ok) {
          const data = await res.json();
          console.error("Cloudinary delete failed:", data.error);
        }
      } catch (err) {
        console.error("Cloudinary delete network error:", err);
      } finally {
        setUploadingImage(false);
      }
    }
    
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleSubmitInternal = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const submissionData = {
      ...formData,
      price: Number(formData.price),
      images: formData.images || [],
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      sizes: sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: colors.filter(c => c.name.trim() !== ''),
      attributes: attributes.filter(a => a.name.trim() !== ''),
      variations: variations.map(v => ({
        ...v,
        // Ensure attributes is a plain object if it came from Mongoose Map
        attributes: v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes
      }))
    }

    try {
      await onSubmit(submissionData)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    }
  }

  return (
    <form onSubmit={handleSubmitInternal} className="space-y-6 pb-20">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData(prev => ({
                    ...prev, 
                    title: newTitle,
                    slug: !initialData ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') : prev.slug
                  }));
                }}
                className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
                placeholder="Short sleeve t-shirt"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Long Description</label>
              <textarea 
                rows={8}
                value={formData.longDescription}
                onChange={(e) => setFormData(prev => ({...prev, longDescription: e.target.value}))}
                className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
                placeholder="Detailed description with key features..."
              />
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <label className="block text-sm font-medium text-gray-900">Media</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.images?.map((img: any, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group bg-gray-50">
                  <img 
                    src={img.url} 
                    alt={`Product image ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => handleRemoveImage(idx)}
                      className="bg-white rounded-md p-1.5 text-red-600 hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50"
                      title="Delete image"
                    >
                      {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Trash size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="relative aspect-square flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer group">
                {uploadingImage ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:text-gray-700">
                    <Plus size={20} className="group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-xs font-medium">Add files</span>
                    <input type="file" multiple className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">৳</span>
                  <input 
                    type="number" 
                    required min="0" step="1"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                    className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">Age Range</label>
                <input 
                  type="text" 
                  value={formData.ageRange}
                  onChange={(e) => setFormData(prev => ({...prev, ageRange: e.target.value}))}
                  className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
                  placeholder="e.g. 3-5, 8+, 12-14"
                />
              </div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Inventory</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">Quantity</label>
                <input 
                  type="number" 
                  required min="0"
                  value={formData.inventory}
                  onChange={(e) => setFormData(prev => ({...prev, inventory: parseInt(e.target.value) || 0}))}
                  className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h3 className="text-base font-semibold text-gray-900">Options</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-900">Colors</label>
                <button type="button" onClick={() => setColors([...colors, {name: '', hex: '#000000'}])} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Plus size={16}/> Add Color
                </button>
              </div>
              <div className="space-y-3">
                {colors.map((color, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input 
                      type="text" 
                      placeholder="Color Name" 
                      value={color.name} 
                      onChange={(e) => { 
                        const newColors = [...colors]; 
                        newColors[idx].name = e.target.value;
                        setColors(newColors); 
                      }} 
                      className="flex-1 bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none" 
                    />
                    <div className="h-[38px] w-[38px] rounded-lg border border-gray-300 relative overflow-hidden shrink-0 shadow-sm">
                      <input 
                        type="color" 
                        value={color.hex} 
                        onChange={(e) => { 
                          const newColors = [...colors]; 
                          newColors[idx].hex = e.target.value; 
                          setColors(newColors) 
                        }} 
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" 
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setColors(colors.filter((_, i) => i !== idx))} 
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-900">Sizes</label>
              <input 
                type="text" 
                placeholder="Separate with commas (e.g. S, M, L)"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={generateVariations}
                className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg text-sm transition-colors"
              >
                Generate Variants
              </button>
            </div>
            
            {variations.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-500">Variant</th>
                        <th className="px-4 py-3 font-medium text-gray-500">Price</th>
                        <th className="px-4 py-3 font-medium text-gray-500">Stock</th>
                        <th className="px-4 py-3 font-medium text-gray-500">SKU</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {variations.map((v, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 text-gray-900 font-medium">{v.combinationString}</td>
                          <td className="px-2 py-2">
                            <input type="number" value={v.price} onChange={e => { const vnew = [...variations]; vnew[i].price = Number(e.target.value); setVariations(vnew) }} className="w-full bg-white text-gray-900 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-500" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="number" value={v.stock} onChange={e => { const vnew = [...variations]; vnew[i].stock = Number(e.target.value); setVariations(vnew) }} className="w-full bg-white text-gray-900 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-500" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="text" value={v.sku} onChange={e => { const vnew = [...variations]; vnew[i].sku = e.target.value; setVariations(vnew) }} className="w-full bg-white text-gray-900 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-500" />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button type="button" onClick={() => setVariations(variations.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">
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

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-6">
          
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Status</h3>
            <div className="space-y-3">
              <select
                value={formData.isPublished ? "active" : "draft"}
                onChange={(e) => setFormData(prev => ({...prev, isPublished: e.target.value === "active"}))}
                className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow bg-white"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
              <p className="text-xs text-gray-500">
                {formData.isPublished ? "This product will be visible to all sales channels." : "This product will be hidden from all sales channels."}
              </p>
            </div>
          </div>

          {/* Organization Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h3 className="text-base font-semibold text-gray-900">Product organization</h3>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Category</label>
              <select 
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow bg-white"
              >
                <option value="" disabled>Select category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Product handle (URL)</label>
              <input 
                type="text" 
                required
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({...prev, slug: e.target.value.toLowerCase().replace(/ /g, '-')}))}
                className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Tags</label>
              <input 
                type="text" 
                placeholder="Separate with commas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {initialData ? 'Save changes' : 'Save product'}
        </button>
      </div>
    </form>
  )
}
