"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageSquare, RefreshCw } from 'lucide-react'
import { WhatsAppService } from "@/lib/adapters/whatsapp-service-adapter"

export function WhatsAppHistory() {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const history = await WhatsAppService.getMessageHistory()
      setMessages(history)
    } catch (error) {
      console.error("Erro ao carregar histórico de mensagens:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  // Formatar número de telefone para exibição
  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return "-"

    // Se começar com 55 (Brasil), remover
    let formatted = phoneNumber
    if (formatted.startsWith("55")) {
      formatted = formatted.substring(2)
    }

    // Formatar como (XX) XXXXX-XXXX
    if (formatted.length === 11) {
      return `(${formatted.substring(0, 2)}) ${formatted.substring(2, 7)}-${formatted.substring(7)}`
    }

    return phoneNumber
  }

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Formatar conteúdo da mensagem para exibição
  const formatMessageContent = (content: string) => {
    try {
      // Verificar se é um JSON (template)
      const parsed = JSON.parse(content)
      if (parsed.name) {
        return `Template: ${parsed.name}`
      }
      return content
    } catch {
      // Se não for JSON, retornar o conteúdo como está
      return content.length > 50 ? `${content.substring(0, 50)}...` : content
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Histórico de Mensagens
            </CardTitle>
            <CardDescription>Histórico de mensagens WhatsApp enviadas</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadMessages} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhuma mensagem enviada ainda
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(message.created_at)}</TableCell>
                      <TableCell>{formatPhoneNumber(message.phone_number)}</TableCell>
                      <TableCell>
                        {message.message_type === "template" ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                            Template
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                            Texto
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {formatMessageContent(message.message_content)}
                      </TableCell>
                      <TableCell>
                        {message.status === "sent" ? (
                          <Badge className="bg-green-500">Enviada</Badge>
                        ) : message.status === "delivered" ? (
                          <Badge className="bg-blue-500">Entregue</Badge>
                        ) : message.status === "read" ? (
                          <Badge className="bg-purple-500">Lida</Badge>
                        ) : (
                          <Badge variant="destructive">Erro</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
