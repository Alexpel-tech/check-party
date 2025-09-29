import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json({ error: "Número de telefone e mensagem são obrigatórios" }, { status: 400 })
    }

    // Verificar configuração do WhatsApp
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json({ error: "Configuração do WhatsApp não encontrada" }, { status: 500 })
    }

    // Simular envio de WhatsApp (remova esta parte em produção)
    const mockResponse = {
      messaging_product: "whatsapp",
      contacts: [
        {
          input: to,
          wa_id: to.replace(/\D/g, ""),
        },
      ],
      messages: [
        {
          id: "wamid." + Math.random().toString(36).substr(2, 9),
        },
      ],
    }

    // Em produção, use o código real da API do WhatsApp:
    /*
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'text',
          text: { body: message }
        })
      }
    )
    
    const result = await whatsappResponse.json()
    */

    return NextResponse.json({
      success: true,
      message: "WhatsApp enviado com sucesso (simulado)",
      data: mockResponse,
    })
  } catch (error) {
    console.error("Erro no teste de WhatsApp:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
