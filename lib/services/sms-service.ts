"use server"

import { createServerClient } from "@/lib/supabase/server"

// Função para enviar SMS via Twilio
export async function sendSMS(to: string, message: string) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error("Credenciais do Twilio não configuradas")
    }

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: message,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erro ao enviar SMS: ${error}`)
    }

    const result = await response.json()

    // Salvar no histórico
    await saveSMSHistory(to, message, "sent", result.sid)

    return { success: true, messageId: result.sid }
  } catch (error) {
    console.error("Erro ao enviar SMS:", error)
    await saveSMSHistory(to, message, "failed", null, error instanceof Error ? error.message : "Erro desconhecido")
    throw error
  }
}

// Função para salvar histórico de SMS
export async function saveSMSHistory(
  phoneNumber: string,
  message: string,
  status: "sent" | "failed",
  messageId: string | null,
  errorMessage?: string,
) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("sms_history").insert({
      phone_number: phoneNumber,
      message,
      status,
      message_id: messageId,
      error_message: errorMessage,
      sent_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Erro ao salvar histórico SMS:", error)
    }
  } catch (error) {
    console.error("Erro ao salvar histórico SMS:", error)
  }
}

// Função para buscar histórico de SMS
export async function getSMSHistory(limit = 50) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("sms_history")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar histórico SMS:", error)
    return []
  }
}

// Função para enviar confirmação de presença via SMS
export async function sendGuestConfirmationSMS(guestName: string, phoneNumber: string, partyName: string) {
  const message = `Olá ${guestName}! Sua presença foi confirmada para a festa: ${partyName}. Obrigado!`
  return await sendSMS(phoneNumber, message)
}

// Função para enviar lembrete via SMS
export async function sendReminderSMS(guestName: string, phoneNumber: string, partyName: string, partyDate: string) {
  const message = `Olá ${guestName}! Lembrete: A festa ${partyName} será em ${partyDate}. Te esperamos lá!`
  return await sendSMS(phoneNumber, message)
}

// Exportar objeto SMSService para compatibilidade
export const SMSService = {
  sendSMS,
  saveSMSHistory,
  getSMSHistory,
  sendGuestConfirmationSMS,
  sendReminderSMS,
}
