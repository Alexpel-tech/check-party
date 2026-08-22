"use server"

import { createServerClient } from "../supabase/server"
import type { PartyHall, NewPartyHall } from "../types"
import { revalidatePath } from "next/cache"

// Buscar todos os salões de festa
export async function getPartyHalls(): Promise<PartyHall[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("party_halls").select("*").order("name")

  if (error) {
    console.error("Erro ao buscar salões:", error)
    throw new Error("Falha ao buscar salões de festa")
  }

  return data || []
}

// Buscar um salão de festa por ID
export async function getPartyHallById(id: string): Promise<PartyHall | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("party_halls").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar salão:", error)
    return null
  }

  return data
}

// Criar um novo salão de festa
export async function createPartyHall(partyHall: NewPartyHall): Promise<PartyHall | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("party_halls").insert(partyHall).select().single()

  if (error) {
    console.error("Erro ao criar salão:", error)
    throw new Error("Falha ao criar salão de festa")
  }

  revalidatePath("/admin/dashboard")
  return data
}

// Atualizar um salão de festa
export async function updatePartyHall(id: string, partyHall: Partial<PartyHall>): Promise<PartyHall | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("party_halls")
    .update({ ...partyHall, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar salão:", error)
    throw new Error("Falha ao atualizar salão de festa")
  }

  revalidatePath("/admin/dashboard")
  return data
}

// Excluir um salão de festa
export async function deletePartyHall(id: string): Promise<boolean> {
  const supabase = await createServerClient()

  const { error } = await supabase.from("party_halls").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir salão:", error)
    throw new Error("Falha ao excluir salão de festa")
  }

  revalidatePath("/admin/dashboard")
  return true
}
