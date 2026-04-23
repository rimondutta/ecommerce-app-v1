import { Metadata } from "next"
import Sidebar from "@/components/admin/Sidebar"
import TopBar from "@/components/admin/TopBar"
import AdminAuthProvider from "@/components/admin/AdminAuthProvider"

export const metadata: Metadata = {
  title: "Admin Dashboard | FlexWear",
  description: "E-Commerce Management Dashboard",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <div className="flex min-h-screen bg-[#f1f1f1] font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthProvider>
  )
}
