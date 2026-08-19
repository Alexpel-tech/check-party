import { supabase } from "@/lib/supabase/client"


export interface NotificationTestResult {
  success: boolean
  message: string
  details?: any
  error?: string
}

export async function testNotificationCreation(): Promise<NotificationTestResult> {
  try {
    const testNotification = {
      title: "Teste de Notificação",
      message: "Esta é uma notificação de teste do sistema",
      type: "info",
      user_id: null, // Notificação global
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("notifications").insert(testNotification).select().single()

    if (error) {
      return {
        success: false,
        message: "Falha ao criar notificação de teste",
        error: error.message,
      }
    }

    // Limpar notificação de teste
    await supabase.from("notifications").delete().eq("id", data.id)

    return {
      success: true,
      message: "Notificação criada e removida com sucesso",
      details: { notificationId: data.id },
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro ao testar criação de notificação",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function testRealtimeNotifications(): Promise<NotificationTestResult> {
  try {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          message: "Timeout no teste de notificações em tempo real",
        })
      }, 5000)

      const channel = supabase
        .channel("test-notifications")
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (payload) => {
          clearTimeout(timeout)
          resolve({
            success: true,
            message: "Notificações em tempo real funcionando",
            details: { payload },
          })
        })
        .subscribe()

      // Criar uma notificação de teste para disparar o evento
      setTimeout(async () => {
        await supabase.from("notifications").insert({
          title: "Teste Realtime",
          message: "Teste de notificação em tempo real",
          type: "test",
          created_at: new Date().toISOString(),
        })
      }, 1000)
    })
  } catch (error) {
    return {
      success: false,
      message: "Erro ao testar notificações em tempo real",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function runAllNotificationTests(): Promise<NotificationTestResult[]> {
  const results = []

  // Teste de criação
  results.push(await testNotificationCreation())

  // Teste de tempo real
  results.push(await testRealtimeNotifications())

  return results
}
