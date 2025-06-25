import { createClient } from "@supabase/supabase-js"

// Função para criar um cliente Supabase seguro
const createSafeClient = () => {
  // Verifica se estamos no navegador
  if (typeof window !== "undefined") {
    // Tenta obter as variáveis do localStorage (para desenvolvimento)
    const storedUrl = localStorage.getItem("SUPABASE_URL")
    const storedKey = localStorage.getItem("SUPABASE_KEY")

    // Se temos valores armazenados, use-os
    if (storedUrl && storedKey) {
      return createClient(storedUrl, storedKey)
    }
  }

  // Verifica se as variáveis de ambiente estão definidas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se as variáveis estão definidas, crie o cliente normalmente
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  // Se chegamos aqui, não temos as variáveis necessárias
  // Em vez de criar um cliente inválido, retornamos null
  return null
}

// Cliente Supabase (pode ser null se não configurado)
export const supabaseClient = createSafeClient()

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  // Verifica se o cliente foi criado com sucesso
  return supabaseClient !== null
}

// Função para obter o cliente Supabase com verificação de segurança
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    throw new Error(
      "Supabase não está configurado. Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }
  return supabaseClient
}
