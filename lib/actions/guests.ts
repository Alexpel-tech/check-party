"use server"

import { createServerClient } from "../supabase/server"
import type { Guest, NewGuest, Party } from "../types"
import { revalidatePath } from "next/cache"
import { NotificationService } from "../adapters/notification-service-adapter"

// Buscar todos os convidados
export async function getGuests(): Promise<Guest[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("guests").select("*").order("data_envio_formulario", { ascending: false })
  if (error) {
    console.error("Erro ao buscar convidados:", error)
    throw new Error("Falha ao buscar convidados")
  }
  return data || []
}

// Buscar convidados por festa
export async function getGuestsByParty(partyId: string): Promise<Guest[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("party_id", partyId)
    .order("data_envio_formulario", { ascending: false })
  if (error) {
    console.error("Erro ao buscar convidados da festa:", error)
    throw new Error("Falha ao buscar convidados da festa")
  }
  return data || []
}

// Buscar um convidado por ID
export async function getGuestById(id: string): Promise<Guest | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("guests").select("*").eq("id", id).single()
  if (error) {
    console.error("Erro ao buscar convidado:", error)
    return null
  }
  return data
}

// Criar um novo convidado
export async function createGuest(guest: NewGuest): Promise<Guest | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("guests").insert(guest).select().single()
  if (error) {
    console.error("Erro ao criar convidado:", error)
    throw new Error("Falha ao criar convidado")
  }
  revalidatePath("/admin/dashboard")
  return data
}

// Atualizar um convidado
export async function updateGuest(id: string, guest: Partial<Guest>): Promise<Guest | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("guests")
    .update({ ...guest, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) {
    console.error("Erro ao atualizar convidado:", error)
    throw new Error("Falha ao atualizar convidado")
  }
  revalidatePath("/admin/dashboard")
  return data
}

// Atualizar status de confirmação dos pais
export async function updateParentConfirmation(id: string, status: boolean): Promise<Guest | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("guests")
    .update({
      status_confirmacao_pais: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()
  if (error) {
    console.error("Erro ao atualizar confirmação dos pais:", error)
    throw new Error("Falha ao atualizar confirmação dos pais")
  }
  revalidatePath("/admin/dashboard")
  return data
}

// Atualizar status de confirmação final
export async function updateFinalConfirmation(id: string, status: boolean): Promise<Guest | null> {
  const supabase = createServerClient()
  const { data: guestData, error } = await supabase
    .from("guests")
    .update({
      status_confirmacao_final: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, parties(*)") // Inclui dados da festa para notificação
    .single()

  if (error) {
    console.error("Erro ao atualizar confirmação final:", error)
    throw new Error("Falha ao atualizar confirmação final")
  }

  if (guestData && status) {
    // Enviar notificação apenas se confirmado (status === true)
    const party = guestData.parties as Party // Cast para o tipo Party
    if (party && party.party_parents_id) {
      try {
        const { data: parentUser, error: parentError } = await supabase
          .from("party_parents")
          .select("user_id")
          .eq("id", party.party_parents_id)
          .single()

        if (parentError || !parentUser?.user_id) {
          console.error("Erro ao buscar organizador para notificação de confirmação:", parentError)
        } else {
          await NotificationService.createNotification({
            user_id: parentUser.user_id,
            title: "Nova Confirmação de Presença!",
            message: `${guestData.nome_principal} confirmou presença na festa de ${party.nome_aniversariante}.`,
            type: "success",
            link: `/admin/dashboard?partyId=${party.id}`, // Link para o dashboard da festa
          })
        }
      } catch (notificationError) {
        console.error("Erro ao enviar notificação de confirmação de presença:", notificationError)
      }
    }
  }

  revalidatePath("/admin/dashboard")
  return guestData
}

// Excluir um convidado
export async function deleteGuest(id: string): Promise<boolean> {
  const supabase = createServerClient()
  const { error } = await supabase.from("guests").delete().eq("id", id)
  if (error) {
    console.error("Erro ao excluir convidado:", error)
    throw new Error("Falha ao excluir convidado")
  }
  revalidatePath("/admin/dashboard")
  return true
}
