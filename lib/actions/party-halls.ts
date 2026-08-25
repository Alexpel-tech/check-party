"use server"

import { createServerClient } from "../supabase/server"
import type { PartyHall, NewPartyHall } from "../types"
import { revalidatePath } from "next/cache"

// Retorna o usuário logado ou lança erro se não houver sessão
async function getCurrentUserId(supabase: Awaited<ReturnType<typeof createServerClient>>): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  return user.id
}

// Buscar salões de festa.
// Na área administrativa (usuário logado), retorna somente os salões do
// próprio usuário. Na página pública de confirmação do convidado (sem
// login), retorna todos os salões, já que o visitante precisa localizar
// a festa de qualquer salão.
export async function getPartyHalls(): Promise<PartyHall[]> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase.from("party_halls").select("*").order("name")
  if (user) {
    query = query.eq("user_id", user.id)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao buscar salões:", error)
    throw new Error("Falha ao buscar salões de festa")
  }

  return data || []
}

// Buscar um salão de festa por ID (somente se pertencer ao usuário logado)
export async function getPartyHallById(id: string): Promise<PartyHall | null> {
  const supabase = await createServerClient()
  const userId = await getCurrentUserId(supabase)

  const { data, error } = await supabase.from("party_halls").select("*").eq("id", id).eq("user_id", userId).single()

  if (error) {
    console.error("Erro ao buscar salão:", error)
    return null
  }

  return data
}

// Criar um novo salão de festa (o dono é sempre o usuário logado, nunca um valor vindo do cliente)
export async function createPartyHall(partyHall: NewPartyHall): Promise<PartyHall | null> {
  const supabase = await createServerClient()
  const userId = await getCurrentUserId(supabase)

  const { data, error } = await supabase
    .from("party_halls")
    .insert({ ...partyHall, user_id: userId })
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar salão:", error)
    throw new Error("Falha ao criar salão de festa")
  }

  revalidatePath("/admin/dashboard")
  return data
}

// Atualizar um salão de festa (somente se pertencer ao usuário logado)
export async function updatePartyHall(id: string, partyHall: Partial<PartyHall>): Promise<PartyHall | null> {
  const supabase = await createServerClient()
  const userId = await getCurrentUserId(supabase)

  const { data, error } = await supabase
    .from("party_halls")
    .update({ ...partyHall, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar salão:", error)
    throw new Error("Falha ao atualizar salão de festa")
  }

  revalidatePath("/admin/dashboard")
  return data
}

// Excluir um salão de festa (somente se pertencer ao usuário logado)
export async function deletePartyHall(id: string): Promise<boolean> {
  const supabase = await createServerClient()
  const userId = await getCurrentUserId(supabase)

  const { error } = await supabase.from("party_halls").delete().eq("id", id).eq("user_id", userId)

  if (error) {
    console.error("Erro ao excluir salão:", error)
    throw new Error("Falha ao excluir salão de festa")
  }

  revalidatePath("/admin/dashboard")
  return true
}
