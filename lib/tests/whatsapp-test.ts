import { supabase } from "@/lib/supabase/client"

interface WhatsAppTestOptions {
  to?: string
  message?: string
}

export async function testWhatsAppService(testType = "config", options: WhatsAppTestOptions = {}) {
  const startTime = Date.now()

  try {
    switch (testType) {
      case "config":
        // Verificar se as variáveis de ambiente do WhatsApp estão configuradas
        const requiredEnvVars = ["WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN"]

        const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

        if (missingVars.length > 0) {
          return {
            success: false,
            message: `Variáveis de ambiente não configuradas: ${missingVars.join(", ")}`,
            details: {
              missingVars,
              requiredVars: requiredEnvVars,
            },
          }
        }

        return {
          success: true,
          message: "Configuração do WhatsApp Business está correta",
          details: {
            phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? "Configurado" : "Não configurado",
            accessToken: process.env.WHATSAPP_ACCESS_TOKEN ? "Configurado" : "Não configurado",
          },
        }

      case "send":
        if (!options.to || !options.message) {
          return {
            success: false,
            message: "Número de telefone e mensagem são obrigatórios para teste de envio",
            details: { to: options.to, message: options.message },
          }
        }

        try {
          // Simular envio de mensagem WhatsApp
          const response = await fetch("/api/whatsapp/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: options.to,
              message: options.message,
              isTest: true,
            }),
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || "Erro ao enviar mensagem WhatsApp")
          }

          return {
            success: true,
            message: `Mensagem WhatsApp enviada com sucesso para ${options.to}`,
            details: {
              to: options.to,
              message: options.message,
              messageId: result.messageId,
              status: result.status,
              responseTime: Date.now() - startTime,
            },
          }
        } catch (error) {
          return {
            success: false,
            message: `Erro ao enviar WhatsApp: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            details: {
              to: options.to,
              message: options.message,
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          }
        }

      case "templates":
        // Verificar templates aprovados do WhatsApp
        try {
          const response = await fetch("/api/whatsapp/templates", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || "Erro ao buscar templates")
          }

          return {
            success: true,
            message: `${result.templates?.length || 0} templates encontrados`,
            details: {
              totalTemplates: result.templates?.length || 0,
              templates: result.templates?.slice(0, 3).map((template: any) => ({
                name: template.name,
                status: template.status,
                language: template.language,
              })),
            },
          }
        } catch (error) {
          return {
            success: false,
            message: `Erro ao verificar templates: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            details: {
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          }
        }

      case "history":
        // Verificar se o histórico de WhatsApp está sendo salvo
        try {
          const { data, error } = await supabase
            .from("whatsapp_history")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5)

          if (error) {
            throw new Error(`Erro ao buscar histórico: ${error.message}`)
          }

          return {
            success: true,
            message: `Histórico de WhatsApp encontrado: ${data?.length || 0} registros`,
            details: {
              totalRecords: data?.length || 0,
              recentRecords: data?.slice(0, 3).map((record) => ({
                id: record.id,
                to: record.to_number,
                status: record.status,
                createdAt: record.created_at,
              })),
            },
          }
        } catch (error) {
          return {
            success: false,
            message: `Erro ao verificar histórico: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            details: {
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          }
        }

      default:
        throw new Error("Tipo de teste WhatsApp não reconhecido")
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido no teste de WhatsApp",
      details: {
        testType,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
    }
  }
}
