"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, PartyPopper, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPartyHalls } from "@/lib/actions/party-halls"
import { getPartiesByHall } from "@/lib/actions/parties"
import type { PartyHall, Party } from "@/lib/types"

export default function GuestEntryPage() {
  const [partyHalls, setPartyHalls] = useState<PartyHall[]>([])
  const [selectedHallId, setSelectedHallId] = useState<string>("")
  const [birthdayName, setBirthdayName] = useState("")
  const [parties, setParties] = useState<Party[]>([])
  const [matchedParty, setMatchedParty] = useState<Party | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadPartyHalls() {
      try {
        const halls = await getPartyHalls()
        setPartyHalls(halls)
      } catch (error) {
        console.error("Erro ao carregar salões:", error)
        setError("Não foi possível carregar a lista de salões. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadPartyHalls()
  }, [])

  useEffect(() => {
    async function loadParties() {
      if (!selectedHallId) return

      setLoading(true)
      try {
        const partiesData = await getPartiesByHall(selectedHallId)
        setParties(partiesData)
      } catch (error) {
        console.error("Erro ao carregar festas:", error)
        setError("Não foi possível carregar as festas deste salão. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadParties()
  }, [selectedHallId])

  const handleVerify = () => {
    setVerifying(true)
    setError("")
    setMatchedParty(null)

    // Normalizar o nome inserido para comparação
    const normalizedInput = birthdayName.toLowerCase().trim()

    // Procurar por uma correspondência
    const match = parties.find((party) => party.nome_aniversariante.toLowerCase().includes(normalizedInput))

    if (match) {
      setMatchedParty(match)
    } else {
      setError("Nome do aniversariante não encontrado. Verifique se o nome está correto.")
    }

    setVerifying(false)
  }

  const handleProceed = () => {
    if (matchedParty && matchedParty.link_formulario) {
      router.push(`/guest/${matchedParty.link_formulario}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <PartyPopper className="h-10 w-10 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-purple-800">Confirmação de Presença</CardTitle>
          <CardDescription className="text-center">
            Selecione o salão de festas e informe o nome do aniversariante
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="party-hall">Salão de Festas</Label>
                <Select value={selectedHallId} onValueChange={setSelectedHallId}>
                  <SelectTrigger id="party-hall">
                    <SelectValue placeholder="Selecione o salão de festas" />
                  </SelectTrigger>
                  <SelectContent>
                    {partyHalls.map((hall) => (
                      <SelectItem key={hall.id} value={hall.id}>
                        {hall.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedHallId && (
                <div className="space-y-2">
                  <Label htmlFor="birthday-name">Nome do Aniversariante</Label>
                  <Input
                    id="birthday-name"
                    placeholder="Digite o nome do aniversariante"
                    value={birthdayName}
                    onChange={(e) => setBirthdayName(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Digite o nome do aniversariante para acessar o formulário de confirmação
                  </p>
                </div>
              )}

              {matchedParty && (
                <div className="p-4 bg-green-50 rounded-md border border-green-100">
                  <h3 className="font-medium text-green-800 mb-2">Festa Encontrada!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Festa de {matchedParty.theme} do(a) {matchedParty.nome_aniversariante}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Voltar
          </Button>
          {matchedParty ? (
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleProceed}>
              Prosseguir para Confirmação
            </Button>
          ) : (
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleVerify}
              disabled={!selectedHallId || !birthdayName || verifying}
            >
              {verifying ? "Verificando..." : "Verificar"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
