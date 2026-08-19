import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Lazy singleton instance - only created when first accessed, not at module load time.
// This avoids crashing the build/server when this module is imported but the
// environment variables aren't configured yet (e.g. static analysis during `next build`).
let _supabase: ReturnType<typeof createClient> | undefined
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop, receiver) {
    if (!_supabase) {
      _supabase = createClient()
    }
    return Reflect.get(_supabase, prop, receiver)
  },
})

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

