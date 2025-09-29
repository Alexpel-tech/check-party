import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Teste de conexão básica
    const startTime = Date.now()
    const { data, error, count } = await supabase.from("parties").select("*", { count: "exact", head: true })

    const responseTime = Date.now() - startTime

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: `Erro de conexão: ${error.message}`,
          details: {
            error: error.message,
            code: error.code,
            hint: error.hint,
          },
        },
        { status: 500 },
      )
    }

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    return NextResponse.json({
      success: true,
      message: "Banco de dados conectado e funcionando",
      details: {
        connectionTime: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        tablesAccessible: true,
        partiesCount: count || 0,
        authStatus: authError ? "Não autenticado" : "Autenticado",
      },
    })
  } catch (error) {
    console.error("Erro no health check do banco:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao verificar banco de dados",
        details: {
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      },
      { status: 500 },
    )
  }
}
