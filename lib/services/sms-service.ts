"use server"

import { createServerClient } from "../supabase/server"
import type { Guest, Party } from "../types"

// Tipos para as mensagens SMS
export type SMSMessage = {
  to: string
  body: string
}

export type SMSResponse = {
  success: boolean
  messageId?: string
  error?: string
}

// Função auxiliar para formatar número de telefone
function formatPhoneNumber(phoneNumber: string): string {
  // Remover todos os caracteres não numéricos
  const cleaned = phoneNumber.replace(/\D/g, "")

  // Verificar se já tem o código do país
  if (cleaned.startsWith("1")) {
    return `+${cleaned}`
  }

  // Se começar com 55 (Brasil), adicionar o + na frente
  if (cleaned.startsWith("55")) {
    return `+${cleaned}`
  }

  // Adicionar código do Brasil (55) se não tiver
  return `+55${cleaned}`
}

// Função auxiliar para enviar mensagem
async function sendMessage(message: SMSMessage): Promise<SMSResponse> {
  try {
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error("Credenciais do Twilio não configuradas")
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")

    const formData = new URLSearchParams()
    formData.append("To", message.to)
    formData.append("From", TWILIO_PHONE_NUMBER)
    formData.append("Body", message.body)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: formData.toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Erro ao enviar SMS")
    }

    // Registrar mensagem enviada no banco de dados
    await logMessageToDatabase(message, data.sid)

    return {
      success: true,
      messageId: data.sid,
    }
  } catch (error: any) {
    console.error("Erro ao enviar SMS:", error)
    return {
      success: false,
      error: error.message || "Erro desconhecido ao enviar SMS",
    }
  }
}

// Função auxiliar para registrar no banco
async function logMessageToDatabase(message: SMSMessage, messageId?: string): Promise<void> {
  try {
    const supabase = createServerClient()

    await supabase.from("sms_messages").insert({
      phone_number: message.to,
      message_content: message.body,
      message_id: messageId || null,
      status: "sent",
    })
  } catch (error) {
    console.error("Erro ao registrar SMS no banco de dados:", error)
  }
}

// Funções exportadas (todas async)
export async function sendGuestConfirmation(guest: Guest, party: Party): Promise<SMSResponse> {
  if (!guest.whatsapp) {
    return { success: false, error: "Número de telefone não fornecido" }
  }

  // Formatar o número de telefone (remover caracteres não numéricos)
  const phoneNumber = formatPhoneNumber(guest.whatsapp)

  // Criar mensagem de confirmação
  const message: SMSMessage = {
    to: phoneNumber,
    body: `Olá ${guest.nome_principal}, sua presença na festa de ${party.nome_aniversariante} foi confirmada! A festa será no dia ${new Date(party.data).toLocaleDateString("pt-BR")} às ${party.horario} no endereço: ${party.local_detalhado}. Agradecemos sua confirmação!`,
  }

  return sendMessage(message)
}

export async function sendGuestReminder(guest: Guest, party: Party): Promise<SMSResponse> {
  if (!guest.whatsapp) {
    return { success: false, error: "Número de telefone não fornecido" }
  }

  // Formatar o número de telefone
  const phoneNumber = formatPhoneNumber(guest.whatsapp)

  // Criar mensagem de lembrete
  const message: SMSMessage = {
    to: phoneNumber,
    body: `Olá ${guest.nome_principal}, não esqueça da festa de ${party.nome_aniversariante} amanhã, dia ${new Date(party.data).toLocaleDateString("pt-BR")} às ${party.horario}. Esperamos você lá!`,
  }

  return sendMessage(message)
}

export async function sendCustomMessage(phoneNumber: string, message: string): Promise<SMSResponse> {
  // Formatar o número de telefone
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber)

  // Criar mensagem de texto simples
  const smsMessage: SMSMessage = {
    to: formattedPhoneNumber,
    body: message,
  }

  return sendMessage(smsMessage)
}

export async function getMessageHistory(limit = 50): Promise<any[]> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("sms_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar histórico de SMS:", error)
    return []
  }
}
