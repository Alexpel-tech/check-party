"use client"

import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { TestDashboard } from "@/components/test-dashboard"

export default function SystemStatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar activeTab="system-status" />

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-purple-800">Status do Sistema</h1>
              <p className="text-gray-600 mt-1">Monitoramento em tempo real de todos os serviços</p>
            </div>
          </div>

          <TestDashboard />
        </main>
      </div>
    </div>
  )
}
