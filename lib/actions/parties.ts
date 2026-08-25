"use server"

import { createServerClient } from "../supabase/server"
import type { Party, NewParty, PartyWithGuestCount } from "../types"
import { revalidatePath } from "next/cache"
import { generateUniqueLink } from "../utils"
import { createPartyParent, generateParentUsername, generateRandomPassword } from "./party-parents"

// Retorna o usuário logado ou lança erro se não houver sessão.
// Usado nas telas administrativas, onde cada dono só pode ver/gerenciar
// as próprias festas.
async function getCurrentUserId(supabase: Awaited<ReturnType<typeof createServerClient>>): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  return user.id
}

// IDs dos salões que pertencem ao usuário logado
async function getOwnedHallIds(supabase: Awaited<ReturnType<typeof createServerClient>>, userId: string) {
  const { data, error } = await supabase.from("party_halls").select("id").eq("user_id", userId)
  if (error) {
    console.error("Erro ao buscar salões do usuário:", error)
    throw new Error("Falha ao buscar salões do usuário")
  }
  return (data || []).map((h) => h.id)
}

// Confirma que o salão informado pertence ao usuário logado
async function assertOwnsHall(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  hallId: string,
) {
  const { data, error } = await supabase
    .from("party_halls")
    .select("id")
    .eq("id", hallId)
    .eq("user_id", userId)
    .single()

  if (error || !data) {
    throw new Error("Salão não encontrado ou não pertence ao usuário logado")
  }
}

// Buscar todas as festas do usuário logado (área administrativa)
export async function getParties(): Promise<Party[]> {
  const supabase = await createServerClient()
  const userId = await getCurrentUserId(supabase)
  const hallIds = await getOwnedHallIds(supabase, userId)

  if (hallIds.length === 0) return []

  const { data, error } = await supabase.from("parties").select("*").in("party_hall_id", hallIds).order("data")
  if (error) {
    console.error("Erro ao buscar festas:", error)
    throw new Error("Falha ao buscar festas")
  }
  return data || []
}

// Buscar festas com contagem de convidados (somente do usuário logado)
export async function getPartiesWithGuestCount(): Promise<PartyWithGuestCount[]> {
  const supabase = await createServerClient()
  const userId = await getCurrentUserId(supabase)
  const hallIds = await getOwnedHallIds(supabase, userId)

  if (hallIds.length === 0) return []

  const { data: parties, error: partiesError } = await supabase
    .from("parties")
    .select("*")
    .in("party_hall_id", hallIds)
    .order("data")
  if (partiesError) {
    console.error("Erro ao buscar festas:", partiesError)
    throw new Error("Falha ao buscar festas")
  }
  if (!parties || parties.length === 0) {
    return []
  }
  const partiesWithCount = await Promise.all(
    parties.map(async (party) => {
      const { count: totalCount, error: totalError } = await supabase
        .from("guests")
        .select("*", { count: "exact", head: true })
        .eq("party_id", party.id)
      const { count: confirmedCount, error: confirmedError } = await supabase
        .from("guests")
        .select("*", { count: "exact", head: true })
        .eq("party_id", party.id)
        .eq("status_confirmacao_final", true)
      if (totalError || confirmedError) {
        console.error("Erro ao buscar contagem de convidados:", totalError || confirmedError)
      }
      return {
        ...party,
        total_convidados: totalCount || 0,
        confirmados: confirmedCount || 0,
      }
    }),
  )
  return partiesWithCount
}

// Buscar uma festa por ID (uso público/pais — sem restrição de dono)
export async function getPartyById(id: string): Promise<Party | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("parties").select("*").eq("id", id).single()
  if (error) {
    console.error("Erro ao buscar festa:", error)
    return null
  }
  return data
}

// Buscar uma festa por link do formulário (uso público — sem restrição de dono)
export async function getPartyByLink(link: string): Promise<Party | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("parties").select("*").eq("link_formulario", link).single()
  if (error) {
    console.error("Erro ao buscar festa pelo link:", error)
    return null
  }
  return data
}

// Criar uma nova festa (o salão informado precisa pertencer ao usuário logado)
export async function createParty(
  party: NewParty,
): Promise<{ party: Party | null; parentCredentials: { username: string; password: string } | null }> {
  const supabase = await createServerClient()
  const userId = await getCurrentUserId(supabase)
  await assertOwnsHall(supabase, userId, party.party_hall_id)

  if (!party.link_formulario) {
    party.link_formulario = generateUniqueLink(party.nome_aniversariante, party.theme)
  }

  const { data, error } = await supabase.from("parties").insert(party).select().single()

  if (error) {
    console.error("Erro ao criar festa:", error)
    throw new Error("Falha ao criar festa")
  }

  // Gerar credenciais para os pais
  const username = generateParentUsername(party.nome_aniversariante)
  const password = generateRandomPassword()

  try {
    await createPartyParent({
      party_id: data.id,
      username,
      password,
    })

    revalidatePath("/admin/dashboard")
    return {
      party: data,
      parentCredentials: {
        username,
        password,
      },
    }
  } catch (parentError) {
    console.error("Erro ao criar credenciais dos pais:", parentError)
    return {
      party: data,
      parentCredentials: null,
    }
  }
}

// Atualizar uma festa (somente se pertencer a um salão do usuário logado)
export async function updateParty(id: string, party: Partial<Party>): Promise<Party | null> {
  const supabase = await createServerClient()
  const userId = await getCurrentUserId(supabase)
  const hallIds = await getOwnedHallIds(supabase, userId)

  const { data, error } = await supabase
    .from("parties")
    .update({ ...party, updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("party_hall_id", hallIds)
    .select()
    .single()
  if (error) {
    console.error("Erro ao atualizar festa:", error)
    throw new Error("Falha ao atualizar festa")
  }
  revalidatePath("/admin/dashboard")
  return data
}

// Excluir uma festa (somente se pertencer a um salão do usuário logado)
export async function deleteParty(id: string): Promise<boolean> {
  const supabase = await createServerClient()
  const userId = await getCurrentUserId(supabase)
  const hallIds = await getOwnedHallIds(supabase, userId)

  const { error } = await supabase.from("parties").delete().eq("id", id).in("party_hall_id", hallIds)
  if (error) {
    console.error("Erro ao excluir festa:", error)
    throw new Error("Falha ao excluir festa")
  }
  revalidatePath("/admin/dashboard")
  return true
}

// Buscar festas por salão (uso público — página de confirmação do convidado)
export async function getPartiesByHall(hallId: string): Promise<Party[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("parties").select("*").eq("party_hall_id", hallId).order("data")
  if (error) {
    console.error("Erro ao buscar festas do salão:", error)
    throw new Error("Falha ao buscar festas do salão")
  }
  return data || []
}
