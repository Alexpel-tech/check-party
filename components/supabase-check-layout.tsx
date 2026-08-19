"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { SupabaseConfigWarning } from "./supabase-config-warning"

export function SupabaseCheckLayout({ children }: { children: React.ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Verifica se as variáveis de ambiente estão configuradas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Verifica se há configuração no localStorage (para desenvolvimento)
    const storedUrl = localStorage.getItem("SUPABASE_URL")
    const storedKey = localStorage.getItem("SUPABASE_KEY")

    setIsConfigured(!!(supabaseUrl && supabaseKey) || !!(storedUrl && storedKey))
  }, [])

  // Não renderiza nada durante a hidratação para evitar erros
  if (!isClient) return null

  // Se não estiver configurado, mostra o aviso
  if (!isConfigured) {
    return <SupabaseConfigWarning />
  }

  // Se estiver configurado, renderiza os filhos normalmente
  return <>{children}</>
}
