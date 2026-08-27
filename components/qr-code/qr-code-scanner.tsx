"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Camera, AlertCircle, CheckCircle, X } from "lucide-react"
import { validateQRToken, registerCheckIn } from "@/lib/utils/qr-code"
import dynamic from "next/dynamic"

// Importar QR Scanner dinamicamente para evitar erros de SSR
const QrScanner = dynamic(() => import("react-qr-scanner"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  ),
})

interface QRCodeScannerProps {
  onSuccess?: (guestData: any) => void
}

export function QRCodeScanner({ onSuccess }: QRCodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [result, setResult] = useState<{
    success: boolean
    message: string
    guestData?: any
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Função para processar o QR Code escaneado
  const handleScan = async (data: string | null) => {
    if (data && !loading) {
      setScanning(false)
      await processQRCode(data)
    }
  }

  // Função para processar erros de câmera
  const handleError = (err: any) => {
    console.error("Erro na câmera:", err)
    setCameraError("Não foi possível acessar a câmera. Verifique as permissões.")
    setScanning(false)
  }

  // Função para processar o QR Code (escaneado ou inserido manualmente)
  const processQRCode = async (data: string) => {
    setLoading(true)
    setResult(null)

    try {
      // Extrair o token do URL se for um link completo
      let token = data
      if (data.includes("/check-in/")) {
        token = data.split("/check-in/")[1]
      }

      // Validar o token
      const validation = await validateQRToken(token)

      if (!validation.success || !validation.data?.guest) {
        setResult({
          success: false,
          message: validation.error || "QR Code inválido",
        })
        return
      }

      const validatedGuest = validation.data.guest

      // Registrar o check-in
      const checkIn = await registerCheckIn(token)

      if (!checkIn.success) {
        setResult({
          success: false,
          message: checkIn.error || "Erro ao registrar check-in",
          guestData: validatedGuest,
        })
        return
      }

      // Check-in bem-sucedido
      setResult({
        success: true,
        message: "Check-in realizado com sucesso!",
        guestData: validatedGuest,
      })

      // Chamar callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess(validatedGuest)
      }
    } catch (error) {
      console.error("Erro ao processar QR Code:", error)
      setResult({
        success: false,
        message: "Erro ao processar QR Code",
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para processar entrada manual
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim() && !loading) {
      await processQRCode(manualInput)
      setManualInput("")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Scanner de Check-in</CardTitle>
        <CardDescription>Escaneie o QR Code do convidado para registrar o check-in</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {scanning ? (
          <div className="relative">
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={(data) => data && handleScan(data.text)}
              style={{ width: "100%", height: "auto" }}
              constraints={{
                video: {
                  facingMode: "environment",
                },
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
              onClick={() => setScanning(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={() => {
              setScanning(true)
              setCameraError(null)
            }}
            disabled={loading}
          >
            <Camera className="h-4 w-4 mr-2" />
            Iniciar Scanner
          </Button>
        )}

        {cameraError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro na câmera</AlertTitle>
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">ou</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleManualSubmit} className="flex space-x-2">
          <Input
            placeholder="Cole o código ou URL aqui"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={!manualInput.trim() || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
          </Button>
        </form>

        {result && (
          <Alert
            variant={result.success ? "default" : "destructive"}
            className={result.success ? "bg-green-50 border-green-200" : ""}
          >
            {result.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Sucesso" : "Erro"}</AlertTitle>
            <AlertDescription>
              {result.message}
              {result.guestData && (
                <div className="mt-2">
                  <p className="font-medium">{result.guestData.nome_principal}</p>
                  <p className="text-sm">
                    {result.guestData.quantidade_total} {result.guestData.quantidade_total > 1 ? "pessoas" : "pessoa"}
                    {result.guestData.quantidade_criancas > 0 && ` (${result.guestData.quantidade_criancas} crianças)`}
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
