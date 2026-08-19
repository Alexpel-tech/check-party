import { generateQRToken, validateQRToken } from "@/lib/utils/qr-code"

export interface QRCodeTestResult {
  success: boolean
  message: string
  details?: any
  error?: string
}

export async function testQRCodeGeneration(): Promise<QRCodeTestResult> {
  try {
    const testGuestId = "test-guest-123"
    const testPartyId = "test-party-456"

    const token = await generateQRToken(testGuestId, testPartyId)

    if (!token) {
      return {
        success: false,
        message: "Falha na geração do token QR Code",
      }
    }

    return {
      success: true,
      message: "Token QR Code gerado com sucesso",
      details: {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + "...",
      },
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro ao gerar QR Code",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function testQRCodeValidation(): Promise<QRCodeTestResult> {
  try {
    // Gerar um token de teste
    const testGuestId = "test-guest-123"
    const testPartyId = "test-party-456"

    const token = await generateQRToken(testGuestId, testPartyId)

    // Tentar validar o token
    const validation = await validateQRToken(token)

    return {
      success: validation.success,
      message: validation.success ? "Validação de QR Code funcionando" : "Falha na validação",
      details: validation.data,
      error: validation.error,
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro ao testar validação de QR Code",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function testQRCodeAPI(): Promise<QRCodeTestResult> {
  try {
    const response = await fetch("/api/test/qrcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        guestId: "test-guest-123",
        partyId: "test-party-456",
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: "Falha na API de QR Code",
        error: result.error || "Erro desconhecido",
      }
    }

    return {
      success: true,
      message: "API de QR Code funcionando",
      details: result,
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro ao testar API de QR Code",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function runAllQRCodeTests(): Promise<QRCodeTestResult[]> {
  const results = []

  // Teste de geração
  results.push(await testQRCodeGeneration())

  // Teste de validação
  results.push(await testQRCodeValidation())

  // Teste da API
  results.push(await testQRCodeAPI())

  return results
}
