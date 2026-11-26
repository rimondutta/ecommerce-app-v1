"use client";

import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Phone,
  Home,
  Briefcase,
  Gift,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/playshelf/Toast";
import { SavedAddress } from "./types";

interface AddressesTabProps {
  addresses: SavedAddress[];
  loading: boolean;
  defaultCustomerName?: string;
  onAddressesUpdated: (nextAddresses: SavedAddress[]) => void;
}

interface AddressFormState {
  label: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

const PRESET_LABELS = [
  { value: "Home", icon: Home },
  { value: "Office", icon: Briefcase },
  { value: "Gift", icon: Gift },
];

function createEmptyForm(defaultName = ""): AddressFormState {
  return {
    label: "Home",
    fullName: defaultName,
    phoneNumber: "",
    streetAddress: "",
    city: "Dhaka",
    state: "",
    zipCode: "",
    isDefault: false,
  };
}

export default function AddressesTab({
  addresses,
  loading,
  defaultCustomerName = "",
  onAddressesUpdated,
}: AddressesTabProps) {
  const { showToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormState>(() =>
    createEmptyForm(defaultCustomerName)
  );
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      ...createEmptyForm(defaultCustomerName),
      isDefault: addresses.length === 0,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (addr: SavedAddress) => {
    setEditingId(addr._id);
    setForm({
      label: addr.label || "Home",
      fullName: addr.fullName || "",
      phoneNumber: addr.phoneNumber || "",
      streetAddress: addr.streetAddress || "",
      city: addr.city || "",
      state: addr.state || "",
      zipCode: addr.zipCode || "",
      isDefault: Boolean(addr.isDefault),
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.streetAddress.trim() || !form.city.trim()) {
      showToast("Please fill in recipient name, street address, and city", "error");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = editingId
        ? `/api/users/addresses/${editingId}`
        : "/api/users/addresses";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error || "Could not save address", "error");
        return;
      }

      onAddressesUpdated(data.addresses || []);
      showToast(
        editingId ? "Address updated!" : "New address saved!",
        "success"
      );
      closeForm();
    } catch {
      showToast("Network error saving address. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setBusyId(addressId);
    try {
      const res = await fetch(`/api/users/addresses/${addressId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onAddressesUpdated(data.addresses || []);
        showToast("Default delivery address updated", "success");
      } else {
        showToast(data.error || "Could not update default address", "error");
      }
    } catch {
      showToast("Could not update default address", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (addressId: string) => {
    setBusyId(addressId);
    try {
      const res = await fetch(`/api/users/addresses/${addressId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onAddressesUpdated(data.addresses || []);
        setConfirmDeleteId(null);
        showToast("Address removed", "info");
      } else {
        showToast(data.error || "Failed to delete address", "error");
      }
    } catch {
      showToast("Failed to delete address", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <m.div
      key="addresses"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Header Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-[22px] border border-[#EDE4D8] p-5 flex flex-wrap items-center justify-between gap-4 shadow-[0_2px_10px_rgba(44,36,22,0.04)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-[#E8470A]">
            <MapPin size={18} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2416]">
              Saved Addresses
            </h2>
            <p className="text-xs text-[#7A6E62]">
              Manage home, office, and gift delivery destinations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#5428D8] hover:bg-[#4318C4] text-white text-xs font-bold px-4 py-2.5 shadow-[0_2px_10px_rgba(84,40,216,0.22)] transition-all cursor-pointer"
        >
          <Plus size={15} />
          Add New Address
        </button>
      </div>

      {/* Add / Edit Drawer Form */}
      <AnimatePresence>
        {isFormOpen && (
          <m.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-[24px] border-2 border-[#DFD6FE] p-5 sm:p-7 shadow-[0_12px_32px_rgba(84,40,216,0.10)] space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-[#2C2416]">
                {editingId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                className="w-8 h-8 rounded-full bg-[#F5F1EB] hover:bg-[#EAE1D3] flex items-center justify-center text-[#7A6E62] cursor-pointer"
                aria-label="Close form"
              >
                <X size={15} />
              </button>
            </div>

            {/* Label Selector Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2416] block">
                Address Label
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_LABELS.map(({ value, icon: Icon }) => {
                  const selected = form.label === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, label: value }))}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                        selected
                          ? "bg-[#5428D8] text-white border-[#5428D8] shadow-xs"
                          : "bg-[#FDF8F0] text-[#7A6E62] border-[#E8DDD0] hover:border-[#5428D8]/40"
                      )}
                    >
                      <Icon size={13} />
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2416] block">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="e.g. Rimon Dutta"
                  className="w-full human-input px-3.5 py-2.5 text-sm text-[#2C2416]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2416] block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  placeholder="e.g. 017XXXXXXXX"
                  className="w-full human-input px-3.5 py-2.5 text-sm text-[#2C2416]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#2C2416] block">
                  Street Address / House / Road *
                </label>
                <input
                  type="text"
                  required
                  value={form.streetAddress}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, streetAddress: e.target.value }))
                  }
                  placeholder="House #12, Road #4, Sector 7, Uttara"
                  className="w-full human-input px-3.5 py-2.5 text-sm text-[#2C2416]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2416] block">
                  City / District *
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Dhaka"
                  className="w-full human-input px-3.5 py-2.5 text-sm text-[#2C2416]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2416] block">
                    Area / Thana
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    placeholder="Uttara"
                    className="w-full human-input px-3.5 py-2.5 text-sm text-[#2C2416]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2416] block">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={form.zipCode}
                    onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))}
                    placeholder="1230"
                    className="w-full human-input px-3.5 py-2.5 text-sm text-[#2C2416]"
                  />
                </div>
              </div>
            </div>

            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                className="w-4 h-4 rounded accent-[#5428D8] cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-semibold text-[#2C2416]">
                Set as my default delivery address
              </span>
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#7A6E62] hover:bg-[#F5F1EB] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5428D8] hover:bg-[#4318C4] text-white text-xs font-bold shadow-[0_2px_10px_rgba(84,40,216,0.22)] disabled:opacity-60 transition-all cursor-pointer"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {editingId ? "Update Address" : "Save Address"}
              </button>
            </div>
          </m.form>
        )}
      </AnimatePresence>

      {/* Address Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white rounded-[22px] border border-[#EDE4D8] p-5 space-y-3 animate-pulse"
            >
              <div className="h-5 w-24 bg-[#F3F0FE] rounded-full" />
              <div className="h-4 w-40 bg-[#EDE4D8] rounded" />
              <div className="h-4 w-full bg-[#F5ECE0] rounded" />
            </div>
          ))}
        </div>
      ) : addresses.length === 0 && !isFormOpen ? (
        <div className="bg-white/95 backdrop-blur-md rounded-[26px] border border-[#EDE4D8] p-10 sm:p-14 text-center shadow-[0_4px_20px_rgba(44,36,22,0.04)]">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-[#E8470A] mx-auto mb-4">
            <MapPin size={28} strokeWidth={1.8} />
          </div>
          <h3 className="text-lg font-bold text-[#2C2416]">No saved addresses yet</h3>
          <p className="text-sm text-[#7A6E62] mt-1.5 max-w-sm mx-auto">
            Add your delivery address once to breeze through future toy orders.
          </p>
          <button
            type="button"
            onClick={openAddForm}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#5428D8] hover:bg-[#4318C4] text-white text-sm font-semibold px-6 py-3 shadow-[0_4px_14px_rgba(84,40,216,0.28)] transition-all cursor-pointer"
          >
            <Plus size={16} />
            Add First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const isBusy = busyId === addr._id;
            const isConfirmingDelete = confirmDeleteId === addr._id;

            return (
              <div
                key={addr._id}
                className={cn(
                  "bg-white/95 backdrop-blur-md rounded-[22px] border p-5 shadow-[0_2px_12px_rgba(44,36,22,0.04)] flex flex-col justify-between gap-4 transition-all",
                  addr.isDefault
                    ? "border-[#5428D8]/40 ring-1 ring-[#5428D8]/10"
                    : "border-[#EDE4D8]"
                )}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-[#F3F0FE] text-[#5428D8] px-3 py-1 rounded-full">
                      {addr.label || "Home"}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                        <Star size={11} className="fill-emerald-600 text-emerald-600" />
                        Default
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-[#2C2416]">
                      {addr.fullName}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#7A6E62] mt-1 leading-relaxed">
                      {addr.streetAddress}
                      <br />
                      {addr.city}
                      {addr.state ? `, ${addr.state}` : ""}
                      {addr.zipCode ? ` - ${addr.zipCode}` : ""}
                    </p>
                  </div>

                  {addr.phoneNumber && (
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2C2416]/85">
                      <Phone size={12} className="text-[#9A8F83]" />
                      {addr.phoneNumber}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#F4ECE2] flex items-center justify-between gap-2 flex-wrap">
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleSetDefault(addr._id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#5428D8] hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {isBusy ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#9A8F83] font-medium">
                      Primary shipping destination
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditForm(addr)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#2C2416] bg-[#FBF4EB] hover:bg-[#F3E9DB] transition-colors cursor-pointer"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDelete(addr._id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1.5 rounded-lg text-xs font-semibold text-[#7A6E62] hover:bg-[#F5F1EB] cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(addr._id)}
                        className="p-1.5 rounded-lg text-[#9A8F83] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        aria-label="Delete address"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </m.div>
  );
}
