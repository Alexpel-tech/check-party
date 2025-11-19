"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSMSHistoryAdapter } from "@/lib/adapters/sms-service-adapter"

interface SMSHistoryProps {
  partyId?: string
}

interface SMSRecord {
  id: string
  phone_number: string
  message: string
  status: string
  sent_at: string
  error_message?: string
}

export function SMSHistory({ partyId }: SMSHistoryProps) {
  const [history, setHistory] = useState<SMSRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [partyId])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const result = await getSMSHistoryAdapter(partyId)
      if (result.success && result.data) {
        setHistory(result.data)
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Carregando histórico...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de SMS</CardTitle>
        <CardDescription>Mensagens SMS enviadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma mensagem enviada ainda</p>
          ) : (
            history.map((record) => (
              <div key={record.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{record.phone_number}</p>
                    <p className="text-sm text-muted-foreground">{record.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(record.sent_at).toLocaleString("pt-BR")}</p>
                    {record.error_message && <p className="text-xs text-red-500">{record.error_message}</p>}
                  </div>
                  <Badge variant={record.status === "sent" ? "default" : "destructive"}>
                    {record.status === "sent" ? "Enviado" : "Falhou"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
