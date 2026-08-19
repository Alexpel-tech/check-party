"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Calendar, Users, MapPin } from "lucide-react"
import { getParties } from "@/lib/actions/parties"
import { getGuestsByParty } from "@/lib/actions/guests"
import type { Party, Guest } from "@/lib/types"

interface PartySelectorProps {
  onPartySelect: (party: Party, guests: Guest[]) => void
  className?: string
}

export function PartySelector({ onPartySelect, className }: PartySelectorProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [parties, setParties] = useState<Party[]>([])
  const [selectedPartyId, setSelectedPartyId] = useState<string>("")
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [error, setError] = useState<string | null>(null)

  // Carregar festas disponíveis
  useEffect(() => {
    async function loadParties() {
      setIsLoading(true)
      setError(null)
      try {
        const partiesData = await getParties()
        setParties(partiesData)

        if (partiesData.length > 0) {
          setSelectedPartyId(partiesData[0].id)
        } else {
          setError("Nenhuma festa encontrada. Crie uma festa primeiro.")
        }
      } catch (error) {
        console.error("Erro ao carregar festas:", error)
        setError("Erro ao carregar festas. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    loadParties()
  }, [])

  // Carregar convidados quando a festa for selecionada
  useEffect(() => {
    async function loadGuests() {
      if (!selectedPartyId) return

      setIsLoading(true)
      setError(null)
      try {
        const guestsData = await getGuestsByParty(selectedPartyId)
        setGuests(guestsData)

        const party = parties.find((p) => p.id === selectedPartyId) || null
        setSelectedParty(party)

        if (party) {
          onPartySelect(party, guestsData)
        }
      } catch (error) {
        console.error("Erro ao carregar convidados:", error)
        setError("Erro ao carregar convidados. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    loadGuests()
  }, [selectedPartyId, parties, onPartySelect])

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="party">Selecione a Festa</Label>
          <Select
            value={selectedPartyId}
            onValueChange={setSelectedPartyId}
            disabled={isLoading || parties.length === 0}
          >
            <SelectTrigger id="party" className="w-full">
              <SelectValue placeholder="Selecione uma festa" />
            </SelectTrigger>
            <SelectContent>
              {parties.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.nome_aniversariante} - {party.theme} ({formatDate(party.data)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedParty && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-green-800 flex items-center">Festa Selecionada</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <div className="bg-white p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Data e Hora</p>
                      <p className="text-sm">
                        {formatDate(selectedParty.data)} às {selectedParty.horario}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="bg-white p-2 rounded-full">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Convidados</p>
                      <p className="text-sm">
                        {guests.length} total ({guests.filter((g) => g.whatsapp).length} com contato)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 md:col-span-2">
                    <div className="bg-white p-2 rounded-full">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Local</p>
                      <p className="text-sm">{selectedParty.local_detalhado}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
