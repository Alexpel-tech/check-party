import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Função para criar um cliente Supabase para uso no lado do servidor
export function createServerClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variáveis de ambiente do Supabase não estão configuradas corretamente.")
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
          console.warn(`Failed to set cookie '${name}' from a server context.`, error)
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          console.warn(`Failed to remove cookie '${name}' from a server context.`, error)
        }
      },
    },
  })
}

// Exportar também como createClient para compatibilidade
export { createServerClient as createClient }

// Função para verificar se o Supabase está configurado no servidor
export function isServerSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
