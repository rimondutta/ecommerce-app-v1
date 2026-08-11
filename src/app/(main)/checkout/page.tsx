"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/playshelf/Toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Package,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Shield,
  Truck,
  Loader2,
  Sparkles,
} from "lucide-react";

const STEPS = [
  { id: "shipping", label: "Shipping", icon: Package },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "confirm", label: "Review", icon: CheckCircle2 },
];

const PAYMENT_METHODS = [
  {
    key: "cod",
    label: "Cash on Delivery",
    desc: "Pay when your order arrives",
    icon: "💵",
  },
  {
    key: "bkash",
    label: "bKash",
    desc: "Instant mobile transfer",
    icon: "📱",
  },
  {
    key: "card",
    label: "Credit / Debit Card",
    desc: "Visa, Mastercard, Amex",
    icon: "💳",
  },
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    paymentMethod: "cod",
    shippingZone: "inside_dhaka",
    notes: "",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 0)
      return (
        form.name && form.phone && form.address && form.city
      );
    if (step === 1) return form.paymentMethod;
    return true;
  };

  const shippingCost = form.shippingZone === "outside_dhaka" ? 150 : 120;
  const grandTotal = total + shippingCost;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: form.email,
          customerName: form.name,
          items: items.map((item) => ({
            productId: item.id,
            variantId: item.variantId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            variantOptions: item.variantOptions,
            image: item.image,
          })),
          shippingAddress: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            addressLine1: form.address,
            city: form.city,
            postcode: form.zip,
            country: 'Bangladesh'
          },
          paymentMethod: form.paymentMethod,
          shippingZone: form.shippingZone,
          notes: form.notes,
          totalAmount: total,
          shippingCost: shippingCost,
        }),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        showToast("Order placed successfully! 🎉");
        router.push(`/invoice/${data.orderId}`);
      } else {
        showToast(data.message || "Order failed", "error");
      }
    } catch {
      showToast("Connection error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-8 text-center bg-white">
        <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-amber-50 border border-amber-200">
          <ShoppingBag size={40} className="text-amber-400" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-black">Your cart is empty</h1>
          <p className="text-gray-500 text-base max-w-xs">
            Add some items to your cart before checking out.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-black transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #FFC93C 0%, #F5A623 100%)" }}
        >
          <Sparkles size={16} />
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
        {/* ── Header ── */}
        <div className="mb-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-6 font-medium"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
            Checkout
          </h1>
        </div>

        {/* ── Progress Steps ── */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isCompleted = i < step;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex-1 justify-center",
                    isActive
                      ? "bg-[#FFC93C] text-black shadow-[0_4px_14px_rgba(255,201,60,0.35)]"
                      : isCompleted
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-white text-gray-400 border border-gray-200"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight
                    size={16}
                    className={cn(
                      "shrink-0 transition-colors",
                      isCompleted ? "text-green-400" : "text-gray-300"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* ── Form Area ── */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm p-7 md:p-9 space-y-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <Package size={18} className="text-amber-500" strokeWidth={1.8} />
                    </div>
                    <h2 className="text-xl font-bold text-black">
                      Shipping Details
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CheckoutField
                      label="Full Name"
                      value={form.name}
                      onChange={(v) => updateField("name", v)}
                      placeholder="Your name"
                      required
                    />
                    <CheckoutField
                      label="Email (optional)"
                      type="email"
                      value={form.email}
                      onChange={(v) => updateField("email", v)}
                      placeholder="you@email.com"
                    />
                    <CheckoutField
                      label="Phone"
                      type="tel"
                      value={form.phone}
                      onChange={(v) => updateField("phone", v)}
                      placeholder="+880 1XXX XXXXXX"
                      required
                    />
                    <CheckoutField
                      label="ZIP / Postal Code"
                      value={form.zip}
                      onChange={(v) => updateField("zip", v)}
                      placeholder="1207"
                    />
                  </div>
                  <CheckoutField
                    label="Street Address"
                    value={form.address}
                    onChange={(v) => updateField("address", v)}
                    placeholder="House, Road, Area"
                    required
                  />
                  <CheckoutField
                    label="City"
                    value={form.city}
                    onChange={(v) => updateField("city", v)}
                    placeholder="Dhaka"
                    required
                  />

                  {/* ── Shipping Zone ── */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Truck size={15} className="text-amber-500" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Delivery Area <span className="text-amber-500">*</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "inside_dhaka", label: "Inside Dhaka", charge: 120, icon: "🏙️" },
                        { key: "outside_dhaka", label: "Outside Dhaka", charge: 150, icon: "🚚" },
                      ].map((zone) => {
                        const isSelected = form.shippingZone === zone.key;
                        return (
                          <button
                            key={zone.key}
                            type="button"
                            onClick={() => updateField("shippingZone", zone.key)}
                            className={cn(
                              "flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 text-center transition-all duration-200",
                              isSelected
                                ? "border-amber-400 bg-amber-50 shadow-sm"
                                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            <span className="text-2xl">{zone.icon}</span>
                            <p className="font-bold text-sm text-black leading-tight">{zone.label}</p>
                            <span className={cn("text-sm font-bold", isSelected ? "text-amber-600" : "text-gray-500")}>
                              ৳{zone.charge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm p-7 md:p-9 space-y-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                      <CreditCard size={18} className="text-teal-500" strokeWidth={1.8} />
                    </div>
                    <h2 className="text-xl font-bold text-black">
                      Payment Method
                    </h2>
                  </div>

                  {/* ── Payment Methods ── */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Pay With
                    </p>
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = form.paymentMethod === method.key;
                      return (
                        <button
                          key={method.key}
                          onClick={() => updateField("paymentMethod", method.key)}
                          className={cn(
                            "w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-200",
                            isSelected
                              ? "border-amber-400 bg-amber-50 shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          <span className="text-2xl">{method.icon}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-black">
                              {method.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {method.desc}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                              isSelected
                                ? "border-amber-500 bg-amber-500"
                                : "border-gray-300"
                            )}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Order Notes (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Any special instructions for delivery…"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-black placeholder:text-gray-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-5"
                >
                  {/* Review summary */}
                  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-7 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                        <CheckCircle2 size={18} className="text-purple-500" strokeWidth={1.8} />
                      </div>
                      <h2 className="text-xl font-bold text-black">
                        Review Order
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        ["Recipient", form.name],
                        ["Email", form.email],
                        ["Phone", form.phone],
                        ["Payment", form.paymentMethod === "cod" ? "Cash on Delivery" : form.paymentMethod === "bkash" ? "bKash" : "Card"],
                        ["Delivery", form.shippingZone === "outside_dhaka" ? "Outside Dhaka" : "Inside Dhaka"],
                        ["Address", `${form.address}, ${form.city} ${form.zip}`],
                      ].map(([label, value]) => (
                        <div key={label} className="space-y-0.5">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {label}
                          </p>
                          <p className="text-sm font-semibold text-black">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-7 space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                      Items ({items.length})
                    </h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={`${item.id}-${JSON.stringify(item.variantOptions)}`}
                          className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100"
                        >
                          <div className="w-14 h-16 relative shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-black truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {Object.entries(item.variantOptions || {}).map(([k, v]) => `${k}: ${v}`).join(" · ")} {Object.keys(item.variantOptions || {}).length > 0 && "·"} Qty {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-black whitespace-nowrap">
                            ৳{Math.round(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Navigation ── */}
            <div className="flex items-center justify-between gap-4 mt-6">
              {step > 0 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:text-black border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 2 ? (
                <button
                  onClick={() => canProceed() && setStep(step + 1)}
                  disabled={!canProceed()}
                  className={cn(
                    "flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-black transition-all duration-200",
                    canProceed()
                      ? "hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_14px_rgba(255,201,60,0.35)]"
                      : "opacity-40 cursor-not-allowed"
                  )}
                  style={{ background: "linear-gradient(135deg, #FFC93C 0%, #F5A623 100%)" }}
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-black transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_18px_rgba(255,201,60,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #FFC93C 0%, #F5A623 100%)" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Place Order
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-gray-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Shield size={13} />
                Secure Checkout
              </div>
              <div className="flex items-center gap-1.5">
                <Truck size={13} />
                Fast Delivery
              </div>
            </div>
          </div>

          {/* ── Order Summary Sidebar ── */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-gray-400" strokeWidth={1.8} />
                <h3 className="font-bold text-black text-base">
                  Order Summary
                </h3>
                <span className="ml-auto text-xs text-gray-400 font-medium">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Items list */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${JSON.stringify(item.variantOptions)}`}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-14 relative shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate leading-snug">
                        {item.title}
                      </p>
                      {Object.keys(item.variantOptions || {}).length > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {Object.entries(item.variantOptions || {}).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        ×{item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-black whitespace-nowrap">
                      ৳{Math.round(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100" />

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-black font-semibold">
                    ৳{Math.round(total).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">
                    Shipping
                    <span className="ml-1.5 text-[10px] text-gray-400">
                      ({form.shippingZone === "outside_dhaka" ? "Outside Dhaka" : "Inside Dhaka"})
                    </span>
                  </span>
                  <span className="font-semibold text-black">৳{shippingCost}</span>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-black text-base">Total</span>
                  <span
                    className="text-2xl font-bold"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    ৳{Math.round(grandTotal).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest">
        {label}
        {required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
      />
    </div>
  );
}
