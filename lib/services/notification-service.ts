"use server"

import { createServerClient } from "@/lib/supabase/server"

// Função para criar notificação
export async function createNotification(notification: {
  userId: string
  title: string
  message: string
  type?: string
  link?: string
}) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || "default",
        link: notification.link,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Erro ao criar notificação:", error)
    throw error
  }
}

// Função para buscar notificações do usuário
export async function getUserNotifications(userId: string, limit = 50) {
  try {
    const supabase = createServerClient()

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
}

// Função para marcar notificação como lida
export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = createServerClient()

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
}

// Função para marcar todas as notificações como lidas
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const supabase = createServerClient()

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
}

// Função para deletar notificação
export async function deleteNotification(notificationId: string) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar notificação:", error)
    throw error
  }
}

// Função para contar notificações não lidas
export async function getUnreadNotificationsCount(userId: string) {
  try {
    const supabase = createServerClient()

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
}

// Função para criar notificação de confirmação de presença
export async function createGuestConfirmationNotification(userId: string, guestName: string, partyName: string) {
  return await createNotification({
    userId,
    title: "Nova confirmação de presença",
    message: `${guestName} confirmou presença na festa: ${partyName}`,
    type: "guest_confirmation",
  })
}

// Função para criar notificação de nova festa
export async function createNewPartyNotification(userId: string, partyName: string) {
  return await createNotification({
    userId,
    title: "Nova festa criada",
    message: `A festa "${partyName}" foi criada com sucesso`,
    type: "new_party",
  })
}

// Exportar objeto NotificationService para compatibilidade
export const NotificationService = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationsCount,
  createGuestConfirmationNotification,
  createNewPartyNotification,
}
