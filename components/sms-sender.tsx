"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MessageSquare, Send } from "lucide-react"
import { sendSMS, sendGuestConfirmationSMS, sendReminderSMS } from "@/lib/services/sms-service"

interface SMSSenderProps {
  partyId?: string
  guestName?: string
  guestPhone?: string
  partyName?: string
  partyDate?: string
}

export function SMSSender({ partyId, guestName, guestPhone, partyName, partyDate }: SMSSenderProps) {
  const [phoneNumber, setPhoneNumber] = useState(guestPhone || "")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSendSMS = async () => {
    if (!phoneNumber || !message) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o número de telefone e a mensagem.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await sendSMS(phoneNumber, message)
      toast({
        title: "SMS enviado!",
        description: "A mensagem foi enviada com sucesso.",
      })
      setMessage("")
      if (!guestPhone) {
        setPhoneNumber("")
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar SMS",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendConfirmation = async () => {
    if (!guestName || !phoneNumber || !partyName) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para enviar confirmação.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await sendGuestConfirmationSMS(guestName, phoneNumber, partyName)
      toast({
        title: "Confirmação enviada!",
        description: "SMS de confirmação enviado com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao enviar confirmação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendReminder = async () => {
    if (!guestName || !phoneNumber || !partyName || !partyDate) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para enviar lembrete.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const formattedDate = new Date(partyDate).toLocaleDateString("pt-BR")
      await sendReminderSMS(guestName, phoneNumber, partyName, formattedDate)
      toast({
        title: "Lembrete enviado!",
        description: "SMS de lembrete enviado com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao enviar lembrete",
        description: error instanceof Error ? error.message : "Erro desconhecido",
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
            placeholder="+5511999999999"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={!!guestPhone}
          />
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
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSendSMS}
            disabled={isLoading || !phoneNumber || !message}
            className="flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar SMS
          </Button>

          {guestName && partyName && (
            <Button variant="outline" onClick={handleSendConfirmation} disabled={isLoading || !phoneNumber}>
              Enviar Confirmação
            </Button>
          )}

          {guestName && partyName && partyDate && (
            <Button variant="outline" onClick={handleSendReminder} disabled={isLoading || !phoneNumber}>
              Enviar Lembrete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
