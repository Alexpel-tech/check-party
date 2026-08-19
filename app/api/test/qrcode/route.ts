import { type NextRequest, NextResponse } from "next/server"
import { generateQRToken, validateQRToken } from "@/lib/utils/qr-code"

export async function POST(request: NextRequest) {
  try {
    const { guestId, partyId } = await request.json()

    if (!guestId || !partyId) {
      return NextResponse.json({ error: "guestId e partyId são obrigatórios" }, { status: 400 })
    }

    // Testar geração de token
    const token = await generateQRToken(guestId, partyId)

    if (!token) {
      return NextResponse.json({ error: "Falha na geração do token" }, { status: 500 })
    }

    // Testar validação do token
    const validation = await validateQRToken(token)

    return NextResponse.json({
      success: true,
      message: "QR Code gerado e validado com sucesso",
      data: {
        token: token.substring(0, 20) + "...",
        validation: validation.success,
        validationError: validation.error,
      },
    })
  } catch (error) {
    console.error("Erro no teste de QR Code:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
