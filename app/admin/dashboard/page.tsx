"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getParties } from "@/lib/actions/parties"
import { getGuestsByParty } from "@/lib/actions/guests"
import { getPartyHalls } from "@/lib/actions/party-halls"
import { PartyList } from "@/components/party-list"
import { GuestList } from "@/components/guest-list"
import { Loader2, Plus, Users, Calendar, Building, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Party, Guest, PartyHall } from "@/lib/types"

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [parties, setParties] = useState<Party[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [partyHalls, setPartyHalls] = useState<PartyHall[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // Carregar festas
        const partiesData = await getParties()
        setParties(partiesData)

        // Carregar convidados da primeira festa (se houver)
        if (partiesData.length > 0) {
          const guestsData = await getGuestsByParty(partiesData[0].id)
          setGuests(guestsData)
        }

        // Carregar salões de festa
        const partyHallsData = await getPartyHalls()
        setPartyHalls(partyHallsData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Calcular estatísticas
  const totalGuests = guests.length
  const confirmedGuests = guests.filter((guest) => guest.status_confirmacao_final).length
  const pendingGuests = guests.filter((guest) => !guest.status_confirmacao_final).length
  const totalPeople = guests.reduce((acc, guest) => acc + guest.quantidade_total, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-xl font-bold text-purple-800">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/parties/new">
              <Plus className="h-4 w-4 mr-1" />
              Nova Festa
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/party-halls/new">
              <Plus className="h-4 w-4 mr-1" />
              Novo Salão
            </Link>
          </Button>
        </div>
      </div>

      <main className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total de Festas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{parties.length}</div>
                    <Calendar className="h-5 w-5 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total de Convidados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{totalGuests}</div>
                    <Users className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {confirmedGuests} confirmados · {pendingGuests} pendentes · {totalPeople} pessoas no total
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Salões de Festa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{partyHalls.length}</div>
                    <Building className="h-5 w-5 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="parties">Festas</TabsTrigger>
                <TabsTrigger value="guests">Convidados</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Próximas Festas</CardTitle>
                    <CardDescription>Festas que acontecerão nos próximos dias</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {parties.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <p>Nenhuma festa cadastrada</p>
                        <Button asChild variant="link" className="mt-2">
                          <Link href="/admin/parties/new">
                            <Plus className="h-4 w-4 mr-1" />
                            Criar Nova Festa
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {parties.slice(0, 3).map((party) => (
                          <div key={party.id} className="flex items-center justify-between border-b pb-3">
                            <div>
                              <h3 className="font-medium">{party.nome_aniversariante}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(party.data).toLocaleDateString("pt-BR")} às {party.horario}
                              </p>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/admin/parties/${party.id}`}>
                                <span>Detalhes</span>
                                <ArrowRight className="ml-1 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        ))}
                        <div className="text-center pt-2">
                          <Button asChild variant="link">
                            <Link href="/admin/parties">Ver todas as festas</Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Confirmações Recentes</CardTitle>
                    <CardDescription>Últimos convidados que confirmaram presença</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {guests.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <p>Nenhum convidado confirmado</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {guests
                          .filter((guest) => guest.status_confirmacao_final)
                          .slice(0, 3)
                          .map((guest) => (
                            <div key={guest.id} className="flex items-center justify-between border-b pb-3">
                              <div>
                                <h3 className="font-medium">{guest.nome_principal}</h3>
                                <p className="text-sm text-gray-500">
                                  {guest.quantidade_total} pessoas · Confirmado em{" "}
                                  {new Date(guest.data_envio_formulario).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>
                          ))}
                        <div className="text-center pt-2">
                          <Button asChild variant="link">
                            <Link href="/admin/guests">Ver todos os convidados</Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="parties">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Todas as Festas</CardTitle>
                      <CardDescription>Lista de todas as festas cadastradas</CardDescription>
                    </div>
                    <Button asChild size="sm">
                      <Link href="/admin/parties/new">
                        <Plus className="h-4 w-4 mr-1" />
                        Nova Festa
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <PartyList parties={parties} showActions />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="guests">
                <Card>
                  <CardHeader>
                    <CardTitle>Todos os Convidados</CardTitle>
                    <CardDescription>Lista de todos os convidados cadastrados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GuestList guests={guests} showActions />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}
