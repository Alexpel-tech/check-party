"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs" // Import Session
import { NotificationService, type Notification } from "@/lib/adapters/notification-service-adapter"
import { useToast } from "@/components/ui/use-toast"

export function useRealtimeNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const fetchInitialNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    try {
      const initialData = await NotificationService.getUserNotifications(userId, 20)
      setNotifications(initialData)
      setUnreadCount(initialData.filter((n) => !n.read).length)
    } catch (error) {
      console.error("Erro ao buscar notificações iniciais:", error)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    fetchInitialNotifications()

    const channel = supabase
      .channel(`realtime_notifications_user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(
            (prev) =>
              [newNotification, ...prev]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 50), // Limitar o número de notificações em memória
          )
          if (!newNotification.read) {
            setUnreadCount((prev) => prev + 1)
          }
          toast({
            title: newNotification.title,
            description: newNotification.message,
            duration: 7000, // Aumentar duração para dar tempo de ler
          })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          const oldNotification = payload.old as Notification | undefined

          setNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)))

          if (oldNotification) {
            if (!oldNotification.read && updatedNotification.read) {
              setUnreadCount((prev) => Math.max(0, prev - 1))
            } else if (oldNotification.read && !updatedNotification.read) {
              setUnreadCount((prev) => prev + 1)
            }
          } else {
            // Se oldNotification não estiver disponível, recalcular
            setNotifications((prev) => {
              setUnreadCount(prev.filter((n) => !n.read).length)
              return prev
            })
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deletedNotification = payload.old as Notification
          setNotifications((prev) => prev.filter((n) => n.id !== deletedNotification.id))
          if (!deletedNotification.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
          }
        },
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(`Conectado ao canal de notificações para ${userId}!`)
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          console.error(`Erro no canal de notificações para ${userId}:`, status, err)
          // Poderia tentar reconectar aqui ou notificar o usuário
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, toast, fetchInitialNotifications])

  const markAsRead = async (notificationId: string) => {
    if (!userId) return
    try {
      await NotificationService.markNotificationAsRead(notificationId)
      // O evento UPDATE do Supabase Realtime deve atualizar o estado local
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
      toast({ title: "Erro", description: "Não foi possível marcar como lida.", variant: "destructive" })
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return
    try {
      await NotificationService.markAllNotificationsAsRead(userId)
      // O evento UPDATE do Supabase Realtime deve atualizar o estado local
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error)
      toast({ title: "Erro", description: "Não foi possível marcar todas como lidas.", variant: "destructive" })
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!userId) return
    try {
      await NotificationService.deleteNotification(notificationId)
      // O evento DELETE do Supabase Realtime deve atualizar o estado local
    } catch (error) {
      console.error("Erro ao excluir notificação:", error)
      toast({ title: "Erro", description: "Não foi possível excluir a notificação.", variant: "destructive" })
    }
  }

  const sendTestNotification = async () => {
    if (!userId) {
      toast({
        title: "Usuário não logado",
        description: "Faça login para enviar uma notificação de teste.",
        variant: "destructive",
      })
      return
    }
    try {
      await NotificationService.createNotification({
        user_id: userId,
        title: "Notificação de Teste 🚀",
        message: "Se você recebeu isso, o sistema de notificações em tempo real está funcionando!",
        type: "info",
        link: "/admin/my-notifications",
      })
      // O toast de sucesso é disparado pelo evento INSERT do realtime
    } catch (error) {
      console.error("Erro ao enviar notificação de teste:", error)
      toast({
        title: "Erro no Teste",
        description: "Não foi possível enviar a notificação de teste. Verifique o console.",
        variant: "destructive",
      })
    }
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchInitialNotifications, // Expor para uso externo se necessário
    sendTestNotification,
  }
}
