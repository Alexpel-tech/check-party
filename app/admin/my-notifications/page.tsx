"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-provider"
import { NotificationService, type Notification } from "@/lib/adapters/notification-service-adapter"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trash2, Eye, CheckCheck, Bell } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useRealtimeNotifications } from "@/lib/hooks/use-realtime-notifications"

export default function MyNotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Inicializa o hook useRealtimeNotifications aqui para ter acesso a sendTestNotification
  // e para que ele comece a ouvir os eventos de notificação.
  const { sendTestNotification: sendTestNotificationHook, fetchInitialNotifications } = useRealtimeNotifications(
    user?.id,
  )

  const handleSendTestNotification = async () => {
    if (!user || !sendTestNotificationHook) return
    await sendTestNotificationHook()
    // O toast de sucesso já é tratado dentro do hook sendTestNotification
  }

  const loadNotifications = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      // Usar fetchInitialNotifications do hook para consistência, se ele popular o estado que usamos
      // Ou manter a busca direta se o hook não expor as notificações diretamente para esta página
      const data = await NotificationService.getUserNotifications(user.id)
      setNotifications(data)
    } catch (error) {
      console.error("Erro ao buscar notificações:", error)
      toast({ title: "Erro", description: "Não foi possível carregar as notificações.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user])

  // Efeito para atualizar as notificações da página quando o hook receber novas
  useEffect(() => {
    if (user) {
      const supabase = NotificationService.getSupabaseClient() // Supondo que NotificationService possa fornecer o client
      const channel = supabase
        .channel(`my-notifications-page-updates:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Ouvir INSERT, UPDATE, DELETE
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadNotifications() // Recarregar as notificações na página
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markNotificationAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      toast({ title: "Sucesso", description: "Notificação marcada como lida." })
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível marcar como lida.", variant: "destructive" })
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    try {
      await NotificationService.markAllNotificationsAsRead(user.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast({ title: "Sucesso", description: "Todas as notificações foram marcadas como lidas." })
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível marcar todas como lidas.", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await NotificationService.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      toast({ title: "Sucesso", description: "Notificação excluída." })
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir a notificação.", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar activeTab="my-notifications" />
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Minhas Notificações</CardTitle>
                  <CardDescription>Veja todas as suas notificações aqui.</CardDescription>
                </div>
                <div className="flex gap-2">
                  {notifications.some((n) => !n.read) && (
                    <Button onClick={handleMarkAllAsRead} size="sm">
                      <CheckCheck className="mr-2 h-4 w-4" />
                      Marcar todas como lidas
                    </Button>
                  )}
                  <Button
                    onClick={handleSendTestNotification}
                    size="sm"
                    variant="outline"
                    disabled={!user || !sendTestNotificationHook}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Enviar Notificação de Teste
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Bell className="mx-auto h-12 w-12 mb-4" />
                  <p>Você não tem nenhuma notificação no momento.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={cn(
                        "p-4 rounded-lg border flex items-start justify-between gap-4",
                        notification.read ? "bg-muted/50" : "bg-card shadow-sm",
                        notification.type === "success" && !notification.read && "border-green-500/50",
                        notification.type === "error" && !notification.read && "border-red-500/50",
                        notification.type === "warning" && !notification.read && "border-yellow-500/50",
                        notification.type === "info" && !notification.read && "border-blue-500/50",
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={cn(
                              "h-2.5 w-2.5 rounded-full flex-shrink-0",
                              notification.type === "success" && "bg-green-500",
                              notification.type === "error" && "bg-red-500",
                              notification.type === "warning" && "bg-yellow-500",
                              notification.type === "info" && "bg-blue-500",
                              notification.type === "default" && "bg-primary",
                            )}
                          />
                          <h3 className={cn("font-semibold", !notification.read && "text-primary")}>
                            {notification.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(notification.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 items-center">
                        {!notification.read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            title="Marcar como lida"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Marcar como lida</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => handleDelete(notification.id)}
                          title="Excluir notificação"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
