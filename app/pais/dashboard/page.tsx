"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogOut } from "lucide-react"
import { getParentSession, logoutParent } from "@/lib/actions/party-parents"
import { getPartyById } from "@/lib/actions/parties"
import { getGuestsByParty } from "@/lib/actions/guests"
import type { ParentSession, Party, Guest } from "@/lib/types"
import { GuestList } from "@/components/guest-list"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function ParentDashboard() {
  const [session, setSession] = useState<ParentSession | null>(null)
  const [party, setParty] = useState<Party | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadSession() {
      try {
        const currentSession = await getParentSession()
        if (!currentSession) {
          router.push("/pais/login")
          return
        }
        setSession(currentSession)

        // Carregar dados da festa
        const partyData = await getPartyById(currentSession.party_id)
        if (partyData) {
          setParty(partyData)
        }

        // Carregar convidados
        const guestsData = await getGuestsByParty(currentSession.party_id)
        setGuests(guestsData)
      } catch (error) {
        console.error("Erro ao carregar sessão:", error)
        router.push("/pais/login")
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [router])

  const handleLogout = async () => {
    await logoutParent()
    router.push("/pais/login")
  }

  const handleUpdateGuest = async () => {
    if (session) {
      const guestsData = await getGuestsByParty(session.party_id)
      setGuests(guestsData)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg text-purple-800">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session || !party) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center text-purple-800">Sessão Expirada</CardTitle>
            <CardDescription className="text-center">Sua sessão expirou ou você não está autenticado.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/pais/login")}>Fazer Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-purple-800">Check Party</span>
            <span className="text-sm text-gray-500">Área dos Pais</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Festa de {party.nome_aniversariante}</CardTitle>
            <CardDescription>
              {party.theme} - {formatDate(party.data)} às {party.horario}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">Local:</span> {party.local_detalhado}
              </p>
              <p className="mt-2">
                <span className="font-medium">Total de convidados:</span> {guests.length}
              </p>
              <p>
                <span className="font-medium">Confirmados:</span>{" "}
                {guests.filter((guest) => guest.status_confirmacao_final).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-purple-800 mb-4">Lista de Convidados</h2>
        <Card>
          <CardContent className="pt-6">
            <GuestList guests={guests} showActions={true} onUpdate={handleUpdateGuest} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
