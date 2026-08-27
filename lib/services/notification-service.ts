"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

interface Notification {
  id?: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at?: string
  link?: string
}

export async function createNotification(notification: Omit<Notification, "id" | "created_at" | "read">) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        ...notification,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao criar notificação:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function getNotifications(userId: string, unreadOnly = false) {
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (unreadOnly) {
      query = query.eq("read", false)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao marcar todas as notificações como lidas:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar notificação:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function getUnreadCount(userId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false)

    if (error) throw error

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error("Erro ao contar notificações não lidas:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      count: 0,
    }
  }
}

// Funções de conveniência para tipos específicos de notificação
export async function notifyGuestConfirmation(
  userId: string,
  guestName: string,
  partyName: string,
  partyId: string,
  guestId: string,
) {
  return createNotification({
    user_id: userId,
    title: "Nova Confirmação",
    message: `${guestName} confirmou presença na festa "${partyName}"`,
    type: "success",
    link: `/admin/parties/${partyId}`,
  })
}

export async function notifyGuestDecline(
  userId: string,
  guestName: string,
  partyName: string,
  partyId: string,
  guestId: string,
) {
  return createNotification({
    user_id: userId,
    title: "Convidado Declinou",
    message: `${guestName} declinou o convite para a festa "${partyName}"`,
    type: "warning",
    link: `/admin/parties/${partyId}`,
  })
}

export async function notifyReminderSent(userId: string, count: number, partyName: string, partyId: string) {
  return createNotification({
    user_id: userId,
    title: "Lembretes Enviados",
    message: `${count} lembretes foram enviados para a festa "${partyName}"`,
    type: "info",
    link: `/admin/parties/${partyId}`,
  })
}

export async function notifyPaymentReceived(userId: string, planName: string, amount: number) {
  return createNotification({
    user_id: userId,
    title: "Pagamento Recebido",
    message: `Pagamento de R$ ${amount.toFixed(2)} recebido para o plano ${planName}`,
    type: "success",
    link: "/admin/settings",
  })
}

// Export do serviço
export const NotificationService = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  notifyGuestConfirmation,
  notifyGuestDecline,
  notifyReminderSent,
  notifyPaymentReceived,
}
