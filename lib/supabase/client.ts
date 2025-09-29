import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Create a singleton instance
export const supabase = createClient()

// Export aliases for compatibility
export const createClientSupabaseClient = createClient
export const supabaseClient = supabase

// Função para verificar se o Supabase está configurado
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Função para obter o cliente Supabase com verificação de segurança
export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não está configurado. Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }
  return supabase
}

export default supabase
