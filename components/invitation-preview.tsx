"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import type { Party, Guest } from "@/lib/types"

interface InvitationPreviewProps {
  party: Party | null
  guest: Guest | null
  message: string
  type: "whatsapp" | "sms" | "email"
}

export function InvitationPreview({ party, guest, message, type }: InvitationPreviewProps) {
  const [isVisible, setIsVisible] = useState(false)

  if (!party || !guest) {
    return null
  }

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Processar a mensagem para substituir placeholders
  const processMessage = (message: string) => {
    return message
      .replace(/\[nome do convidado\]/gi, guest.nome_principal)
      .replace(/\[nome do aniversariante\]/gi, party.nome_aniversariante)
      .replace(/\[data\]/gi, formatDate(party.data))
      .replace(/\[hora\]/gi, party.horario)
      .replace(/\[local\]/gi, party.local_detalhado)
      .replace(/\[tema\]/gi, party.theme)
  }

  const processedMessage = processMessage(message)

  return (
    <Card className="border-dashed border-2 border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex justify-between items-center">
          <span>Pré-visualização do Convite</span>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(!isVisible)} className="h-8 w-8 p-0">
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        {isVisible ? (
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm mb-2">
              <span className="font-semibold">Para:</span> {guest.nome_principal}
              {type === "whatsapp" && <span className="text-xs text-gray-500"> (via WhatsApp: {guest.whatsapp})</span>}
              {type === "sms" && <span className="text-xs text-gray-500"> (via SMS: {guest.whatsapp})</span>}
              {type === "email" && <span className="text-xs text-gray-500"> (via Email: {guest.email})</span>}
            </div>
            <div className="text-sm mb-2">
              <span className="font-semibold">Festa:</span> {party.nome_aniversariante} - {party.theme}
            </div>
            <div className="border-t border-gray-200 pt-2 whitespace-pre-wrap">{processedMessage}</div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-20 text-gray-400">
            Clique no ícone de olho para visualizar o convite
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-xs text-gray-500">Esta é uma prévia de como o convite será enviado para o convidado.</p>
      </CardFooter>
    </Card>
  )
}
