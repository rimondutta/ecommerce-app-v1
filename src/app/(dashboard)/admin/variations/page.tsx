"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Tag,
  Palette,
  X,
  Check,
  Loader2,
  Layers,
  SlidersHorizontal,
  Info,
  CheckCircle2,
} from "lucide-react";

export type DisplayType = "cards" | "swatch" | "button" | "dropdown";

interface VariationType {
  _id: string;
  name: string;
  slug: string;
  displayType: DisplayType | "pcs" | string;
  valueCount: number;
}

interface VariationValue {
  _id: string;
  value: string;
  slug: string;
  colorHex?: string | null;
  sortOrder: number;
}

interface LayoutMeta {
  type: DisplayType;
  name: string;
  badge: string;
  shortLabel: string;
  icon: typeof Layers;
  description: string;
  recommendedFor: string;
  previewExample: string;
  badgeStyle: string;
  activeBorder: string;
}

const LAYOUT_OPTIONS: LayoutMeta[] = [
  {
    type: "cards",
    name: "Bundle Cards (Pieces / Pcs)",
    badge: "📦 Bundle Cards",
    shortLabel: "Bundle Cards",
    icon: Layers,
    description: "High-converting radio cards with savings badges & compare prices (e.g. ২ পিস নিতে চাই, SAVE 801 TK)",
    recommendedFor: "Pieces, Packs, Bundles, Quantities",
    previewExample: "২ পিস নিতে চাই (Save 801 tk) ৳699",
    badgeStyle: "bg-purple-100 text-[#5428D8] border-purple-200",
    activeBorder: "border-[#5428D8] ring-2 ring-[#5428D8]/20 bg-purple-50/40",
  },
  {
    type: "swatch",
    name: "Color Swatches",
    badge: "🎨 Color Swatches",
    shortLabel: "Color Swatches",
    icon: Palette,
    description: "Visual circular color swatches with hex color picker",
    recommendedFor: "Color, Shade, Pattern",
    previewExample: "🔴 🔵 🟢 🟡 Color circles",
    badgeStyle: "bg-pink-100 text-pink-700 border-pink-200",
    activeBorder: "border-pink-500 ring-2 ring-pink-500/20 bg-pink-50/40",
  },
  {
    type: "button",
    name: "Pill Buttons (Size / Options)",
    badge: "🏷️ Pill Buttons",
    shortLabel: "Pill Buttons",
    icon: Tag,
    description: "Clean rectangular / pill buttons for standard text options",
    recommendedFor: "Size (S, M, L, XL), Style, Weight",
    previewExample: "[ S ]  [ M ]  [ L ]  [ XL ]",
    badgeStyle: "bg-blue-100 text-blue-700 border-blue-200",
    activeBorder: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40",
  },
  {
    type: "dropdown",
    name: "Dropdown Select",
    badge: "▾ Dropdown",
    shortLabel: "Dropdown",
    icon: ChevronDown,
    description: "Compact select dropdown menu for long lists of options",
    recommendedFor: "Large option lists (10+ items), Compact layouts",
    previewExample: "▼ Select an option...",
    badgeStyle: "bg-amber-100 text-amber-700 border-amber-200",
    activeBorder: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40",
  },
];

