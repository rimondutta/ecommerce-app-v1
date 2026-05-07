"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CartoonButton from "@/components/ui/CartoonButton";
import CartoonInput from "@/components/ui/CartoonInput";
import { useCartoonToast } from "@/components/ui/CartoonToast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Package, CreditCard, CheckCircle2, ArrowLeft, ArrowRight, Star } from "lucide-react";

const STEPS = [
  { id: "shipping", label: "SHIPPING", icon: Package },
  { id: "payment", label: "PAYMENT", icon: CreditCard },
  { id: "confirm", label: "CONFIRM", icon: CheckCircle2 },
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useCartoonToast();

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
    if (step === 0) return form.name && form.email && form.phone && form.address && form.city;
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
        showToast("MISSION COMPLETE! GEAR ACQUIRED.");
        router.push("/account");
      } else {
        showToast(data.message || "Order failed", "error");
      }
    } catch {
      showToast("Connection error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-8 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none" />
        <div className="w-24 h-24 bg-ink flex items-center justify-center border-4 border-ink cartoon-shadow rotate-12">
          <ShoppingBag size={48} className="text-paper" />
        </div>
        <div className="space-y-2">
           <h1 className="font-bangers text-5xl text-ink uppercase tracking-tight">INVENTORY EMPTY</h1>
           <p className="font-comic font-bold italic text-2xl text-secondary">You haven't marked any gear for acquisition yet.</p>
        </div>
        <Link href="/products">
          <CartoonButton size="lg">START ACQUISITION</CartoonButton>
        </Link>
      </div>
    );
  }

  const shippingCost = total >= 8000 ? 0 : 120;
  const grandTotal = total + shippingCost;

  return (
    <div className="min-h-screen bg-paper relative overflow-hidden">
      <div className="absolute inset-0 bg-halftone opacity-5 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-8 md:px-12 py-20 relative z-10">
        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="inline-block px-4 py-2 bg-ink text-paper border-2 border-ink rotate-[-2deg]">
            <span className="font-bebas text-2xl tracking-[0.2em] uppercase">// MISSION BRIEFING</span>
          </div>
          <h1 className="font-bangers text-7xl md:text-9xl text-ink uppercase tracking-tight leading-none drop-shadow-[6px_6px_0px_#000]">
            CHECKOUT
          </h1>
        </div>

        {/* Progress Timeline */}
        <div className="flex items-center justify-between gap-4 mb-20 relative overflow-x-auto no-scrollbar pb-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isCompleted = i < step;
            return (
              <div key={s.id} className="flex flex-1 items-center gap-4">
                <div className={cn(
                  "flex items-center gap-4 px-6 py-4 border-4 transition-all cartoon-shadow-sm",
                  isActive ? "bg-ink text-paper border-ink" : isCompleted ? "bg-white border-ink text-ink" : "bg-white border-ink/10 text-ink/20"
                )}>
                  <Icon size={24} />
                  <span className="font-bebas text-2xl tracking-widest hidden md:inline">{s.label}</span>
                  {isCompleted && <div className="absolute -top-3 -right-3 w-8 h-8 bg-white border-3 border-ink flex items-center justify-center font-bangers text-xl rotate-12">✓</div>}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-1 min-w-[2rem]",
                    isCompleted ? "bg-ink" : "bg-ink/10"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Form Area */}
          <div className="lg:col-span-8 space-y-12">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div 
                  key="step0" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border-4 border-ink p-10 cartoon-shadow-lg space-y-10"
                >
                  <div className="flex items-center gap-4 border-b-4 border-ink/10 pb-6">
                    <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center border-3 border-ink cartoon-shadow-xs rotate-[-3deg]">
                      <Package size={24} />
                    </div>
                    <h2 className="font-bangers text-4xl text-ink uppercase tracking-tight">STAGE 01: SHIPPING INTEL</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <CartoonInput label="FULL NAME" value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="AGENT CODENAME" />
                    <CartoonInput label="SECURE EMAIL" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="AGENT@HQ.COM" />
                    <CartoonInput label="VOICE LINE" type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+1.XXX.XXX.XXXX" />
                    <CartoonInput label="ZIP CODE" value={form.zip} onChange={(e) => updateField("zip", e.target.value)} placeholder="XXXXX" />
                  </div>
                  <CartoonInput label="BASE ADDRESS" value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="STREET, BUILDING, SECTOR" />
                  <CartoonInput label="LOCATION CITY" value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="DISTRICT" />
                </motion.div>
              )}

              {step === 1 && (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border-4 border-ink p-10 cartoon-shadow-lg space-y-10"
                >
                  <div className="flex items-center gap-4 border-b-4 border-ink/10 pb-6">
                    <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center border-3 border-ink cartoon-shadow-xs rotate-[-3deg]">
                      <CreditCard size={24} />
                    </div>
                    <h2 className="font-bangers text-4xl text-ink uppercase tracking-tight">STAGE 02: PAYMENT PROTOCOL</h2>
                  </div>

                  <div className="space-y-6">
                    {[
                      { key: "cod", label: "CASH ON DELIVERY", desc: "Settle with the agent upon arrival" },
                      { key: "bkash", label: "SECURE MOBILE", desc: "Instant mobile terminal transfer" },
                      { key: "card", label: "ENCRYPTED CARD", desc: "Visa / Mastercard protocols" },
                    ].map((method) => (
                      <button
                        key={method.key}
                        onClick={() => updateField("paymentMethod", method.key)}
                        className={cn(
                          "w-full flex items-center justify-between p-6 border-4 transition-all cartoon-shadow-sm",
                          form.paymentMethod === method.key
                            ? "bg-ink text-paper border-ink translate-x-1 translate-y-1 shadow-none"
                            : "bg-white text-ink border-ink hover:bg-surface"
                        )}
                      >
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-8 h-8 rounded-full border-4 flex items-center justify-center",
                            form.paymentMethod === method.key ? "bg-white border-white" : "border-ink"
                          )}>
                             {form.paymentMethod === method.key && <div className="w-3 h-3 bg-ink rounded-full" />}
                          </div>
                          <div className="text-left">
                            <span className="font-bangers text-3xl block tracking-tight">{method.label}</span>
                            <span className="font-comic font-bold italic text-lg opacity-60 leading-none">{method.desc}</span>
                          </div>
                        </div>
                        <CreditCard size={32} className="opacity-20" />
                      </button>
                    ))}
                  </div>
                  <div className="pt-6">
                     <CartoonInput label="MISSION NOTES (OPTIONAL)" value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="ANY SPECIAL INSTRUCTIONS FOR THE AGENT?" />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border-4 border-ink p-10 cartoon-shadow-lg space-y-10"
                >
                  <div className="flex items-center gap-4 border-b-4 border-ink/10 pb-6">
                    <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center border-3 border-ink cartoon-shadow-xs rotate-[-3deg]">
                      <CheckCircle2 size={24} />
                    </div>
                    <h2 className="font-bangers text-4xl text-ink uppercase tracking-tight">STAGE 03: FINAL CLEARANCE</h2>
                  </div>

                  <div className="bg-surface border-4 border-ink p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-halftone opacity-10 rotate-45 translate-x-12 -translate-y-12" />
                    <h3 className="font-bebas text-2xl text-secondary tracking-widest uppercase">// DOSSIER REVIEW</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      {[
                        ["OPERATIVE", form.name],
                        ["CONTACT", form.email],
                        ["DESTINATION", `${form.address}, ${form.city} ${form.zip}`],
                        ["PROTOCOL", form.paymentMethod.toUpperCase()],
                      ].map(([label, value]) => (
                        <div key={label} className="space-y-1">
                          <span className="font-bebas text-xl text-ink/40 tracking-widest uppercase">{label}</span>
                          <p className="font-bangers text-2xl text-ink tracking-tight uppercase leading-none">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bebas text-2xl text-secondary tracking-widest uppercase">// ACQUISITION LIST</h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.color}-${item.size}`} className="flex items-center gap-6 p-4 bg-white border-3 border-ink cartoon-shadow-xs">
                          <div className="w-16 h-20 relative shrink-0 border-2 border-ink overflow-hidden bg-surface">
                            <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bangers text-2xl text-ink truncate tracking-tight uppercase">{item.title}</p>
                            <p className="font-bebas text-lg text-ink/40 tracking-widest">SCHEMA: {item.color} / SIZE: {item.size} / UNITS: {item.quantity}</p>
                          </div>
                          <span className="font-bangers text-3xl text-ink">৳{Math.round(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between gap-8 pt-8">
              {step > 0 ? (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-3 font-bebas text-3xl text-secondary hover:text-ink transition-colors uppercase tracking-tight"
                >
                  <ArrowLeft size={28} /> REVERT STAGE
                </button>
              ) : <div />}

              {step < 2 ? (
                <CartoonButton size="lg" className="min-w-[200px]" onClick={() => canProceed() && setStep(step + 1)} disabled={!canProceed()}>
                  NEXT STAGE <ArrowRight className="ml-3" size={28} />
                </CartoonButton>
              ) : (
                <CartoonButton size="lg" className="min-w-[280px]" onClick={handleSubmit} disabled={isSubmitting}>
                   {isSubmitting ? "TRANSMITTING..." : "CONFIRM MISSION ★"}
                </CartoonButton>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white border-4 border-ink p-8 cartoon-shadow-lg sticky top-24 space-y-10 overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-halftone opacity-10 rotate-45 translate-x-12 -translate-y-12" />
               
               <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-ink text-paper border-2 border-ink">
                     <ShoppingBag size={20} />
                   </div>
                   <h3 className="font-bangers text-4xl text-ink uppercase tracking-tight">THE TALLY</h3>
                </div>

                <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.color}`} className="flex justify-between items-start gap-4">
                      <div className="space-y-1 flex-1">
                        <span className="font-bangers text-xl text-ink block leading-none uppercase">{item.title}</span>
                        <span className="font-bebas text-lg text-ink/40 tracking-widest">UNITS ×{item.quantity}</span>
                      </div>
                      <span className="font-bangers text-2xl text-ink">৳{Math.round(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="h-1 bg-ink/10" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bebas text-xl text-ink/40 tracking-widest uppercase">LOGISTICS</span>
                    <span className={cn(
                      "font-bangers text-2xl",
                      shippingCost === 0 ? "text-ink" : "text-ink"
                    )}>
                      {shippingCost === 0 ? "FREE OF CHARGE" : `৳${shippingCost}`}
                    </span>
                  </div>
                  
                  <div className="p-6 bg-ink text-paper border-4 border-ink cartoon-shadow-sm flex justify-between items-center rotate-[2deg]">
                     <span className="font-bebas text-3xl tracking-[0.2em]">TOTAL DUE</span>
                     <span className="font-bangers text-5xl">৳{Math.round(grandTotal).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 font-comic font-bold italic text-ink/40 text-sm justify-center">
                   <Star size={14} /> SECURE TRANSACTION GUARANTEED <Star size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
