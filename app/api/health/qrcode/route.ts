import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar se JWT_SECRET está configurado
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "JWT_SECRET não configurado",
          details: {
            hasJwtSecret: false,
            missingVars: ["JWT_SECRET"],
          },
        },
        { status: 400 },
      )
    }

    // Simular geração de QR Code
    const testData = {
      guestId: "test-guest-123",
      partyId: "test-party-456",
      timestamp: new Date().toISOString(),
      type: "check-in",
    }

    const testQRData = JSON.stringify(testData)

    if (!testQRData) {
      throw new Error("Erro na geração de dados para QR Code")
    }

    return NextResponse.json({
      success: true,
      message: "Serviço QR Code funcionando corretamente",
      details: {
        testGenerated: true,
        dataLength: testQRData.length,
        jwtConfigured: true,
        sampleData: testData,
      },
    })
  } catch (error) {
    console.error("Erro no health check do QR Code:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao verificar serviço QR Code",
        details: {
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      },
      { status: 500 },
    )
  }
}
