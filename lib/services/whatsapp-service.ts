"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

interface WhatsAppMessage {
  to: string
  message: string
  partyId?: string
  guestId?: string
  type?: "text" | "template"
  templateName?: string
  templateParams?: string[]
}

interface WhatsAppResponse {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendWhatsAppMessage(data: WhatsAppMessage): Promise<WhatsAppResponse> {
  try {
    if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error("Credenciais do WhatsApp não configuradas")
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    // Preparar payload baseado no tipo de mensagem
    const payload: any = {
      messaging_product: "whatsapp",
      to: data.to.replace(/\D/g, ""), // Remove caracteres não numéricos
    }

    if (data.type === "template" && data.templateName) {
      payload.type = "template"
      payload.template = {
        name: data.templateName,
        language: { code: "pt_BR" },
      }

      if (data.templateParams && data.templateParams.length > 0) {
        payload.template.components = [
          {
            type: "body",
            parameters: data.templateParams.map((param) => ({
              type: "text",
              text: param,
            })),
          },
        ]
      }
    } else {
      payload.type = "text"
      payload.text = { body: data.message }
    }

    // Enviar mensagem via WhatsApp Business API
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error?.message || "Erro ao enviar mensagem WhatsApp")
    }

    // Salvar no histórico
    const supabase = await createServerSupabaseClient()
    await supabase.from("whatsapp_history").insert({
      phone_number: data.to,
      message: data.message,
      party_id: data.partyId,
      guest_id: data.guestId,
      message_type: data.type || "text",
      template_name: data.templateName,
      status: "sent",
      whatsapp_id: result.messages?.[0]?.id,
      sent_at: new Date().toISOString(),
    })

    return {
      success: true,
      messageId: result.messages?.[0]?.id,
    }
  } catch (error) {
    console.error("Erro ao enviar WhatsApp:", error)

    // Salvar erro no histórico
    try {
      const supabase = await createServerSupabaseClient()
      await supabase.from("whatsapp_history").insert({
        phone_number: data.to,
        message: data.message,
        party_id: data.partyId,
        guest_id: data.guestId,
        message_type: data.type || "text",
        template_name: data.templateName,
        status: "failed",
        error_message: error instanceof Error ? error.message : "Erro desconhecido",
        sent_at: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error("Erro ao salvar no histórico:", dbError)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function getWhatsAppHistory(partyId?: string) {
  try {
    const supabase = await createServerSupabaseClient()
    let query = supabase.from("whatsapp_history").select("*").order("sent_at", { ascending: false })

    if (partyId) {
      query = query.eq("party_id", partyId)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar histórico de WhatsApp:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

// Templates pré-definidos
export async function sendConfirmationReminder(
  to: string,
  guestName: string,
  partyName: string,
  partyDate: string,
  partyId: string,
  guestId: string,
) {
  const message = `Olá ${guestName}! 👋\n\nLembramos que você foi convidado(a) para a festa "${partyName}" no dia ${partyDate}.\n\nPor favor, confirme sua presença o quanto antes!\n\nObrigado! 🎉`

  return sendWhatsAppMessage({
    to,
    message,
    partyId,
    guestId,
    type: "text",
  })
}

export async function sendConfirmationThankYou(
  to: string,
  guestName: string,
  partyName: string,
  partyId: string,
  guestId: string,
) {
  const message = `Obrigado ${guestName}! ✅\n\nSua confirmação para a festa "${partyName}" foi recebida com sucesso!\n\nAguardamos você! 🎉`

  return sendWhatsAppMessage({
    to,
    message,
    partyId,
    guestId,
    type: "text",
  })
}

// Export do serviço
export const WhatsAppService = {
  sendWhatsAppMessage,
  getWhatsAppHistory,
  sendConfirmationReminder,
  sendConfirmationThankYou,
}
