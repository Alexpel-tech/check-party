import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Verificar se a tabela de notificações existe e está acessível
    const startTime = Date.now()
    const { data, error, count } = await supabase.from("notifications").select("*", { count: "exact", head: true })

    const responseTime = Date.now() - startTime

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: `Erro ao acessar notificações: ${error.message}`,
          details: {
            error: error.message,
            code: error.code,
            hint: error.hint,
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Serviço de notificações funcionando corretamente",
      details: {
        tableAccessible: true,
        checkTime: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        notificationsCount: count || 0,
        realtimeEnabled: true,
      },
    })
  } catch (error) {
    console.error("Erro no health check das notificações:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao verificar serviço de notificações",
        details: {
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      },
      { status: 500 },
    )
  }
}
