"use server"

import { createClient } from "@/lib/supabase/server"
import type { TableLayout, TableAssignment } from "@/lib/types"

export async function getTableLayout(partyId: string): Promise<TableLayout[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("table_layouts").select("*").eq("party_id", partyId).order("name")

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar layout de mesas:", error)
    return []
  }
}

export async function createTable(
  table: Omit<TableLayout, "id" | "created_at" | "updated_at">,
): Promise<TableLayout | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("table_layouts")
      .insert({
        ...table,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Erro ao criar mesa:", error)
    return null
  }
}

export async function updateTablePosition(id: string, x: number, y: number): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("table_layouts")
      .update({
        x_position: x,
        y_position: y,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao atualizar posição da mesa:", error)
    return false
  }
}

export async function deleteTable(id: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Primeiro, remover todas as atribuições de convidados para esta mesa
    await supabase.from("table_assignments").delete().eq("table_id", id)

    // Depois, excluir a mesa
    const { error } = await supabase.from("table_layouts").delete().eq("id", id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir mesa:", error)
    return false
  }
}

export async function getTableAssignments(partyId: string): Promise<TableAssignment[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("table_assignments")
      .select("*, table_layouts!inner(*)")
      .eq("table_layouts.party_id", partyId)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar atribuições de mesa:", error)
    return []
  }
}

export async function assignGuestToTable(tableId: string, guestId: string): Promise<TableAssignment | null> {
  try {
    const supabase = await createClient()

    // Verificar se já existe uma atribuição para este convidado
    const { data: existingAssignment } = await supabase
      .from("table_assignments")
      .select("*")
      .eq("guest_id", guestId)
      .single()

    if (existingAssignment) {
      // Atualizar atribuição existente
      const { data, error } = await supabase
        .from("table_assignments")
        .update({
          table_id: tableId,
        })
        .eq("id", existingAssignment.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } else {
      // Criar nova atribuição
      const { data, error } = await supabase
        .from("table_assignments")
        .insert({
          table_id: tableId,
          guest_id: guestId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    }
  } catch (error) {
    console.error("Erro ao atribuir convidado à mesa:", error)
    return null
  }
}

export async function removeGuestAssignment(guestId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("table_assignments").delete().eq("guest_id", guestId)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao remover atribuição de convidado:", error)
    return false
  }
}
