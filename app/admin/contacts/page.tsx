"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, AlertCircle } from "lucide-react"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ContactImporter } from "@/components/contacts/contact-importer"
import { PartySelector } from "@/components/party-selector"
import { getParties } from "@/lib/actions/parties"
import type { Party } from "@/lib/types"

export default function ContactsPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader onLogout={() => {}} />

      <div className="flex flex-1">
        <AdminSidebar activeTab="contacts" setActiveTab={() => {}} />

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-purple-800 mb-6">Importação de Contatos</h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Selecione uma Festa
                </CardTitle>
                <CardDescription>Escolha uma festa para importar contatos</CardDescription>
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

            {selectedParty && (
              <ContactImporter
                party={selectedParty}
                onImportComplete={() => {
                  // Recarregar dados se necessário
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
