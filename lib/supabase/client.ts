import { createBrowserClient } from "@supabase/ssr"

export function createClientSupabaseClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Create a singleton instance
export const supabase = createClientSupabaseClient()

// Export aliases for compatibility
export const createClient = createClientSupabaseClient
export const supabaseClient = supabase

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Função para obter o cliente Supabase com verificação de segurança
export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não está configurado. Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }
  return supabase
}

export default supabase