export default function VariationsPage() {
  const [types, setTypes] = useState<VariationType[]>([]);
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [typeValues, setTypeValues] = useState<Record<string, VariationValue[]>>({});
  const [loading, setLoading] = useState(true);
  const [updatingLayoutId, setUpdatingLayoutId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Add Type Modal
  const [showAddType, setShowAddType] = useState(false);
  const [addTypeName, setAddTypeName] = useState("");
  const [addTypeDisplay, setAddTypeDisplay] = useState<DisplayType>("button");
  const [addTypeLoading, setAddTypeLoading] = useState(false);
  const [addTypeError, setAddTypeError] = useState("");

  // Edit Type Modal
  const [editingType, setEditingType] = useState<VariationType | null>(null);
  const [editTypeName, setEditTypeName] = useState("");
  const [editTypeDisplay, setEditTypeDisplay] = useState<DisplayType>("button");
  const [editTypeLoading, setEditTypeLoading] = useState(false);

  // Add Value
  const [addValueTypeId, setAddValueTypeId] = useState<string | null>(null);
  const [addValueText, setAddValueText] = useState("");
  const [addValueHex, setAddValueHex] = useState("#000000");
  const [addValueLoading, setAddValueLoading] = useState(false);
  const [addValueError, setAddValueError] = useState("");

  // Edit Value
  const [editingValue, setEditingValue] = useState<VariationValue | null>(null);
  const [editValueText, setEditValueText] = useState("");
  const [editValueHex, setEditValueHex] = useState("#000000");
  const [editValueLoading, setEditValueLoading] = useState(false);

  const loadTypes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/variation-types");
      const data = await res.json();
      if (data.variationTypes) setTypes(data.variationTypes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  // Auto-suggest layout in Add Modal based on typed name
  const handleTypeNameChange = (val: string) => {
    setAddTypeName(val);
    const lower = val.toLowerCase();
    if (
      lower.includes("piece") ||
      lower.includes("pcs") ||
      lower.includes("pack") ||
      lower.includes("bundle") ||
      lower.includes("পিস") ||
      lower.includes("প্যাক")
    ) {
      setAddTypeDisplay("cards");
    } else if (
      lower.includes("color") ||
      lower.includes("colour") ||
      lower.includes("রং") ||
      lower.includes("shade")
    ) {
      setAddTypeDisplay("swatch");
    } else if (
      lower.includes("size") ||
      lower.includes("সাইজ") ||
      lower.includes("dimension")
    ) {
      setAddTypeDisplay("button");
    }
  };

  const loadValues = async (typeId: string) => {
    if (typeValues[typeId]) return;
    const res = await fetch(`/api/admin/variation-types/${typeId}/values`);
    const data = await res.json();
    if (data.values) setTypeValues((prev) => ({ ...prev, [typeId]: data.values }));
  };

  const toggleExpand = async (typeId: string) => {
    if (expandedType === typeId) {
      setExpandedType(null);
    } else {
      setExpandedType(typeId);
      await loadValues(typeId);
    }
  };

  // Quick 1-click Layout Switcher from row
  const handleQuickChangeLayout = async (typeId: string, newDisplay: DisplayType) => {
    setUpdatingLayoutId(typeId);
    // Optimistic update
    setTypes((prev) =>
      prev.map((t) => (t._id === typeId ? { ...t, displayType: newDisplay } : t))
    );

    try {
      const res = await fetch(`/api/admin/variation-types/${typeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayType: newDisplay }),
      });
      if (!res.ok) {
        throw new Error("Failed to update layout");
      }
      setSaveSuccessMsg(`Layout updated to ${LAYOUT_OPTIONS.find((l) => l.type === newDisplay)?.shortLabel}!`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      loadTypes();
    } finally {
      setUpdatingLayoutId(null);
    }
  };

  const handleAddType = async () => {
    if (!addTypeName.trim()) {
      setAddTypeError("Name is required");
      return;
    }
    setAddTypeLoading(true);
    setAddTypeError("");
    const res = await fetch("/api/admin/variation-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: addTypeName.trim(), displayType: addTypeDisplay }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAddTypeError(data.error || "Error");
      setAddTypeLoading(false);
      return;
    }
    setAddTypeName("");
    setAddTypeDisplay("button");
    setShowAddType(false);
    setAddTypeLoading(false);
    loadTypes();
  };

  const handleEditType = async () => {
    if (!editingType) return;
    setEditTypeLoading(true);
    await fetch(`/api/admin/variation-types/${editingType._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editTypeName, displayType: editTypeDisplay }),
    });
    setEditingType(null);
    setEditTypeLoading(false);
    loadTypes();
  };

  const handleDeleteType = async (type: VariationType) => {
    if (!confirm(`Delete "${type.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/variation-types/${type._id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    loadTypes();
  };

  const handleAddValue = async (typeId: string, displayType: DisplayType) => {
    if (!addValueText.trim()) {
      setAddValueError("Value is required");
      return;
    }
    setAddValueLoading(true);
    setAddValueError("");
    const body: { value: string; colorHex?: string } = { value: addValueText.trim() };
    if (displayType === "swatch") body.colorHex = addValueHex;
    const res = await fetch(`/api/admin/variation-types/${typeId}/values`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setAddValueError(data.error || "Error");
      setAddValueLoading(false);
      return;
    }
    const res2 = await fetch(`/api/admin/variation-types/${typeId}/values`);
    const data2 = await res2.json();
    setTypeValues((prev) => ({ ...prev, [typeId]: data2.values || [] }));
    setAddValueText("");
    setAddValueHex("#000000");
    setAddValueTypeId(null);
    setAddValueLoading(false);
    setTypes((prev) =>
      prev.map((t) => (t._id === typeId ? { ...t, valueCount: (t.valueCount || 0) + 1 } : t))
    );
  };

  const handleEditValue = async (typeId: string) => {
    if (!editingValue) return;
    setEditValueLoading(true);
    await fetch(`/api/admin/variation-values/${editingValue._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: editValueText, colorHex: editValueHex }),
    });
    const res2 = await fetch(`/api/admin/variation-types/${typeId}/values`);
    const data2 = await res2.json();
    setTypeValues((prev) => ({ ...prev, [typeId]: data2.values || [] }));
    setEditingValue(null);
    setEditValueLoading(false);
  };

  const handleDeleteValue = async (typeId: string, valueId: string) => {
    if (!confirm("Delete this value?")) return;
    const res = await fetch(`/api/admin/variation-values/${valueId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    setTypeValues((prev) => ({
      ...prev,
      [typeId]: (prev[typeId] || []).filter((v) => v._id !== valueId),
    }));
    setTypes((prev) =>
      prev.map((t) => (t._id === typeId ? { ...t, valueCount: Math.max(0, t.valueCount - 1) } : t))
    );
  };

  const getLayoutMeta = (d: string): LayoutMeta => {
    return (
      LAYOUT_OPTIONS.find((l) => l.type === d || (d === "pcs" && l.type === "cards")) ||
      LAYOUT_OPTIONS[2]
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#5428D8]/10 text-[#5428D8] rounded-xl">
              <SlidersHorizontal size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Variations & Storefront Layout CMS</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Control the visual layout style for each variation (Pieces bundle cards, color swatches, or size buttons) directly from this dashboard.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddType(true);
            setAddTypeName("");
            setAddTypeError("");
            setAddTypeDisplay("button");
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5428D8] text-white text-sm font-semibold rounded-xl hover:bg-[#431fb5] transition-all shadow-sm hover:shadow"
        >
          <Plus size={16} /> Add Variation Type
        </button>
      </div>

      {/* CMS Layout Quick Reference Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {LAYOUT_OPTIONS.map((layout) => {
          const Icon = layout.icon;
          return (
            <div
              key={layout.type}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gray-50 text-gray-700">
                    <Icon size={18} />
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${layout.badgeStyle}`}>
                    {layout.badge}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{layout.name}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{layout.description}</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Best For:
                </span>
                <span className="text-xs font-semibold text-gray-700">{layout.recommendedFor}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Types List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">Active Variation Types</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Click layout dropdown to instantly switch how it renders on the product page.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-600 bg-gray-200/70 px-2.5 py-1 rounded-full">
            {types.length} Types Configured
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : types.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Tag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No variation types yet.</p>
            <p className="text-xs text-gray-400 mt-1">Create Pieces, Color, or Size to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {types.map((type) => {
              const meta = getLayoutMeta(type.displayType);
              const LayoutIcon = meta.icon;
              const isUpdating = updatingLayoutId === type._id;

              return (
                <div key={type._id} className="transition-colors hover:bg-gray-50/50">
                  {/* Type Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                    {/* Left: Expand + Name + Count */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleExpand(type._id)}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                        title={expandedType === type._id ? "Collapse values" : "Expand values"}
                      >
                        {expandedType === type._id ? (
                          <ChevronDown size={18} className="text-gray-700" />
                        ) : (
                          <ChevronRight size={18} className="text-gray-500" />
                        )}
                      </button>

                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-bold text-gray-900 text-base">{type.name}</span>
                        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                          {type.slug}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium shrink-0">
                          {type.valueCount} value{type.valueCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Storefront Layout Quick Controller */}
                    <div className="flex items-center gap-2 pl-8 sm:pl-0">
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl px-3 py-1.5 transition-colors">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium shrink-0">
                          <LayoutIcon size={14} className="text-gray-700" />
                          <span className="hidden md:inline text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                            Storefront Layout:
                          </span>
                        </div>
                        <select
                          value={type.displayType === "pcs" ? "cards" : type.displayType}
                          onChange={(e) => handleQuickChangeLayout(type._id, e.target.value as DisplayType)}
                          disabled={isUpdating}
                          className="bg-transparent font-bold text-xs text-gray-900 border-none outline-none cursor-pointer hover:text-[#5428D8] focus:text-[#5428D8] disabled:opacity-50"
                        >
                          <option value="cards">📦 Bundle Cards (Pieces)</option>
                          <option value="swatch">🎨 Color Swatches</option>
                          <option value="button">🏷️ Pill Buttons (Size)</option>
                          <option value="dropdown">▾ Dropdown</option>
                        </select>
                        {isUpdating && <Loader2 size={12} className="animate-spin text-[#5428D8] ml-1 shrink-0" />}
                      </div>

                      {/* Edit / Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingType(type);
                            setEditTypeName(type.name);
                            setEditTypeDisplay(meta.type);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Variation Type & Layout"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteType(type)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Variation Type"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Values Panel */}
                  {expandedType === type._id && (
                    <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-4 space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Configured values for <strong>{type.name}</strong> ({meta.name}):</span>
                        {type.displayType === "cards" && (
                          <span className="text-[11px] text-[#5428D8] font-medium">
                            💡 Values like &quot;1 Pcs&quot;, &quot;2 Pcs&quot;, &quot;3 Pcs&quot; will auto-format to Bengali cards with savings!
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(typeValues[type._id] || []).map((val) => (
                          <div
                            key={val._id}
                            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm"
                          >
                            {type.displayType === "swatch" && val.colorHex && (
                              <span
                                className="w-4 h-4 rounded-full border border-gray-300 shrink-0 shadow-inner"
                                style={{ backgroundColor: val.colorHex }}
                              />
                            )}
                            {editingValue?._id === val._id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editValueText}
                                  onChange={(e) => setEditValueText(e.target.value)}
                                  className="text-xs font-medium border-b border-gray-400 outline-none w-28 bg-transparent text-gray-900"
                                />
                                {type.displayType === "swatch" && (
                                  <input
                                    type="color"
                                    value={editValueHex}
                                    onChange={(e) => setEditValueHex(e.target.value)}
                                    className="w-6 h-5 cursor-pointer rounded border"
                                  />
                                )}
                                <button
                                  onClick={() => handleEditValue(type._id)}
                                  disabled={editValueLoading}
                                  className="p-1 text-emerald-600 hover:text-emerald-700"
                                >
                                  {editValueLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                                </button>
                                <button
                                  onClick={() => setEditingValue(null)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="text-xs font-semibold text-gray-800">{val.value}</span>
                                {val.colorHex && (
                                  <span className="text-[10px] font-mono text-gray-400">{val.colorHex}</span>
                                )}
                                <div className="flex items-center gap-1 ml-1 border-l pl-1.5 border-gray-200">
                                  <button
                                    onClick={() => {
                                      setEditingValue(val);
                                      setEditValueText(val.value);
                                      setEditValueHex(val.colorHex || "#000000");
                                    }}
                                    className="p-0.5 text-gray-400 hover:text-gray-700"
                                    title="Edit value"
                                  >
                                    <Pencil size={11} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteValue(type._id, val._id)}
                                    className="p-0.5 text-gray-400 hover:text-red-500"
                                    title="Delete value"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add Value Form */}
                      {addValueTypeId === type._id ? (
                        <div className="flex items-center gap-2 pt-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm max-w-lg">
                          {type.displayType === "swatch" && (
                            <div className="h-8 w-8 rounded-lg border border-gray-300 relative overflow-hidden shrink-0">
                              <input
                                type="color"
                                value={addValueHex}
                                onChange={(e) => setAddValueHex(e.target.value)}
                                className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                                title="Pick hex color"
                              />
                            </div>
                          )}
                          <input
                            type="text"
                            value={addValueText}
                            onChange={(e) => setAddValueText(e.target.value)}
                            placeholder={
                              type.displayType === "swatch"
                                ? "Color name (e.g. Red, Navy)"
                                : type.displayType === "cards"
                                ? "Pieces (e.g. 1 Pcs, 2 Pcs, 3 Pcs)"
                                : "Value name (e.g. XL, 32GB)"
                            }
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#5428D8] text-gray-900 bg-white"
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue(type._id, meta.type)}
                            autoFocus
                          />
                          {addValueError && <p className="text-xs text-red-500">{addValueError}</p>}
                          <button
                            onClick={() => handleAddValue(type._id, meta.type)}
                            disabled={addValueLoading}
                            className="px-3 py-1.5 text-xs font-semibold bg-[#5428D8] text-white rounded-lg hover:bg-[#431fb5] disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                          >
                            {addValueLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add
                          </button>
                          <button
                            onClick={() => {
                              setAddValueTypeId(null);
                              setAddValueText("");
                              setAddValueError("");
                            }}
                            className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 shrink-0"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAddValueTypeId(type._id);
                            setAddValueText("");
                            setAddValueHex("#000000");
                            setAddValueError("");
                          }}
                          className="flex items-center gap-1.5 text-xs text-[#5428D8] hover:text-[#431fb5] font-semibold pt-1"
                        >
                          <Plus size={14} /> Add new {type.name} value
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Type Modal */}
      {showAddType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#5428D8]/10 text-[#5428D8] rounded-lg">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">New Variation Type</h2>
                  <p className="text-xs text-gray-500">Configure variation category and select storefront layout</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddType(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {addTypeError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {addTypeError}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Variation Name
              </label>
              <input
                type="text"
                value={addTypeName}
                onChange={(e) => handleTypeNameChange(e.target.value)}
                placeholder="e.g. Pieces, Color, Size, Bundle"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#5428D8] focus:ring-2 focus:ring-[#5428D8]/20 text-gray-900 bg-white font-medium"
                onKeyDown={(e) => e.key === "Enter" && handleAddType()}
                autoFocus
              />
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Info size={12} /> Typing &quot;Pieces&quot; or &quot;Color&quot; automatically selects the recommended layout below.
              </span>
            </div>

            {/* Visual Layout Picker Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Storefront Visual Layout (CMS Control)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LAYOUT_OPTIONS.map((layout) => {
                  const Icon = layout.icon;
                  const isSelected = addTypeDisplay === layout.type;
                  return (
                    <div
                      key={layout.type}
                      onClick={() => setAddTypeDisplay(layout.type)}
                      className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? layout.activeBorder
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Icon size={16} className={isSelected ? "text-[#5428D8]" : "text-gray-600"} />
                            <span className="text-xs font-bold text-gray-900">{layout.shortLabel}</span>
                          </div>
                          {isSelected && <Check size={16} className="text-[#5428D8] shrink-0" />}
                        </div>
                        <p className="text-[11px] text-gray-500 leading-tight">{layout.description}</p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-medium">Recommended for:</span>
                        <span className="text-[10px] font-bold text-gray-700 truncate max-w-[150px]">
                          {layout.recommendedFor}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowAddType(false)}
                className="px-4 py-2.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddType}
                disabled={addTypeLoading}
                className="px-5 py-2.5 text-xs font-bold bg-[#5428D8] text-white rounded-xl hover:bg-[#431fb5] disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {addTypeLoading && <Loader2 size={14} className="animate-spin" />} Create Variation Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Type Modal */}
      {editingType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#5428D8]/10 text-[#5428D8] rounded-lg">
                  <Pencil size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Edit Variation Type</h2>
                  <p className="text-xs text-gray-500">Update variation name and storefront display style</p>
                </div>
              </div>
              <button
                onClick={() => setEditingType(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Variation Name
              </label>
              <input
                type="text"
                value={editTypeName}
                onChange={(e) => setEditTypeName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#5428D8] focus:ring-2 focus:ring-[#5428D8]/20 text-gray-900 bg-white font-medium"
              />
            </div>

            {/* Visual Layout Picker Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Storefront Visual Layout (CMS Control)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LAYOUT_OPTIONS.map((layout) => {
                  const Icon = layout.icon;
                  const isSelected = editTypeDisplay === layout.type;
                  return (
                    <div
                      key={layout.type}
                      onClick={() => setEditTypeDisplay(layout.type)}
                      className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? layout.activeBorder
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Icon size={16} className={isSelected ? "text-[#5428D8]" : "text-gray-600"} />
                            <span className="text-xs font-bold text-gray-900">{layout.shortLabel}</span>
                          </div>
                          {isSelected && <Check size={16} className="text-[#5428D8] shrink-0" />}
                        </div>
                        <p className="text-[11px] text-gray-500 leading-tight">{layout.description}</p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-medium">Recommended for:</span>
                        <span className="text-[10px] font-bold text-gray-700 truncate max-w-[150px]">
                          {layout.recommendedFor}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setEditingType(null)}
                className="px-4 py-2.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditType}
                disabled={editTypeLoading}
                className="px-5 py-2.5 text-xs font-bold bg-[#5428D8] text-white rounded-xl hover:bg-[#431fb5] disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {editTypeLoading && <Loader2 size={14} className="animate-spin" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}