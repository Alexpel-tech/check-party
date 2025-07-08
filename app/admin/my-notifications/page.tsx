"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Bell, Check, CheckCheck, Trash2, TestTube, Loader2 } from "lucide-react"
import { NotificationService } from "@/lib/adapters/notification-service-adapter"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import type { Notification } from "@/lib/types"

export default function MyNotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const data = await NotificationService.getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error("Erro ao carregar notificações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      setIsUpdating(id)
      await NotificationService.markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      toast({
        title: "Sucesso",
        description: "Notificação marcada como lida.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setIsUpdating("all")
      await NotificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsUpdating(id)
      await NotificationService.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      toast({
        title: "Sucesso",
        description: "Notificação excluída com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a notificação.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleSendTest = async () => {
    try {
      setIsUpdating("test")
      await NotificationService.createNotification({
        user_id: "current", // Será substituído pelo ID do usuário atual no backend
        title: "Notificação de Teste",
        message: `Esta é uma notificação de teste enviada em ${new Date().toLocaleString("pt-BR")}.`,
        type: "info",
      })
      toast({
        title: "Sucesso",
        description: "Notificação de teste enviada! Recarregue a página para vê-la.",
      })
      // Recarregar notificações após um breve delay
      setTimeout(loadNotifications, 1000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação de teste.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "🎉"
      case "warning":
        return "⚠️"
      case "error":
        return "❌"
      case "info":
        return "ℹ️"
      default:
        return "📢"
    }
  }

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case "success":
        return "default"
      case "warning":
        return "secondary"
      case "error":
        return "destructive"
      case "info":
        return "outline"
      default:
        return "outline"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar activeTab="my-notifications" />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-purple-800 mb-2">Minhas Notificações</h1>
            <p className="text-gray-600">Gerencie suas notificações e mantenha-se atualizado.</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificações
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {unreadCount} não lidas
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {notifications.length === 0
                      ? "Você não possui notificações."
                      : `${notifications.length} notificação${notifications.length !== 1 ? "ões" : ""} no total.`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSendTest} disabled={isUpdating === "test"}>
                    {isUpdating === "test" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Enviar Teste
                  </Button>
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={isUpdating === "all"}>
                      {isUpdating === "all" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCheck className="h-4 w-4 mr-2" />
                      )}
                      Marcar Todas como Lidas
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Carregando notificações...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Nenhuma notificação</p>
                  <p className="text-sm">Você não possui notificações no momento.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendTest}
                    disabled={isUpdating === "test"}
                    className="mt-4 bg-transparent"
                  >
                    {isUpdating === "test" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Enviar Notificação de Teste
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        !notification.read
                          ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                          : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">{notification.title}</h3>
                              <Badge variant={getNotificationBadgeVariant(notification.type)} className="text-xs">
                                {notification.type}
                              </Badge>
                              {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{notification.message}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </span>
                              {notification.link && (
                                <Link
                                  href={notification.link}
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Ver detalhes →
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={isUpdating === notification.id}
                              title="Marcar como lida"
                            >
                              {isUpdating === notification.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            disabled={isUpdating === notification.id}
                            className="text-red-500 hover:text-red-700"
                            title="Excluir"
                          >
                            {isUpdating === notification.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
