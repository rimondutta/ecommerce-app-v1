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
    inventory: 0,
    isPublished: true,
    imageUrl: ""
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
        inventory: initialData.inventory || 0,
        isPublished: initialData.isPublished !== undefined ? initialData.isPublished : true,
        imageUrl: initialData.images?.[0]?.url || ""
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

  const handleSubmitInternal = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const submissionData = {
      ...formData,
      price: Number(formData.price),
      images: formData.imageUrl ? [{ url: formData.imageUrl, alt: formData.title }] : [],
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
    <form onSubmit={handleSubmitInternal} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-8">
      {error && (
        <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-bold text-sm uppercase">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest">Title</label>
          <input 
            type="text" 
            required
            value={formData.title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setFormData(prev => ({
                ...prev, 
                title: newTitle,
                // Only auto-generate slug for new products
                slug: !initialData ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') : prev.slug
              }));
            }}
            className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest">Slug (URL)</label>
          <input 
            type="text" 
            required
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({...prev, slug: e.target.value.toLowerCase().replace(/ /g, '-')}))}
            className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest">Price (৳)</label>
          <input 
            type="number" 
            required min="0" step="1"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
            className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest">Inventory Count</label>
          <input 
            type="number" 
            required min="0"
            value={formData.inventory}
            onChange={(e) => setFormData(prev => ({...prev, inventory: parseInt(e.target.value) || 0}))}
            className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-widest">Description</label>
        <textarea 
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
          className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest">Category</label>
          <select 
            required
            value={formData.category}
            onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
            className="w-full border-2 border-black p-3 text-sm focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow appearance-none bg-white cursor-pointer"
          >
            <option value="" disabled>Select a category...</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest">Image</label>
          {formData.imageUrl ? (
            <div className="relative border-2 border-black rounded-none overflow-hidden group">
              <img 
                src={formData.imageUrl} 
                alt="Product preview" 
                className="w-full h-48 object-contain bg-gray-50"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none border-2 border-black"
                >
                  <Trash size={16} /> Delete Image
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 items-stretch h-[52px]">
              <input 
                type="url" 
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({...prev, imageUrl: e.target.value}))}
                className="w-full border-2 border-black px-3 text-sm focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
              />
              <div className="relative border-2 border-black bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center shrink-0 w-32 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
                {uploadingImage ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer text-[10px] font-black uppercase tracking-widest">
                    Upload
                    <input type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Variants & Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-black/10">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest">Sizes (comma separated)</label>
          <input 
            type="text" 
            placeholder="e.g. S, M, L"
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest">Tags (comma separated)</label>
          <input 
            type="text" 
            placeholder="e.g. summer, oversized"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          />
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-4 pt-4 border-t-2 border-black/10">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold uppercase tracking-widest">Colors</label>
          <button type="button" onClick={() => setColors([...colors, {name: '', hex: '#000000'}])} className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors flex items-center gap-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
            <Plus size={14}/> Add Color
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
                className="flex-1 border-2 border-black p-3 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
              />
              <div className="h-[52px] w-14 border-2 border-black relative overflow-hidden shrink-0">
                <input 
                  type="color" 
                  value={color.hex} 
                  onChange={(e) => { 
                    const newColors = [...colors]; 
                    newColors[idx].hex = e.target.value; 
                    setColors(newColors) 
                  }} 
                  className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" 
                />
              </div>
              <button 
                type="button" 
                onClick={() => setColors(colors.filter((_, i) => i !== idx))} 
                className="p-3 border-2 border-black hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Variations */}
      <div className="space-y-4 pt-4 border-t-2 border-black/10">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold uppercase tracking-widest">Variations</label>
          <button 
            type="button" 
            onClick={generateVariations}
            className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Generate from Colors & Sizes
          </button>
        </div>
        
        {variations.length > 0 && (
          <div className="border-4 border-black overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 border-b-4 border-black">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">Variant</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">Price</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">Stock</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px]">SKU</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {variations.map((v, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-bold">{v.combinationString}</td>
                    <td className="px-2 py-2">
                      <input type="number" value={v.price} onChange={e => { const vnew = [...variations]; vnew[i].price = Number(e.target.value); setVariations(vnew) }} className="w-full border-2 border-black p-1.5" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" value={v.stock} onChange={e => { const vnew = [...variations]; vnew[i].stock = Number(e.target.value); setVariations(vnew) }} className="w-full border-2 border-black p-1.5" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="text" value={v.sku} onChange={e => { const vnew = [...variations]; vnew[i].sku = e.target.value; setVariations(vnew) }} className="w-full border-2 border-black p-1.5" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => setVariations(variations.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700">
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visibility */}
      <div className="flex items-center gap-3 pt-6 border-t-2 border-black/10">
        <button 
          type="button"
          onClick={() => setFormData(prev => ({...prev, isPublished: !prev.isPublished}))}
          className={`w-12 h-6 border-2 border-black relative transition-colors ${formData.isPublished ? 'bg-black' : 'bg-white'}`}
        >
          <div className={`absolute top-0.5 bottom-0.5 w-4 transition-all ${formData.isPublished ? 'right-0.5 bg-white' : 'left-0.5 bg-black'}`} />
        </button>
        <label className="text-sm font-bold uppercase tracking-wider cursor-pointer">Published to Storefront</label>
      </div>

      {/* Submit */}
      <div className="pt-6 flex justify-end">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-black text-white px-10 py-5 text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black border-4 border-black transition-all flex items-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <><Save size={20} /> {initialData ? 'Update Product' : 'Create Product'}</>
          )}
        </button>
      </div>
    </form>
  )
}
