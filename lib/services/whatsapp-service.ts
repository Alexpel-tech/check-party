"use server"

import { createServerClient } from "@/lib/supabase/server"

// Função para enviar mensagem via WhatsApp Business API
export async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

    if (!phoneNumberId || !accessToken) {
      throw new Error("Credenciais do WhatsApp não configuradas")
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: message,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erro ao enviar WhatsApp: ${error}`)
    }

    const result = await response.json()

    // Salvar no histórico
    await saveWhatsAppHistory(to, message, "sent", result.messages?.[0]?.id)

    return { success: true, messageId: result.messages?.[0]?.id }
  } catch (error) {
    console.error("Erro ao enviar WhatsApp:", error)
    await saveWhatsAppHistory(to, message, "failed", null, error instanceof Error ? error.message : "Erro desconhecido")
    throw error
  }
}

// Função para salvar histórico de WhatsApp
export async function saveWhatsAppHistory(
  phoneNumber: string,
  message: string,
  status: "sent" | "failed",
  messageId: string | null,
  errorMessage?: string,
) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("whatsapp_history").insert({
      phone_number: phoneNumber,
      message,
      status,
      message_id: messageId,
      error_message: errorMessage,
      sent_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Erro ao salvar histórico WhatsApp:", error)
    }
  } catch (error) {
    console.error("Erro ao salvar histórico WhatsApp:", error)
  }
}

// Função para buscar histórico de WhatsApp
export async function getWhatsAppHistory(limit = 50) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("whatsapp_history")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar histórico WhatsApp:", error)
    return []
  }
}

// Função para enviar confirmação de presença via WhatsApp
export async function sendGuestConfirmationWhatsApp(guestName: string, phoneNumber: string, partyName: string) {
  const message = `🎉 Olá ${guestName}!\n\nSua presença foi confirmada para a festa:\n*${partyName}*\n\nObrigado! 🎈`
  return await sendWhatsAppMessage(phoneNumber, message)
}

// Função para enviar lembrete via WhatsApp
export async function sendReminderWhatsApp(
  guestName: string,
  phoneNumber: string,
  partyName: string,
  partyDate: string,
) {
  const message = `🎊 Olá ${guestName}!\n\n📅 *Lembrete importante:*\nA festa *${partyName}* será em *${partyDate}*\n\nTe esperamos lá! 🎉`
  return await sendWhatsAppMessage(phoneNumber, message)
}

// Função para enviar mensagem personalizada
export async function sendCustomWhatsAppMessage(phoneNumber: string, message: string) {
  return await sendWhatsAppMessage(phoneNumber, message)
}

// Exportar objeto WhatsAppService para compatibilidade
export const WhatsAppService = {
  sendWhatsAppMessage,
  saveWhatsAppHistory,
  getWhatsAppHistory,
  sendGuestConfirmationWhatsApp,
  sendReminderWhatsApp,
  sendCustomWhatsAppMessage,
}
