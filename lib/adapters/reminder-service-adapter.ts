import {
  createReminderConfig,
  updateReminderConfig,
  deleteReminderConfig,
  getReminderConfigs,
  scheduleReminders,
  processPendingReminders,
  getReminderJobs,
} from "@/lib/services/reminder-service"
import type { ReminderConfig, ReminderLog } from "@/lib/types"

export const ReminderService = {
  // Nomes usados por components/reminders/reminder-config.tsx — versões que
  // traduzem entre o vocabulário da tela e as colunas reais do banco.
  createReminderConfig: createReminderConfigForUI,
  updateReminderConfig: updateReminderConfigForUI,
  deleteReminderConfig: deleteReminderConfigForUI,
  getReminderConfigsByParty,
  getReminderLogsByParty,
  // Nome usado por app/admin/reminders/page.tsx
  processScheduledReminders: processPendingReminders,
  // Funções "cruas" (formato do banco), para quem precisar delas diretamente
  scheduleReminders,
  getReminderConfigs,
  getReminderJobs,
}

// -----------------------------------------------------------------------
// Camada de tradução entre o vocabulário da tela (type/timing/custom_days/
// is_active) e as colunas reais do banco (reminder_type/days_before_event/
// custom_message/enabled). Isso evita reescrever a UI inteira mantendo os
// presets de horário ("1 dia antes", "1 semana antes" etc.) enquanto grava
// certinho na tabela reminder_configs.
// -----------------------------------------------------------------------

function timingToDays(timing: ReminderConfig["timing"], customDays?: number | null): number {
  switch (timing) {
    case "1_day":
      return 1
    case "2_days":
      return 2
    case "3_days":
      return 3
    case "1_week":
      return 7
    case "custom":
      return customDays || 1
    default:
      return 1
  }
}

function daysToTiming(days: number): { timing: ReminderConfig["timing"]; custom_days: number | null } {
  switch (days) {
    case 1:
      return { timing: "1_day", custom_days: null }
    case 2:
      return { timing: "2_days", custom_days: null }
    case 3:
      return { timing: "3_days", custom_days: null }
    case 7:
      return { timing: "1_week", custom_days: null }
    default:
      return { timing: "custom", custom_days: days }
  }
}

function toUIConfig(row: any): ReminderConfig {
  const { timing, custom_days } = daysToTiming(row.days_before_event)
  return {
    id: row.id,
    party_id: row.party_id,
    type: row.reminder_type === "both" ? "whatsapp" : row.reminder_type,
    timing,
    custom_days,
    message: row.custom_message || "",
    is_active: row.enabled,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// Busca as configurações de lembrete de uma festa, já traduzidas para o
// formato que a tela usa. Lança erro em caso de falha (a tela trata via
// try/catch).
export async function getReminderConfigsByParty(partyId: string): Promise<ReminderConfig[]> {
  const result = await getReminderConfigs(partyId)
  if (!result.success || !result.data) {
    throw new Error(result.error || "Falha ao buscar configurações de lembrete")
  }
  return result.data.map(toUIConfig)
}

// Busca o histórico de lembretes enviados de uma festa (tabela reminder_jobs)
export async function getReminderLogsByParty(partyId: string): Promise<ReminderLog[]> {
  const result = await getReminderJobs(partyId)
  if (!result.success || !result.data) {
    throw new Error(result.error || "Falha ao buscar histórico de lembretes")
  }
  return result.data as unknown as ReminderLog[]
}

// Cria uma configuração de lembrete a partir dos dados no formato da tela
export async function createReminderConfigForUI(configData: {
  party_id: string
  type: string
  timing: string
  custom_days?: number
  message: string
  is_active: boolean
}): Promise<ReminderConfig> {
  const result = await createReminderConfig({
    party_id: configData.party_id,
    reminder_type: configData.type as "whatsapp" | "sms" | "both",
    days_before_event: timingToDays(configData.timing as ReminderConfig["timing"], configData.custom_days),
    custom_message: configData.message,
    enabled: configData.is_active,
  })

  if (!result.success || !result.data) {
    throw new Error(result.error || "Falha ao criar configuração de lembrete")
  }

  return toUIConfig(result.data)
}

// Atualiza uma configuração (aceita campos parciais no formato da tela)
export async function updateReminderConfigForUI(
  id: string,
  partial: Partial<{ type: string; timing: string; custom_days?: number; message: string; is_active: boolean }>,
): Promise<ReminderConfig> {
  const patch: Record<string, unknown> = {}
  if (partial.type !== undefined) patch.reminder_type = partial.type
  if (partial.message !== undefined) patch.custom_message = partial.message
  if (partial.is_active !== undefined) patch.enabled = partial.is_active
  if (partial.timing !== undefined) {
    patch.days_before_event = timingToDays(partial.timing as ReminderConfig["timing"], partial.custom_days)
  }

  const result = await updateReminderConfig(id, patch)

  if (!result.success || !result.data) {
    throw new Error(result.error || "Falha ao atualizar configuração de lembrete")
  }

  return toUIConfig(result.data)
}

// Exclui uma configuração de lembrete
export async function deleteReminderConfigForUI(id: string): Promise<boolean> {
  const result = await deleteReminderConfig(id)
  if (!result.success) {
    throw new Error(result.error || "Falha ao excluir configuração de lembrete")
  }
  return true
}
