"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ReminderConfigComponent } from "@/components/reminders/reminder-config"
import { PartySelector } from "@/components/party-selector"
import { getParties } from "@/lib/actions/parties"
import { ReminderService } from "@/lib/services/reminder-service"
import type { Party } from "@/lib/types"

export default function RemindersPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [processingReminders, setProcessingReminders] = useState(false)

  // Carregar festas
  useEffect(() => {
    async function loadParties() {
      try {
        const partiesData = await getParties()
        setParties(partiesData)
        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao carregar festas:", error)
        setError("Erro ao carregar festas")
        setIsLoading(false)
      }
    }

    loadParties()
  }, [])

  // Função para processar lembretes programados
  const handleProcessReminders = async () => {
    setProcessingReminders(true)
    setError("")
    setSuccess("")

    try {
      const result = await ReminderService.processScheduledReminders()

      if (result.success) {
        setSuccess(`Lembretes processados com sucesso! ${result.sent} lembretes enviados, ${result.failed} falhas.`)
      } else {
        setError(result.error || "Erro ao processar lembretes")
      }
    } catch (error) {
      console.error("Erro ao processar lembretes:", error)
      setError("Erro ao processar lembretes programados")
    } finally {
      setProcessingReminders(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader onLogout={() => {}} />

      <div className="flex flex-1">
        <AdminSidebar activeTab="reminders" setActiveTab={() => {}} />

        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-purple-800">Lembretes Automáticos</h1>
            <Button
              onClick={handleProcessReminders}
              disabled={processingReminders}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {processingReminders ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              Processar Lembretes Agora
            </Button>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Selecione uma Festa</CardTitle>
                <CardDescription>Escolha uma festa para configurar os lembretes automáticos</CardDescription>
              </CardHeader>
              <CardContent>
                <PartySelector
                  parties={parties}
                  selectedParty={selectedParty}
                  onSelectParty={setSelectedParty}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {selectedParty && <ReminderConfigComponent party={selectedParty} />}
          </div>
        </main>
      </div>
    </div>
  )
}
