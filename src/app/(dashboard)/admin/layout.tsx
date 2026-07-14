import { Metadata } from "next"
import Sidebar from "@/components/admin/Sidebar"
import TopBar from "@/components/admin/TopBar"
import AdminAuthProvider from "@/components/admin/AdminAuthProvider"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Admin Dashboard | Toy Hourse",
  description: "E-Commerce Management Dashboard",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <div className="flex min-h-screen bg-gray-50 font-sans">
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
