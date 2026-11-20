"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Menu,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Save,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  Sparkles,
  Link2,
} from "lucide-react";

interface MenuChild {
  _id?: string;
  label: string;
  url: string;
  openInNewTab?: boolean;
  order?: number;
}

interface MenuItem {
  _id: string;
  label: string;
  url: string;
  icon?: string;
  badge?: string;
  openInNewTab?: boolean;
  isActive?: boolean;
  order: number;
  children?: MenuChild[];
}

const COMMON_EMOJIS = [
  "🏠", "🧸", "🎮", "✨", "🔥", "👧", "🧩", "🏎️", "🎨", "💄", "🎁", "👶", "⚡", "🛍️", "🎯", "⭐"
];

const PRESET_URLS = [
  { label: "Home Page", url: "/" },
  { label: "Shop (All Products)", url: "/products" },
  { label: "Special Deals", url: "/products?tag=specialoffer" },
  { label: "Toys Category", url: "/products?category=toys" },
  { label: "Gadgets Category", url: "/products?category=gadgets" },
  { label: "Cosmetics Category", url: "/products?category=cosmetics" },
  { label: "About Us", url: "/about" },
  { label: "Contact Us", url: "/contact" },
  { label: "Blog", url: "/blogs" },
];

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [editItem, setEditItem] = useState<Partial<MenuItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activePreviewDropdown, setActivePreviewDropdown] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/menu", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      } else {
        showToast(data.error || "Failed to load menu", "error");
      }
    } catch {
      showToast("Network error loading menu items", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Reorder items
  const moveItem = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);

    const reordered = newItems.map((item, idx) => ({ ...item, order: idx }));
    setItems(reordered);

    try {
      const res = await fetch("/api/admin/menu/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map(({ _id, order }) => ({ _id, order })),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showToast("Menu reordered successfully");
    } catch {
      showToast("Failed to save new order", "error");
      fetchItems();
    }
  };

  // Toggle active status
  const toggleActive = async (item: MenuItem) => {
    const updatedStatus = !item.isActive;
    setItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, isActive: updatedStatus } : i))
    );

    try {
      const res = await fetch(`/api/admin/menu/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showToast(updatedStatus ? `"${item.label}" is now visible` : `"${item.label}" is now hidden`, "info");
    } catch {
      showToast("Failed to update status", "error");
      fetchItems();
    }
  };

  // Delete item
  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete "${label}" from the menu?`)) return;

    try {
      const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setItems((prev) => prev.filter((i) => i._id !== id));
      showToast(`"${label}" deleted successfully`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete item", "error");
    }
  };

  // Reset to default
  const handleResetDefaults = async () => {
    if (
      !confirm(
        "Reset menu to default template (Home, Toys, Gadgets, Cosmetics, Deals, About, Contact)? Current menu will be replaced."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/menu/reset-defaults", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("Menu reset to defaults successfully!", "success");
        fetchItems();
      } else {
        showToast(data.error || "Reset failed", "error");
      }
    } catch {
      showToast("Error resetting menu", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for new item
  const openAddModal = () => {
    setEditItem({
      label: "",
      url: "/",
      icon: "",
      badge: "",
      openInNewTab: false,
      isActive: true,
      children: [],
    });
    setIsNew(true);
  };

  // Open modal for editing existing item
  const openEditModal = (item: MenuItem) => {
    setEditItem({
      ...item,
      children: item.children ? JSON.parse(JSON.stringify(item.children)) : [],
    });
    setIsNew(false);
  };

  // Close modal
  const closeModal = () => {
    setEditItem(null);
    setIsNew(false);
  };

  // Save item (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem?.label?.trim() || !editItem?.url?.trim()) {
      showToast("Label and URL are required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        label: editItem.label.trim(),
        url: editItem.url.trim(),
        icon: editItem.icon?.trim() || "",
        badge: editItem.badge?.trim() || "",
        openInNewTab: Boolean(editItem.openInNewTab),
        isActive: editItem.isActive !== false,
        children: (editItem.children || []).filter((c) => c.label.trim() && c.url.trim()),
      };

      const url = isNew ? "/api/admin/menu" : `/api/admin/menu/${editItem._id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save");

      showToast(isNew ? "New menu item created!" : "Menu item updated!", "success");
      closeModal();
      fetchItems();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save menu item", "error");
    } finally {
      setSaving(false);
    }
  };

  // Child management helpers
  const addChildItem = () => {
    setEditItem((prev) => ({
      ...prev,
      children: [
        ...(prev?.children || []),
        { label: "", url: "/", openInNewTab: false, order: prev?.children?.length || 0 },
      ],
    }));
  };

  const updateChild = (index: number, field: keyof MenuChild, value: string | boolean) => {
    setEditItem((prev) => {
      const children = [...(prev?.children || [])];
      children[index] = { ...children[index], [field]: value };
      return { ...prev, children };
    });
  };

  const removeChild = (index: number) => {
    setEditItem((prev) => {
      const children = [...(prev?.children || [])];
      children.splice(index, 1);
      return { ...prev, children };
    });
  };

  const moveChild = (index: number, direction: -1 | 1) => {
    setEditItem((prev) => {
      const children = [...(prev?.children || [])];
      const target = index + direction;
      if (target < 0 || target >= children.length) return prev;
      const [moved] = children.splice(index, 1);
      children.splice(target, 0, moved);
      return { ...prev, children };
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold text-white animate-fade-in ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
              ? "bg-red-600"
              : "bg-[#5428D8]"
          }`}
        >
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5428D8] flex items-center justify-center">
              <Menu size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Header Menu CMS</h1>
              <p className="text-xs text-gray-500">
                Manage website navbar links, categories, emojis, and dropdown menus.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
            title="Reset menu to default template"
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5428D8] hover:bg-[#431db8] text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:scale-[1.02]"
          >
            <Plus size={16} />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Live Navbar Preview */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#5428D8]" />
            <h2 className="text-sm font-bold text-gray-800">Live Navbar Preview</h2>
          </div>
          <span className="text-[11px] font-medium text-gray-400">
            {items.filter((i) => i.isActive).length} active items
          </span>
        </div>

        {/* Mock Top Navbar Bar */}
        <div className="bg-[#FAF9FF] border border-purple-100 rounded-xl p-3 flex items-center gap-6 overflow-x-auto relative">
          {items.filter((i) => i.isActive).length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">
              No active menu items. Click &ldquo;Add Menu Item&rdquo; or &ldquo;Reset Defaults&rdquo; above.
            </p>
          ) : (
            items
              .filter((i) => i.isActive)
              .map((item) => (
                <div
                  key={item._id}
                  className="relative group shrink-0"
                  onMouseEnter={() => setActivePreviewDropdown(item._id)}
                  onMouseLeave={() => setActivePreviewDropdown(null)}
                >
                  <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800 hover:text-[#5428D8] cursor-pointer py-1">
                    {item.icon && <span className="text-base">{item.icon}</span>}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-[#EF4444] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                        {item.badge}
                      </span>
                    )}
                    {item.children && item.children.length > 0 && (
                      <ChevronDown size={14} className="text-gray-400 stroke-[2.5]" />
                    )}
                  </div>

                  {/* Dropdown preview */}
                  {activePreviewDropdown === item._id && item.children && item.children.length > 0 && (
                    <div className="absolute top-full left-0 pt-1 z-30 w-48">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 animate-fade-in">
                        {item.children.map((child, cIdx) => (
                          <div
                            key={cIdx}
                            className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#5428D8] flex items-center justify-between"
                          >
                            <span>{child.label}</span>
                            {child.openInNewTab && <ExternalLink size={10} className="text-gray-300" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Menu Items Table / Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Configured Menu Links</h2>
          <span className="text-xs text-gray-400">Drag or use arrows to change position</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading menu items...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Menu size={36} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No menu items configured</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Add your first menu item or reset to default links.
            </p>
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 bg-[#5428D8] text-white text-xs font-bold rounded-xl"
            >
              Reset to Defaults
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item, idx) => {
              const isExpanded = expandedId === item._id;
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div key={item._id} className="transition-colors hover:bg-gray-50/70">
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Reorder arrows & Info */}
                    <div className="flex items-center gap-3">
                      {/* Reorder Up/Down */}
                      <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => moveItem(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 hover:text-[#5428D8] text-gray-400 disabled:opacity-20 transition-colors"
                          title="Move up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <span className="text-[10px] font-mono font-bold text-gray-500 leading-none py-0.5">
                          {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => moveItem(idx, 1)}
                          disabled={idx === items.length - 1}
                          className="p-1 hover:text-[#5428D8] text-gray-400 disabled:opacity-20 transition-colors"
                          title="Move down"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-lg shrink-0">
                        {item.icon || <Link2 size={16} className="text-[#5428D8]" />}
                      </div>

                      {/* Label + URL */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{item.label}</span>
                          {item.badge && (
                            <span className="bg-[#EF4444] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {item.openInNewTab && (
                            <span title="Opens in new tab">
                              <ExternalLink size={12} className="text-gray-400" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {item.url}
                          </code>
                          {hasChildren && (
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : item._id)}
                              className="text-[11px] font-semibold text-[#5428D8] hover:underline flex items-center gap-1"
                            >
                              <span>{item.children?.length} sub-links</span>
                              <ChevronDown
                                size={12}
                                className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status toggle & Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Active Status Badge / Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleActive(item)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          item.isActive
                            ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                        }`}
                        title={item.isActive ? "Visible in navbar. Click to hide." : "Hidden from navbar. Click to show."}
                      >
                        {item.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{item.isActive ? "Active" : "Hidden"}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-2 text-gray-500 hover:text-[#5428D8] hover:bg-purple-50 rounded-xl transition-colors"
                        title="Edit item"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id, item.label)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Expandable sub-items view */}
                  {isExpanded && hasChildren && (
                    <div className="bg-[#FAF9FF] px-6 py-3 border-t border-purple-50">
                      <p className="text-xs font-bold text-[#5428D8] mb-2 uppercase tracking-wider">
                        Dropdown Sub-items:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {item.children?.map((child, cIdx) => (
                          <div
                            key={cIdx}
                            className="bg-white p-2.5 rounded-lg border border-purple-100 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-semibold text-gray-800">{child.label}</p>
                              <code className="text-[10px] text-gray-500 font-mono">{child.url}</code>
                            </div>
                            {child.openInNewTab && <ExternalLink size={12} className="text-gray-400" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Create Drawer Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#5428D8] flex items-center justify-center">
                  {isNew ? <Plus size={18} /> : <Pencil size={18} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {isNew ? "Add Menu Item" : `Edit Menu Item: ${editItem.label}`}
                  </h3>
                  <p className="text-xs text-gray-500">Configure link details and dropdown items</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form id="menu-item-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Label */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editItem.label || ""}
                    onChange={(e) => setEditItem((p) => ({ ...p, label: e.target.value }))}
                    placeholder="e.g. Toys, Deals, About"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-[#5428D8] transition-colors"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Target URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editItem.url || ""}
                    onChange={(e) => setEditItem((p) => ({ ...p, url: e.target.value }))}
                    placeholder="e.g. /products, /about, /contact"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-800 outline-none focus:border-[#5428D8] transition-colors"
                  />
                </div>
              </div>

              {/* Quick URL Presets */}
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Quick URL Presets:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_URLS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setEditItem((p) => ({ ...p, url: preset.url }))}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-purple-50 hover:text-[#5428D8] text-gray-600 rounded-md transition-colors font-mono"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji Icon & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Emoji Icon
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editItem.icon || ""}
                      onChange={(e) => setEditItem((p) => ({ ...p, icon: e.target.value }))}
                      placeholder="e.g. 🧸, 🎮, 💄"
                      className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-center text-lg outline-none focus:border-[#5428D8]"
                    />
                    <div className="flex flex-wrap gap-1">
                      {COMMON_EMOJIS.slice(0, 8).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setEditItem((p) => ({ ...p, icon: emoji }))}
                          className="w-7 h-7 rounded-lg hover:bg-purple-50 text-base flex items-center justify-center transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Optional Badge (e.g. HOT, NEW)
                  </label>
                  <input
                    type="text"
                    value={editItem.badge || ""}
                    onChange={(e) => setEditItem((p) => ({ ...p, badge: e.target.value }))}
                    placeholder="e.g. HOT, NEW, 20% OFF"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 outline-none focus:border-[#5428D8]"
                  />
                </div>
              </div>

              {/* Checkboxes: Active & New Tab */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editItem.isActive !== false}
                    onChange={(e) => setEditItem((p) => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#5428D8] focus:ring-[#5428D8]"
                  />
                  <span>Active (Visible on Storefront)</span>
                </label>

                <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editItem.openInNewTab)}
                    onChange={(e) => setEditItem((p) => ({ ...p, openInNewTab: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#5428D8] focus:ring-[#5428D8]"
                  />
                  <span>Open link in new browser tab</span>
                </label>
              </div>

              {/* Dropdown Children / Sub-items */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Dropdown Sub-Items (Children)</h4>
                    <p className="text-xs text-gray-500">
                      When added, hovering this menu item shows a clean dropdown menu.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addChildItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5428D8] font-bold text-xs rounded-lg transition-colors"
                  >
                    <Plus size={14} />
                    Add Sub-Item
                  </button>
                </div>

                {(!editItem.children || editItem.children.length === 0) ? (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                    No dropdown sub-items configured. Click &ldquo;Add Sub-Item&rdquo; above if you want a dropdown.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {editItem.children.map((child, cIdx) => (
                      <div
                        key={cIdx}
                        className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-2.5"
                      >
                        {/* Up/Down buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveChild(cIdx, -1)}
                            disabled={cIdx === 0}
                            className="p-1 hover:text-[#5428D8] text-gray-400 disabled:opacity-20"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveChild(cIdx, 1)}
                            disabled={cIdx === (editItem.children?.length || 0) - 1}
                            className="p-1 hover:text-[#5428D8] text-gray-400 disabled:opacity-20"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        {/* Label */}
                        <input
                          type="text"
                          required
                          value={child.label}
                          onChange={(e) => updateChild(cIdx, "label", e.target.value)}
                          placeholder="Sub-item label (e.g. Action Figures)"
                          className="flex-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-800 outline-none focus:border-[#5428D8] bg-white"
                        />

                        {/* URL */}
                        <input
                          type="text"
                          required
                          value={child.url}
                          onChange={(e) => updateChild(cIdx, "url", e.target.value)}
                          placeholder="URL (e.g. /products?category=action-figures)"
                          className="flex-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-800 outline-none focus:border-[#5428D8] bg-white"
                        />

                        {/* New tab */}
                        <label className="flex items-center gap-1 text-[11px] text-gray-600 shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(child.openInNewTab)}
                            onChange={(e) => updateChild(cIdx, "openInNewTab", e.target.checked)}
                            className="rounded text-[#5428D8]"
                          />
                          <span>New tab</span>
                        </label>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeChild(cIdx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Remove sub-item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="menu-item-form"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#5428D8] hover:bg-[#431db8] text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                <Save size={15} />
                <span>{saving ? "Saving..." : isNew ? "Create Menu Item" : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
