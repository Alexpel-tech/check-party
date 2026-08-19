import { supabase } from "@/lib/supabase/client"


export interface DatabaseTestResult {
  success: boolean
  message: string
  details?: any
  error?: string
}

export async function testDatabaseConnection(): Promise<DatabaseTestResult> {
  try {
    const { data, error } = await supabase.from("parties").select("count").limit(1)

    if (error) {
      return {
        success: false,
        message: "Erro na conexão com o banco de dados",
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Conexão com banco de dados estabelecida com sucesso",
      details: { connected: true, timestamp: new Date().toISOString() },
    }
  } catch (error) {
    return {
      success: false,
      message: "Falha na conexão com o banco de dados",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function testTableStructure(): Promise<DatabaseTestResult> {
  try {
    const tables = ["parties", "guests", "party_halls", "qr_codes", "sms_history", "whatsapp_history", "notifications"]
    const results = []

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1)
        results.push({
          table,
          exists: !error,
          error: error?.message,
        })
      } catch (err) {
        results.push({
          table,
          exists: false,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }
    }

    const allTablesExist = results.every((r) => r.exists)

    return {
      success: allTablesExist,
      message: allTablesExist ? "Todas as tabelas existem" : "Algumas tabelas estão ausentes",
      details: results,
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro ao verificar estrutura das tabelas",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function testAuthentication(): Promise<DatabaseTestResult> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    return {
      success: true,
      message: user ? "Usuário autenticado" : "Nenhum usuário autenticado",
      details: {
        authenticated: !!user,
        userId: user?.id,
        email: user?.email,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: "Erro ao verificar autenticação",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function runAllDatabaseTests(): Promise<DatabaseTestResult[]> {
  const tests = [testDatabaseConnection, testTableStructure, testAuthentication]

  const results = []
  for (const test of tests) {
    try {
      const result = await test()
      results.push(result)
    } catch (error) {
      results.push({
        success: false,
        message: `Erro ao executar teste: ${test.name}`,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  return results
}
