"use server"

import { createServerClient } from "@/lib/supabase/server"
import { sendWhatsAppMessage } from "./whatsapp-service"
import { sendSMS } from "./sms-service"

// Função para criar configuração de lembrete
export async function createReminderConfig(config: {
  partyId: string
  reminderType: "whatsapp" | "sms" | "both"
  scheduledFor: string
  message: string
  isActive: boolean
}) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("reminder_configs").insert(config).select().single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Erro ao criar configuração de lembrete:", error)
    throw error
  }
}

// Função para buscar configurações de lembrete
export async function getReminderConfigs(partyId?: string) {
  try {
    const supabase = createServerClient()

    let query = supabase.from("reminder_configs").select("*")

    if (partyId) {
      query = query.eq("party_id", partyId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar configurações de lembrete:", error)
    return []
  }
}

// Função para processar lembretes pendentes
export async function processScheduledReminders() {
  try {
    const supabase = createServerClient()

    // Buscar lembretes que devem ser enviados agora
    const { data: reminders, error } = await supabase
      .from("reminder_configs")
      .select(`
        *,
        parties (
          id,
          child_name,
          party_date,
          guests (
            id,
            name,
            phone,
            status
          )
        )
      `)
      .eq("is_active", true)
      .lte("scheduled_for", new Date().toISOString())

    if (error) {
      throw error
    }

    for (const reminder of reminders || []) {
      await processReminder(reminder)
    }

    return { success: true, processed: reminders?.length || 0 }
  } catch (error) {
    console.error("Erro ao processar lembretes:", error)
    throw error
  }
}

// Função para processar um lembrete específico
export async function processReminder(reminder: any) {
  try {
    const supabase = createServerClient()
    const party = reminder.parties

    if (!party || !party.guests) {
      return
    }

    // Filtrar apenas convidados confirmados
    const confirmedGuests = party.guests.filter((guest: any) => guest.status === "confirmed")

    for (const guest of confirmedGuests) {
      if (!guest.phone) continue

      try {
        let success = false
        let errorMessage = ""

        // Personalizar mensagem
        const personalizedMessage = reminder.message
          .replace("{guest_name}", guest.name)
          .replace("{party_name}", `festa do(a) ${party.child_name}`)
          .replace("{party_date}", new Date(party.party_date).toLocaleDateString("pt-BR"))

        // Enviar conforme o tipo
        if (reminder.reminder_type === "whatsapp" || reminder.reminder_type === "both") {
          try {
            await sendWhatsAppMessage(guest.phone, personalizedMessage)
            success = true
          } catch (error) {
            errorMessage += `WhatsApp: ${error instanceof Error ? error.message : "Erro desconhecido"}; `
          }
        }

        if (reminder.reminder_type === "sms" || reminder.reminder_type === "both") {
          try {
            await sendSMS(guest.phone, personalizedMessage)
            success = true
          } catch (error) {
            errorMessage += `SMS: ${error instanceof Error ? error.message : "Erro desconhecido"}; `
          }
        }

        // Salvar log do lembrete
        await supabase.from("reminder_logs").insert({
          reminder_config_id: reminder.id,
          guest_id: guest.id,
          phone_number: guest.phone,
          message: personalizedMessage,
          status: success ? "sent" : "failed",
          error_message: errorMessage || null,
          sent_at: new Date().toISOString(),
        })
      } catch (error) {
        console.error(`Erro ao enviar lembrete para ${guest.name}:`, error)
      }
    }

    // Desativar o lembrete após o envio
    await supabase.from("reminder_configs").update({ is_active: false }).eq("id", reminder.id)
  } catch (error) {
    console.error("Erro ao processar lembrete:", error)
  }
}

// Função para buscar logs de lembretes
export async function getReminderLogs(reminderConfigId?: string, limit = 50) {
  try {
    const supabase = createServerClient()

    let query = supabase
      .from("reminder_logs")
      .select(`
        *,
        guests (
          name
        )
      `)
      .order("sent_at", { ascending: false })
      .limit(limit)

    if (reminderConfigId) {
      query = query.eq("reminder_config_id", reminderConfigId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar logs de lembretes:", error)
    return []
  }
}

// Função para atualizar configuração de lembrete
export async function updateReminderConfig(id: string, updates: any) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("reminder_configs").update(updates).eq("id", id).select().single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Erro ao atualizar configuração de lembrete:", error)
    throw error
  }
}

// Função para deletar configuração de lembrete
export async function deleteReminderConfig(id: string) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("reminder_configs").delete().eq("id", id)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar configuração de lembrete:", error)
    throw error
  }
}

// Exportar objeto ReminderService para compatibilidade
export const ReminderService = {
  createReminderConfig,
  getReminderConfigs,
  processScheduledReminders,
  processReminder,
  getReminderLogs,
  updateReminderConfig,
  deleteReminderConfig,
}
