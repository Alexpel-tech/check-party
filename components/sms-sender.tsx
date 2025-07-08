"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { sendSMSAdapter } from "@/lib/adapters/sms-service-adapter"
import { Loader2, MessageSquare } from "lucide-react"

interface SMSSenderProps {
  partyId?: string
  guestId?: string
  onSent?: () => void
}

export function SMSSender({ partyId, guestId, onSent }: SMSSenderProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("custom")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const messageTemplates = {
    confirmation: "Olá! Por favor, confirme sua presença na festa. Aguardamos sua resposta!",
    reminder: "Lembramos que você foi convidado(a) para nossa festa. Não esqueça de confirmar sua presença!",
    thankYou: "Obrigado por confirmar sua presença! Aguardamos você na festa!",
    custom: "",
  }

  const handleMessageTypeChange = (type: string) => {
    setMessageType(type)
    if (type !== "custom") {
      setMessage(messageTemplates[type as keyof typeof messageTemplates])
    } else {
      setMessage("")
    }
  }

  const handleSend = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o número de telefone e a mensagem.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await sendSMSAdapter({
        to: phoneNumber,
        message,
        partyId,
        guestId,
      })

      if (result.success) {
        toast({
          title: "SMS Enviado",
          description: "A mensagem foi enviada com sucesso!",
        })

        // Limpar formulário
        setPhoneNumber("")
        setMessage("")
        setMessageType("custom")

        // Callback opcional
        onSent?.()
      } else {
        throw new Error(result.error || "Erro ao enviar SMS")
      }
    } catch (error) {
      console.error("Erro ao enviar SMS:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar SMS",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Enviar SMS
        </CardTitle>
        <CardDescription>Envie mensagens SMS para convidados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Número de Telefone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+55 11 99999-9999"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="messageType">Tipo de Mensagem</Label>
          <Select value={messageType} onValueChange={handleMessageTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de mensagem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmation">Confirmação</SelectItem>
              <SelectItem value="reminder">Lembrete</SelectItem>
              <SelectItem value="thankYou">Agradecimento</SelectItem>
              <SelectItem value="custom">Personalizada</SelectItem>
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
          />
          <p className="text-sm text-muted-foreground">{message.length}/160 caracteres</p>
        </div>

        <Button onClick={handleSend} disabled={isLoading || !phoneNumber.trim() || !message.trim()} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar SMS"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
