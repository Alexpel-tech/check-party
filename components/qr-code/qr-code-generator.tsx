"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Download, Share2, RefreshCw } from "lucide-react"
import { generateQRToken } from "@/lib/utils/qr-code"
import type { Guest, Party } from "@/lib/types"
import dynamic from "next/dynamic"

// Importar QRCode dinamicamente para evitar erros de SSR
const QRCode = dynamic(() => import("react-qr-code"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-64 flex items-center justify-center bg-gray-100 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  ),
})

interface QRCodeGeneratorProps {
  guest: Guest
  party: Party
}

export function QRCodeGenerator({ guest, party }: QRCodeGeneratorProps) {
  const [qrValue, setQrValue] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(true)
  const [baseUrl, setBaseUrl] = useState<string>("")

  useEffect(() => {
    // Definir a URL base
    setBaseUrl(window.location.origin)

    // Gerar o token para o QR Code
    async function generate() {
      const token = await generateQRToken(guest.id, party.id)
      const checkInUrl = `${window.location.origin}/check-in/${token}`
      setQrValue(checkInUrl)
      setIsGenerating(false)
    }
    generate()
  }, [guest.id, party.id])

  // Função para baixar o QR Code como imagem
  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `convite-${guest.nome_principal.replace(/\s+/g, "-").toLowerCase()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  // Função para compartilhar o QR Code
  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Convite para ${party.nome_aniversariante}`,
          text: `Olá ${guest.nome_principal}, aqui está seu QR Code para check-in na festa de ${party.nome_aniversariante}!`,
          url: qrValue,
        })
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
      }
    } else {
      // Fallback para copiar para a área de transferência
      navigator.clipboard.writeText(qrValue)
      alert("Link copiado para a área de transferência!")
    }
  }

  // Função para regenerar o QR Code
  const regenerateQRCode = async () => {
    setIsGenerating(true)
    const token = await generateQRToken(guest.id, party.id)
    const checkInUrl = `${baseUrl}/check-in/${token}`
    setQrValue(checkInUrl)
    setIsGenerating(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>QR Code de Check-in</CardTitle>
        <CardDescription>Use este QR Code para fazer check-in na festa de {party.nome_aniversariante}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {isGenerating ? (
          <div className="h-64 w-64 flex items-center justify-center bg-gray-100 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="p-4 bg-white rounded-lg">
            <QRCode id="qr-code-canvas" value={qrValue} size={256} level="H" fgColor="#7C3AED" />
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="font-medium">{guest.nome_principal}</p>
          <p className="text-sm text-gray-500">
            {guest.quantidade_total} {guest.quantidade_total > 1 ? "pessoas" : "pessoa"}
            {guest.quantidade_criancas > 0 && ` (${guest.quantidade_criancas} crianças)`}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={regenerateQRCode}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerar
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={downloadQRCode}>
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </Button>
          <Button onClick={shareQRCode}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
