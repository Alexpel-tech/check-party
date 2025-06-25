import type React from "react"
import { AdminHeader } from "@/components/admin-header"
import { NewAdminSidebar } from "@/components/new-admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <NewAdminSidebar />
      <SidebarInset className="flex flex-col">
        <AdminHeader />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
