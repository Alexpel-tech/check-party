import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json({ error: "Número de telefone e mensagem são obrigatórios" }, { status: 400 })
    }

    // Verificar configuração do Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({ error: "Configuração do Twilio não encontrada" }, { status: 500 })
    }

    // Simular envio de SMS (remova esta parte em produção)
    const mockResponse = {
      sid: "SM" + Math.random().toString(36).substr(2, 9),
      status: "queued",
      to: to,
      from: fromNumber,
      body: message,
      dateCreated: new Date().toISOString(),
    }

    // Em produção, use o código real do Twilio:
    /*
    const twilio = require('twilio')(accountSid, authToken)
    
    const smsResponse = await twilio.messages.create({
      body: message,
      from: fromNumber,
      to: to
    })
    */

    return NextResponse.json({
      success: true,
      message: "SMS enviado com sucesso (simulado)",
      data: mockResponse,
    })
  } catch (error) {
    console.error("Erro no teste de SMS:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
