"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { validateQRToken, registerCheckIn } from "@/lib/utils/qr-code"
import type { Guest } from "@/lib/types"

export default function CheckInPage() {
  const params = useParams()
  const token = params.token as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guest, setGuest] = useState<Guest | null>(null)
  const [checkInStatus, setCheckInStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    async function validateToken() {
      try {
        const result = await validateQRToken(token)

        if (!result.valid || !result.guest) {
          setError(result.error || "QR Code inválido")
          setIsLoading(false)
          return
        }

        setGuest(result.guest)
        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao validar token:", error)
        setError("Erro ao processar QR Code")
        setIsLoading(false)
      }
    }

    validateToken()
  }, [token])

  const handleCheckIn = async () => {
    if (!guest) return

    setIsLoading(true)

    try {
      const result = await registerCheckIn(guest.id)

      if (result.success) {
        setCheckInStatus({
          success: true,
          message: "Check-in realizado com sucesso!",
        })
      } else {
        setCheckInStatus({
          success: false,
          message: result.error || "Erro ao realizar check-in",
        })
      }
    } catch (error) {
      console.error("Erro ao realizar check-in:", error)
      setCheckInStatus({
        success: false,
        message: "Erro ao processar check-in",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
          <p className="text-gray-600">Verificando QR Code...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              QR Code Inválido
            </CardTitle>
            <CardDescription>Não foi possível validar este QR Code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Link href="/admin/dashboard">
                <Button variant="outline" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check-in de Convidado</CardTitle>
          <CardDescription>Confirme os dados do convidado e realize o check-in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {guest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md border">
                <h3 className="font-medium text-lg">{guest.nome_principal}</h3>
                <p className="text-gray-600">
                  {guest.quantidade_total} {guest.quantidade_total > 1 ? "pessoas" : "pessoa"}
                  {guest.quantidade_criancas > 0 && ` (${guest.quantidade_criancas} crianças)`}
                </p>
                {guest.email && <p className="text-sm text-gray-500">{guest.email}</p>}
                {guest.whatsapp && <p className="text-sm text-gray-500">WhatsApp: {guest.whatsapp}</p>}
              </div>

              {checkInStatus ? (
                <Alert
                  variant={checkInStatus.success ? "default" : "destructive"}
                  className={checkInStatus.success ? "bg-green-50 border-green-200" : ""}
                >
                  {checkInStatus.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{checkInStatus.success ? "Sucesso" : "Erro"}</AlertTitle>
                  <AlertDescription>{checkInStatus.message}</AlertDescription>
                </Alert>
              ) : (
                <Button className="w-full" onClick={handleCheckIn} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Realizar Check-in
                </Button>
              )}

              <div className="flex justify-center">
                <Link href="/admin/dashboard">
                  <Button variant="outline" className="flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
