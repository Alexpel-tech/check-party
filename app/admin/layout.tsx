import type React from "react"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AuthProvider } from "@/lib/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificationProvider } from "@/lib/contexts/notification-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminHeader />

            <div className="flex flex-1">
              <AdminSidebar />

              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
