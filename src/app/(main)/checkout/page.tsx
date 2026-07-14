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
    notes: "",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 0)
      return (
        form.name && form.email && form.phone && form.address && form.city
      );
    if (step === 1) return form.paymentMethod;
    return true;
  };

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
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
            image: item.image,
          })),
          shippingAddress: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            zip: form.zip,
          },
          paymentMethod: form.paymentMethod,
          notes: form.notes,
          totalAmount: total,
        }),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        showToast("Order placed successfully! 🎉");
        router.push("/account");
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-8 text-center">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #FFC93C20, #FF6B5D10)",
              border: "1px solid #FFC93C20",
            }}
          >
            <ShoppingBag size={40} className="text-white/40" strokeWidth={1.5} />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Your cart is empty</h1>
          <p className="text-white/40 text-base max-w-xs">
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

  const shippingCost = total >= 8000 ? 0 : 120;
  const grandTotal = total + shippingCost;

  return (
    <div className="min-h-screen relative">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, #FFC93C 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
        {/* ── Header ── */}
        <div className="mb-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
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
                      ? "bg-[#FFC93C] text-black shadow-[0_0_20px_rgba(255,201,60,0.25)]"
                      : isCompleted
                      ? "bg-white/10 text-white border border-white/15"
                      : "bg-white/[0.03] text-white/25 border border-white/5"
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
                      isCompleted ? "text-white/30" : "text-white/10"
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
                  className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-7 md:p-9 space-y-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#FFC93C]/10 border border-[#FFC93C]/20 flex items-center justify-center">
                      <Package size={18} className="text-[#FFC93C]" strokeWidth={1.8} />
                    </div>
                    <h2 className="text-xl font-bold text-white">
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
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(v) => updateField("email", v)}
                      placeholder="you@email.com"
                      required
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
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-7 md:p-9 space-y-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 flex items-center justify-center">
                      <CreditCard size={18} className="text-[#4ECDC4]" strokeWidth={1.8} />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Payment Method
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = form.paymentMethod === method.key;
                      return (
                        <button
                          key={method.key}
                          onClick={() =>
                            updateField("paymentMethod", method.key)
                          }
                          className={cn(
                            "w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-200",
                            isSelected
                              ? "border-[#FFC93C]/50 bg-[#FFC93C]/8 shadow-[0_0_20px_rgba(255,201,60,0.08)]"
                              : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                          )}
                        >
                          <span className="text-2xl">{method.icon}</span>
                          <div className="flex-1">
                            <p className={cn("font-semibold text-sm", isSelected ? "text-white" : "text-white/70")}>
                              {method.label}
                            </p>
                            <p className="text-xs text-white/30 mt-0.5">
                              {method.desc}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                              isSelected
                                ? "border-[#FFC93C] bg-[#FFC93C]"
                                : "border-white/20"
                            )}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-black" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">
                      Order Notes (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Any special instructions for delivery…"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FFC93C]/40 focus:ring-1 focus:ring-[#FFC93C]/20 transition-all resize-none"
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
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-7 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#8B7FD6]/10 border border-[#8B7FD6]/20 flex items-center justify-center">
                        <CheckCircle2 size={18} className="text-[#8B7FD6]" strokeWidth={1.8} />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        Review Order
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        ["Recipient", form.name],
                        ["Email", form.email],
                        ["Phone", form.phone],
                        ["Payment", form.paymentMethod === "cod" ? "Cash on Delivery" : form.paymentMethod === "bkash" ? "bKash" : "Card"],
                        ["Address", `${form.address}, ${form.city} ${form.zip}`],
                      ].map(([label, value]) => (
                        <div key={label} className="space-y-0.5">
                          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                            {label}
                          </p>
                          <p className="text-sm font-semibold text-white/80">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-7 space-y-4">
                    <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest">
                      Items ({items.length})
                    </h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={`${item.id}-${item.color}-${item.size}`}
                          className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                        >
                          <div className="w-14 h-16 relative shrink-0 rounded-lg overflow-hidden bg-white/5">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-white/30 mt-0.5">
                              {item.color} · {item.size} · Qty {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-white whitespace-nowrap">
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
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white border border-white/8 hover:border-white/15 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200"
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
                      ? "hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,201,60,0.25)]"
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
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-black transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_24px_rgba(255,201,60,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
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
            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-white/20">
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
            <div className="sticky top-24 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-6 space-y-6">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-white/40" strokeWidth={1.8} />
                <h3 className="font-bold text-white text-base">
                  Order Summary
                </h3>
                <span className="ml-auto text-xs text-white/30 font-medium">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Items list */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.color}`}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-14 relative shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/5">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate leading-snug">
                        {item.title}
                      </p>
                      <p className="text-xs text-white/25 mt-0.5">
                        ×{item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-white whitespace-nowrap">
                      ৳{Math.round(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/5" />

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Subtotal</span>
                  <span className="text-white/70 font-medium">
                    ৳{Math.round(total).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Shipping</span>
                  <span
                    className={cn(
                      "font-medium",
                      shippingCost === 0 ? "text-[#4ECDC4]" : "text-white/70"
                    )}
                  >
                    {shippingCost === 0 ? "Free" : `৳${shippingCost}`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-[11px] text-white/20">
                    Add ৳{Math.round(8000 - total).toLocaleString()} more for free shipping
                  </p>
                )}

                <div className="h-px bg-white/5" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Total</span>
                  <span
                    className="text-2xl font-bold"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #FFC93C 0%, #F5A623 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    ৳{Math.round(grandTotal).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Free shipping progress */}
              {shippingCost > 0 && (
                <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4">
                  <div className="flex justify-between text-xs text-white/30 mb-2">
                    <span>Free shipping progress</span>
                    <span>{Math.round((total / 8000) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FFC93C] to-[#4ECDC4] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((total / 8000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
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
      <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-widest">
        {label}
        {required && <span className="text-[#FFC93C] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FFC93C]/40 focus:ring-1 focus:ring-[#FFC93C]/20 transition-all"
      />
    </div>
  );
}
