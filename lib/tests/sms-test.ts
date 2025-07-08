import { supabase } from "@/lib/supabase/client"

interface SMSTestOptions {
  to?: string
  message?: string
}

export async function testSMSService(testType = "config", options: SMSTestOptions = {}) {
  const startTime = Date.now()

  try {
    switch (testType) {
      case "config":
        // Verificar se as variáveis de ambiente do Twilio estão configuradas
        const requiredEnvVars = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"]

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
          message: "Configuração do Twilio está correta",
          details: {
            accountSid: process.env.TWILIO_ACCOUNT_SID ? "Configurado" : "Não configurado",
            authToken: process.env.TWILIO_AUTH_TOKEN ? "Configurado" : "Não configurado",
            phoneNumber: process.env.TWILIO_PHONE_NUMBER || "Não configurado",
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
          // Simular envio de SMS (em produção, chamaria a API do Twilio)
          const response = await fetch("/api/sms/send", {
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
            throw new Error(result.error || "Erro ao enviar SMS")
          }

          return {
            success: true,
            message: `SMS enviado com sucesso para ${options.to}`,
            details: {
              to: options.to,
              message: options.message,
              sid: result.sid,
              status: result.status,
              responseTime: Date.now() - startTime,
            },
          }
        } catch (error) {
          return {
            success: false,
            message: `Erro ao enviar SMS: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            details: {
              to: options.to,
              message: options.message,
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          }
        }

      case "history":
        // Verificar se o histórico de SMS está sendo salvo
        try {
          const { data, error } = await supabase
            .from("sms_history")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5)

          if (error) {
            throw new Error(`Erro ao buscar histórico: ${error.message}`)
          }

          return {
            success: true,
            message: `Histórico de SMS encontrado: ${data?.length || 0} registros`,
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
        throw new Error("Tipo de teste SMS não reconhecido")
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido no teste de SMS",
      details: {
        testType,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
    }
  }
}
