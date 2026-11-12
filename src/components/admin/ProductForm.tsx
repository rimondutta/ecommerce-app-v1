"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Trash, Save, Loader2, AlertCircle, ChevronDown, ChevronUp, Image as ImageIcon, Camera, Upload, X } from "lucide-react"
import { isCloudinaryUrl } from "@/lib/utils"
import RichDescriptionEditor from "@/components/admin/RichDescriptionEditor"

// ─── Types ─────────────────────────────────────────────────────────────────

interface VariationTypeItem {
  _id: string
  name: string
  slug?: string
  description?: string
  displayType?: string
}

interface VariationValueItem {
  _id: string
  variationType?: string
  value: string
  slug?: string
  colorHex?: string
}

interface CategoryOption {
  _id: string
  name: string
  slug?: string
}

interface ProductVariantData {
  _id?: string
  combination: Array<{
    variationType: string | { _id: string; name: string }
    variationValue: string | { _id: string; value: string }
  }>
  combinationLabel?: string
  sku: string
  price: number
  comparePrice?: number | null
  stock: number
  isActive: boolean
  images?: Array<{ url: string; alt: string }>
}

interface ProductInitialData {
  _id?: string
  title?: string
  slug?: string
  price?: number
  compareAtPrice?: number
  category?: CategoryOption | string
  description?: string
  longDescription?: string
  inventory?: number
  isPublished?: boolean
  ageRange?: string
  images?: Array<{ url: string; alt: string }>
  tags?: string[];
  attributes?: Array<{ name: string; value: string }>
  hasVariations?: boolean
  variationTypes?: Array<string | VariationTypeItem>
  variants?: ProductVariantData[]
}

interface ProductFormProps {
  initialData?: ProductInitialData
  categories: CategoryOption[]
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  loading: boolean
}

interface CombinationItem {
  variationType: string   // VariationType ObjectId string
  variationValue: string  // VariationValue ObjectId string
}

interface VariantRow {
  combination: CombinationItem[]
  combinationLabel: string
  sku: string
  price: number | string
  comparePrice: number | string
  stock: number | string
  isActive: boolean
  image?: string
}

