"use client"

import { useEffect, useState, use } from "react"
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Mail, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchOrder = () => {
    setLoading(true)
    fetch(`/api/admin/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const updateStatus = async (type: 'payment' | 'fulfillment', newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [type === 'payment' ? 'paymentStatus' : 'fulfillmentStatus']: newStatus
        })
      })
      
      if (!res.ok) throw new Error("Update failed")
      
      const data = await res.json()
      setOrder(data.order)
    } catch(err) {
      alert("Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-sm text-gray-500">Loading order details...</div>
  if (!order) return <div className="p-8 text-center text-sm text-gray-500">Order not found.</div>

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'bg-[#AEE9D1] text-[#008060]'
      case 'processing':
      case 'shipped':
        return 'bg-[#FFF4B5] text-[#8A6116]'
      case 'pending':
      case 'unfulfilled':
        return 'bg-[#FFEBCC] text-[#8A6116]'
      case 'cancelled':
      case 'failed':
        return 'bg-[#FFD1CC] text-[#8A1111]'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 text-gray-500 hover:text-[#202223] hover:bg-gray-200/50 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#202223]">#{order._id.slice(-6).toUpperCase()}</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(order.fulfillmentStatus)}`}>
                {order.fulfillmentStatus.charAt(0).toUpperCase() + order.fulfillmentStatus.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {order.fulfillmentStatus === 'unfulfilled' && (
            <button 
              disabled={updating}
              onClick={() => updateStatus('fulfillment', 'processing')}
              className="bg-[#008060] hover:bg-[#006e52] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Package size={16} /> Mark as fulfilled
            </button>
          )}
          {order.fulfillmentStatus === 'processing' && (
             <button 
                disabled={updating}
                onClick={() => updateStatus('fulfillment', 'shipped')}
                className="bg-[#008060] hover:bg-[#006e52] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Truck size={16} /> Mark as shipped
             </button>
          )}
           {order.fulfillmentStatus === 'shipped' && (
             <button 
                disabled={updating}
                onClick={() => updateStatus('fulfillment', 'delivered')}
                className="bg-[#008060] hover:bg-[#006e52] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle size={16} /> Mark as delivered
             </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Items Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-base font-semibold text-[#202223] flex items-center gap-2">
                   <Package size={18} /> Items ({order.items?.length || 0})
                </h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(order.fulfillmentStatus)}`}>
                   {order.fulfillmentStatus}
                </span>
             </div>
             <div className="p-0">
                <table className="w-full text-left">
                   <tbody className="divide-y divide-gray-100">
                      {order.items?.map((item: any, idx: number) => (
                         <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-6 flex items-center gap-4">
                               <div className="h-16 w-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 shrink-0 text-gray-400 font-bold text-xs">
                                  IMG
                               </div>
                               <div>
                                  <div className="font-medium text-[#202223]">{item.title}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                     {item.color && <span>{item.color}</span>}
                                     {item.color && item.size && <span className="mx-1">•</span>}
                                     {item.size && <span>{item.size}</span>}
                                  </div>
                               </div>
                            </td>
                            <td className="p-6 text-sm text-gray-600">
                               ৳{item.price.toLocaleString()} × {item.quantity}
                            </td>
                            <td className="p-6 text-right font-medium text-[#202223]">
                               ৳{(item.price * item.quantity).toLocaleString()}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
             <div className="p-6 bg-gray-50/30 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Subtotal</span>
                   <span className="text-[#202223]">৳{(order.totalAmount - (order.shippingCost || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Shipping</span>
                   <span className="text-[#202223]">৳{(order.shippingCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100 mt-2">
                   <span className="text-[#202223]">Total</span>
                   <span className="text-[#202223]">৳{order.totalAmount.toLocaleString()}</span>
                </div>
             </div>
          </div>

          {/* Timeline Card (Placeholder) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-base font-semibold text-[#202223]">Timeline</h2>
             </div>
             <div className="p-6">
                <div className="relative pl-6 border-l border-gray-200 py-2 space-y-6">
                   <div className="relative">
                      <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                      <div className="text-sm">
                         <span className="font-semibold">Order placed</span>
                         <span className="text-gray-500 ml-2">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                   </div>
                   {order.fulfillmentStatus !== 'unfulfilled' && (
                     <div className="relative">
                        <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white"></div>
                        <div className="text-sm">
                           <span className="font-semibold">Order processing</span>
                           <span className="text-gray-500 ml-2">Updated recently</span>
                        </div>
                     </div>
                   )}
                </div>
             </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
           
           {/* Customer Card */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-base font-semibold text-[#202223]">Customer</h2>
                <ExternalLink size={16} className="text-gray-400" />
             </div>
             <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-[#E3E4E6] rounded-full flex items-center justify-center text-gray-600 font-bold uppercase">
                      {order.customerName?.charAt(0) || 'G'}
                   </div>
                   <div>
                      <div className="font-medium text-[#005bd3] hover:underline cursor-pointer">{order.customerName || 'Guest Customer'}</div>
                      <div className="text-xs text-gray-500">No orders yet</div>
                   </div>
                </div>
                <div className="pt-4 border-t border-gray-100 space-y-3">
                   <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-[#202223]">Contact information</h3>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-[#005bd3]">
                      <Mail size={16} className="text-gray-400" />
                      <span className="truncate hover:underline cursor-pointer">{order.customerEmail}</span>
                   </div>
                </div>
                <div className="pt-4 border-t border-gray-100 space-y-3">
                   <h3 className="text-sm font-semibold text-[#202223]">Shipping address</h3>
                   <div className="text-sm text-gray-600 leading-relaxed flex gap-2">
                      <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        {order.customerName}<br />
                        {order.shippingAddress?.addressLine1 || 'No address provided'}<br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.postcode}<br />
                        {order.shippingAddress?.country || 'Bangladesh'}
                      </div>
                   </div>
                </div>
             </div>
           </div>

           {/* Payment Status Card */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                 <h2 className="text-base font-semibold text-[#202223]">Payment</h2>
              </div>
              <div className="p-6 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(order.paymentStatus)}`}>
                       {order.paymentStatus}
                    </span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Method</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-900">
                       {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}
                    </span>
                 </div>
                 {order.paymentStatus === 'pending' && (
                    <button 
                      disabled={updating}
                      onClick={() => updateStatus('payment', 'paid')}
                      className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors py-2"
                    >
                       Mark as paid
                    </button>
                 )}
                 {order.paymentStatus === 'paid' && (
                    <div className="text-sm text-gray-500 text-center py-2 flex items-center justify-center gap-2">
                       <CheckCircle size={14} className="text-green-500" /> Payment captured
                    </div>
                 )}
              </div>
           </div>

           {/* Cancellation Card */}
           {(order.fulfillmentStatus !== 'delivered' && order.fulfillmentStatus !== 'cancelled') && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <div className="p-4">
                    <button 
                       disabled={updating}
                       onClick={() => {
                          if (confirm("Are you sure you want to cancel this order?")) {
                             updateStatus('fulfillment', 'cancelled')
                          }
                       }}
                       className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                       <XCircle size={16} /> Cancel order
                    </button>
                 </div>
              </div>
           )}

        </div>

      </div>
    </div>
  )
}
