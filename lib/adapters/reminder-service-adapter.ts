// lib/adapters/reminder-service-adapter.ts
"use client" // Adapters are for client-side consumption of server actions

import { toast } from "@/components/ui/use-toast" // Assuming you use shadcn toast
import {
  createReminderConfig as createReminderConfigAction,
  updateReminderConfig as updateReminderConfigAction,
  getReminderConfigsByParty as getReminderConfigsByPartyAction,
  deleteReminderConfig as deleteReminderConfigAction,
  sendReminder as sendReminderAction,
  getReminderLogsByParty as getReminderLogsByPartyAction,
  processScheduledReminders as processScheduledRemindersAction, // Typically a server-side cron job
  type ReminderType, // Ensure types are exported from service or types file
  type ReminderTiming,
} from "../services/reminder-service"
import type { ReminderConfig, ReminderLog, Guest, Party } from "../types" // Make sure all necessary types are available

// Re-export types if they are needed by components using this adapter
export type { ReminderType, ReminderTiming }

export const ReminderService = {
  async createReminderConfig(
    config: Omit<ReminderConfig, "id" | "created_at" | "updated_at">,
  ): Promise<ReminderConfig | null> {
    try {
      const result = await createReminderConfigAction(config)
      if (result) {
        toast({ title: "Sucesso", description: "Configuração de lembrete criada." })
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar a configuração de lembrete.",
          variant: "destructive",
        })
      }
      return result
    } catch (error: any) {
      console.error("Adapter Error: createReminderConfig", error)
      toast({ title: "Erro", description: error.message || "Falha ao criar configuração.", variant: "destructive" })
      return null
    }
  },

  async updateReminderConfig(id: string, config: Partial<ReminderConfig>): Promise<ReminderConfig | null> {
    try {
      const result = await updateReminderConfigAction(id, config)
      if (result) {
        toast({ title: "Sucesso", description: "Configuração de lembrete atualizada." })
      } else {
        toast({ title: "Erro", description: "Não foi possível atualizar a configuração.", variant: "destructive" })
      }
      return result
    } catch (error: any) {
      console.error("Adapter Error: updateReminderConfig", error)
      toast({ title: "Erro", description: error.message || "Falha ao atualizar configuração.", variant: "destructive" })
      return null
    }
  },

  async getReminderConfigsByParty(partyId: string): Promise<ReminderConfig[]> {
    try {
      return await getReminderConfigsByPartyAction(partyId)
    } catch (error: any) {
      console.error("Adapter Error: getReminderConfigsByParty", error)
      toast({ title: "Erro", description: "Falha ao buscar configurações de lembrete.", variant: "destructive" })
      return []
    }
  },

  async deleteReminderConfig(id: string): Promise<boolean> {
    try {
      const success = await deleteReminderConfigAction(id)
      if (success) {
        toast({ title: "Sucesso", description: "Configuração de lembrete excluída." })
      } else {
        toast({ title: "Erro", description: "Não foi possível excluir a configuração.", variant: "destructive" })
      }
      return success
    } catch (error: any) {
      console.error("Adapter Error: deleteReminderConfig", error)
      toast({ title: "Erro", description: error.message || "Falha ao excluir configuração.", variant: "destructive" })
      return false
    }
  },

  async sendReminder(
    guest: Guest,
    party: Party,
    type: ReminderType,
    message: string,
    reminderConfigId?: string,
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      // Note: Direct sendReminder might be complex from client if it involves sensitive logic or multiple steps.
      // This is kept for consistency but review if this specific action should be client-invokable directly.
      const result = await sendReminderAction(guest, party, type, message, reminderConfigId)
      if (result.success) {
        toast({ title: "Sucesso", description: `Lembrete (${type}) enviado para ${guest.nome_principal}.` })
      } else {
        toast({
          title: "Erro",
          description: result.error || `Falha ao enviar lembrete (${type}).`,
          variant: "destructive",
        })
      }
      return result
    } catch (error: any) {
      console.error("Adapter Error: sendReminder", error)
      toast({
        title: "Erro",
        description: error.message || "Falha crítica ao enviar lembrete.",
        variant: "destructive",
      })
      return { success: false, error: error.message || "Falha crítica ao enviar lembrete." }
    }
  },

  async getReminderLogsByParty(partyId: string): Promise<ReminderLog[]> {
    try {
      return await getReminderLogsByPartyAction(partyId)
    } catch (error: any) {
      console.error("Adapter Error: getReminderLogsByParty", error)
      toast({ title: "Erro", description: "Falha ao buscar histórico de lembretes.", variant: "destructive" })
      return []
    }
  },

  // processScheduledReminders is typically a server-side cron job and not called from the client.
  // If you need to trigger it manually for admin purposes, ensure it's appropriate.
  async processScheduledReminders(): Promise<{ success: boolean; sent: number; failed: number; error?: string }> {
    try {
      const result = await processScheduledRemindersAction()
      if (result.success) {
        toast({
          title: "Processamento Concluído",
          description: `Lembretes enviados: ${result.sent}, Falhas: ${result.failed}.`,
        })
      } else {
        toast({
          title: "Erro no Processamento",
          description: result.error || "Falha ao processar lembretes agendados.",
          variant: "destructive",
        })
      }
      return result
    } catch (error: any) {
      console.error("Adapter Error: processScheduledReminders", error)
      toast({
        title: "Erro Crítico",
        description: error.message || "Falha crítica ao processar lembretes.",
        variant: "destructive",
      })
      return { success: false, sent: 0, failed: 0, error: error.message || "Falha crítica." }
    }
  },
}
