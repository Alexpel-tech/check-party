"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth/auth-provider"
import { getSupabaseClient } from "@/lib/supabase/client"
import { NotificationService } from "@/lib/adapters/notification-service-adapter"
import type { Notification } from "@/lib/types"

export function useRealtimeNotifications() {
  const { user, isConfigured } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Buscar notificações iniciais
  const fetchNotifications = useCallback(async () => {
    if (!user || !isConfigured) {
      setIsLoading(false)
      return
    }

    try {
      const data = await NotificationService.getNotifications()
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.read).length)
    } catch (error) {
      console.error("Erro ao buscar notificações:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user, isConfigured])

  // Configurar realtime
  useEffect(() => {
    if (!user || !isConfigured) return

    fetchNotifications()

    const supabase = getSupabaseClient()

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          setNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)))

          // Recalcular unreadCount
          setNotifications((current) => {
            const newUnreadCount = current
              .map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
              .filter((n) => !n.read).length
            setUnreadCount(newUnreadCount)
            return current.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
          })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deletedId = payload.old.id
          setNotifications((prev) => {
            const filtered = prev.filter((n) => n.id !== deletedId)
            setUnreadCount(filtered.filter((n) => !n.read).length)
            return filtered
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, isConfigured, fetchNotifications])

  // Marcar como lida
  const markAsRead = useCallback(
    async (id: string) => {
      if (!isConfigured) return

      try {
        await NotificationService.markAsRead(id)
        // O realtime vai atualizar automaticamente
      } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error)
        throw error
      }
    },
    [isConfigured],
  )

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!isConfigured) return

    try {
      await NotificationService.markAllAsRead()
      // Atualizar localmente também para feedback imediato
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error)
      throw error
    }
  }, [isConfigured])

  // Excluir notificação
  const deleteNotification = useCallback(
    async (id: string) => {
      if (!isConfigured) return

      try {
        await NotificationService.deleteNotification(id)
        // O realtime vai atualizar automaticamente
      } catch (error) {
        console.error("Erro ao excluir notificação:", error)
        throw error
      }
    },
    [isConfigured],
  )

  // Enviar notificação de teste
  const sendTestNotification = useCallback(async () => {
    if (!user || !isConfigured) return

    try {
      await NotificationService.createNotification({
        user_id: user.id,
        title: "Notificação de Teste",
        message: `Esta é uma notificação de teste enviada em ${new Date().toLocaleString("pt-BR")}.`,
        type: "info",
      })
    } catch (error) {
      console.error("Erro ao enviar notificação de teste:", error)
      throw error
    }
  }, [user, isConfigured])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
    refetch: fetchNotifications,
  }
}
