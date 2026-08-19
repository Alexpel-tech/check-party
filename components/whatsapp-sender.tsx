"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { sendWhatsAppMessageAdapter } from "@/lib/adapters/whatsapp-service-adapter"
import { Loader2, MessageCircle } from "lucide-react"

interface WhatsAppSenderProps {
  partyId?: string
  guestId?: string
  onSent?: () => void
}

export function WhatsAppSender({ partyId, guestId, onSent }: WhatsAppSenderProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("custom")
  const [useTemplate, setUseTemplate] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const messageTemplates = {
    confirmation: "Olá! 👋\n\nPor favor, confirme sua presença na festa. Aguardamos sua resposta!\n\nObrigado! 🎉",
    reminder:
      "Lembramos que você foi convidado(a) para nossa festa! 🎊\n\nNão esqueça de confirmar sua presença.\n\nAguardamos você! ✨",
    thankYou: "Obrigado por confirmar sua presença! ✅\n\nAguardamos você na festa! 🎉🥳",
    welcome: "Bem-vindo(a)! 🎉\n\nObrigado por se juntar à nossa festa. Será incrível ter você conosco! ✨",
    custom: "",
  }

  const availableTemplates = [
    { value: "confirmation_reminder", label: "Lembrete de Confirmação" },
    { value: "party_details", label: "Detalhes da Festa" },
    { value: "thank_you", label: "Agradecimento" },
  ]

  const handleMessageTypeChange = (type: string) => {
    setMessageType(type)
    if (type !== "custom") {
      setMessage(messageTemplates[type as keyof typeof messageTemplates])
    } else {
      setMessage("")
    }
  }

  const handleSend = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o número de telefone.",
        variant: "destructive",
      })
      return
    }

    if (!useTemplate && !message.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha a mensagem.",
        variant: "destructive",
      })
      return
    }

    if (useTemplate && !templateName) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um template.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await sendWhatsAppMessageAdapter({
        to: phoneNumber,
        message: useTemplate ? "" : message,
        partyId,
        guestId,
        type: useTemplate ? "template" : "text",
        templateName: useTemplate ? templateName : undefined,
      })

      if (result.success) {
        toast({
          title: "WhatsApp Enviado",
          description: "A mensagem foi enviada com sucesso!",
        })

        // Limpar formulário
        setPhoneNumber("")
        setMessage("")
        setMessageType("custom")
        setUseTemplate(false)
        setTemplateName("")

        // Callback opcional
        onSent?.()
      } else {
        throw new Error(result.error || "Erro ao enviar mensagem WhatsApp")
      }
    } catch (error) {
      console.error("Erro ao enviar WhatsApp:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar mensagem WhatsApp",
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
          <MessageCircle className="h-5 w-5" />
          Enviar WhatsApp
        </CardTitle>
        <CardDescription>Envie mensagens WhatsApp para convidados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Número de WhatsApp</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+55 11 99999-9999"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="useTemplate" checked={useTemplate} onCheckedChange={setUseTemplate} />
          <Label htmlFor="useTemplate">Usar Template Aprovado</Label>
        </div>

        {useTemplate ? (
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select value={templateName} onValueChange={setTemplateName}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <>
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
                  <SelectItem value="welcome">Boas-vindas</SelectItem>
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
                rows={5}
              />
              <p className="text-sm text-muted-foreground">{message.length} caracteres</p>
            </div>
          </>
        )}

        <Button
          onClick={handleSend}
          disabled={
            isLoading || !phoneNumber.trim() || (!useTemplate && !message.trim()) || (useTemplate && !templateName)
          }
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar WhatsApp"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
