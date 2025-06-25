"use server"

import { createServerClient } from "../supabase/server"
import type { Party, NewParty, PartyWithGuestCount } from "../types"
import { revalidatePath } from "next/cache"
import { generateUniqueLink } from "../utils"
import { createPartyParent, generateParentUsername, generateRandomPassword } from "./party-parents"
import { NotificationService } from "../adapters/notification-service-adapter"

// Buscar todas as festas
export async function getParties(): Promise<Party[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("parties").select("*").order("data")
  if (error) {
    console.error("Erro ao buscar festas:", error)
    throw new Error("Falha ao buscar festas")
  }
  return data || []
}

// Buscar festas com contagem de convidados
export async function getPartiesWithGuestCount(): Promise<PartyWithGuestCount[]> {
  const supabase = createServerClient()
  const { data: parties, error: partiesError } = await supabase.from("parties").select("*").order("data")
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

// Buscar uma festa por ID
export async function getPartyById(id: string): Promise<Party | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("parties").select("*").eq("id", id).single()
  if (error) {
    console.error("Erro ao buscar festa:", error)
    return null
  }
  return data
}

// Buscar uma festa por link do formulário
export async function getPartyByLink(link: string): Promise<Party | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("parties").select("*").eq("link_formulario", link).single()
  if (error) {
    console.error("Erro ao buscar festa pelo link:", error)
    return null
  }
  return data
}

// Criar uma nova festa
export async function createParty(
  party: NewParty,
  userId: string, // Adicionado userId para notificação
): Promise<{ party: Party | null; parentCredentials: { username: string; password: string } | null }> {
  const supabase = createServerClient()
  if (!party.link_formulario) {
    party.link_formulario = generateUniqueLink(party.nome_aniversariante, party.theme)
  }
  const { data, error } = await supabase.from("parties").insert(party).select().single()

  if (error) {
    console.error("Erro ao criar festa:", error)
    throw new Error("Falha ao criar festa")
  }

  if (data) {
    // Se a festa foi criada com sucesso
    try {
      await NotificationService.createNotification({
        user_id: userId, // Notificar o usuário que criou a festa
        title: "Festa Criada com Sucesso!",
        message: `A festa "${data.nome_aniversariante}" foi criada e está pronta para configuração.`,
        type: "success",
        link: `/admin/dashboard?partyId=${data.id}`, // Link para o dashboard da festa
      })
    } catch (notificationError) {
      console.error("Erro ao enviar notificação de criação de festa:", notificationError)
    }
  }

  const username = generateParentUsername(party.nome_aniversariante)
  const password = generateRandomPassword()
  try {
    await createPartyParent({
      party_id: data.id,
      username,
      password,
      // user_id: userId, // Se createPartyParent precisar do user_id para associar ao auth.users
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
    // Mesmo que a criação do pai falhe, a festa foi criada.
    // Poderia adicionar uma notificação de aviso aqui se necessário.
    return {
      party: data,
      parentCredentials: null,
    }
  }
}

// Atualizar uma festa
export async function updateParty(id: string, party: Partial<Party>): Promise<Party | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("parties")
    .update({ ...party, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) {
    console.error("Erro ao atualizar festa:", error)
    throw new Error("Falha ao atualizar festa")
  }
  revalidatePath("/admin/dashboard")
  return data
}

// Excluir uma festa
export async function deleteParty(id: string): Promise<boolean> {
  const supabase = createServerClient()
  const { error } = await supabase.from("parties").delete().eq("id", id)
  if (error) {
    console.error("Erro ao excluir festa:", error)
    throw new Error("Falha ao excluir festa")
  }
  revalidatePath("/admin/dashboard")
  return true
}

// Buscar festas por salão
export async function getPartiesByHall(hallId: string): Promise<Party[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("parties").select("*").eq("party_hall_id", hallId).order("data")
  if (error) {
    console.error("Erro ao buscar festas do salão:", error)
    throw new Error("Falha ao buscar festas do salão")
  }
  return data || []
}
