import { NextResponse } from "next/server"

export async function GET() {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    const hasAllCredentials = !!(accessToken && phoneNumberId)

    if (!hasAllCredentials) {
      return NextResponse.json(
        {
          success: false,
          message: "Credenciais do WhatsApp Business não configuradas completamente",
          details: {
            hasAccessToken: !!accessToken,
            hasPhoneNumberId: !!phoneNumberId,
            missingVars: [!accessToken && "WHATSAPP_ACCESS_TOKEN", !phoneNumberId && "WHATSAPP_PHONE_NUMBER_ID"].filter(
              Boolean,
            ),
          },
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Serviço WhatsApp configurado corretamente",
      details: {
        accessToken: accessToken.substring(0, 20) + "...",
        phoneNumberId,
        provider: "WhatsApp Business API",
        status: "Configurado",
      },
    })
  } catch (error) {
    console.error("Erro no health check do WhatsApp:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao verificar serviço WhatsApp",
        details: {
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      },
      { status: 500 },
    )
  }
}
