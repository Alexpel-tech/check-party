import { getSupabaseClient } from "@/lib/supabase/client"

// Adapter para uso em componentes cliente
export const NotificationServiceAdapter = {
  async getUserNotifications(userId: string, limit = 50) {
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Erro ao buscar notificações:", error)
      return []
    }
  },

  async markNotificationAsRead(notificationId: string) {
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
      throw error
    }
  },

  async markAllNotificationsAsRead(userId: string) {
    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error)
      throw error
    }
  },

  async deleteNotification(notificationId: string) {
    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error("Erro ao deletar notificação:", error)
      throw error
    }
  },

  async getUnreadNotificationsCount(userId: string) {
    try {
      const supabase = getSupabaseClient()

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false)

      if (error) {
        throw error
      }

      return count || 0
    } catch (error) {
      console.error("Erro ao contar notificações não lidas:", error)
      return 0
    }
  },
}
