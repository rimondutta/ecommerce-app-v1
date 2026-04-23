"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, ToggleLeft, ToggleRight, Ticket, Percent, DollarSign, X, MoreVertical, Search, Filter } from "lucide-react"

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
  });

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          minOrderAmount: Number(form.minOrderAmount) || 0,
          maxUses: Number(form.maxUses) || 0,
          expiresAt: form.expiresAt || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create"); return; }

      setCoupons(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "" });
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon._id, isActive: !coupon.isActive }),
      });
      if (res.ok) {
        setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      setCoupons(prev => prev.filter(c => c._id !== id));
    } catch {}
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-[#202223]">Discounts</h1>
          <p className="text-[13px] text-[#616161] mt-0.5">Manage codes that customers enter at checkout.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#008060] text-white px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#006e52] transition-colors shadow-sm"
        >
          Create discount
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg border border-[#d2d2d2] shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {/* Filters/Tabs */}
        <div className="flex items-center px-4 py-2 border-b border-[#d2d2d2] gap-4">
          <button className="text-[13px] font-semibold text-[#202223] border-b-2 border-[#008060] pb-2 pt-1 px-1">All</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Active</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Scheduled</button>
          <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] pb-2 pt-1 px-1 border-b-2 border-transparent transition-colors">Expired</button>
        </div>

        {/* Search Bar */}
        <div className="p-4 flex items-center gap-3 bg-[#fcfcfc]">
          <div className="relative flex-1 group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161] group-focus-within:text-[#008060] transition-colors" />
            <input 
              type="text" 
              placeholder="Filter discounts" 
              className="w-full bg-white border border-[#d2d2d2] rounded-md py-1.5 pl-10 pr-4 text-[13px] text-[#202223] placeholder:text-[#616161] focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-[#d2d2d2] rounded-md px-3 py-1.5 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f6] shadow-sm transition-colors">
            <Filter size={14} />
            <span>Filter</span>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#d2d2d2] border-t-[#008060] rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#fcfcfc]">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#e1e3e5] mb-6 transform rotate-3">
              <Ticket size={40} className="text-[#008060]" />
            </div>
            <h2 className="text-[17px] font-bold text-[#202223] mb-2 tracking-tight">Create your first discount code</h2>
            <p className="text-[13px] text-[#616161] max-w-[340px] mb-8 leading-relaxed">
              Reward your customers with a fixed or percentage amount off their order to drive more sales and customer loyalty.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#008060] text-white px-6 py-2.5 rounded-md text-[14px] font-bold hover:bg-[#006e52] shadow-md active:scale-95 transition-all"
            >
              Create discount code
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f9f9f9] border-b border-[#e1e3e5]">
                  <th className="px-6 py-3 text-[12px] font-bold text-[#616161] uppercase tracking-wider">Discount code</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#616161] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#616161] uppercase tracking-wider">Used</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#616161] text-right uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1f1]">
                {coupons.map((coupon) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                  const isMaxed = coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses;

                  return (
                    <tr key={coupon._id} className="hover:bg-[#f8f9fa] group transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="text-[13px] font-bold text-[#008060] font-mono hover:underline uppercase tracking-wider">
                          {coupon.code}
                        </div>
                        <div className="text-[11px] text-[#616161] mt-0.5 font-medium">
                          {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`} off
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="bg-[#fbeae5] text-[#d82c0d] px-2.5 py-1 rounded-full text-[11px] font-bold border border-[#f8d0c9]">EXPIRED</span>
                        ) : isMaxed ? (
                          <span className="bg-[#fff4e5] text-[#965e00] px-2.5 py-1 rounded-full text-[11px] font-bold border border-[#ffe2bb]">MAX REACHED</span>
                        ) : coupon.isActive ? (
                          <span className="bg-[#e3f1df] text-[#008060] px-2.5 py-1 rounded-full text-[11px] font-bold border border-[#bee0b5]">ACTIVE</span>
                        ) : (
                          <span className="bg-[#e4e5e7] text-[#202223] px-2.5 py-1 rounded-full text-[11px] font-bold border border-[#ccd0d2]">DISABLED</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#202223] font-medium">
                        {coupon.usedCount} used
                      </td>
                      <td className="px-6 py-4 text-right text-[13px] text-[#616161] font-medium">
                        {coupon.minOrderAmount > 0 ? `Min. ৳${coupon.minOrderAmount}` : "No minimum"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button
                            onClick={() => handleToggle(coupon)}
                            className={`p-2 rounded-md hover:bg-white border border-transparent hover:border-[#d2d2d2] shadow-sm transition-all ${coupon.isActive ? 'text-[#008060]' : 'text-[#616161]'}`}
                            title={coupon.isActive ? "Disable" : "Enable"}
                          >
                            {coupon.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="p-2 rounded-md hover:bg-white border border-transparent hover:border-[#f8d0c9] text-[#d82c0d] shadow-sm transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0b0c0d]/80 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#d2d2d2] bg-[#f9f9f9]">
              <h2 className="text-[15px] font-bold text-[#202223]">Create discount code</h2>
              <button onClick={() => { setShowForm(false); setError(""); }} className="p-1 hover:bg-[#e4e5e7] rounded-md transition-colors text-[#616161]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {error && (
                <div className="bg-[#fbeae5] border border-[#d82c0d]/20 text-[#d82c0d] text-[13px] font-medium px-4 py-3 rounded-md flex items-start gap-2">
                  <div className="mt-0.5">⚠️</div>
                  {error}
                </div>
              )}

              <div>
                <label className="text-[13px] font-medium text-[#202223] mb-1.5 block">Discount code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SUMMER2024"
                    required
                    className="flex-1 px-3 py-2 border border-[#d2d2d2] rounded-md text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all uppercase"
                  />
                  <button type="button" className="text-[13px] font-medium text-[#008060] hover:underline">Generate code</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-medium text-[#202223] mb-1.5 block">Type</label>
                  <select
                    value={form.discountType}
                    onChange={e => setForm(p => ({ ...p, discountType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-[#d2d2d2] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#202223] mb-1.5 block">Value</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.discountValue}
                      onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))}
                      placeholder="0"
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-[#d2d2d2] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#616161] text-[12px] pointer-events-none">
                      {form.discountType === "percentage" ? "%" : "৳"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-medium text-[#202223] mb-1.5 block">Minimum purchase</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.minOrderAmount}
                      onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-[#d2d2d2] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all pl-7"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161] text-[12px] pointer-events-none">৳</div>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#202223] mb-1.5 block">Maximum usages</label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))}
                    placeholder="Unlimited"
                    min="0"
                    className="w-full px-3 py-2 border border-[#d2d2d2] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#202223] mb-1.5 block">End date (optional)</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#d2d2d2] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#d2d2d2]">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(""); }}
                  className="flex-1 py-2 border border-[#d2d2d2] rounded-md text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f6] transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-[#008060] text-white rounded-md text-[13px] font-semibold hover:bg-[#006e52] shadow-sm disabled:opacity-50 transition-all active:scale-95"
                >
                  {saving ? "Creating..." : "Save discount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
