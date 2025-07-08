import { getSupabaseClient } from "@/lib/supabase/client"

// Adapter para uso em componentes cliente
export const WhatsAppServiceAdapter = {
  async getWhatsAppHistory(limit = 50) {
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from("whatsapp_history")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Erro ao buscar histórico WhatsApp:", error)
      return []
    }
  },

  async getStats() {
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase.from("whatsapp_history").select("status")

      if (error) {
        throw error
      }

      const total = data?.length || 0
      const sent = data?.filter((item) => item.status === "sent").length || 0
      const failed = data?.filter((item) => item.status === "failed").length || 0

      return { total, sent, failed }
    } catch (error) {
      console.error("Erro ao buscar estatísticas WhatsApp:", error)
      return { total: 0, sent: 0, failed: 0 }
    }
  },
}
