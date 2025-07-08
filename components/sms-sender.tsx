"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Send, MessageSquare, Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SMSService } from "@/lib/adapters/sms-service-adapter"
import { PartySelector } from "@/components/party-selector"
import { InvitationPreview } from "@/components/invitation-preview"
import type { Guest, Party } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface SMSSenderProps {
  initialGuests?: Guest[]
  initialParty?: Party
}

export function SMSSender({ initialGuests, initialParty }: SMSSenderProps) {
  const [selectedTab, setSelectedTab] = useState("individual")
  const [selectedGuest, setSelectedGuest] = useState<string>("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [messageTemplate, setMessageTemplate] = useState("custom")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { toast } = useToast()

  const [party, setParty] = useState<Party | null>(initialParty || null)
  const [guests, setGuests] = useState<Guest[]>(initialGuests || [])
  const [selectedGuestObject, setSelectedGuestObject] = useState<Guest | null>(null)

  // Atualizar mensagem quando o template mudar
  useEffect(() => {
    if (messageTemplate === "confirmation" && party) {
      setMessage(
        `Olá [nome do convidado], sua presença na festa de [nome do aniversariante] foi confirmada! A festa será no dia [data] às [hora] no endereço: [local]. Agradecemos sua confirmação!`,
      )
    } else if (messageTemplate === "reminder" && party) {
      setMessage(
        `Olá [nome do convidado], não esqueça da festa de [nome do aniversariante] amanhã, dia [data] às [hora]. Esperamos você lá!`,
      )
    }
  }, [messageTemplate, party])

  // Atualizar o objeto do convidado selecionado quando o ID mudar
  useEffect(() => {
    if (selectedGuest && guests.length > 0) {
      const guest = guests.find((g) => g.id === selectedGuest)
      setSelectedGuestObject(guest || null)
    } else {
      setSelectedGuestObject(null)
    }
  }, [selectedGuest, guests])

  // Função para lidar com a seleção de festa
  const handlePartySelect = (selectedParty: Party, partyGuests: Guest[]) => {
    setParty(selectedParty)
    setGuests(partyGuests)

    // Resetar seleção de convidado
    setSelectedGuest("")
    setSelectedGuestObject(null)

    // Atualizar mensagem com base no template
    if (messageTemplate === "confirmation") {
      setMessage(
        `Olá [nome do convidado], sua presença na festa de ${selectedParty.nome_aniversariante} foi confirmada! A festa será no dia [data] às ${selectedParty.horario} no endereço: ${selectedParty.local_detalhado}. Agradecemos sua confirmação!`,
      )
    } else if (messageTemplate === "reminder") {
      setMessage(
        `Olá [nome do convidado], não esqueça da festa de ${selectedParty.nome_aniversariante} amanhã, dia [data] às ${selectedParty.horario}. Esperamos você lá!`,
      )
    }
  }

  // Enviar mensagem individual
  const handleSendIndividual = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!party) {
        throw new Error("Selecione uma festa primeiro")
      }

      if (!phoneNumber && !selectedGuest) {
        throw new Error("Selecione um convidado ou informe um número de telefone")
      }

      if (!message.trim()) {
        throw new Error("Digite uma mensagem para enviar")
      }

      let result

      // Se for um convidado selecionado
      if (selectedGuest) {
        const guest = guests?.find((g) => g.id === selectedGuest)

        if (!guest) {
          throw new Error("Convidado não encontrado")
        }

        if (!guest.whatsapp) {
          throw new Error("Este convidado não possui número de telefone cadastrado")
        }

        // Processar a mensagem para substituir placeholders
        const processedMessage = message
          .replace(/\[nome do convidado\]/gi, guest.nome_principal)
          .replace(/\[nome do aniversariante\]/gi, party.nome_aniversariante)
          .replace(/\[data\]/gi, new Date(party.data).toLocaleDateString("pt-BR"))
          .replace(/\[hora\]/gi, party.horario)
          .replace(/\[local\]/gi, party.local_detalhado)
          .replace(/\[tema\]/gi, party.theme)

        result = await SMSService.sendCustomMessage(guest.whatsapp, processedMessage)
      } else {
        // Envio para número personalizado
        result = await SMSService.sendCustomMessage(phoneNumber, message)
      }

      if (!result.success) {
        throw new Error(result.error || "Erro ao enviar SMS")
      }

      setSuccess("SMS enviado com sucesso!")

      // Limpar campos se for número personalizado
      if (!selectedGuest) {
        setPhoneNumber("")
      }
    } catch (error: any) {
      setError(error.message || "Ocorreu um erro ao enviar o SMS")
    } finally {
      setIsLoading(false)
    }
  }

  // Enviar mensagem em massa
  const handleSendBulk = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!party) {
        throw new Error("Selecione uma festa primeiro")
      }

      if (!guests || guests.length === 0) {
        throw new Error("Não há convidados para enviar mensagens")
      }

      if (!message.trim()) {
        throw new Error("Digite uma mensagem para enviar")
      }

      // Filtrar convidados com número de telefone
      const guestsWithPhone = guests.filter((guest) => guest.whatsapp)

      if (guestsWithPhone.length === 0) {
        throw new Error("Nenhum convidado possui número de telefone cadastrado")
      }

      // Confirmar envio em massa
      if (
        !window.confirm(`Você está prestes a enviar SMS para ${guestsWithPhone.length} convidados. Deseja continuar?`)
      ) {
        setIsLoading(false)
        return
      }

      let successCount = 0
      let errorCount = 0

      // Enviar mensagens para cada convidado
      for (const guest of guestsWithPhone) {
        try {
          // Processar a mensagem para substituir placeholders
          const processedMessage = message
            .replace(/\[nome do convidado\]/gi, guest.nome_principal)
            .replace(/\[nome do aniversariante\]/gi, party.nome_aniversariante)
            .replace(/\[data\]/gi, new Date(party.data).toLocaleDateString("pt-BR"))
            .replace(/\[hora\]/gi, party.horario)
            .replace(/\[local\]/gi, party.local_detalhado)
            .replace(/\[tema\]/gi, party.theme)

          const result = await SMSService.sendCustomMessage(guest.whatsapp!, processedMessage)

          if (result.success) {
            successCount++
          } else {
            errorCount++
          }

          // Pequeno delay para evitar limitações de API
          await new Promise((resolve) => setTimeout(resolve, 300))
        } catch (error) {
          errorCount++
        }
      }

      setSuccess(`SMS enviados: ${successCount} com sucesso, ${errorCount} com erro.`)
    } catch (error: any) {
      setError(error.message || "Ocorreu um erro ao enviar os SMS")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneNumber || !message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o número de telefone e a mensagem.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await SMSService.sendCustomMessage(phoneNumber, message)

      if (result.success) {
        toast({
          title: "SMS enviado",
          description: "A mensagem SMS foi enviada com sucesso.",
        })
        setMessage("")
      } else {
        toast({
          title: "Erro ao enviar SMS",
          description: result.error || "Ocorreu um erro ao enviar o SMS.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar SMS",
        description: "Ocorreu um erro ao enviar o SMS.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Enviar SMS
        </CardTitle>
        <CardDescription>Envie mensagens SMS para convidados da festa</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Seletor de festa */}
        <PartySelector onPartySelect={handlePartySelect} className="mb-6" />

        {party && (
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="individual">Mensagem Individual</TabsTrigger>
              <TabsTrigger value="bulk">Mensagem em Massa</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Destinatário</Label>
                <Select value={selectedGuest} onValueChange={setSelectedGuest}>
                  <SelectTrigger id="recipient">
                    <SelectValue placeholder="Selecione um convidado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom_number">Número personalizado</SelectItem>
                    {guests?.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id} disabled={!guest.whatsapp}>
                        {guest.nome_principal} {!guest.whatsapp && "(Sem telefone)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(!selectedGuest || selectedGuest === "custom_number") && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">Formato: DDD + número</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="template">Tipo de Mensagem</Label>
                <Select value={messageTemplate} onValueChange={setMessageTemplate}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Mensagem Personalizada</SelectItem>
                    <SelectItem value="confirmation">Confirmação de Presença</SelectItem>
                    <SelectItem value="reminder">Lembrete de Festa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500">
                  Você pode usar [nome do convidado], [nome do aniversariante], [data], [hora], [local] e [tema] como
                  placeholders.
                </p>
              </div>

              {/* Pré-visualização do convite */}
              <InvitationPreview party={party} guest={selectedGuestObject} message={message} type="sms" />

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
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                <h3 className="font-medium text-yellow-800 mb-2">Envio em Massa</h3>
                <p className="text-sm text-yellow-700">
                  Esta opção enviará SMS para todos os convidados que possuem número de telefone cadastrado (
                  {guests?.filter((g) => g.whatsapp).length || 0} de {guests?.length || 0} convidados).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-template">Tipo de Mensagem</Label>
                <Select value={messageTemplate} onValueChange={setMessageTemplate}>
                  <SelectTrigger id="bulk-template">
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Mensagem Personalizada</SelectItem>
                    <SelectItem value="confirmation">Confirmação de Presença</SelectItem>
                    <SelectItem value="reminder">Lembrete de Festa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-message">Mensagem</Label>
                <Textarea
                  id="bulk-message"
                  placeholder="Digite sua mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500">
                  Você pode usar [nome do convidado], [nome do aniversariante], [data], [hora], [local] e [tema] como
                  placeholders.
                </p>
              </div>

              {/* Exemplo de como a mensagem ficará para um convidado */}
              {guests.length > 0 && <InvitationPreview party={party} guest={guests[0]} message={message} type="sms" />}

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
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={selectedTab === "individual" ? handleSendIndividual : handleSendBulk}
          disabled={isLoading || !party}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </span>
          ) : (
            <span className="flex items-center">
              <Send className="mr-2 h-4 w-4" />
              Enviar SMS
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
