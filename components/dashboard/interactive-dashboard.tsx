"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, BarChart, PieChart, Calendar, TrendingUp, Users } from "lucide-react"
import {
  generateConfirmationsByDayData,
  generateConfirmationStatusData,
  generateGuestDistributionData,
  generatePartiesByMonthData,
  calculateStatistics,
} from "@/lib/utils/chart-data"
import type { Guest, PartyWithGuestCount } from "@/lib/types"
import dynamic from "next/dynamic"

// Importar componentes de gráfico dinamicamente para evitar erros de SSR
const DynamicBarChart = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  ),
})

const DynamicPieChart = dynamic(() => import("react-chartjs-2").then((mod) => mod.Pie), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  ),
})

const DynamicLineChart = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  ),
})

// Importar Chart.js e registrar componentes necessários
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js"

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
)

interface InteractiveDashboardProps {
  guests: Guest[]
  parties: PartyWithGuestCount[]
  isLoading?: boolean
}

export function InteractiveDashboard({ guests, parties, isLoading = false }: InteractiveDashboardProps) {
  const [selectedParty, setSelectedParty] = useState<string>("all")
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>(guests)
  const [activeTab, setActiveTab] = useState("overview")
  const [statistics, setStatistics] = useState<any>(null)

  // Filtrar convidados quando a festa selecionada mudar
  useEffect(() => {
    if (selectedParty === "all") {
      setFilteredGuests(guests)
    } else {
      setFilteredGuests(guests.filter((guest) => guest.party_id === selectedParty))
    }
  }, [selectedParty, guests])

  // Calcular estatísticas quando os dados mudarem
  useEffect(() => {
    setStatistics(calculateStatistics(filteredGuests, parties))
  }, [filteredGuests, parties])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold text-purple-800">Dashboard Interativo</h2>

        <div className="w-full md:w-64">
          <Label htmlFor="party-filter">Filtrar por Festa</Label>
          <Select value={selectedParty} onValueChange={setSelectedParty}>
            <SelectTrigger id="party-filter">
              <SelectValue placeholder="Selecione uma festa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Festas</SelectItem>
              {parties.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.nome_aniversariante} - {party.theme}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                <Users className="h-4 w-4 mr-2 text-purple-600" />
                Total de Convidados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">{statistics.totalGuests}</div>
              <p className="text-xs text-gray-500 mt-1">
                {statistics.confirmedGuests} confirmados ({statistics.confirmationRate}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                Total de Festas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">{statistics.totalParties}</div>
              <p className="text-xs text-gray-500 mt-1">
                Média de {statistics.averageGuestsPerParty} convidados por festa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                Taxa de Confirmação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">{statistics.confirmationRate}%</div>
              <p className="text-xs text-gray-500 mt-1">{statistics.totalAttendees} pessoas confirmadas no total</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="confirmations">Confirmações</TabsTrigger>
          <TabsTrigger value="guests">Convidados</TabsTrigger>
          <TabsTrigger value="parties">Festas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-purple-600" />
                  Confirmações por Dia
                </CardTitle>
                <CardDescription>Número de confirmações recebidas por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {filteredGuests.length > 0 ? (
                    <DynamicBarChart
                      data={generateConfirmationsByDayData(filteredGuests)}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top" as const,
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">Nenhum dado disponível</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                  Status de Confirmação
                </CardTitle>
                <CardDescription>Distribuição de status de confirmação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {filteredGuests.length > 0 ? (
                    <DynamicPieChart
                      data={generateConfirmationStatusData(filteredGuests)}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom" as const,
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">Nenhum dado disponível</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="confirmations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Confirmações</CardTitle>
              <CardDescription>Evolução das confirmações ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {filteredGuests.length > 0 ? (
                  <DynamicLineChart
                    data={generateConfirmationsByDayData(filteredGuests)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">Nenhum dado disponível</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Convidados</CardTitle>
              <CardDescription>Proporção entre adultos e crianças</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {filteredGuests.length > 0 ? (
                  <DynamicPieChart
                    data={generateGuestDistributionData(filteredGuests)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">Nenhum dado disponível</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Festas por Mês</CardTitle>
              <CardDescription>Distribuição de festas ao longo do ano</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {parties.length > 0 ? (
                  <DynamicBarChart
                    data={generatePartiesByMonthData(parties)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">Nenhum dado disponível</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
