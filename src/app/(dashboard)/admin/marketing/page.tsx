"use client"

import { Megaphone, Plus, Mail, MessageSquare, Tag, Globe, ChevronRight, Info, Search } from "lucide-react"

export default function AdminMarketingPage() {
  const marketingActivities = [
    {
      title: "Email marketing",
      description: "Send personalized emails to your customers with Shopify Email.",
      icon: <Mail size={20} className="text-[#008060]" />,
      active: true
    },
    {
      title: "Facebook and Instagram",
      description: "Run ads and reach new customers on social platforms.",
      icon: <Globe size={20} className="text-[#008060]" />,
      active: false
    },
    {
      title: "Snapchat Ads",
      description: "Sync your products to Snapchat and run compelling ads.",
      icon: <Megaphone size={20} className="text-[#202223]" />,
      active: false
    }
  ]

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 text-[#202223]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-[#202223]">Marketing</h1>
          <p className="text-[13px] text-[#616161] mt-0.5">Reach your customers and drive sales through new marketing channels.</p>
        </div>
        <button className="bg-[#008060] text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-[#006e52] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95">
          <Plus size={16} strokeWidth={2.5} /> Create campaign
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#d2d2d2] shadow-[0_1px_0_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-[#616161] mb-1">
            <Tag size={14} />
            <span className="text-[12px] font-medium uppercase tracking-wider">Marketing sales</span>
          </div>
          <div className="text-[24px] font-bold text-[#202223]">৳0.00</div>
          <p className="text-[11px] text-[#616161] mt-1 flex items-center gap-1">
            <Info size={10} /> 0% of total sales
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#d2d2d2] shadow-[0_1px_0_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-[#616161] mb-1">
            <MessageSquare size={14} />
            <span className="text-[12px] font-medium uppercase tracking-wider">Marketing sessions</span>
          </div>
          <div className="text-[24px] font-bold text-[#202223]">0</div>
          <p className="text-[11px] text-[#616161] mt-1 flex items-center gap-1">
             <Info size={10} /> 0% of total sessions
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#d2d2d2] shadow-[0_1px_0_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-[#616161] mb-1">
            <Megaphone size={14} />
            <span className="text-[12px] font-medium uppercase tracking-wider">Orders</span>
          </div>
          <div className="text-[24px] font-bold text-[#202223]">0</div>
          <p className="text-[11px] text-[#616161] mt-1 flex items-center gap-1">
            <Info size={10} /> 0 orders from marketing
          </p>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="bg-[#f1f8ff] p-5 rounded-xl border border-[#c2e0ff] flex gap-4 items-start shadow-sm">
        <div className="p-2 bg-white rounded-lg border border-[#c2e0ff] shadow-sm">
          <Info size={20} className="text-[#005bd3]" />
        </div>
        <div className="flex-1">
          <h4 className="text-[14px] font-bold text-[#001e51]">New: Automate your emails</h4>
          <p className="text-[13px] text-[#001e51]/80 mt-1 leading-relaxed">Set up automated emails to welcome new subscribers or win back abandoned carts. Merchants who use automation see up to <span className="font-bold">30% more sales</span>.</p>
          <div className="flex items-center gap-4 mt-3">
            <button className="text-[13px] font-bold text-[#005bd3] hover:underline transition-all">Get started</button>
            <button className="text-[13px] font-medium text-[#616161] hover:text-[#202223] transition-all">Dismiss</button>
          </div>
        </div>
      </div>

      {/* Marketing Channels */}
      <div className="bg-white rounded-xl border border-[#d2d2d2] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#d2d2d2] flex items-center justify-between bg-[#f9f9f9]">
          <h2 className="text-[14px] font-bold text-[#202223]">Apps and channels</h2>
          <button className="text-[12px] font-bold text-[#008060] hover:underline">Add marketing app</button>
        </div>
        <div className="divide-y divide-[#f1f1f1]">
          {marketingActivities.map((activity, i) => (
            <div key={i} className="px-6 py-5 flex items-center justify-between hover:bg-[#fbfbfb] cursor-pointer group transition-all">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-white rounded-xl border border-[#d2d2d2] group-hover:border-[#008060] group-hover:shadow-sm transition-all duration-300">
                  {activity.icon}
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#202223] group-hover:text-[#008060] transition-colors">{activity.title}</h3>
                  <p className="text-[13px] text-[#616161] mt-0.5 max-w-[500px] leading-snug">{activity.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 {!activity.active && (
                    <span className="text-[11px] font-bold bg-[#f6f6f7] text-[#616161] px-2.5 py-1 rounded-full border border-[#d2d2d2]">
                      Not installed
                    </span>
                 )}
                 {activity.active && (
                    <span className="text-[11px] font-bold bg-[#e3f1df] text-[#008060] px-2.5 py-1 rounded-full border border-[#bbe5b3]">
                      Active
                    </span>
                 )}
                 <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#616161] group-hover:bg-[#f1f1f1] group-hover:text-[#202223] transition-all">
                   <ChevronRight size={18} />
                 </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-[#f9f9f9] border-t border-[#d2d2d2] text-center">
          <p className="text-[12px] text-[#616161]">View all marketing apps in the <span className="text-[#008060] font-bold hover:underline cursor-pointer">Shopify App Store</span></p>
        </div>
      </div>
    </div>

  )
}
