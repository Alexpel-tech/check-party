import { NextResponse } from "next/server"

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER

    const hasAllCredentials = !!(accountSid && authToken && phoneNumber)

    if (!hasAllCredentials) {
      return NextResponse.json(
        {
          success: false,
          message: "Credenciais do Twilio não configuradas completamente",
          details: {
            hasAccountSid: !!accountSid,
            hasAuthToken: !!authToken,
            hasPhoneNumber: !!phoneNumber,
            missingVars: [
              !accountSid && "TWILIO_ACCOUNT_SID",
              !authToken && "TWILIO_AUTH_TOKEN",
              !phoneNumber && "TWILIO_PHONE_NUMBER",
            ].filter(Boolean),
          },
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Serviço SMS configurado corretamente",
      details: {
        accountSid: accountSid.substring(0, 10) + "...",
        phoneNumber,
        provider: "Twilio",
        status: "Configurado",
      },
    })
  } catch (error) {
    console.error("Erro no health check do SMS:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao verificar serviço SMS",
        details: {
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      },
      { status: 500 },
    )
  }
}
