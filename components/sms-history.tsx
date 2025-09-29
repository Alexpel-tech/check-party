"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, Search, Loader2, AlertCircle } from "lucide-react"
import { SMSService } from "@/lib/services/sms-service"

export function SMSHistory() {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMessages, setFilteredMessages] = useState<any[]>([])

  useEffect(() => {
    async function loadMessages() {
      setIsLoading(true)
      try {
        const messagesData = await SMSService.getMessageHistory()
        setMessages(messagesData)
        setFilteredMessages(messagesData)
      } catch (error) {
        console.error("Erro ao carregar histórico de mensagens:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMessages(messages)
    } else {
      const filtered = messages.filter(
        (message) =>
          message.phone_number.includes(searchTerm) ||
          message.message_content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredMessages(filtered)
    }
  }, [searchTerm, messages])

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

  // Formatar número de telefone para exibição
  const formatPhoneNumber = (phoneNumber: string) => {
    // Remover o código do país (+55) se existir
    const cleaned = phoneNumber.replace(/^\+55/, "")

    // Formatar como (XX) XXXXX-XXXX
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`
    }

    // Formatar como (XX) XXXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`
    }

    // Retornar o número original se não conseguir formatar
    return phoneNumber
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Histórico de SMS
        </CardTitle>
        <CardDescription>Visualize o histórico de mensagens SMS enviadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar por número ou conteúdo..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setSearchTerm("")} disabled={!searchTerm}>
              Limpar
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>Nenhuma mensagem encontrada</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">{formatPhoneNumber(message.phone_number)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{message.message_content}</div>
                      </TableCell>
                      <TableCell>
                        {message.status === "sent" ? (
                          <Badge className="bg-green-500">Enviado</Badge>
                        ) : message.status === "delivered" ? (
                          <Badge className="bg-blue-500">Entregue</Badge>
                        ) : message.status === "failed" ? (
                          <Badge variant="destructive">Falhou</Badge>
                        ) : (
                          <Badge variant="outline">{message.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(message.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
