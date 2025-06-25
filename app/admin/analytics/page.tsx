"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { InteractiveDashboard } from "@/components/dashboard/interactive-dashboard"
import { getPartiesWithGuestCount } from "@/lib/actions/parties"
import { getGuests } from "@/lib/actions/guests"
import type { PartyWithGuestCount, Guest } from "@/lib/types"

export default function AnalyticsPage() {
  const [parties, setParties] = useState<PartyWithGuestCount[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const partiesData = await getPartiesWithGuestCount()
        setParties(partiesData)

        const guestsData = await getGuests()
        setGuests(guestsData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setError("Erro ao carregar dados para análise")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader onLogout={() => {}} />

      <div className="flex flex-1">
        <AdminSidebar activeTab="analytics" setActiveTab={() => {}} />

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-purple-800 mb-6">Analytics</h1>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <InteractiveDashboard guests={guests} parties={parties} />
          )}
        </main>
      </div>
    </div>
  )
}
