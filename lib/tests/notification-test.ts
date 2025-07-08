import { supabase } from "@/lib/supabase/client"

export async function testNotificationService(testType = "create") {
  const startTime = Date.now()

  try {
    switch (testType) {
      case "create":
        // Testar criação de notificação
        try {
          const testNotification = {
            title: "Teste de Notificação",
            message: "Esta é uma notificação de teste criada em " + new Date().toLocaleString(),
            type: "info" as const,
            user_id: "test-user-" + Date.now(),
            party_id: "test-party-" + Date.now(),
          }

          const { data, error } = await supabase.from("notifications").insert(testNotification).select().single()

          if (error) {
            throw new Error(`Erro ao criar notificação: ${error.message}`)
          }

          return {
            success: true,
            message: "Notificação criada com sucesso",
            details: {
              notificationId: data.id,
              title: data.title,
              message: data.message,
              type: data.type,
              createdAt: data.created_at,
              responseTime: Date.now() - startTime,
            },
          }
        } catch (error) {
          return {
            success: false,
            message: `Erro ao criar notificação: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            details: {
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          }
        }

      case "fetch":
        // Testar busca de notificações
        try {
          const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10)

          if (error) {
            throw new Error(`Erro ao buscar notificações: ${error.message}`)
          }

          return {
            success: true,
            message: `${data?.length || 0} notificações encontradas`,
            details: {
              totalNotifications: data?.length || 0,
              recentNotifications: data?.slice(0, 3).map((notification) => ({
                id: notification.id,
                title: notification.title,
                type: notification.type,
                read: notification.read,
                createdAt: notification.created_at,
              })),
              responseTime: Date.now() - startTime,
            },
          }
        } catch (error) {
          return {
            success: false,
            message: `Erro ao buscar notificações: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            details: {
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          }
        }

      case "read":
        // Testar marcar notificação como lida
        try {
          // Primeiro, buscar uma notificação não lida
          const { data: unreadNotifications, error: fetchError } = await supabase
            .from("notifications")
            .select("*")
            .eq("read", false)
            .limit(1)

          if (fetchError) {
            throw new Error(`Erro ao buscar notificação não lida: ${fetchError.message}`)
          }

          if (!unreadNotifications || unreadNotifications.length === 0) {
            // Criar uma notificação de teste se não houver nenhuma não lida
            const { data: newNotification, error: createError } = await supabase
              .from("notifications")
              .insert({
                title: "Teste - Marcar como Lida",
                message: "Notificação criada para teste de marcação como lida",
                type: "info",
                user_id: "test-user-read-" + Date.now(),
                read: false,
              })
              .select()
              .single()

            if (createError || !newNotification) {
              throw new Error("Erro ao criar notificação de teste")
            }

            unreadNotifications.push(newNotification)
          }

          const notificationToRead = unreadNotifications[0]

          // Marcar como lida
          const { data, error } = await supabase
            .from("notifications")
            .update({ read: true, read_at: new Date().toISOString() })
            .eq("id", notificationToRead.id)
            .select()
            .single()

          if (error) {
            throw new Error(`Erro ao marcar notificação como lida: ${error.message}`)
          }

          return {
            success: true,
            message: "Notificação marcada como lida com sucesso",
            details: {
              notificationId: data.id,
              title: data.title,
              read: data.read,
              readAt: data.read_at,
              responseTime: Date.now() - startTime,
            },
          }
        } catch (error) {
          return {
            success: false,
            message: `Erro ao marcar notificação como lida: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            details: {
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          }
        }

      case "realtime":
        // Testar notificações em tempo real
        try {
          let realtimeWorking = false
          let subscriptionError = null

          // Criar uma subscription de teste
          const channel = supabase
            .channel("test-notifications")
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "notifications",
              },
              (payload) => {
                realtimeWorking = true
              },
            )
            .subscribe((status) => {
              if (status === "SUBSCRIBED") {
                // Subscription ativa
              } else if (status === "CHANNEL_ERROR") {
                subscriptionError = "Erro na subscription do canal"
              }
            })

          // Aguardar um pouco para a subscription ser estabelecida
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Criar uma notificação para testar o realtime
          const { error: insertError } = await supabase.from("notifications").insert({
            title: "Teste Realtime",
            message: "Notificação para testar funcionalidade em tempo real",
            type: "info",
            user_id: "test-user-realtime-" + Date.now(),
          })

          if (insertError) {
            throw new Error(`Erro ao criar notificação de teste: ${insertError.message}`)
          }

          // Aguardar um pouco para ver se o realtime funciona
          await new Promise((resolve) => setTimeout(resolve, 2000))

          // Limpar subscription
          await supabase.removeChannel(channel)

          return {
            success: realtimeWorking && !subscriptionError,
            message: realtimeWorking
              ? "Notificações em tempo real funcionando corretamente"
              : subscriptionError || "Notificações em tempo real não funcionaram",
            details: {
              realtimeWorking,
              subscriptionError,
              responseTime: Date.now() - startTime,
            },
          }
        } catch (error) {
          return {
            success: false,
            message: `Erro ao testar notificações em tempo real: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            details: {
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          }
        }

      default:
        throw new Error("Tipo de teste de notificação não reconhecido")
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido no teste de notificações",
      details: {
        testType,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
    }
  }
}
