"use client"

import { FileText, Globe, PenTool, Layout, ChevronRight } from "lucide-react"

export default function AdminContentPage() {
  const contentTypes = [
    {
      title: "Pages",
      description: "Manage your store's static pages like About Us, Contact, and FAQs.",
      icon: <FileText size={20} className="text-[#008060]" />,
      action: "Manage pages"
    },
    {
      title: "Blog posts",
      description: "Write and manage articles for your store's blog.",
      icon: <PenTool size={20} className="text-[#008060]" />,
      action: "Manage blog"
    },
    {
      title: "Navigation",
      description: "Configure menus and links for your store's header and footer.",
      icon: <Layout size={20} className="text-[#008060]" />,
      action: "Manage navigation"
    },
    {
      title: "Preferences",
      description: "Set your store's title, meta description, and social sharing settings.",
      icon: <Globe size={20} className="text-[#008060]" />,
      action: "View preferences"
    }
  ]

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] font-bold text-[#202223]">Online Store</h1>
        <p className="text-[13px] text-[#616161] mt-0.5">Manage your store's content and appearance.</p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contentTypes.map((type, index) => (
          <div 
            key={index} 
            className="group bg-white p-5 rounded-lg border border-[#d2d2d2] shadow-sm hover:border-[#008060] transition-all cursor-pointer flex gap-4"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-[#f6f6f7] rounded-md flex items-center justify-center border border-[#d2d2d2] group-hover:border-[#008060]/30 transition-colors">
              {type.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-[#202223] group-hover:text-[#008060] transition-colors">{type.title}</h3>
                <ChevronRight size={16} className="text-[#616161] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[13px] text-[#616161] mt-1 pr-6">{type.description}</p>
              <button className="mt-3 text-[13px] font-medium text-[#008060] hover:underline">
                {type.action}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Theme Preview Placeholder */}
      <div className="bg-white rounded-lg border border-[#d2d2d2] shadow-sm p-6">
        <h2 className="text-[14px] font-bold text-[#202223] mb-4">Current theme</h2>
        <div className="bg-[#f6f6f7] rounded-lg border border-[#d2d2d2] p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white rounded-full border border-[#d2d2d2] flex items-center justify-center mb-4">
            <Layout size={32} className="text-[#616161]" />
          </div>
          <h3 className="text-[16px] font-bold text-[#202223]">Modern Brutalist</h3>
          <p className="text-[13px] text-[#616161] mt-1 mb-6 max-w-sm">
            This is the theme that customers see when they visit your store.
          </p>
          <div className="flex gap-2">
            <button className="bg-white border border-[#d2d2d2] rounded-md px-4 py-2 text-[13px] font-medium text-[#202223] hover:bg-[#f3f3f3] transition-colors">
              Customize
            </button>
            <button className="bg-white border border-[#d2d2d2] rounded-md px-4 py-2 text-[13px] font-medium text-[#202223] hover:bg-[#f3f3f3] transition-colors">
              Actions
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
