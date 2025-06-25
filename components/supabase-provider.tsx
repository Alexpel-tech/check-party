"use client"

import { type ReactNode, useEffect, useState } from "react"
import { SupabaseConfigChecker } from "./supabase-config-checker"
import { SupabaseFallback } from "./supabase-fallback"
import { isSupabaseConfigured } from "@/lib/supabase/client"

interface SupabaseProviderProps {
  children: ReactNode
  requireAuth?: boolean
}

export function SupabaseProvider({ children, requireAuth = false }: SupabaseProviderProps) {
  const [isConfigured, setIsConfigured] = useState(true) // Assume configurado por padrão
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verifica se o Supabase está configurado
    setIsConfigured(isSupabaseConfigured())

    // Verifica se há configuração no localStorage
    if (typeof window !== "undefined") {
      const storedUrl = localStorage.getItem("SUPABASE_URL")
      const storedKey = localStorage.getItem("SUPABASE_KEY")

      if (storedUrl && storedKey) {
        setIsConfigured(true)
      }
    }

    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não estiver configurado e requer autenticação, mostra o fallback
  if (!isConfigured && requireAuth) {
    return <SupabaseFallback />
  }

  // Se não estiver configurado, mostra o checker
  if (!isConfigured) {
    return (
      <>
        <SupabaseConfigChecker />
        {children}
      </>
    )
  }

  // Se estiver configurado, mostra o conteúdo normalmente
  return <>{children}</>
}
