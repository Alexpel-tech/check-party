"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { sendSMSAdapter } from "@/lib/adapters/sms-service-adapter"
import { useToast } from "@/hooks/use-toast"

interface SMSSenderProps {
  partyId?: string
  guestId?: string
}

export function SMSSender({ partyId, guestId }: SMSSenderProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    if (!phoneNumber || !message) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await sendSMSAdapter({
        to: phoneNumber,
        message,
        partyId,
        guestId,
      })

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "SMS enviado com sucesso!",
        })
        setPhoneNumber("")
        setMessage("")
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao enviar SMS",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar SMS",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar SMS</CardTitle>
        <CardDescription>Envie mensagens SMS para seus convidados</CardDescription>
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
        <Button onClick={handleSend} disabled={loading} className="w-full">
          {loading ? "Enviando..." : "Enviar SMS"}
        </Button>
      </CardContent>
    </Card>
  )
}
