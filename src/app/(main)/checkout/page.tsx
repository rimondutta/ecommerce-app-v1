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
  ChevronRight,
  ShieldCheck,
  Lock,
  Package,
  Phone,
  Mail,
  MapPin,
  Banknote
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
    cardNumber: "",
    expiry: "",
    cvc: ""
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
          className="w-20 h-20 mb-6 text-neutral-200"
        >
           <ShoppingBag size={80} strokeWidth={1} />
        </motion.div>
        <h1 className="text-3xl font-light tracking-tight text-neutral-900 mb-2">Your bag is empty</h1>
        <p className="text-sm text-neutral-700 mb-10 max-w-xs">Looks like you haven't added any premium garments to your collection yet.</p>
        <Link href="/shop" className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all rounded-full">
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
    <div className="min-h-screen bg-[#FDFDFD] selection:bg-black selection:text-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
        
        <div className="flex items-center justify-between mb-12">
            <Link href="/shop" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-black transition-all">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                Back to Shop
            </Link>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">Secure Checkout Active</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
           
           {/* LEFT COLUMN: CHECKOUT FLOW */}
           <div className="lg:col-span-7">
              <div className="mb-12">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 mb-4">Checkout</h1>
                <div className="flex items-center gap-3">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step === s ? 'bg-black text-white shadow-lg' : step > s ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-400'}`}>
                                {step > s ? <CheckCircle2 size={14} /> : s}
                            </div>
                            {s < 3 && <div className={`w-8 h-[1px] ${step > s ? 'bg-green-200' : 'bg-neutral-100'}`} />}
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
                        className="space-y-10"
                    >
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 text-neutral-900">
                                <Mail size={18} strokeWidth={1.5} />
                                <h2 className="text-lg font-medium">Contact Information</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 ml-1">Email Address</label>
                                    <input 
                                        type="email"
                                        name="customerEmail"
                                        value={formData.customerEmail}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        className="w-full bg-white border border-neutral-200 rounded-xl px-5 py-4 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3 text-neutral-900">
                                <MapPin size={18} strokeWidth={1.5} />
                                <h2 className="text-lg font-medium">Shipping Details</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 ml-1">Full Name</label>
                                    <input 
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleInputChange}
                                        placeholder="Receiver's full name"
                                        className="w-full bg-white border border-neutral-300 rounded-xl px-5 py-4 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-400"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 ml-1">Street Address</label>
                                    <input 
                                        name="addressLine1"
                                        value={formData.addressLine1}
                                        onChange={handleInputChange}
                                        placeholder="House No, Street, Area"
                                        className="w-full bg-white border border-neutral-300 rounded-xl px-5 py-4 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-400"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 ml-1">City</label>
                                    <input 
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Dhaka"
                                        className="w-full bg-white border border-neutral-300 rounded-xl px-5 py-4 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-400"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 ml-1">Postcode</label>
                                    <input 
                                        name="postcode"
                                        value={formData.postcode}
                                        onChange={handleInputChange}
                                        placeholder="1200"
                                        className="w-full bg-white border border-neutral-300 rounded-xl px-5 py-4 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-400"
                                    />
                                </div>
                                
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 ml-1">Shipping Area</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setShippingArea('inside')}
                                            className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${shippingArea === 'inside' ? 'border-black bg-black/5' : 'border-neutral-200 hover:border-neutral-300'}`}
                                        >
                                            <span className="text-sm font-medium">Inside Chattogram</span>
                                            <span className="text-xs font-bold">৳50</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setShippingArea('outside')}
                                            className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${shippingArea === 'outside' ? 'border-black bg-black/5' : 'border-neutral-200 hover:border-neutral-300'}`}
                                        >
                                            <span className="text-sm font-medium">Outside Chattogram</span>
                                            <span className="text-xs font-bold">৳120</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <button 
                            onClick={handleNext}
                            disabled={!formData.addressLine1 || !formData.customerEmail || !formData.customerName || !shippingArea}
                            className="w-full bg-black text-white py-5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all disabled:opacity-20 flex items-center justify-center gap-3 shadow-xl shadow-black/5"
                        >
                            Continue to Payment <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-10"
                    >
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 text-neutral-900">
                                <CreditCard size={18} strokeWidth={1.5} />
                                <h2 className="text-lg font-medium">Payment Method</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col gap-4 ${paymentMethod === 'cod' ? 'border-black bg-white shadow-md' : 'border-neutral-100 bg-neutral-50/50 hover:border-neutral-200'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                        <Banknote size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold uppercase tracking-tight text-neutral-900">Cash on Delivery</div>
                                        <div className="text-[10px] text-neutral-700 mt-1 uppercase tracking-widest font-bold">Pay upon reception</div>
                                    </div>
                                </button>
 
                                <button 
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col gap-4 ${paymentMethod === 'card' ? 'border-black bg-white shadow-md' : 'border-neutral-100 bg-neutral-50/50 hover:border-neutral-200'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'card' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold uppercase tracking-tight text-neutral-900">Debit / Credit Card</div>
                                        <div className="text-[10px] text-neutral-700 mt-1 uppercase tracking-widest font-bold">Secure online payment</div>
                                    </div>
                                </button>
                            </div>

                            {paymentMethod === 'card' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 bg-neutral-50 rounded-3xl border border-neutral-100 space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 ml-1">Card Number</label>
                                            <div className="relative">
                                                <input 
                                                    placeholder="XXXX XXXX XXXX XXXX"
                                                    className="w-full bg-white border border-neutral-300 rounded-xl px-5 py-4 text-sm focus:border-black outline-none transition-all placeholder:text-neutral-400"
                                                />
                                                <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 ml-1">Expiry Date</label>
                                                <input 
                                                    placeholder="MM / YY"
                                                    className="w-full bg-white border border-neutral-300 rounded-xl px-5 py-4 text-sm focus:border-black outline-none transition-all placeholder:text-neutral-400"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 ml-1">CVC</label>
                                                <input 
                                                    placeholder="XXX"
                                                    className="w-full bg-white border border-neutral-300 rounded-xl px-5 py-4 text-sm focus:border-black outline-none transition-all placeholder:text-neutral-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                                        <ShieldCheck size={14} className="text-green-600" /> 
                                        Encrypted 256-bit Secure Connection
                                    </div>
                                </motion.div>
                            )}

                            {paymentMethod === 'cod' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 bg-neutral-900 rounded-3xl text-white space-y-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <Truck className="text-neutral-400" size={18} strokeWidth={1.5} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Protocol Confirmation</span>
                                    </div>
                                    <p className="text-sm text-neutral-400 leading-relaxed font-light">
                                        Your order will be verified via phone call. Please keep your balance ready at the time of delivery. Shipping will commence immediately after verification.
                                    </p>
                                </motion.div>
                            )}
                        </section>

                        <div className="flex flex-col md:flex-row gap-4 pt-4">
                            <button 
                                onClick={handleBack}
                                className="px-8 py-5 border border-neutral-200 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={16} /> Edit Details
                            </button>
                            <button 
                                onClick={handleSubmitOrder}
                                disabled={loading}
                                className="flex-1 bg-black text-white py-5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Place Order Now <CheckCircle2 size={16} /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
           <div className="lg:col-span-5">
              <div className="bg-white rounded-[32px] p-6 lg:p-10 border border-neutral-100 shadow-2xl shadow-neutral-200/50">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-semibold text-neutral-900">Order Summary</h3>
                    <span className="text-[10px] font-bold bg-neutral-100 px-2 py-1 rounded-full uppercase tracking-widest text-neutral-500">
                        {items.length} {items.length === 1 ? 'Item' : 'Items'}
                    </span>
                 </div>
                 
                 <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide mb-8">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 group">
                         <div className="w-20 aspect-[3/4] bg-neutral-50 rounded-2xl overflow-hidden flex-shrink-0 border border-neutral-100 transition-transform group-hover:scale-[1.02]">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h4 className="text-sm font-semibold text-neutral-900 line-clamp-1">{item.title}</h4>
                                <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-neutral-600 mt-1">
                                    <span>{item.size}</span>
                                    <span>•</span>
                                    <span>{item.color}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-neutral-600">QTY: {item.quantity}</span>
                                <span className="text-sm font-semibold text-neutral-900">৳{Math.round(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="space-y-4 pt-6 border-t border-neutral-100">
                    <div className="flex justify-between text-xs font-bold text-neutral-700">
                       <span className="uppercase tracking-widest">Subtotal</span>
                       <span className="text-neutral-900">৳{Math.round(total).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-neutral-700">
                       <span className="uppercase tracking-widest">Shipping</span>
                       <span className="text-neutral-900 font-bold">
                        {shippingArea ? `৳${shippingCost.toLocaleString()}` : 'Select area'}
                       </span>
                    </div>
                    
                    <div className="pt-8 flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600">Total Amount</label>
                        <div className="flex items-end justify-between">
                            <div className="text-3xl md:text-4xl font-semibold tracking-tighter text-neutral-900">
                                ৳{Math.round(finalTotal).toLocaleString()}
                            </div>
                            <div className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-900">
                                <Package size={20} strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="mt-10 p-6 bg-neutral-50 rounded-3xl border border-neutral-100/50">
                    <div className="flex items-start gap-4">
                        <div className="mt-1">
                            <ShieldCheck size={20} className="text-black" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-900">Premium Assurance</p>
                            <p className="text-[10px] leading-relaxed text-neutral-500 font-medium">
                                30-day effortless returns and global authenticity guarantee on every shipment.
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
