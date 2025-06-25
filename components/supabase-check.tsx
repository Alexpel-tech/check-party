"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { SupabaseConfigForm } from "./supabase-config-form"
import { isSupabaseConfigured } from "@/lib/supabase/client"

export function SupabaseCheck({ children }: { children: React.ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setIsConfigured(isSupabaseConfigured())
  }, [])

  // Não renderiza nada durante a hidratação para evitar erros
  if (!isClient) {
    return null
  }

  // Se não estiver configurado, mostra o formulário de configuração
  if (!isConfigured) {
    return (
      <>
        <SupabaseConfigForm />
        {children}
      </>
    )
  }

  // Se estiver configurado, renderiza os filhos normalmente
  return <>{children}</>
}
