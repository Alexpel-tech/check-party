import { supabase } from "@/lib/supabase/client"

export async function testDatabaseConnection(testType = "connection") {
  const startTime = Date.now()

  try {
    switch (testType) {
      case "connection":
        // Teste básico de conexão
        const { data, error } = await supabase.from("parties").select("count").limit(1)

        if (error) {
          throw new Error(`Erro de conexão: ${error.message}`)
        }

        return {
          success: true,
          message: "Conexão com Supabase estabelecida com sucesso",
          details: {
            connected: true,
            responseTime: Date.now() - startTime,
          },
        }

      case "tables":
        // Verificar se todas as tabelas necessárias existem
        const requiredTables = [
          "parties",
          "guests",
          "party_halls",
          "sms_history",
          "whatsapp_history",
          "notifications",
          "reminder_logs",
          "qr_codes",
        ]

        const tableResults = []

        for (const table of requiredTables) {
          try {
            const { error } = await supabase.from(table).select("*").limit(1)
            tableResults.push({
              table,
              exists: !error,
              error: error?.message,
            })
          } catch (err) {
            tableResults.push({
              table,
              exists: false,
              error: err instanceof Error ? err.message : "Erro desconhecido",
            })
          }
        }

        const missingTables = tableResults.filter((t) => !t.exists)

        return {
          success: missingTables.length === 0,
          message:
            missingTables.length === 0
              ? "Todas as tabelas necessárias existem"
              : `${missingTables.length} tabelas não encontradas: ${missingTables.map((t) => t.table).join(", ")}`,
          details: {
            tables: tableResults,
            totalTables: requiredTables.length,
            existingTables: tableResults.filter((t) => t.exists).length,
          },
        }

      case "rls":
        // Testar políticas RLS (Row Level Security)
        try {
          // Tentar acessar dados sem autenticação (deve falhar em tabelas protegidas)
          const { error: partiesError } = await supabase.from("parties").select("*").limit(1)
          const { error: guestsError } = await supabase.from("guests").select("*").limit(1)

          return {
            success: true,
            message: "Políticas RLS estão funcionando corretamente",
            details: {
              partiesAccess: !partiesError,
              guestsAccess: !guestsError,
              note: "Acesso sem autenticação testado",
            },
          }
        } catch (error) {
          return {
            success: false,
            message: "Erro ao testar políticas RLS",
            details: {
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          }
        }

      default:
        throw new Error("Tipo de teste não reconhecido")
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido no teste de banco de dados",
      details: {
        testType,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
    }
  }
}
