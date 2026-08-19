"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { sendSMS } from "./sms-service"
import { sendWhatsAppMessage } from "./whatsapp-service"

interface ReminderConfig {
  party_id: string
  reminder_type: "sms" | "whatsapp" | "both"
  days_before_event: number
  custom_message?: string
  enabled: boolean
}

interface ReminderJob {
  id: string
  party_id: string
  guest_id: string
  reminder_type: "sms" | "whatsapp"
  scheduled_for: string
  status: "pending" | "sent" | "failed"
  message: string
}

export async function createReminderConfig(config: ReminderConfig) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.from("reminder_configs").insert(config).select().single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao criar configuração de lembrete:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function updateReminderConfig(id: string, config: Partial<ReminderConfig>) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.from("reminder_configs").update(config).eq("id", id).select().single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao atualizar configuração de lembrete:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function getReminderConfigs(partyId?: string) {
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase.from("reminder_configs").select("*").order("created_at", { ascending: false })

    if (partyId) {
      query = query.eq("party_id", partyId)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar configurações de lembrete:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function scheduleReminders(partyId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Buscar configurações de lembrete para a festa
    const { data: configs, error: configError } = await supabase
      .from("reminder_configs")
      .select("*")
      .eq("party_id", partyId)
      .eq("enabled", true)

    if (configError) throw configError

    if (!configs || configs.length === 0) {
      return { success: true, message: "Nenhuma configuração de lembrete encontrada" }
    }

    // Buscar dados da festa
    const { data: party, error: partyError } = await supabase
      .from("parties")
      .select("*, guests(*)")
      .eq("id", partyId)
      .single()

    if (partyError) throw partyError

    const partyDate = new Date(party.data)
    const jobs: Omit<ReminderJob, "id">[] = []

    // Criar jobs de lembrete para cada configuração e convidado
    for (const config of configs) {
      const reminderDate = new Date(partyDate)
      reminderDate.setDate(reminderDate.getDate() - config.days_before_event)

      for (const guest of party.guests) {
        if (guest.status_confirmacao === "pendente") {
          const message =
            config.custom_message ||
            `Olá ${guest.nome_principal}! Lembramos que você foi convidado(a) para a festa de "${party.nome_aniversariante}" no dia ${partyDate.toLocaleDateString("pt-BR")}. Por favor, confirme sua presença!`

          if (config.reminder_type === "sms" || config.reminder_type === "both") {
            if (guest.whatsapp) {
              jobs.push({
                party_id: partyId,
                guest_id: guest.id,
                reminder_type: "sms",
                scheduled_for: reminderDate.toISOString(),
                status: "pending",
                message,
              })
            }
          }

          if (config.reminder_type === "whatsapp" || config.reminder_type === "both") {
            if (guest.whatsapp) {
              jobs.push({
                party_id: partyId,
                guest_id: guest.id,
                reminder_type: "whatsapp",
                scheduled_for: reminderDate.toISOString(),
                status: "pending",
                message,
              })
            }
          }
        }
      }
    }

    // Salvar jobs no banco
    if (jobs.length > 0) {
      const { error: jobError } = await supabase.from("reminder_jobs").insert(jobs)

      if (jobError) throw jobError
    }

    return {
      success: true,
      message: `${jobs.length} lembretes agendados com sucesso`,
    }
  } catch (error) {
    console.error("Erro ao agendar lembretes:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function processPendingReminders() {
  try {
    const supabase = await createServerSupabaseClient()
    const now = new Date().toISOString()

    // Buscar lembretes pendentes que devem ser enviados
    const { data: jobs, error: jobError } = await supabase
      .from("reminder_jobs")
      .select(`
        *,
        guests(*),
        parties(*)
      `)
      .eq("status", "pending")
      .lte("scheduled_for", now)

    if (jobError) throw jobError

    if (!jobs || jobs.length === 0) {
      return { success: true, message: "Nenhum lembrete pendente" }
    }

    let sentCount = 0
    let failedCount = 0

    // Processar cada job
    for (const job of jobs) {
      try {
        let result

        if (job.reminder_type === "sms") {
          result = await sendSMS({
            to: job.guests.whatsapp,
            message: job.message,
            partyId: job.party_id,
            guestId: job.guest_id,
          })
        } else if (job.reminder_type === "whatsapp") {
          result = await sendWhatsAppMessage({
            to: job.guests.whatsapp,
            message: job.message,
            partyId: job.party_id,
            guestId: job.guest_id,
          })
        }

        // Atualizar status do job
        const newStatus = result?.success ? "sent" : "failed"
        await supabase
          .from("reminder_jobs")
          .update({
            status: newStatus,
            processed_at: new Date().toISOString(),
            error_message: result?.error,
          })
          .eq("id", job.id)

        if (result?.success) {
          sentCount++
        } else {
          failedCount++
        }
      } catch (error) {
        console.error(`Erro ao processar job ${job.id}:`, error)

        await supabase
          .from("reminder_jobs")
          .update({
            status: "failed",
            processed_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : "Erro desconhecido",
          })
          .eq("id", job.id)

        failedCount++
      }
    }

    return {
      success: true,
      message: `Processados ${jobs.length} lembretes: ${sentCount} enviados, ${failedCount} falharam`,
    }
  } catch (error) {
    console.error("Erro ao processar lembretes:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function getReminderJobs(partyId?: string) {
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from("reminder_jobs")
      .select(`
        *,
        guests(nome_principal, whatsapp),
        parties(nome_aniversariante, data)
      `)
      .order("scheduled_for", { ascending: false })

    if (partyId) {
      query = query.eq("party_id", partyId)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar jobs de lembrete:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}
