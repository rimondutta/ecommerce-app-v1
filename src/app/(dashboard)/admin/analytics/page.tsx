"use client"

import { BarChart2, TrendingUp, ArrowUpRight, DollarSign, ShoppingBag, Users } from "lucide-react"

export default function AdminAnalyticsPage() {
  const stats = [
    { label: "Total Sales", value: "৳128,430", change: "+14.2%" },
    { label: "Online Store Sessions", value: "12,432", change: "+5.1%" },
    { label: "Online Store Conversion Rate", value: "2.45%", change: "-0.2%" },
    { label: "Total Orders", value: "432", change: "+12.4%" },
    { label: "Average Order Value", value: "৳297", change: "+2.1%" },
    { label: "Top Selected Products", value: "84", change: "+1.5%" },
  ]

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 text-[#202223]">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold">Analytics</h1>
        <div className="flex gap-2">
           <button className="bg-white border border-[#d2d2d2] rounded-md px-3 py-1.5 text-[13px] font-medium hover:bg-[#f6f6f6]">
             Customize
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-[#d2d2d2] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-[#616161]">{stat.label}</span>
              <button className="text-[#616161] hover:text-[#202223]"><ArrowUpRight size={14} /></button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[20px] font-bold">{stat.value}</span>
              <span className={`text-[12px] font-medium ${stat.change.startsWith('+') ? 'text-[#008060]' : 'text-[#d82c0d]'}`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-[#f1f1f1]">
               <div className="h-16 w-full bg-[#f9f9f9] rounded flex items-end gap-1 px-1">
                  {[...Array(12)].map((_, j) => (
                    <div 
                      key={j} 
                      className="flex-1 bg-[#008060]/20 rounded-t group hover:bg-[#008060] transition-colors" 
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    >
                       <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 rounded">
                         {Math.floor(Math.random() * 100)}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#d2d2d2] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#d2d2d2]">
          <h2 className="text-[14px] font-bold">Reports</h2>
        </div>
        <div className="divide-y divide-[#f1f1f1]">
          <div className="p-4 flex items-center justify-between hover:bg-[#f9f9f9] cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f6f6f7] rounded border border-[#d2d2d2] group-hover:border-[#008060]/30"><BarChart2 size={16} className="text-[#008060]" /></div>
              <span className="text-[13px] font-medium">Sales over time</span>
            </div>
            <ChevronRight size={14} className="text-[#616161]" />
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-[#f9f9f9] cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f6f6f7] rounded border border-[#d2d2d2] group-hover:border-[#008060]/30"><Users size={16} className="text-[#008060]" /></div>
              <span className="text-[13px] font-medium">Customers over time</span>
            </div>
            <ChevronRight size={14} className="text-[#616161]" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronRight({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
