"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabaseClient, isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any | null; user: User | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured()) {
      setIsConfigured(false)
      setIsLoading(false)
      return
    }

    // Verificar se há uma sessão ativa
    const getSession = async () => {
      try {
        setIsLoading(true)
        const client = getSupabaseClient()
        const { data, error } = await client.auth.getSession()

        if (!error && data.session) {
          setSession(data.session)
          setUser(data.session.user)
        }
      } catch (error) {
        console.error("Erro ao obter sessão:", error)
        setIsConfigured(false)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Configurar listener para mudanças de autenticação
    try {
      if (supabaseClient) {
        const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)
        })

        return () => {
          if (authListener?.subscription) {
            authListener.subscription.unsubscribe()
          }
        }
      }
    } catch (error) {
      console.error("Erro ao configurar listener de autenticação:", error)
      setIsConfigured(false)
      setIsLoading(false)
    }

    return () => {}
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      return { error: new Error("Supabase não configurado") }
    }

    try {
      const client = getSupabaseClient()
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    if (!isConfigured) {
      return { error: new Error("Supabase não configurado"), user: null }
    }

    try {
      const client = getSupabaseClient()
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })
      return { error, user: data?.user || null }
    } catch (error) {
      console.error("Erro ao registrar:", error)
      return { error, user: null }
    }
  }

  const signOut = async () => {
    if (!isConfigured) return

    try {
      const client = getSupabaseClient()
      await client.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      return { error: new Error("Supabase não configurado") }
    }

    try {
      const client = getSupabaseClient()
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      console.error("Erro ao resetar senha:", error)
      return { error }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    isConfigured,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
