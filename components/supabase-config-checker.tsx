"use client"

import { useState, useEffect } from "react"
import { SupabaseConfigForm } from "./supabase-config-form"

export function SupabaseConfigChecker() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [showConfig, setShowConfig] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Verifica se as variáveis de ambiente estão configuradas
    const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const envSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Verifica se há configuração no localStorage (para desenvolvimento)
    const storedUrl = typeof window !== "undefined" ? localStorage.getItem("SUPABASE_URL") : null
    const storedKey = typeof window !== "undefined" ? localStorage.getItem("SUPABASE_KEY") : null

    const isConfigured = !!(envSupabaseUrl && envSupabaseKey) || !!(storedUrl && storedKey)

    setShowConfig(!isConfigured)

    // Tenta obter valores do localStorage
    if (storedUrl) setSupabaseUrl(storedUrl)
    if (storedKey) setSupabaseKey(storedKey)
  }, [])

  const saveConfig = () => {
    // Salva no localStorage para desenvolvimento
    localStorage.setItem("SUPABASE_URL", supabaseUrl)
    localStorage.setItem("SUPABASE_KEY", supabaseKey)

    setIsSaved(true)

    // Recarrega a página após 2 segundos para aplicar as alterações
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  // Não renderiza nada durante a hidratação para evitar erros
  if (!isClient) return null

  // Se não estiver configurado, mostra o formulário
  if (showConfig) {
    return <SupabaseConfigForm />
  }

  return null
}
