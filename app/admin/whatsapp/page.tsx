"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { WhatsAppSender } from "@/components/whatsapp-sender"
import { WhatsAppHistory } from "@/components/whatsapp-history"
import { ArrowLeft, MessageSquare, Settings, Loader2 } from "lucide-react"
import Link from "next/link"
import { getParties } from "@/lib/actions/parties"
import { getGuestsByParty } from "@/lib/actions/guests"
import type { Party, Guest } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function WhatsAppPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("send")
  const [isLoading, setIsLoading] = useState(true)
  const [parties, setParties] = useState<Party[]>([])
  const [selectedPartyId, setSelectedPartyId] = useState<string>("")
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])

  useEffect(() => {
    async function loadParties() {
      try {
        const partiesData = await getParties()
        setParties(partiesData)

        if (partiesData.length > 0) {
          setSelectedPartyId(partiesData[0].id)
        }
      } catch (error) {
        console.error("Erro ao carregar festas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadParties()
  }, [])

  useEffect(() => {
    async function loadGuests() {
      if (!selectedPartyId) return

      setIsLoading(true)
      try {
        const guestsData = await getGuestsByParty(selectedPartyId)
        setGuests(guestsData)

        const party = parties.find((p) => p.id === selectedPartyId) || null
        setSelectedParty(party)
      } catch (error) {
        console.error("Erro ao carregar convidados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadGuests()
  }, [selectedPartyId, parties])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar activeTab="whatsapp" />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <Link href="/admin/dashboard" className="inline-flex items-center text-purple-600 hover:text-purple-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Dashboard
            </Link>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-purple-800">Notificações WhatsApp</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="send">
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar Mensagens
              </TabsTrigger>
              <TabsTrigger value="history">
                <MessageSquare className="h-4 w-4 mr-2" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Selecionar Festa</CardTitle>
                  <CardDescription>Selecione a festa para enviar mensagens aos convidados</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="party">Festa</Label>
                        <Select value={selectedPartyId} onValueChange={setSelectedPartyId}>
                          <SelectTrigger id="party">
                            <SelectValue placeholder="Selecione uma festa" />
                          </SelectTrigger>
                          <SelectContent>
                            {parties.map((party) => (
                              <SelectItem key={party.id} value={party.id}>
                                {party.nome_aniversariante} - {party.theme} (
                                {new Date(party.data).toLocaleDateString("pt-BR")})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedParty && (
                        <div className="p-4 bg-purple-50 rounded-md border border-purple-100">
                          <h3 className="font-medium text-purple-800 mb-2">Detalhes da Festa</h3>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Aniversariante:</span> {selectedParty.nome_aniversariante}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Tema:</span> {selectedParty.theme}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Data:</span>{" "}
                            {new Date(selectedParty.data).toLocaleDateString("pt-BR")} às {selectedParty.horario}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Convidados:</span> {guests.length} (
                            {guests.filter((g) => g.whatsapp).length} com WhatsApp)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedParty && <WhatsAppSender guests={guests} party={selectedParty} />}
            </TabsContent>

            <TabsContent value="history">
              <WhatsAppHistory />
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do WhatsApp</CardTitle>
                  <CardDescription>Configure as credenciais da API do WhatsApp Business</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone-id">Phone Number ID</Label>
                      <Input id="phone-id" placeholder="ID do número de telefone do WhatsApp Business" />
                      <p className="text-xs text-gray-500">Encontre este ID no painel do WhatsApp Business API</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="access-token">Access Token</Label>
                      <Input id="access-token" type="password" placeholder="Token de acesso à API" />
                      <p className="text-xs text-gray-500">
                        Token de acesso permanente para a API do WhatsApp Business
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-md border border-yellow-100">
                      <h3 className="font-medium text-yellow-800 mb-2">Importante</h3>
                      <p className="text-sm text-yellow-700">
                        Para usar a API do WhatsApp Business, você precisa ter uma conta aprovada no WhatsApp Business
                        Platform. Saiba mais na{" "}
                        <a
                          href="https://developers.facebook.com/docs/whatsapp/business-platform"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          documentação oficial
                        </a>
                        .
                      </p>
                    </div>

                    <Button className="w-full bg-purple-600 hover:bg-purple-700">Salvar Configurações</Button>
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
