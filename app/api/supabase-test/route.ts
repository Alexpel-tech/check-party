import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Tenta fazer uma consulta simples
    const { data, error } = await supabase.from("guests").select("id").limit(1)

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao conectar com o Supabase",
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Conexão com o Supabase estabelecida com sucesso!",
      data,
    })
  } catch (error) {
    console.error("Erro ao testar conexão:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao testar conexão com o Supabase",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
