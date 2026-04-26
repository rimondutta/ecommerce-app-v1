"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Plus, Trash } from "lucide-react"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
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
  const [sizes, setSizes] = useState("")
  const [tags, setTags] = useState("")
  const [colors, setColors] = useState<{name: string, hex: string}[]>([])
  const [attributes, setAttributes] = useState<{name: string, value: string}[]>([])
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
    // Fetch categories
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories)
      })
      .catch(console.error)

    // Fetch product details
    fetch(`/api/admin/products/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setFormData({
            title: data.product.title,
            slug: data.product.slug,
            price: data.product.price.toString(),
            category: data.product.category || "",
            description: data.product.description || "",
            inventory: data.product.inventory || 0,
            isPublished: data.product.isPublished,
            imageUrl: data.product.images?.[0]?.url || ""
          })
          if (data.product.sizes) {
            setSizes(data.product.sizes.join(", "))
          }
          if (data.product.tags) {
            setTags(data.product.tags.join(", "))
          }
          if (data.product.attributes) {
            setAttributes(data.product.attributes)
          }
          if (data.product.variations) {
            setVariations(data.product.variations)
          }
          if (data.product.colors) {
            setColors(data.product.colors.map((c: any) => ({ name: c.name, hex: c.hex || "#000000" })))
          }
        } else if (data.error) {
          setError(data.error)
        }
        setFetching(false)
      })
      .catch(err => {
        console.error(err)
        setError("Failed to fetch product details.")
        setFetching(false)
      })
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          images: formData.imageUrl ? [{ url: formData.imageUrl, alt: formData.title }] : [],
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          sizes: sizes.split(",").map(s => s.trim()).filter(Boolean),
          colors: colors.filter(c => c.name.trim() !== ''),
          attributes,
          variations
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update product")
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

  if (fetching) return <div className="p-8 text-center font-bold tracking-widest uppercase">Loading Product...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 border-2 border-transparent hover:border-black transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tight">Edit Product</h1>
      </div>

      {error && <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-bold text-sm uppercase">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest">Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setFormData({
                  ...formData, 
                  title: newTitle,
                  slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                });
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
              onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
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
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest">Inventory Count</label>
            <input 
              type="number" 
              required min="0"
              value={formData.inventory}
              onChange={(e) => setFormData({...formData, inventory: parseInt(e.target.value)})}
              className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest">Description</label>
          <textarea 
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest">Category</label>
            <select 
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
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
              <div className="relative border-2 border-black rounded-none overflow-hidden group mb-4">
                <img 
                  src={formData.imageUrl} 
                  alt="Product preview" 
                  className="w-full h-48 object-contain bg-gray-50"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: "" })}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none border-2 border-black"
                  >
                    <Trash size={16} /> Delete Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 items-stretch h-12">
                <input 
                  type="url" 
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full border-2 border-black px-3 text-sm focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                />
                <div className="relative border-2 border-black bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center shrink-0 w-32 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
                  {uploadingImage ? (
                     <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <label htmlFor="file-upload-edit" className="w-full h-full flex items-center justify-center cursor-pointer text-[10px] font-black uppercase tracking-widest">
                      Upload File
                      <input id="file-upload-edit" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              placeholder="e.g. summer, oversized, trending"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
            />
          </div>
          
          {/* Attributes */}
          <div className="space-y-4 col-span-1 md:col-span-2 pt-4">
            <div className="flex justify-between items-center border-b-4 border-black pb-2">
              <label className="block text-xs font-bold uppercase tracking-widest">Specifications</label>
              <button type="button" onClick={() => setAttributes([...attributes, {name: '', value: ''}])} className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-2 py-1 hover:bg-black hover:text-white transition-colors flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                <Plus size={14}/> Add Row
              </button>
            </div>
            <div className="space-y-3">
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center w-full">
                    <input type="text" placeholder="e.g. Material" value={attr.name} onChange={(e) => { const newAttrs = [...attributes]; newAttrs[idx].name = e.target.value; setAttributes(newAttrs) }} className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow" />
                    <input type="text" placeholder="e.g. 100% Organic Cotton" value={attr.value} onChange={(e) => { const newAttrs = [...attributes]; newAttrs[idx].value = e.target.value; setAttributes(newAttrs) }} className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow" />
                    <button type="button" onClick={() => setAttributes(attributes.filter((_, i) => i !== idx))} className="p-3.5 border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none shrink-0"><Trash size={20} /></button>
                </div>
              ))}
              {attributes.length === 0 && <p className="text-xs font-bold uppercase tracking-widest text-gray-500 py-2">No specifications added.</p>}
            </div>
          </div>

          <div className="space-y-4 col-span-1 md:col-span-2 pt-4">
            <div className="flex justify-between items-center border-b-4 border-black pb-2">
              <label className="block text-xs font-bold uppercase tracking-widest">Colors</label>
              <button type="button" onClick={() => setColors([...colors, {name: '', hex: '#000000'}])} className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-2 py-1 hover:bg-black hover:text-white transition-colors flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                <Plus size={14}/> Add Color
              </button>
            </div>
            
            <div className="space-y-3">
              {colors.map((color, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center w-full">
                    <input type="text" placeholder="Color Name (e.g. Midnight Black)" value={color.name} onChange={(e) => { 
                      const newColors = [...colors]; 
                      const newName = e.target.value;
                      newColors[idx].name = newName; 
                      
                      // Auto-map common colors
                      const standardColors: Record<string, string> = {
                        "red": "#ff0000", "blue": "#0000ff", "green": "#008000", "black": "#000000",
                        "white": "#ffffff", "yellow": "#ffff00", "orange": "#ffa500", "purple": "#800080",
                        "pink": "#ffc0cb", "gray": "#808080", "grey": "#808080", "navy": "#000080",
                        "olive": "#808000", "maroon": "#800000", "teal": "#008080", "silver": "#c0c0c0",
                        "gold": "#ffd700", "brown": "#a52a2a"
                      };
                      const mappedHex = standardColors[newName.toLowerCase().trim()];
                      if (mappedHex && (!color.hex || color.hex === '#000000')) {
                        newColors[idx].hex = mappedHex;
                      }
                      
                      setColors(newColors); 
                    }} className="w-full border-2 border-black p-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow" />
                    <div className="flex w-full sm:w-auto items-center gap-3">
                      <div className="h-[52px] w-20 min-w-[80px] border-2 border-black overflow-hidden shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
                        <input type="color" value={color.hex} onChange={(e) => { const newColors = [...colors]; newColors[idx].hex = e.target.value; setColors(newColors) }} className="absolute -top-2 -left-2 w-32 h-32 p-0 border-0 cursor-pointer object-cover" />
                      </div>
                      <button type="button" onClick={() => setColors(colors.filter((_, i) => i !== idx))} className="p-3.5 border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"><Trash size={20} /></button>
                    </div>
                </div>
              ))}
              {colors.length === 0 && <p className="text-xs font-bold uppercase tracking-widest text-gray-500 py-2">No colors added.</p>}
            </div>
          </div>
        </div>

        {/* Variations Table */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center border-b-4 border-black pb-2">
            <label className="block text-xs font-bold uppercase tracking-widest">Variations</label>
            <button 
              type="button" 
              onClick={generateVariations}
              className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-2 py-1 hover:bg-black hover:text-white transition-colors flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Generate Variations
            </button>
          </div>
          
          {variations.length > 0 ? (
            <div className="border-2 border-black overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-100 border-b-2 border-black">
                    <tr>
                      <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs border-r-2 border-black">Variant</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs border-r-2 border-black">Price</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs border-r-2 border-black w-24">Stock</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs border-r-2 border-black min-w-[120px]">SKU</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs border-r-2 border-black">Image URL</th>
                      <th className="px-4 py-3 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black">
                    {variations.map((v, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-xs border-r-2 border-black">{v.combinationString}</td>
                        <td className="px-4 py-2 border-r-2 border-black">
                          <input type="number" value={v.price} onChange={e => { const vnew = [...variations]; vnew[i].price = Number(e.target.value); setVariations(vnew) }} className="w-full border-2 border-black px-2 py-1.5 focus:outline-none focus:ring-0" />
                        </td>
                        <td className="px-4 py-2 border-r-2 border-black">
                          <input type="number" value={v.stock} onChange={e => { const vnew = [...variations]; vnew[i].stock = Number(e.target.value); setVariations(vnew) }} className="w-full border-2 border-black px-2 py-1.5 focus:outline-none focus:ring-0" />
                        </td>
                        <td className="px-4 py-2 border-r-2 border-black">
                          <input type="text" value={v.sku} onChange={e => { const vnew = [...variations]; vnew[i].sku = e.target.value; setVariations(vnew) }} className="w-full border-2 border-black px-2 py-1.5 focus:outline-none focus:ring-0" placeholder="SKU" />
                        </td>
                        <td className="px-4 py-2 border-r-2 border-black">
                          <input type="text" value={v.image} onChange={e => { const vnew = [...variations]; vnew[i].image = e.target.value; setVariations(vnew) }} className="w-full border-2 border-black px-2 py-1.5 focus:outline-none focus:ring-0" placeholder="https://" />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button type="button" onClick={() => setVariations(variations.filter((_, idx) => idx !== i))} className="p-1.5 text-black hover:text-white hover:bg-black rounded transition-colors border-2 border-transparent hover:border-black">
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 py-2">No variations generated.</p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input 
            type="checkbox" 
            id="published"
            checked={formData.isPublished}
            onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
            className="w-5 h-5 border-2 border-black rounded-none outline-none appearance-none checked:bg-black checked:after:content-['✓'] checked:after:text-white checked:after:flex checked:after:justify-center checked:after:items-center"
          />
          <label htmlFor="published" className="text-sm font-bold uppercase tracking-wider cursor-pointer">Published to Storefront</label>
        </div>

        <div className="pt-6 border-t-4 border-black flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Updating...' : <><Save size={18} /> Update Product</>}
          </button>
        </div>

      </form>
    </div>
  )
}
