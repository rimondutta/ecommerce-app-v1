"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/providers/CartProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  ShoppingBag, 
  ShieldCheck,
  Package,
  Mail,
  MapPin,
  Banknote,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('cod');
  const [shippingArea, setShippingArea] = useState<'inside' | 'outside' | null>(null);
  
  const [formData, setFormData] = useState({
    customerEmail: "",
    customerName: "",
    customerPhone: "",
    addressLine1: "",
    city: "",
    postcode: "",
    country: "Bangladesh",
  });

  const shippingCost = shippingArea === 'inside' ? 50 : shippingArea === 'outside' ? 120 : 0;
  const finalTotal = total + shippingCost;

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        customerEmail: session.user?.email || "",
        customerName: session.user?.name || ""
      }));
    }
  }, [session]);

  if (items.length === 0 && step < 3) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 mb-8 text-zinc-200 bg-zinc-100 rounded-full flex items-center justify-center"
        >
           <ShoppingBag size={40} strokeWidth={1.5} className="text-zinc-400" />
        </motion.div>
        <h1 className="text-4xl font-display font-bold tracking-tight text-zinc-900 mb-4">Your bag is empty</h1>
        <p className="text-zinc-500 mb-10 max-w-xs font-medium">Looks like you haven't added any technical gear to your collection yet.</p>
        <Link href="/shop" className="px-10 py-4 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all rounded-full shadow-soft hover:shadow-soft-xl">
          Start Shopping
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmitOrder = async () => {
    setLoading(true);
    try {
      const orderPayload = {
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
        totalAmount: finalTotal,
        paymentMethod: paymentMethod,
        items: items.map(item => ({
          product: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size
        })),
        shippingAddress: {
          addressLine1: formData.addressLine1,
          city: formData.city,
          postcode: formData.postcode,
          country: formData.country
        },
        shippingCost: shippingCost
      };

      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (data.success) {
        clearCart();
        router.push(`/checkout/success?id=${data.orderId}`);
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Connectivity Error. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 selection:bg-zinc-900 selection:text-white pt-32 pb-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-16">
            <Link href="/shop" className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-all">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                Return to Shop
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-full shadow-soft">
                <Lock size={12} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Secure Protocol Active</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
           
           {/* LEFT COLUMN: CHECKOUT FLOW */}
           <div className="lg:col-span-7">
              <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 mb-8">Checkout</h1>
                <div className="flex items-center gap-4">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step === s ? 'bg-zinc-900 text-white shadow-soft-xl' : step > s ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-white text-zinc-400 border border-zinc-200'}`}>
                                {step > s ? <CheckCircle2 size={18} /> : s}
                            </div>
                            {s < 2 && <div className={`w-12 h-[2px] rounded-full ${step > s ? 'bg-emerald-200' : 'bg-zinc-200'}`} />}
                        </div>
                    ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-12"
                    >
                        <section className="space-y-8 bg-white p-8 md:p-10 rounded-[2.5rem] border border-zinc-100 shadow-soft">
                            <div className="flex items-center gap-3 text-zinc-900 border-b border-zinc-50 pb-6 mb-2">
                                <Mail size={20} className="text-zinc-400" />
                                <h2 className="text-xl font-display font-bold">Contact & Shipping</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Full Name</label>
                                    <input 
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleInputChange}
                                        placeholder="Receiver's name"
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-300"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Email Address</label>
                                    <input 
                                        type="email"
                                        name="customerEmail"
                                        value={formData.customerEmail}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-300"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Street Address</label>
                                    <input 
                                        name="addressLine1"
                                        value={formData.addressLine1}
                                        onChange={handleInputChange}
                                        placeholder="House No, Street, Area"
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-[1.5rem] px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">City</label>
                                    <input 
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Dhaka"
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Postcode</label>
                                    <input 
                                        name="postcode"
                                        value={formData.postcode}
                                        onChange={handleInputChange}
                                        placeholder="1200"
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-300"
                                    />
                                </div>
                                
                                <div className="md:col-span-2 space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Shipping Protocol</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setShippingArea('inside')}
                                            className={`flex items-center justify-between px-6 py-5 rounded-2xl border-2 transition-all duration-300 ${shippingArea === 'inside' ? 'border-zinc-900 bg-zinc-900 text-white shadow-soft-xl' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200 text-zinc-600'}`}
                                        >
                                            <span className="text-sm font-bold">Inside City</span>
                                            <span className="text-xs font-bold opacity-80">৳50</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setShippingArea('outside')}
                                            className={`flex items-center justify-between px-6 py-5 rounded-2xl border-2 transition-all duration-300 ${shippingArea === 'outside' ? 'border-zinc-900 bg-zinc-900 text-white shadow-soft-xl' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200 text-zinc-600'}`}
                                        >
                                            <span className="text-sm font-bold">Outside City</span>
                                            <span className="text-xs font-bold opacity-80">৳120</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <button 
                            onClick={handleNext}
                            disabled={!formData.addressLine1 || !formData.customerEmail || !formData.customerName || !shippingArea}
                            className="w-full bg-zinc-900 text-white py-6 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-20 flex items-center justify-center gap-3 shadow-soft-xl"
                        >
                            Continue to Payment <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-12"
                    >
                        <section className="space-y-8 bg-white p-8 md:p-10 rounded-[2.5rem] border border-zinc-100 shadow-soft">
                            <div className="flex items-center gap-3 text-zinc-900 border-b border-zinc-50 pb-6 mb-2">
                                <CreditCard size={20} className="text-zinc-400" />
                                <h2 className="text-xl font-display font-bold">Payment Method</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button 
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`p-8 rounded-[2rem] border-2 text-left transition-all flex flex-col gap-6 ${paymentMethod === 'cod' ? 'border-zinc-900 bg-white shadow-soft-xl' : 'border-zinc-50 bg-zinc-50/50 hover:border-zinc-100'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-400 shadow-sm'}`}>
                                        <Banknote size={24} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold uppercase tracking-tight text-zinc-900">Cash on Delivery</div>
                                        <div className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">Pay upon arrival</div>
                                    </div>
                                </button>
 
                                <button 
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-8 rounded-[2rem] border-2 text-left transition-all flex flex-col gap-6 ${paymentMethod === 'card' ? 'border-zinc-900 bg-white shadow-soft-xl' : 'border-zinc-50 bg-zinc-50/50 hover:border-zinc-100'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${paymentMethod === 'card' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-400 shadow-sm'}`}>
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold uppercase tracking-tight text-zinc-900">Digital Gateway</div>
                                        <div className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">Secure encryption</div>
                                    </div>
                                </button>
                            </div>

                            {paymentMethod === 'card' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100 space-y-8"
                                >
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Card Number</label>
                                            <div className="relative">
                                                <input 
                                                    placeholder="XXXX XXXX XXXX XXXX"
                                                    className="w-full bg-white border border-zinc-200 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-300"
                                                />
                                                <CreditCard className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Expiry</label>
                                                <input 
                                                    placeholder="MM / YY"
                                                    className="w-full bg-white border border-zinc-200 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-300"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">CVC</label>
                                                <input 
                                                    placeholder="XXX"
                                                    className="w-full bg-white border border-zinc-200 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-300"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-4">
                                        <ShieldCheck size={16} className="text-emerald-500" /> 
                                        End-to-End Encrypted Transaction
                                    </div>
                                </motion.div>
                            )}

                            {paymentMethod === 'cod' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 bg-zinc-900 rounded-[2rem] text-white space-y-4 shadow-soft-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <Truck className="text-zinc-400" size={20} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Protocol Confirmation</span>
                                    </div>
                                    <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                                        Our logistics team will verify your shipment via phone call. Please ensure your contact details are accurate to avoid delays.
                                    </p>
                                </motion.div>
                            )}
                        </section>

                        <div className="flex flex-col md:flex-row gap-6 pt-4">
                            <button 
                                onClick={handleBack}
                                className="px-10 py-6 border border-zinc-200 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:shadow-soft transition-all flex items-center justify-center gap-3 text-zinc-600"
                            >
                                <ArrowLeft size={18} /> Adjust Details
                            </button>
                            <button 
                                onClick={handleSubmitOrder}
                                disabled={loading}
                                className="flex-1 bg-zinc-900 text-white py-6 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-soft-xl flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Finalize Transaction <CheckCircle2 size={18} /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
           <div className="lg:col-span-5">
              <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-zinc-100 shadow-soft sticky top-32">
                 <div className="flex items-center justify-between mb-10 border-b border-zinc-50 pb-8">
                    <h3 className="text-2xl font-display font-bold text-zinc-900">Summary</h3>
                    <span className="text-[10px] font-bold bg-zinc-100 px-3 py-1 rounded-full uppercase tracking-widest text-zinc-500">
                        {items.length} {items.length === 1 ? 'Unit' : 'Units'}
                    </span>
                 </div>
                 
                 <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide mb-10">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-6 group">
                         <div className="w-24 aspect-[3/4] bg-zinc-50 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-100 transition-transform group-hover:scale-[1.05] duration-500">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 flex flex-col justify-between py-2">
                            <div>
                                <h4 className="text-sm font-bold text-zinc-900 line-clamp-1">{item.title}</h4>
                                <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">
                                    <span>{item.size}</span>
                                    <span>/</span>
                                    <span>{item.color}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                                <span className="text-sm font-bold text-zinc-900">৳{Math.round(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="space-y-5 pt-8 border-t border-zinc-50">
                    <div className="flex justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                       <span>Base Total</span>
                       <span className="text-zinc-900 font-bold">৳{Math.round(total).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                       <span>Shipping Fee</span>
                       <span className="text-zinc-900 font-bold">
                        {shippingArea ? `৳${shippingCost.toLocaleString()}` : '—'}
                       </span>
                    </div>
                    
                    <div className="pt-8 flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Total Payload</label>
                        <div className="flex items-end justify-between bg-zinc-50 p-6 rounded-3xl border border-zinc-100 shadow-inner">
                            <div className="text-4xl font-display font-bold tracking-tight text-zinc-900">
                                ৳{Math.round(finalTotal).toLocaleString()}
                            </div>
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-900 shadow-soft">
                                <Package size={24} strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="mt-10 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-soft flex-shrink-0">
                            <ShieldCheck size={20} className="text-emerald-500" />
                        </div>
                        <div className="space-y-1 pt-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-900">Auth Guarantee</p>
                            <p className="text-[10px] leading-relaxed text-emerald-700 font-medium">
                                Technical verification on every unit. Global authenticity tracking.
                            </p>
                        </div>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
