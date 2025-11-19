"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

interface SMSMessage {
  to: string
  message: string
  partyId?: string
  guestId?: string
}

interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendSMS(data: SMSMessage): Promise<SMSResponse> {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      throw new Error("Credenciais do Twilio não configuradas")
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    // Enviar SMS via Twilio API
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: data.to,
        Body: data.message,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Erro ao enviar SMS")
    }

    // Salvar no histórico
    const supabase = await createServerSupabaseClient()
    await supabase.from("sms_history").insert({
      phone_number: data.to,
      message: data.message,
      party_id: data.partyId,
      guest_id: data.guestId,
      status: "sent",
      twilio_sid: result.sid,
      sent_at: new Date().toISOString(),
    })

    return {
      success: true,
      messageId: result.sid,
    }
  } catch (error) {
    console.error("Erro ao enviar SMS:", error)

    // Salvar erro no histórico
    try {
      const supabase = await createServerSupabaseClient()
      await supabase.from("sms_history").insert({
        phone_number: data.to,
        message: data.message,
        party_id: data.partyId,
        guest_id: data.guestId,
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

export async function getSMSHistory(partyId?: string) {
  try {
    const supabase = await createServerSupabaseClient()
    let query = supabase.from("sms_history").select("*").order("sent_at", { ascending: false })

    if (partyId) {
      query = query.eq("party_id", partyId)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar histórico de SMS:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

// Export namespace for compatibility (this is allowed in "use server" files)
export const SMSService = {
  sendSMS,
  getSMSHistory,
} as const
