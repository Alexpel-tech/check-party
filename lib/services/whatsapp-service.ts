"use server"

import { createServerClient } from "../supabase/server"
import type { Guest, Party } from "../types"

// Tipos para as mensagens do WhatsApp
export type WhatsAppTemplate = {
  name: string
  language: {
    code: string
  }
  components: {
    type: string
    parameters: any[]
  }[]
}

export type WhatsAppMessage = {
  messaging_product: string
  recipient_type: string
  to: string
  type: string
  template?: WhatsAppTemplate
  text?: {
    body: string
  }
}

export type WhatsAppResponse = {
  success: boolean
  messageId?: string
  error?: string
}

// Funções auxiliares privadas (não exportadas)
async function sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
  try {
    const WHATSAPP_API_URL = "https://graph.facebook.com/v17.0"
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
    const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      throw new Error("Credenciais do WhatsApp não configuradas")
    }

    const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(message),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || "Erro ao enviar mensagem")
    }

    // Registrar mensagem enviada no banco de dados
    await logMessageToDatabase(message, data.messages?.[0]?.id)

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (error: any) {
    console.error("Erro ao enviar mensagem WhatsApp:", error)
    return {
      success: false,
      error: error.message || "Erro desconhecido ao enviar mensagem",
    }
  }
}

async function logMessageToDatabase(message: WhatsAppMessage, messageId?: string): Promise<void> {
  try {
    const supabase = createServerClient()

    await supabase.from("whatsapp_messages").insert({
      phone_number: message.to,
      message_type: message.type,
      message_content: message.text?.body || JSON.stringify(message.template),
      message_id: messageId || null,
      status: "sent",
    })
  } catch (error) {
    console.error("Erro ao registrar mensagem no banco de dados:", error)
  }
}

function formatPhoneNumber(phoneNumber: string): string {
  // Remover todos os caracteres não numéricos
  const cleaned = phoneNumber.replace(/\D/g, "")

  // Verificar se já tem o código do país
  if (cleaned.startsWith("55")) {
    return cleaned
  }

  // Adicionar código do Brasil (55) se não tiver
  return `55${cleaned}`
}

// Funções exportadas
export async function sendGuestConfirmation(guest: Guest, party: Party): Promise<WhatsAppResponse> {
  if (!guest.whatsapp) {
    return { success: false, error: "Número de WhatsApp não fornecido" }
  }

  // Formatar o número de telefone (remover caracteres não numéricos)
  const phoneNumber = formatPhoneNumber(guest.whatsapp)

  // Criar mensagem usando template
  const message: WhatsAppMessage = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phoneNumber,
    type: "template",
    template: {
      name: "guest_confirmation",
      language: {
        code: "pt_BR",
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: guest.nome_principal,
            },
            {
              type: "text",
              text: party.nome_aniversariante,
            },
            {
              type: "text",
              text: new Date(party.data).toLocaleDateString("pt-BR"),
            },
            {
              type: "text",
              text: party.horario,
            },
            {
              type: "text",
              text: party.local_detalhado,
            },
          ],
        },
      ],
    },
  }

  return sendMessage(message)
}

export async function sendGuestReminder(guest: Guest, party: Party): Promise<WhatsAppResponse> {
  if (!guest.whatsapp) {
    return { success: false, error: "Número de WhatsApp não fornecido" }
  }

  // Formatar o número de telefone
  const phoneNumber = formatPhoneNumber(guest.whatsapp)

  // Criar mensagem usando template
  const message: WhatsAppMessage = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phoneNumber,
    type: "template",
    template: {
      name: "guest_reminder",
      language: {
        code: "pt_BR",
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: guest.nome_principal,
            },
            {
              type: "text",
              text: party.nome_aniversariante,
            },
            {
              type: "text",
              text: new Date(party.data).toLocaleDateString("pt-BR"),
            },
            {
              type: "text",
              text: party.horario,
            },
          ],
        },
      ],
    },
  }

  return sendMessage(message)
}

export async function sendCustomMessage(phoneNumber: string, message: string): Promise<WhatsAppResponse> {
  // Formatar o número de telefone
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber)

  // Criar mensagem de texto simples
  const whatsappMessage: WhatsAppMessage = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: formattedPhoneNumber,
    type: "text",
    text: {
      body: message,
    },
  }

  return sendMessage(whatsappMessage)
}

export async function getMessageHistory(limit = 50): Promise<any[]> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar histórico de mensagens:", error)
    return []
  }
}

// Namespace para compatibilidade com código existente
export const WhatsAppService = {
  sendGuestConfirmation,
  sendGuestReminder,
  sendCustomMessage,
  getMessageHistory,
}
