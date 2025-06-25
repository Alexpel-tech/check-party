"use server"

import { createServerClient } from "../supabase/server"
import type { Guest, Party, ReminderConfig, ReminderLog } from "../types"
import { sendCustomMessage as sendWhatsAppCustomMessage } from "./whatsapp-service"
import { sendCustomMessage as sendSMSCustomMessage } from "./sms-service"
import { NotificationService } from "../adapters/notification-service-adapter"

export type ReminderType = "whatsapp" | "sms" | "email"
export type ReminderTiming = "1_day" | "2_days" | "3_days" | "1_week" | "custom"

export async function createReminderConfig(
  config: Omit<ReminderConfig, "id" | "created_at" | "updated_at">,
): Promise<ReminderConfig | null> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.from("reminder_configs").insert(config).select().single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Erro ao criar configuração de lembrete:", error)
    return null
  }
}

export async function updateReminderConfig(
  id: string,
  config: Partial<ReminderConfig>,
): Promise<ReminderConfig | null> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("reminder_configs")
      .update({ ...config, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Erro ao atualizar configuração de lembrete:", error)
    return null
  }
}

export async function getReminderConfigsByParty(partyId: string): Promise<ReminderConfig[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("reminder_configs")
      .select("*")
      .eq("party_id", partyId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Erro ao buscar configurações de lembrete:", error)
    return []
  }
}

export async function deleteReminderConfig(id: string): Promise<boolean> {
  try {
    const supabase = createServerClient()
    const { error } = await supabase.from("reminder_configs").delete().eq("id", id)
    if (error) throw error
    return true
  } catch (error) {
    console.error("Erro ao excluir configuração de lembrete:", error)
    return false
  }
}

async function notifyOrganizerOfReminder(
  party: Party,
  guest: Guest,
  type: ReminderType,
  status: "success" | "failure",
  details?: string,
) {
  if (!party.party_parents_id) return

  const supabase = createServerClient()
  try {
    const { data: parentUser, error: parentError } = await supabase
      .from("party_parents")
      .select("user_id")
      .eq("id", party.party_parents_id)
      .single()

    if (parentError || !parentUser?.user_id) {
      console.error(
        "Erro ao buscar organizador para notificação de lembrete:",
        parentError?.message || "Organizador não encontrado",
      )
      return
    }

    const title =
      status === "success"
        ? `Lembrete (${type.toUpperCase()}) Enviado`
        : `Falha ao Enviar Lembrete (${type.toUpperCase()})`
    const message =
      status === "success"
        ? `Lembrete para a festa de ${party.nome_aniversariante} enviado para ${guest.nome_principal}.`
        : `Falha ao enviar lembrete para ${guest.nome_principal} (festa de ${party.nome_aniversariante}). ${details ? `Detalhes: ${details}` : ""}`
    const notificationType = status === "success" ? "info" : "warning"

    await NotificationService.createNotification({
      user_id: parentUser.user_id,
      title,
      message,
      type: notificationType,
      link: `/admin/reminders?partyId=${party.id}`,
    })
  } catch (notificationError) {
    console.error("Erro ao enviar notificação de lembrete:", notificationError)
  }
}

export async function sendReminder(
  guest: Guest,
  party: Party,
  type: ReminderType,
  message: string,
  reminderConfigId?: string, // Adicionado para log
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const processedMessage = message
      .replace(/\[nome do convidado\]/gi, guest.nome_principal)
      .replace(/\[nome do aniversariante\]/gi, party.nome_aniversariante)
      .replace(/\[data\]/gi, new Date(party.data).toLocaleDateString("pt-BR"))
      .replace(/\[hora\]/gi, party.horario)
      .replace(/\[local\]/gi, party.local_detalhado)
      .replace(/\[tema\]/gi, party.theme)

    let result: { success: boolean; error?: string; messageId?: string }

    switch (type) {
      case "whatsapp":
        if (!guest.whatsapp) {
          result = { success: false, error: "Convidado não possui WhatsApp" }
          break
        }
        result = await sendWhatsAppCustomMessage(guest.whatsapp, processedMessage)
        break
      case "sms":
        if (!guest.whatsapp) {
          // Assumindo que whatsapp armazena o número de telefone para SMS também
          result = { success: false, error: "Convidado não possui número de telefone" }
          break
        }
        result = await sendSMSCustomMessage(guest.whatsapp, processedMessage)
        break
      case "email":
        result = { success: false, error: "Envio de email não implementado" }
        break
      default:
        result = { success: false, error: "Tipo de lembrete inválido" }
    }

    await logReminderSent({
      guest_id: guest.id,
      party_id: party.id,
      reminder_type: type,
      message: processedMessage,
      status: result.success ? "sent" : "failed",
      message_id: result.messageId,
      error_message: result.error,
      reminder_config_id: reminderConfigId,
    })

    await notifyOrganizerOfReminder(party, guest, type, result.success ? "success" : "failure", result.error)

    return result
  } catch (error: any) {
    console.error("Erro crítico ao enviar lembrete:", error)
    await logReminderSent({
      // Logar falha crítica também
      guest_id: guest.id,
      party_id: party.id,
      reminder_type: type,
      message: message, // Mensagem original, pois o processamento pode ter falhado
      status: "failed",
      error_message: error.message || "Erro desconhecido no envio",
      reminder_config_id: reminderConfigId,
    })
    await notifyOrganizerOfReminder(party, guest, type, "failure", error.message || "Erro desconhecido no envio")
    return { success: false, error: error.message || "Erro crítico ao enviar lembrete" }
  }
}

