"use client"

import { Fragment } from "react"
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react"
import { X, Home, ShoppingCart, Tag, Users, Ticket, UserPlus, Image as ImageIcon, Settings, LogOut, Store } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

interface AdminMobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminMobileSidebar({ isOpen, onClose }: AdminMobileSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const links = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Products", href: "/admin/products", icon: Tag },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Discounts", href: "/admin/coupons", icon: Ticket },
    { name: "Admins", href: "/admin/invite", icon: UserPlus },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[999]">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="transform transition ease-in-out duration-300"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <DialogPanel className="fixed inset-y-0 left-0 w-[280px] bg-black text-white flex flex-col shadow-2xl border-r-4 border-white/10">
            {/* Header */}
            <div className="p-6 border-b-4 border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-white bg-white text-black flex items-center justify-center font-black text-lg">
                  F
                </div>
                <span className="text-sm font-black uppercase tracking-tighter leading-none">FlexWear Admin</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-none transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">Main Navigation</p>
              {links.map((link) => {
                const active = isActive(link.href)
                const Icon = link.icon
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-4 py-3 border-2 transition-all ${
                      active 
                        ? "bg-white text-black border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] translate-x-1" 
                        : "text-gray-400 border-transparent hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{link.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User */}
            <div className="p-4 border-t-4 border-white/10 bg-white/5">
              <button
                onClick={() => {
                   onClose();
                   signOut();
                }}
                className="flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-400/10 transition-all w-full text-left"
              >
                <LogOut size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Logout Session</span>
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  )
}
