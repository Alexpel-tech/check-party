import type React from "react"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function TestCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar activeTab="test-center" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
