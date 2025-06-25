"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, QrCode, CheckCircle, AlertCircle } from "lucide-react"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { QRCodeGenerator } from "@/components/qr-code/qr-code-generator"
import { QRCodeScanner } from "@/components/qr-code/qr-code-scanner"
import { PartySelector } from "@/components/party-selector"
import { getParties } from "@/lib/actions/parties"
import { getGuestsByParty } from "@/lib/actions/guests"
import type { Party, Guest } from "@/lib/types"

export default function QRCodesPage() {
  const [activeTab, setActiveTab] = useState("generate")
  const [parties, setParties] = useState<Party[]>([])
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  // Carregar convidados quando uma festa for selecionada
  useEffect(() => {
    async function loadGuests() {
      if (!selectedParty) return

      setIsLoading(true)
      try {
        const guestsData = await getGuestsByParty(selectedParty.id)
        setGuests(guestsData)
        setSelectedGuest(null)
      } catch (error) {
        console.error("Erro ao carregar convidados:", error)
        setError("Erro ao carregar convidados")
      } finally {
        setIsLoading(false)
      }
    }

    loadGuests()
  }, [selectedParty])

  // Função para lidar com o sucesso do check-in
  const handleCheckInSuccess = (guestData: any) => {
    setSuccess(`Check-in realizado com sucesso para ${guestData.nome_principal}!`)
    setTimeout(() => {
      setSuccess("")
    }, 5000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader onLogout={() => {}} />

      <div className="flex flex-1">
        <AdminSidebar activeTab="qr-codes" setActiveTab={() => {}} />

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-purple-800 mb-6">Gerenciamento de QR Codes</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="generate">Gerar QR Codes</TabsTrigger>
              <TabsTrigger value="scan">Escanear QR Codes</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <QrCode className="h-5 w-5 mr-2" />
                    Gerar QR Code para Convidado
                  </CardTitle>
                  <CardDescription>Selecione uma festa e um convidado para gerar o QR Code de check-in</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <PartySelector
                        parties={parties}
                        selectedParty={selectedParty}
                        onSelectParty={setSelectedParty}
                        isLoading={isLoading}
                      />

                      {selectedParty && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-2">Selecione um Convidado</h3>
                          {isLoading ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                            </div>
                          ) : guests.length === 0 ? (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>Nenhum convidado encontrado para esta festa</AlertDescription>
                            </Alert>
                          ) : (
                            <div className="border rounded-md divide-y max-h-96 overflow-y-auto">
                              {guests.map((guest) => (
                                <div
                                  key={guest.id}
                                  className={`p-3 cursor-pointer hover:bg-gray-50 ${
                                    selectedGuest?.id === guest.id ? "bg-purple-50 border-l-4 border-purple-500" : ""
                                  }`}
                                  onClick={() => setSelectedGuest(guest)}
                                >
                                  <p className="font-medium">{guest.nome_principal}</p>
                                  <p className="text-xs text-gray-500">
                                    {guest.quantidade_total} {guest.quantidade_total > 1 ? "pessoas" : "pessoa"}
                                    {guest.quantidade_criancas > 0 && ` (${guest.quantidade_criancas} crianças)`}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      {selectedParty && selectedGuest ? (
                        <QRCodeGenerator guest={selectedGuest} party={selectedParty} />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 border border-dashed rounded-md text-gray-500">
                          <QrCode className="h-16 w-16 mb-4 text-gray-300" />
                          <p className="text-center">
                            Selecione uma festa e um convidado para gerar o QR Code de check-in
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scan" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <QrCode className="h-5 w-5 mr-2" />
                    Escanear QR Code
                  </CardTitle>
                  <CardDescription>Escaneie o QR Code do convidado para realizar o check-in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <QRCodeScanner onSuccess={handleCheckInSuccess} />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Instruções</h3>
                      <div className="space-y-2 text-gray-600">
                        <p>1. Aponte a câmera para o QR Code do convidado</p>
                        <p>2. O sistema irá verificar automaticamente o código</p>
                        <p>3. Confirme os dados do convidado e realize o check-in</p>
                        <p>4. O convidado receberá uma confirmação de check-in</p>
                      </div>

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
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
