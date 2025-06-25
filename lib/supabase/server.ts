import { createClient as supabaseCreateClient } from "@supabase/supabase-js" // Aliased to avoid potential naming conflicts if 'createClient' is used locally
import { cookies } from "next/headers"

// Função para criar um cliente Supabase para uso no lado do servidor
export function createServerClient() {
  // Reverted to original name
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing in server environment variables.")
    throw new Error("Variáveis de ambiente do Supabase não estão configuradas corretamente no servidor.")
  }

  return supabaseCreateClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // This can happen in Server Components when trying to set a cookie
          // Server Components should not typically set cookies directly.
          // Route Handlers or Server Actions are the place for that.
          console.warn(`Failed to set cookie '${name}' from a server context where it might not be allowed.`, error)
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // This can happen in Server Components
          console.warn(`Failed to remove cookie '${name}' from a server context where it might not be allowed.`, error)
        }
      },
    },
  })
}

// Função para verificar se o Supabase está configurado no servidor
export function isServerSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
