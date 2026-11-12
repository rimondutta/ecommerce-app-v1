"use client"

import { useState, useRef } from "react"
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Check,
  RefreshCw,
  HelpCircle,
} from "lucide-react"
import { parseCsvText, convertCsvToProducts, ParsedCsvProduct } from "@/lib/csvHelper"

interface CsvImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess: () => void
}

export default function CsvImportModal({ isOpen, onClose, onImportSuccess }: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedProducts, setParsedProducts] = useState<ParsedCsvProduct[]>([])
  const [parseErrors, setParseErrors] = useState<{ row: number; error: string }[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [updateExisting, setUpdateExisting] = useState(false)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    createdCount: number
    updatedCount: number
    skippedCount: number
    errors: { row: number; title: string; error: string }[]
  } | null>(null)
  const [generalError, setGeneralError] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  if (!isOpen) return null

  const handleReset = () => {
    setFile(null)
    setParsedProducts([])
    setParseErrors([])
    setTotalRows(0)
    setResult(null)
    setGeneralError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleFileProcess = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      setGeneralError("Please upload a valid .csv file")
      return
    }

    setFile(selectedFile)
    setGeneralError("")
    setResult(null)

    try {
      const text = await selectedFile.text()
      const rawRows = parseCsvText(text)
      const parseResult = convertCsvToProducts(rawRows)

      setParsedProducts(parseResult.valid)
      setParseErrors(parseResult.errors)
      setTotalRows(parseResult.totalRows)

      if (parseResult.valid.length === 0 && parseResult.errors.length > 0) {
        setGeneralError("No valid product rows found in the CSV. Please check the template format.")
      }
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : "Failed to read CSV file")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      handleFileProcess(selected)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) {
      handleFileProcess(dropped)
    }
  }

  const handleImportSubmit = async () => {
    if (!parsedProducts.length) return
    setLoading(true)
    setGeneralError("")

    try {
      const res = await fetch("/api/admin/products/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: parsedProducts,
          updateExisting,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Import failed")
      }

      setResult(data)
      onImportSuccess()
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : "Failed to import products")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadSample = () => {
    window.open("/api/admin/products/import-csv", "_blank")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 leading-tight">Import Products by CSV</h2>
              <p className="text-xs text-gray-500">Bulk upload or update products using a CSV spreadsheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Success Result View */}
          {result ? (
            <div className="space-y-5 py-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Products Imported Successfully!</h3>
                <p className="text-sm text-gray-500">{result.message}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{result.createdCount}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-0.5">Created</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{result.updatedCount}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-0.5">Updated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-500">{result.skippedCount}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-0.5">Skipped / Errors</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                    Errors ({result.errors.length} products)
                  </p>
                  <div className="max-h-36 overflow-y-auto border border-red-200 bg-red-50/50 rounded-lg p-3 text-xs space-y-1">
                    {result.errors.map((err, i) => (
                      <div key={i} className="text-red-700">
                        • <strong>Row {err.row} ({err.title}):</strong> {err.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : !file ? (
            /* Upload step */
            <div className="space-y-4">
              {/* Template Download Banner */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Download size={20} className="text-blue-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Download CSV Template</h4>
                    <p className="text-xs text-blue-700">Use our pre-formatted template with example products and columns</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 font-medium text-xs px-3.5 py-2 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
                >
                  Download .CSV
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-300 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-50"
                }`}
              >
                <div className="w-12 h-12 bg-white rounded-full shadow-xs border border-gray-200 flex items-center justify-center text-gray-500 mb-3">
                  <Upload size={22} />
                </div>
                <p className="text-sm font-semibold text-gray-900">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">Supports standard CSV files (.csv) up to 10MB</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Format Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                <div className="font-semibold text-gray-700 flex items-center gap-1">
                  <HelpCircle size={13} /> Supported Columns:
                </div>
                <p className="text-gray-500">
                  <span className="font-medium text-gray-700">Title*</span>, <span className="font-medium text-gray-700">Price*</span>, Compare Price, Category, Inventory, Description, Long Description, Age Range, Badge, Images (separated by ;), Tags, Status
                </p>
              </div>
            </div>
          ) : (
            /* File Preview & Confirmation step */
            <div className="space-y-4">
              {/* Selected File Details */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • {totalRows} total rows • {parsedProducts.length} valid products
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                >
                  Change file
                </button>
              </div>

              {/* Parsing Warnings / Errors if any */}
              {parseErrors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-amber-600" />
                    {parseErrors.length} row{parseErrors.length > 1 ? "s" : ""} will be skipped due to invalid data:
                  </div>
                  <div className="max-h-24 overflow-y-auto pl-5 space-y-0.5">
                    {parseErrors.slice(0, 5).map((e, idx) => (
                      <div key={idx}>• Row {e.row}: {e.error}</div>
                    ))}
                    {parseErrors.length > 5 && (
                      <div className="text-amber-600">...and {parseErrors.length - 5} more rows</div>
                    )}
                  </div>
                </div>
              )}

              {/* Data Preview Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Preview (First {Math.min(parsedProducts.length, 5)} of {parsedProducts.length} products)
                  </h4>
                  <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                    <Check size={13} /> {parsedProducts.length} ready to import
                  </span>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-100 text-gray-600 font-medium sticky top-0 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2">Title</th>
                        <th className="px-3 py-2">Price</th>
                        <th className="px-3 py-2">Compare</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Stock</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedProducts.slice(0, 5).map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-900 max-w-[160px] truncate">{p.title}</td>
                          <td className="px-3 py-2 text-gray-700 font-semibold">৳{p.price}</td>
                          <td className="px-3 py-2 text-gray-400">{p.compareAtPrice ? `৳${p.compareAtPrice}` : "—"}</td>
                          <td className="px-3 py-2 text-gray-600 truncate max-w-[100px]">{p.category || "General"}</td>
                          <td className="px-3 py-2 text-gray-700">{p.inventory}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              p.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                            }`}>
                              {p.isPublished ? "Active" : "Draft"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Options */}
              <div className="pt-2 border-t border-gray-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-gray-900 block">Update existing products</span>
                    <span className="text-gray-500">
                      If a product with the same title or slug already exists, update its details instead of creating a duplicate.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          {result ? (
            <div className="w-full flex justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Upload another file
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={loading || !file || parsedProducts.length === 0}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Import {parsedProducts.length ? `${parsedProducts.length} Products` : "Products"}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

