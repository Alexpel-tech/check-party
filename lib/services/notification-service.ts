"use server"

import { createClient } from "@/lib/supabase/server"

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "success" | "error" | "warning" | "info" | "default"
  read: boolean
  created_at: string
}

export async function createNotification(notification: {
  user_id: string
  title: string
  message: string
  type: "success" | "error" | "warning" | "info" | "default"
}) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: false,
    })
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar notificação:", error)
    throw error
  }

  return data
}

export async function getUserNotifications(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar notificações:", error)
    throw error
  }

  return data as Notification[]
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

  if (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    throw error
  }

  return { success: true }
}

export async function deleteNotification(notificationId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

  if (error) {
    console.error("Erro ao excluir notificação:", error)
    throw error
  }

  return { success: true }
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", userId)

  if (error) {
    console.error("Erro ao marcar todas as notificações como lidas:", error)
    throw error
  }

  return { success: true }
}
