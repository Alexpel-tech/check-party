import { generateQRCode, validateQRToken } from "@/lib/utils/qr-code"

export async function testQRCodeService(testType = "generate") {
  const startTime = Date.now()

  try {
    switch (testType) {
      case "generate":
        // Testar geração de QR Code
        try {
          const testGuestId = "test-guest-" + Date.now()
          const testPartyId = "test-party-" + Date.now()

          const qrData = await generateQRCode(testGuestId, testPartyId)

          if (!qrData || !qrData.token || !qrData.qrCodeUrl) {
            throw new Error("QR Code não foi gerado corretamente")
          }

          return {
            success: true,
            message: "QR Code gerado com sucesso",
            details: {
              token: qrData.token,
              hasQRCodeUrl: !!qrData.qrCodeUrl,
              guestId: testGuestId,
              partyId: testPartyId,
              responseTime: Date.now() - startTime,
            },
          }
        } catch (error) {
          return {
            success: false,
            message: `Erro ao gerar QR Code: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            details: {
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          }
        }

      case "validate":
        // Testar validação de token QR
        try {
          // Primeiro, gerar um token de teste
          const testGuestId = "test-guest-validate-" + Date.now()
          const testPartyId = "test-party-validate-" + Date.now()

          const qrData = await generateQRCode(testGuestId, testPartyId)

          if (!qrData?.token) {
            throw new Error("Não foi possível gerar token para teste de validação")
          }

          // Agora validar o token
          const validation = await validateQRToken(qrData.token)

          return {
            success: validation.valid,
            message: validation.valid ? "Token QR validado com sucesso" : `Token inválido: ${validation.error}`,
            details: {
              token: qrData.token,
              valid: validation.valid,
              guestId: validation.guestId,
              partyId: validation.partyId,
              error: validation.error,
              responseTime: Date.now() - startTime,
            },
          }
        } catch (error) {
          return {
            success: false,
            message: `Erro ao validar token QR: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            details: {
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          }
        }

      case "checkin":
        // Testar processo completo de check-in
        try {
          // Criar dados de teste
          const testGuestId = "test-guest-checkin-" + Date.now()
          const testPartyId = "test-party-checkin-" + Date.now()

          // 1. Gerar QR Code
          const qrData = await generateQRCode(testGuestId, testPartyId)

          if (!qrData?.token) {
            throw new Error("Falha na geração do QR Code para teste de check-in")
          }

          // 2. Simular processo de check-in
          const checkinResponse = await fetch("/api/checkin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: qrData.token,
              isTest: true,
            }),
          })

          const checkinResult = await checkinResponse.json()

          if (!checkinResponse.ok) {
            throw new Error(checkinResult.error || "Erro no processo de check-in")
          }

          return {
            success: true,
            message: "Processo de check-in completado com sucesso",
            details: {
              token: qrData.token,
              guestId: testGuestId,
              partyId: testPartyId,
              checkinStatus: checkinResult.status,
              checkinTime: checkinResult.checkinTime,
              responseTime: Date.now() - startTime,
            },
          }
        } catch (error) {
          return {
            success: false,
            message: `Erro no teste de check-in: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            details: {
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          }
        }

      default:
        throw new Error("Tipo de teste QR Code não reconhecido")
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido no teste de QR Code",
      details: {
        testType,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
    }
  }
}