// ─── Generic typed cartesian product ──────────────────────────────────────
function cartesian<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]]
  const [first, ...rest] = arrays
  const restCombos = cartesian(rest)
  return first.flatMap(item => restCombos.map(combo => [item, ...combo]))
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function ProductForm({ initialData, categories, onSubmit, loading }: ProductFormProps) {

  // ── Form data ──
  const [formData, setFormData] = useState(() => ({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    price: initialData?.price?.toString() || "",
    compareAtPrice: initialData?.compareAtPrice?.toString() || "",
    category: (typeof initialData?.category === 'object' ? initialData.category?._id : initialData?.category) || "",
    description: initialData?.description || "",
    longDescription: initialData?.longDescription || "",
    inventory: initialData?.inventory || 0,
    isPublished: initialData?.isPublished !== undefined ? initialData.isPublished : true,
    ageRange: initialData?.ageRange || "",
    images: (initialData?.images || []) as { url: string; alt: string }[],
  }))
  const [tags, setTags] = useState(() => (initialData?.tags ? initialData.tags.join(", ") : ""))
  const [attributes, setAttributes] = useState<{ name: string; value: string }[]>(() => initialData?.attributes || [])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")

  // ── Variation system ──
  const [hasVariations, setHasVariations] = useState(() => Boolean(initialData?.hasVariations))
  const [typesLoading, setTypesLoading] = useState(true)
  const [availableTypes, setAvailableTypes] = useState<VariationTypeItem[]>([])
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>(() => {
    return (initialData?.variationTypes || [])
      .map(t => (typeof t === 'string' ? t : t?._id?.toString()))
      .filter(Boolean) as string[]
  })
  // typeValues[typeId] = VariationValue[] | undefined (undefined = not yet fetched)
  const [typeValues, setTypeValues] = useState<Record<string, VariationValueItem[]>>({})
  const [valuesLoading, setValuesLoading] = useState<Record<string, boolean>>({})
  // selectedValues[typeId] = array of selected VariationValue._id strings
  const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>(() => {
    const selVals: Record<string, string[]> = {}
    if (initialData?.variants) {
      initialData.variants.forEach(v => {
        (v.combination || []).forEach(c => {
          const tId = (typeof c.variationType === 'string' ? c.variationType : c.variationType?._id)?.toString()
          const vId = (typeof c.variationValue === 'string' ? c.variationValue : c.variationValue?._id)?.toString()
          if (tId && vId) {
            if (!selVals[tId]) selVals[tId] = []
            if (!selVals[tId].includes(vId)) selVals[tId].push(vId)
          }
        })
      })
    }
    return selVals
  })
  const [variantRows, setVariantRows] = useState<VariantRow[]>(() => {
    if (initialData?.variants && initialData.variants.length > 0) {
      return initialData.variants.map(v => {
        const combo: CombinationItem[] = (v.combination || [])
          .map(c => {
            const tId = (typeof c.variationType === 'string' ? c.variationType : c.variationType?._id)?.toString()
            const vId = (typeof c.variationValue === 'string' ? c.variationValue : c.variationValue?._id)?.toString()
            return { variationType: tId || '', variationValue: vId || '' }
          })
          .filter(c => c.variationType && c.variationValue)

        const firstImg = v.images?.[0]
        const imgUrl = typeof firstImg === 'string' ? firstImg : (firstImg as { url?: string })?.url || ''

        return {
          combination: combo,
          combinationLabel: v.combinationLabel || '',
          sku: v.sku || '',
          price: v.price ?? 0,
          comparePrice: v.comparePrice ?? '',
          stock: v.stock ?? 0,
          isActive: v.isActive !== false,
          image: imgUrl,
        }
      })
    }
    return []
  })
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null)
  const [pickingImageForVariant, setPickingImageForVariant] = useState<number | null>(null)
  const [uploadingVariantImage, setUploadingVariantImage] = useState(false)

  const handleVariantDirectUpload = async (variantIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingVariantImage(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to upload image")
      }
      const data = await res.json()
      const newImgUrl = data.url
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: newImgUrl, alt: `${formData.title} - ${variantRows[variantIdx]?.combinationLabel || ''}` }]
      }))
      updateVariantRow(variantIdx, "image", newImgUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setUploadingVariantImage(false)
      e.target.value = ""
    }
  }

  // ── Sync if initialData is loaded/changed asynchronously ──
  const [prevInitialId, setPrevInitialId] = useState(() => initialData?._id)
  if (initialData && initialData._id !== prevInitialId) {
    setPrevInitialId(initialData._id)
    setFormData({
      title: initialData.title || "",
      slug: initialData.slug || "",
      price: initialData.price?.toString() || "",
      compareAtPrice: initialData.compareAtPrice?.toString() || "",
      category: (typeof initialData.category === 'object' ? initialData.category?._id : initialData.category) || "",
      description: initialData.description || "",
      longDescription: initialData.longDescription || "",
      inventory: initialData.inventory || 0,
      isPublished: initialData.isPublished !== undefined ? initialData.isPublished : true,
      ageRange: initialData.ageRange || "",
      images: (initialData.images || []) as { url: string; alt: string }[],
    })
    if (initialData.tags) setTags(initialData.tags.join(", "))
    if (initialData.attributes) setAttributes(initialData.attributes)
  }

  // ── Fetch all available variation types once ──
  useEffect(() => {
    let ignore = false
    fetch('/api/admin/variation-types')
      .then(res => res.json())
      .then(data => { if (!ignore && data.variationTypes) setAvailableTypes(data.variationTypes) })
      .catch(() => { /* silent — user will see empty state */ })
      .finally(() => { if (!ignore) setTypesLoading(false) })
    return () => { ignore = true }
  }, [])

  // ── Fetch values for newly selected types (once per type) ──
  useEffect(() => {
    selectedTypeIds.forEach(typeId => {
      // Skip if already loaded or currently loading
      if (typeValues[typeId] !== undefined || valuesLoading[typeId]) return
      setValuesLoading(prev => ({ ...prev, [typeId]: true }))
      fetch(`/api/admin/variation-types/${typeId}/values`)
        .then(res => res.json())
        .then(data => {
          setTypeValues(prev => ({ ...prev, [typeId]: data.values || [] }))
        })
        .catch(() => setTypeValues(prev => ({ ...prev, [typeId]: [] })))
        .finally(() => setValuesLoading(prev => ({ ...prev, [typeId]: false })))
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTypeIds])

  // ── Regenerate variant rows via cartesian product during render ──
  const [prevVariationKey, setPrevVariationKey] = useState(() => {
    return `${hasVariations}-${selectedTypeIds.join(",")}-${JSON.stringify(selectedValues)}-${formData.title}-${formData.price}`
  })
  const variationKey = `${hasVariations}-${selectedTypeIds.join(",")}-${JSON.stringify(selectedValues)}-${Object.keys(typeValues).length}-${formData.title}-${formData.price}`

  if (variationKey !== prevVariationKey) {
    setPrevVariationKey(variationKey)
    if (!hasVariations || selectedTypeIds.length === 0) {
      if (variantRows.length > 0) setVariantRows([])
    } else {
      const validTypes = selectedTypeIds.filter(tId =>
        availableTypes.some(t => t._id === tId) &&
        Array.isArray(typeValues[tId]) &&
        (selectedValues[tId]?.length ?? 0) > 0
      )

      if (validTypes.length === 0) {
        if (variantRows.length > 0) setVariantRows([])
      } else {
        const valueArrays = validTypes.map(tId => {
          const typeObj = availableTypes.find(t => t._id === tId)!
          const selIds = selectedValues[tId]
          return (typeValues[tId] || [])
            .filter((v: VariationValueItem) => selIds.includes(v._id))
            .map((v: VariationValueItem) => ({ typeObj, valueObj: v }))
        })

        const nonEmpty = valueArrays.filter(arr => arr.length > 0)
        if (nonEmpty.length === 0) {
          if (variantRows.length > 0) setVariantRows([])
        } else {
          const combos = cartesian(nonEmpty)
          const prefix = (formData.title || "PRD").substring(0, 3).toUpperCase()
          const basePrice = Number(formData.price) || 0

          setVariantRows(prevRows => combos.map(combo => {
            const label = combo.map(c => c.valueObj.value).join(" / ")
            const existing = prevRows.find(r => r.combinationLabel === label)
            const skuParts = combo.map(c =>
              ((c.valueObj.slug as string | undefined) || c.valueObj.value || 'X').substring(0, 4).toUpperCase()
            )

            // Auto-detect image from uploaded product images by matching color name
            let assignedImage = existing?.image || ''
            if (!assignedImage && formData.images.length > 0) {
              const labelLower = label.toLowerCase()
              const matched = formData.images.find(img => {
                const alt = (img.alt || '').toLowerCase()
                const url = (img.url || '').toLowerCase()
                return alt.includes(labelLower) || url.includes(labelLower)
              })
              if (matched) assignedImage = matched.url
            }

            return {
              combination: combo.map(c => ({
                variationType: c.typeObj._id,
                variationValue: c.valueObj._id,
              })),
              combinationLabel: label,
              sku: existing?.sku || [prefix, ...skuParts].join("-"),
              price: existing?.price ?? basePrice,
              comparePrice: existing?.comparePrice ?? "",
              stock: existing?.stock ?? 0,
              isActive: existing?.isActive ?? true,
              image: assignedImage,
            }
          }))
        }
      }
    }
  }

  // ── Toggle helpers ──
  const toggleType = useCallback((typeId: string) => {
    setSelectedTypeIds(prev =>
      prev.includes(typeId) ? prev.filter(id => id !== typeId) : [...prev, typeId]
    )
  }, [])

  const toggleValue = useCallback((typeId: string, valueId: string) => {
    setSelectedValues(prev => {
      const current = prev[typeId] || []
      return {
        ...prev,
        [typeId]: current.includes(valueId)
          ? current.filter(id => id !== valueId)
          : [...current, valueId],
      }
    })
  }, [])

  const updateVariantRow = useCallback((idx: number, field: keyof VariantRow, value: string | number | boolean) => {
    setVariantRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row))
  }, [])

  // ── Image handlers ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingImage(true)
    try {
      const newUrls = [...formData.images]
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData()
        fd.append("file", files[i])
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || `Failed to upload image ${i + 1}`)
        }
        const data = await res.json()
        newUrls.push({ url: data.url, alt: formData.title })
      }
      setFormData(prev => ({ ...prev, images: newUrls }))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload images")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async (index: number) => {
    const img = formData.images[index]
    if (!img) return
    if (isCloudinaryUrl(img.url)) {
      setUploadingImage(true)
      try {
        await fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: img.url }),
        })
      } catch (err) {
        console.error("Cloudinary delete error:", err)
      } finally {
        setUploadingImage(false)
      }
    }
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  // ── Submit ──
  const handleSubmitInternal = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (hasVariations && variantRows.length === 0) {
      setError("Please select at least one variation value before saving, or turn off Variations.")
      return
    }

    const submissionData: Record<string, unknown> = {
      ...formData,
      price: Number(formData.price),
      compareAtPrice: formData.compareAtPrice !== "" ? Number(formData.compareAtPrice) : null,
      images: formData.images || [],
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      attributes: attributes.filter(a => a.name.trim() !== ""),
      hasVariations,
    }

    if (hasVariations) {
      submissionData.variationTypes = selectedTypeIds
      submissionData.variants = variantRows.map(row => ({
        combination: row.combination,
        combinationLabel: row.combinationLabel,
        sku: row.sku,
        price: Number(row.price),
        comparePrice: row.comparePrice !== "" && row.comparePrice !== null
          ? Number(row.comparePrice)
          : null,
        stock: Number(row.stock),
        isActive: row.isActive,
        images: row.image ? [row.image] : [],
      }))
    } else {
      submissionData.variationTypes = []
      submissionData.variants = []
    }

    try {
      await onSubmit(submissionData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmitInternal} className="space-y-6 pb-20">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">Title</label>
              <input
                type="text" required
                value={formData.title}
                onChange={e => {
                  const newTitle = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    title: newTitle,
                    // Auto-generate slug only for new products
                    slug: !initialData ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") : prev.slug,
                  }))
                }}
                className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
                placeholder="Awesome toy name"
              />
            </div>

            <RichDescriptionEditor
              label="Description"
              rows={4}
              value={formData.description}
              onChange={val => setFormData(prev => ({ ...prev, description: val }))}
              placeholder="Add product overview, highlights, or short description..."
              helperText="Tip: Highlight text and click Heading or Link, or use Ctrl+B, Ctrl+I, Ctrl+K."
            />

            <RichDescriptionEditor
              label="Long Description"
              rows={8}
              value={formData.longDescription}
              onChange={val => setFormData(prev => ({ ...prev, longDescription: val }))}
              placeholder="Full product details, specifications, usage instructions, or features..."
            />
          </div>

          {/* Media */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Media</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  <Image src={img.url} alt={img.alt || "Product image"} fill sizes="100px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-white/90 text-gray-700 rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                {uploadingImage
                  ? <Loader2 size={20} className="animate-spin text-gray-400" />
                  : (
                    <>
                      <span className="text-xl text-gray-400 font-light">+</span>
                      <span className="text-xs text-gray-400 mt-1">Add media</span>
                    </>
                  )}
                <input
                  type="file" accept="image/*" multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">Regular Price (৳) [Optional]</label>
                <input
                  type="number" min="0" step="0.01"
                  value={formData.compareAtPrice}
                  onChange={e => setFormData(prev => ({ ...prev, compareAtPrice: e.target.value }))}
                  className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">Discount Price (৳)</label>
                <input
                  type="number" required min="0" step="0.01"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
                />
              </div>
            </div>
            {hasVariations && (
              <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                ℹ️ Each variant has its own price. The base price above is used as the default when generating variants.
              </p>
            )}
          </div>

          {/* Other Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Other Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">Age Range</label>
                <input
                  type="text"
                  value={formData.ageRange}
                  onChange={e => setFormData(prev => ({ ...prev, ageRange: e.target.value }))}
                  className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
                  placeholder="e.g. 3-5, 8+, 12-14"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Inventory</h3>
            {!hasVariations ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-900">Quantity</label>
                  <input
                    type="number" required min="0"
                    value={formData.inventory}
                    onChange={e => setFormData(prev => ({ ...prev, inventory: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Stock is tracked per-variant. Set stock in the Variants table below.</p>
            )}
          </div>

          {/* ══ Variations Section ══ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Variants</h3>
                <p className="text-sm text-gray-500 mt-0.5">Add options like size or color</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={hasVariations}
                onClick={() => {
                  setHasVariations(v => {
                    if (v) {
                      setSelectedTypeIds([])
                      setSelectedValues({})
                      setVariantRows([])
                    }
                    return !v
                  })
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${hasVariations ? "bg-gray-900" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${hasVariations ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            {hasVariations && (
              <div className="space-y-6">

                {/* STEP 1 – Select Types */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Step 1 — Select variation types
                  </p>
                  {typesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Loader2 size={14} className="animate-spin" /> Loading types…
                    </div>
                  ) : availableTypes.length === 0 ? (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                      No variation types found.{" "}
                      <a href="/admin/variations" target="_blank" className="underline font-semibold">
                        Create them in Variations →
                      </a>
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableTypes.map(type => (
                        <button
                          key={type._id}
                          type="button"
                          onClick={() => toggleType(type._id)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                            selectedTypeIds.includes(type._id)
                              ? "bg-gray-900 border-gray-900 text-white shadow-sm"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* STEP 2 – Select Values */}
                {selectedTypeIds.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Step 2 — Select values for each type
                    </p>
                    <div className="space-y-3">
                      {selectedTypeIds.map(typeId => {
                        const typeObj = availableTypes.find(t => t._id === typeId)
                        const values = typeValues[typeId]
                        const isLoading = valuesLoading[typeId]

                        return (
                          <div key={typeId} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">{typeObj?.name}</h4>
                            {isLoading ? (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Loader2 size={12} className="animate-spin" /> Loading values…
                              </div>
                            ) : !values || values.length === 0 ? (
                              <p className="text-xs text-gray-400">
                                No values yet.{" "}
                                <a href="/admin/variations" target="_blank" className="underline text-indigo-500">Add values →</a>
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {values.map((val: VariationValueItem) => {
                                  const isSelected = (selectedValues[typeId] || []).includes(val._id)
                                  return (
                                    <button
                                      key={val._id}
                                      type="button"
                                      onClick={() => toggleValue(typeId, val._id)}
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                                        isSelected
                                          ? "bg-gray-900 border-gray-900 text-white shadow-sm"
                                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                                      }`}
                                    >
                                      {typeObj?.displayType === 'swatch' && (
                                        <span
                                          className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-inner shrink-0"
                                          style={{ backgroundColor: val.colorHex || '#ccc' }}
                                        />
                                      )}
                                      {val.value}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3 – Variant Table */}
                {variantRows.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Step 3 — Configure each variant ({variantRows.length} variants)
                    </p>

                    <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
                      <div className="min-w-[660px]">
                      {/* Header */}
                      <div
                        className="grid bg-gray-50 border-b border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        style={{ gridTemplateColumns: "minmax(180px, 1.5fr) 100px 100px 80px 120px 36px" }}
                      >
                        <div>Variant</div>
                        <div>Price (৳)</div>
                        <div>Compare (৳)</div>
                        <div>Stock</div>
                        <div>SKU</div>
                        <div />
                      </div>

                      <div className="divide-y divide-gray-100">
                        {variantRows.map((row, i) => (
                          <div key={i}>
                            {/* Summary row */}
                            <div
                              className={`grid items-center px-4 py-2.5 gap-2 cursor-pointer hover:bg-gray-50 transition-colors ${!row.isActive ? "opacity-50" : ""} ${expandedVariant === i ? "bg-gray-50" : "bg-white"}`}
                              style={{ gridTemplateColumns: "minmax(180px, 1.5fr) 100px 100px 80px 120px 36px" }}
                              onClick={() => setExpandedVariant(expandedVariant === i ? null : i)}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setPickingImageForVariant(i)
                                  }}
                                  className="group/img relative w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center transition-all hover:bg-blue-50/50"
                                  title={row.image ? "Click to change variant photo" : "Click to add photo for this variant"}
                                >
                                  {row.image && row.image.trim() !== "" ? (
                                    <>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={row.image} alt={row.combinationLabel} className="absolute inset-0 w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                        <Camera size={13} className="text-white" />
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400 group-hover/img:text-blue-600 transition-colors">
                                      <Camera size={13} />
                                    </div>
                                  )}
                                </button>
                                <span className="text-sm font-semibold text-gray-900 truncate" title={row.combinationLabel}>
                                  {row.combinationLabel || "Variant"}
                                </span>
                                {!row.isActive && (
                                  <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide shrink-0">Off</span>
                                )}
                              </div>
                              <input
                                type="number" min="0"
                                value={row.price}
                                onClick={e => e.stopPropagation()}
                                onChange={e => updateVariantRow(i, "price", e.target.value)}
                                className="w-full bg-gray-100 hover:bg-white focus:bg-white text-gray-900 rounded-md border border-transparent hover:border-gray-300 focus:border-gray-400 px-2 py-1.5 text-sm outline-none transition-all"
                              />
                              <input
                                type="number" min="0"
                                value={row.comparePrice}
                                placeholder="—"
                                onClick={e => e.stopPropagation()}
                                onChange={e => updateVariantRow(i, "comparePrice", e.target.value)}
                                className="w-full bg-gray-100 hover:bg-white focus:bg-white text-gray-900 rounded-md border border-transparent hover:border-gray-300 focus:border-gray-400 px-2 py-1.5 text-sm outline-none transition-all"
                              />
                              <input
                                type="number" min="0"
                                value={row.stock}
                                onClick={e => e.stopPropagation()}
                                onChange={e => updateVariantRow(i, "stock", e.target.value)}
                                className="w-full bg-gray-100 hover:bg-white focus:bg-white text-gray-900 rounded-md border border-transparent hover:border-gray-300 focus:border-gray-400 px-2 py-1.5 text-sm outline-none transition-all"
                              />
                              <input
                                type="text"
                                value={row.sku}
                                onClick={e => e.stopPropagation()}
                                onChange={e => updateVariantRow(i, "sku", e.target.value)}
                                className="w-full bg-gray-100 hover:bg-white focus:bg-white text-gray-900 rounded-md border border-transparent hover:border-gray-300 focus:border-gray-400 px-2 py-1.5 text-sm font-mono outline-none transition-all"
                              />
                              <div className="flex justify-center text-gray-400">
                                {expandedVariant === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>

                            {/* Expanded panel */}
                            {expandedVariant === i && (
                              <div className="px-4 pb-4 pt-3 border-t border-dashed border-gray-100 bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <label className="flex items-center gap-2.5 cursor-pointer">
                                    <div
                                      onClick={() => updateVariantRow(i, "isActive", !row.isActive)}
                                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${row.isActive ? "bg-gray-900" : "bg-gray-200"}`}
                                    >
                                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${row.isActive ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                      {row.isActive ? "Available for sale" : "Not available"}
                                    </span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVariantRows(prev => prev.filter((_, idx) => idx !== i))
                                      setExpandedVariant(null)
                                    }}
                                    className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                                  >
                                    <Trash size={14} /> Delete variant
                                  </button>
                                </div>

                                {/* Variant Image Selector */}
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-700">Variant Image (auto-switched when customer selects this color):</span>
                                    {row.image && (
                                      <button
                                        type="button"
                                        onClick={() => updateVariantRow(i, "image", "")}
                                        className="text-xs text-red-500 hover:text-red-700 underline"
                                      >
                                        Remove image
                                      </button>
                                    )}
                                  </div>
                                  {formData.images.length === 0 ? (
                                    <p className="text-xs text-gray-400">Add media in the Media section above to select an image for this variant.</p>
                                  ) : (
                                    <div className="flex flex-wrap gap-2 items-center">
                                      {formData.images.map((img, imgIdx) => {
                                        const isSelected = row.image === img.url
                                        return (
                                          <button
                                            key={imgIdx}
                                            type="button"
                                            onClick={() => updateVariantRow(i, "image", isSelected ? "" : img.url)}
                                            className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                              isSelected ? "border-gray-900 ring-2 ring-gray-900/20 scale-105" : "border-gray-200 opacity-60 hover:opacity-100"
                                            }`}
                                            title="Click to select this image for this variant"
                                          >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img.url} alt={img.alt || "Option"} className="w-full h-full object-cover" />
                                            {isSelected && (
                                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs">
                                                ✓
                                              </div>
                                            )}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Custom Attributes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Custom Attributes</h3>
              <button
                type="button"
                onClick={() => setAttributes(prev => [...prev, { name: "", value: "" }])}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 transition-colors"
              >
                + Add
              </button>
            </div>
            {attributes.length === 0 && (
              <p className="text-sm text-gray-400">No custom attributes. Click Add to create one.</p>
            )}
            {attributes.map((attr, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text" placeholder="Name"
                  value={attr.name}
                  onChange={e => setAttributes(prev => prev.map((a, i) => i === idx ? { ...a, name: e.target.value } : a))}
                  className="flex-1 bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 outline-none"
                />
                <input
                  type="text" placeholder="Value"
                  value={attr.value}
                  onChange={e => setAttributes(prev => prev.map((a, i) => i === idx ? { ...a, value: e.target.value } : a))}
                  className="flex-1 bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAttributes(prev => prev.filter((_, i) => i !== idx))}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash size={15} />
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">

          {/* Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Status</h3>
            <select
              value={formData.isPublished ? "active" : "draft"}
              onChange={e => setFormData(prev => ({ ...prev, isPublished: e.target.value === "active" }))}
              className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-shadow"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <p className="text-xs text-gray-500">
              {formData.isPublished
                ? "This product will be visible to all sales channels."
                : "This product will be hidden from all sales channels."}
            </p>
          </div>

          {/* Organization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Organization</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 outline-none transition-shadow"
                >
                  <option value="">None</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 outline-none transition-shadow"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") }))}
                  className="w-full bg-white text-gray-900 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-gray-500 outline-none transition-shadow"
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-black bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(255,201,60,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? "Saving..." : "Save product"}
          </button>

        </div>
      </div>

      {/* ── Modal: Select or Upload Variant Photo ── */}
      {pickingImageForVariant !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Select Photo for &ldquo;{variantRows[pickingImageForVariant]?.combinationLabel}&rdquo;
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  This photo will automatically show when a customer chooses this variant
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickingImageForVariant(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Upload direct button */}
              <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl cursor-pointer hover:bg-blue-50/50 transition-colors">
                {uploadingVariantImage ? (
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                    <Loader2 size={16} className="animate-spin" /> Uploading image...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <Upload size={16} className="text-blue-600" />
                    <span>Upload new photo from computer</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingVariantImage}
                  onChange={(e) => handleVariantDirectUpload(pickingImageForVariant, e)}
                />
              </label>

              {/* Existing product media */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                  Or choose from product media ({formData.images.length})
                </h4>
                {formData.images.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-400 border border-gray-100 rounded-xl bg-gray-50">
                    No photos uploaded to this product yet. Click the button above to upload one!
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                    {formData.images.map((img, imgIdx) => {
                      const isSelected = variantRows[pickingImageForVariant]?.image === img.url;
                      return (
                        <button
                          key={imgIdx}
                          type="button"
                          onClick={() => {
                            updateVariantRow(pickingImageForVariant, "image", isSelected ? "" : img.url);
                          }}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            isSelected
                              ? "border-blue-600 ring-4 ring-blue-500/20 scale-102"
                              : "border-gray-200 hover:border-gray-400 opacity-75 hover:opacity-100"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt={img.alt || "Option"} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                                ✓
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              {variantRows[pickingImageForVariant]?.image ? (
                <button
                  type="button"
                  onClick={() => {
                    updateVariantRow(pickingImageForVariant, "image", "");
                  }}
                  className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                >
                  Remove Photo
                </button>
              ) : <div />}
              <button
                type="button"
                onClick={() => setPickingImageForVariant(null)}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
