"use server"

import { createServerClient } from "../supabase/server"
import type { Guest, NewGuest, Party } from "../types"
import { revalidatePath } from "next/cache"
import { NotificationService } from "../adapters/notification-service-adapter"
import { z } from "zod"

// Schema de validação do convidado. Serve dois propósitos:
// 1. Validar/sanitizar o que vem de um formulário público (sem login) —
//    a fonte de dados menos confiável do sistema.
// 2. Bloquear "mass assignment": só os campos listados aqui chegam a ser
//    inseridos no banco, mesmo que o cliente envie campos extras.
const newGuestSchema = z.object({
  party_id: z.string().uuid("ID da festa inválido"),
  nome_principal: z.string().trim().min(2, "Nome muito curto").max(120, "Nome muito longo"),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(180)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  whatsapp: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  quantidade_adultos: z.number().int().min(1).max(50),
  quantidade_criancas: z.number().int().min(0).max(50),
  status_confirmacao_pais: z.boolean().optional(),
  status_confirmacao_final: z.boolean().optional(),
  observacao: z.string().trim().max(500).optional(),
  data_envio_formulario: z.string().optional(),
})

// Buscar todos os convidados
export async function getGuests(): Promise<Guest[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("guests").select("*").order("data_envio_formulario", { ascending: false })
  if (error) {
    console.error("Erro ao buscar convidados:", error)
    throw new Error("Falha ao buscar convidados")
  }
  return data || []
}

// Buscar convidados por festa
export async function getGuestsByParty(partyId: string): Promise<Guest[]> {
  const supabase = await createServerClient()
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
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("guests").select("*").eq("id", id).single()
  if (error) {
    console.error("Erro ao buscar convidado:", error)
    return null
  }
  return data
}

// Criar um novo convidado
export async function createGuest(guest: NewGuest): Promise<Guest | null> {
  // Valida e sanitiza a entrada. Em caso de dado inválido, lança um erro
  // com uma mensagem segura para mostrar ao usuário (sem detalhes internos).
  const parsed = newGuestSchema.safeParse(guest)
  if (!parsed.success) {
    console.error("Dados de convidado inválidos:", parsed.error.flatten())
    throw new Error("Dados inválidos. Confira o nome, e-mail e quantidade de convidados informados.")
  }

  // Monta o objeto a inserir explicitamente a partir dos dados validados —
  // nunca espalha (...) o input bruto do cliente direto no insert, mesmo
  // que ele tenha campos a mais.
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("guests")
    .insert({
      party_id: parsed.data.party_id,
      nome_principal: parsed.data.nome_principal,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      quantidade_adultos: parsed.data.quantidade_adultos,
      quantidade_criancas: parsed.data.quantidade_criancas,
      status_confirmacao_pais: parsed.data.status_confirmacao_pais,
      status_confirmacao_final: parsed.data.status_confirmacao_final,
      observacao: parsed.data.observacao,
      data_envio_formulario: parsed.data.data_envio_formulario,
    })
    .select()
    .single()
  if (error) {
    console.error("Erro ao criar convidado:", error)
    throw new Error("Falha ao criar convidado")
  }
  revalidatePath("/admin/dashboard")
  return data
}

// Atualizar um convidado
export async function updateGuest(id: string, guest: Partial<Guest>): Promise<Guest | null> {
  const supabase = await createServerClient()
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
  const supabase = await createServerClient()
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
  const supabase = await createServerClient()
  const { data: guestData, error } = await supabase
    .from("guests")
    .update({
      status_confirmacao_final: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, parties(*)")
    .single()

  if (error) {
    console.error("Erro ao atualizar confirmação final:", error)
    throw new Error("Falha ao atualizar confirmação final")
  }

  if (guestData && status) {
    const party = guestData.parties as Party
    if (party && party.party_hall_id) {
      try {
        const { data: hall, error: hallError } = await supabase
          .from("party_halls")
          .select("user_id")
          .eq("id", party.party_hall_id)
          .single()

        if (hallError || !hall?.user_id) {
          console.error("Erro ao buscar dono do salão para notificação de confirmação:", hallError)
        } else {
          await NotificationService.createNotification({
            user_id: hall.user_id,
            title: "Nova Confirmação de Presença!",
            message: `${guestData.nome_principal} confirmou presença na festa de ${party.nome_aniversariante}.`,
            type: "success",
            link: `/admin/dashboard?partyId=${party.id}`,
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
  const supabase = await createServerClient()
  const { error } = await supabase.from("guests").delete().eq("id", id)
  if (error) {
    console.error("Erro ao excluir convidado:", error)
    throw new Error("Falha ao excluir convidado")
  }
  revalidatePath("/admin/dashboard")
  return true
}
