import { getSupabaseClient } from "@/lib/supabase/client"

// Adapter para uso em componentes cliente
export const ReminderServiceAdapter = {
  async getReminderConfigs(partyId?: string) {
    try {
      const supabase = getSupabaseClient()

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
  },

  async getReminderLogs(reminderConfigId?: string, limit = 50) {
    try {
      const supabase = getSupabaseClient()

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
  },

  async getStats() {
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase.from("reminder_logs").select("status")

      if (error) {
        throw error
      }

      const total = data?.length || 0
      const sent = data?.filter((item) => item.status === "sent").length || 0
      const failed = data?.filter((item) => item.status === "failed").length || 0

      return { total, sent, failed }
    } catch (error) {
      console.error("Erro ao buscar estatísticas de lembretes:", error)
      return { total: 0, sent: 0, failed: 0 }
    }
  },
}
