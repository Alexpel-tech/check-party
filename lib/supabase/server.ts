import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { CookieOptions } from "@supabase/ssr" // Ensure this type is available or use 'any'

// Primary function name is createServerClient
export function createServerClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing in server environment variables for lib/supabase/server.ts")
    throw new Error("Variáveis de ambiente do Supabase não estão configuradas corretamente no servidor.")
  }

  return supabaseCreateClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          console.warn(`Failed to set cookie '${name}' from a server context in lib/supabase/server.ts.`, error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          console.warn(`Failed to remove cookie '${name}' from a server context in lib/supabase/server.ts.`, error)
        }
      },
    },
  })
}

// Exporting the same function under the alias 'createClient'
// This is to satisfy parts of the code that might be looking for this specific name.
export { createServerClient as createClient }

export function isServerSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
