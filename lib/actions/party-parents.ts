"use server"

import { createServerClient } from "../supabase/server"
import type { PartyParent, NewPartyParent, ParentLoginCredentials, ParentSession } from "../types"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import * as bcrypt from "bcryptjs"

// Criar credenciais para os pais
export async function createPartyParent(
  partyParent: Omit<NewPartyParent, "password"> & { password: string },
): Promise<PartyParent | null> {
  const supabase = await createServerClient()

  // Hash da senha antes de armazenar
  const hashedPassword = await bcrypt.hash(partyParent.password, 10)

  const { data, error } = await supabase
    .from("party_parents")
    .insert({
      ...partyParent,
      password: hashedPassword,
    })
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar credenciais dos pais:", error)
    throw new Error("Falha ao criar credenciais dos pais")
  }

  revalidatePath("/admin/dashboard")
  return data
}

// Verificar credenciais dos pais
export async function verifyParentCredentials(credentials: ParentLoginCredentials): Promise<ParentSession | null> {
  const supabase = await createServerClient()

  // Buscar usuário pelo username
  const { data: parent, error } = await supabase
    .from("party_parents")
    .select("id, party_id, username, password")
    .eq("username", credentials.username)
    .single()

  if (error || !parent) {
    console.error("Erro ao buscar credenciais:", error)
    return null
  }

  // Verificar senha
  const passwordMatch = await bcrypt.compare(credentials.password, parent.password)
  if (!passwordMatch) {
    return null
  }

  // Criar sessão
  const session: ParentSession = {
    id: parent.id,
    party_id: parent.party_id,
    username: parent.username,
  }

  // Armazenar sessão em cookie
  const cookieStore = cookies()
  cookieStore.set("parent_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 dia
    path: "/",
  })

  return session
}

// Obter sessão atual dos pais
export async function getParentSession(): Promise<ParentSession | null> {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("parent_session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session: ParentSession = JSON.parse(sessionCookie.value)
    return session
  } catch (error) {
    console.error("Erro ao analisar sessão:", error)
    return null
  }
}

// Encerrar sessão dos pais
export async function logoutParent(): Promise<boolean> {
  const cookieStore = cookies()
  cookieStore.delete("parent_session")
  return true
}

// Gerar nome de usuário único para os pais
export async function generateParentUsername(partyName: string): Promise<string> {
  const normalizedName = partyName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "")

  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `pais_${normalizedName}_${randomSuffix}`
}

// Gerar senha aleatória
export async function generateRandomPassword(length = 8): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
