"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MessageCircle, Send } from "lucide-react"
import {
  sendGuestConfirmationWhatsApp,
  sendReminderWhatsApp,
  sendCustomWhatsAppMessage,
} from "@/lib/services/whatsapp-service"

interface WhatsAppSenderProps {
  partyId?: string
  guestName?: string
  guestPhone?: string
  partyName?: string
  partyDate?: string
}

export function WhatsAppSender({ partyId, guestName, guestPhone, partyName, partyDate }: WhatsAppSenderProps) {
  const [phoneNumber, setPhoneNumber] = useState(guestPhone || "")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSendMessage = async () => {
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
      await sendCustomWhatsAppMessage(phoneNumber, message)
      toast({
        title: "Mensagem enviada!",
        description: "A mensagem WhatsApp foi enviada com sucesso.",
      })
      setMessage("")
      if (!guestPhone) {
        setPhoneNumber("")
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
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
      await sendGuestConfirmationWhatsApp(guestName, phoneNumber, partyName)
      toast({
        title: "Confirmação enviada!",
        description: "Mensagem de confirmação enviada via WhatsApp.",
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
      await sendReminderWhatsApp(guestName, phoneNumber, partyName, formattedDate)
      toast({
        title: "Lembrete enviado!",
        description: "Lembrete enviado via WhatsApp com sucesso.",
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
          <MessageCircle className="h-5 w-5 text-green-600" />
          Enviar WhatsApp
        </CardTitle>
        <CardDescription>Envie mensagens via WhatsApp Business API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="whatsapp-phone">Número de Telefone</Label>
          <Input
            id="whatsapp-phone"
            type="tel"
            placeholder="5511999999999"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={!!guestPhone}
          />
          <p className="text-sm text-muted-foreground">Formato: código do país + DDD + número (ex: 5511999999999)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp-message">Mensagem</Label>
          <Textarea
            id="whatsapp-message"
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !phoneNumber || !message}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar WhatsApp
          </Button>

          {guestName && partyName && (
            <Button
              variant="outline"
              onClick={handleSendConfirmation}
              disabled={isLoading || !phoneNumber}
              className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
            >
              Enviar Confirmação
            </Button>
          )}

          {guestName && partyName && partyDate && (
            <Button
              variant="outline"
              onClick={handleSendReminder}
              disabled={isLoading || !phoneNumber}
              className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
            >
              Enviar Lembrete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