export async function logReminderSent(log: Omit<ReminderLog, "id" | "created_at">): Promise<ReminderLog | null> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("reminder_logs")
      .insert({ ...log, created_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Erro ao registrar envio de lembrete:", error)
    return null
  }
}

export async function getReminderLogsByParty(partyId: string): Promise<ReminderLog[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("reminder_logs")
      .select("*, guests(nome_principal)")
      .eq("party_id", partyId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Erro ao buscar histórico de lembretes:", error)
    return []
  }
}

export async function processScheduledReminders(): Promise<{
  success: boolean
  sent: number
  failed: number
  error?: string
}> {
  try {
    const supabase = createServerClient()
    const now = new Date()
    const { data: upcomingParties, error: partiesError } = await supabase
      .from("parties")
      .select("*, party_parents(user_id)") // Incluir user_id do organizador
      .gte("data", now.toISOString().split("T")[0])
      .order("data")

    if (partiesError) throw partiesError
    if (!upcomingParties || upcomingParties.length === 0) return { success: true, sent: 0, failed: 0 }

    let sentCount = 0
    let failedCount = 0

    for (const party of upcomingParties as (Party & { party_parents: { user_id: string } | null })[]) {
      const { data: configs, error: configsError } = await supabase
        .from("reminder_configs")
        .select("*")
        .eq("party_id", party.id)
        .eq("is_active", true)

      if (configsError) {
        console.error(`Erro ao buscar configs para festa ${party.id}:`, configsError)
        continue
      }
      if (!configs || configs.length === 0) continue

      for (const config of configs) {
        const partyDate = new Date(party.data)
        const daysDiff = Math.ceil((partyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        let shouldSend = false
        switch (config.timing) {
          case "1_day":
            shouldSend = daysDiff === 1
            break
          case "2_days":
            shouldSend = daysDiff === 2
            break
          case "3_days":
            shouldSend = daysDiff === 3
            break
          case "1_week":
            shouldSend = daysDiff === 7
            break
          case "custom":
            if (config.custom_days) shouldSend = daysDiff === config.custom_days
            break
        }
        if (!shouldSend) continue

        const { data: guests, error: guestsError } = await supabase
          .from("guests")
          .select("*")
          .eq("party_id", party.id)
          .eq("status_confirmacao_final", true)

        if (guestsError) {
          console.error(`Erro ao buscar convidados para festa ${party.id}:`, guestsError)
          continue
        }
        if (!guests || guests.length === 0) continue

        for (const guest of guests) {
          const { data: existingLogs } = await supabase
            .from("reminder_logs")
            .select("id")
            .eq("guest_id", guest.id)
            .eq("party_id", party.id)
            .eq("reminder_type", config.type)
            .eq("reminder_config_id", config.id)
            .gte("created_at", new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString()) // Início do dia atual
            .lte(
              "created_at",
              new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString(),
            ) // Fim do dia atual
            .limit(1)

          if (existingLogs && existingLogs.length > 0) continue

          const result = await sendReminder(guest, party, config.type as ReminderType, config.message, config.id)
          if (result.success) {
            sentCount++
          } else {
            failedCount++
          }
          await new Promise((resolve) => setTimeout(resolve, 300)) // Delay
        }
      }
    }
    return { success: true, sent: sentCount, failed: failedCount }
  } catch (error: any) {
    console.error("Erro ao processar lembretes programados:", error)
    return { success: false, sent: 0, failed: 0, error: error.message || "Erro ao processar lembretes programados" }
  }
}
